import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import {z} from "zod";
import { usernameValidation } from "@/schema/signingSchema";

const usernameValidationQuery = z.object({
    username: usernameValidation
});

export async function GET(req: Request) {
    await dbConnect();

    try {
        const { searchParams } = new URL(req.url);
        const queryParams = { username: searchParams.get("username") || "" };
        const res = usernameValidationQuery.safeParse(queryParams); //validation with zod

        if (!res.success) {
            const errs = res.error.format().username?._errors || [];
            return Response.json(
                {
                    success: false,
                    message: (errs && errs?.length > 0) ? errs?.join('') : "Invalid query parameter"
                }, { status: 400 }
            )
        }

        const { username } = res.data;
        const existingVerifiedUser = await UserModel.findOne({ username, isVerified: true });
        if (existingVerifiedUser) {
            return Response.json(
                {
                    success: false,
                    message: "You have a twin? Too bad he is faster..."
                }, { status: 400 }
            )
        }

        return Response.json(
                {
                    success: true,
                    message: "That's an unique name for sure!"
                }, { status: 200 }
            )
    } catch (error) {
        console.log("Error in checking username");
        return Response.json(
            {
                success: false,
                message: `Error in checking username, ${error}`
            },
            { status: 500 }
        )
    }
}