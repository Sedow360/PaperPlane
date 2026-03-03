import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { z } from "zod";
import { usernameValidation } from "@/schema/signingSchema";

const usernameValidationQuery = z.object({
  username: usernameValidation
});

export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username") ?? "";

    const res = usernameValidationQuery.safeParse({ username });
    if (!res.success) {
      const errs = res.error.format().username?._errors ?? [];
      return Response.json(
        { success: false, message: errs.length > 0 ? errs.join(', ') : "Invalid username" },
        { status: 400 }
      );
    }

    const user = await UserModel.findOne({ username: res.data.username, isVerified: true }).select('personality');
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "Receiver is not found"
        }, { status: 400 }
      )
    }
    const personality = (user?.personality ?? 'polite, light convo').trim().slice(0, 200);

    const QUESTION_PROMPT = `Create 3 open-ended, engaging questions for someone who is interested in ${personality}, formatted as a single string separated by '||'.

    Guidelines:
    - Focus on universal themes (hobbies, hypotheticals, simple joys)
    - Avoid personal, sensitive, or divisive topics
    - Keep questions light, curious, and welcoming

    Example format:
    "What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?"`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.LLAMA_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'liquid/lfm-2.5-1.2b-thinking:free',
            messages: [{ role: 'user', content: QUESTION_PROMPT }],
        }),
      });

    const data = await response.json();
    const text = data.choices[0].message.content;

    console.log(text);

    return Response.json({ success: true, text }, { status: 200 });

  } catch (error) {
    console.error('[Suggest Messages Error]:', error);
    return new Response(
      JSON.stringify({ error: 'Service Unavailable' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}