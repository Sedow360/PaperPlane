import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { Message } from "@/models/User";
import { messageSchema } from "@/schema/messageSchema";

export async function POST(req: Request) {
    await dbConnect();
    const body = await req.json();

    const result = messageSchema.safeParse(body);
        
    if (!result.success) {
        return Response.json(
            {
                success: false,
                message: result.error.format().content?._errors || "Invalid message content"
            },
            { status: 400 }
        );
    }

    const { content } = result.data;
    const username = body.username;

    try {
        const user = await UserModel.findOne({username});

        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: `User not found`
                },
                { status: 404 }
            )
        }
        if (!user.isAcceptingMessages) {
            return Response.json(
                {
                    success: false,
                    message: `${user.username} has closed his/her window`
                },
                { status: 403 }
            )
        }

        const newMessage = {content, createdAt: new Date()};
        user.messages.push(newMessage as Message);
        await user.save();

        return Response.json(
                {
                    success: true,
                    message: `${user.username} will receive the message`
                },
                { status: 200 }
            )
    } catch (err) {
        console.log("Error in db connection in sending messages");
        return Response.json(
            {
                success: false,
                message: `Error in db connection in sending messages, ${err}`
            },
            { status: 500 }
        )
    }
}