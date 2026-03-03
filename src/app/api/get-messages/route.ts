import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { authOptions } from "../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET() {
    await dbConnect();

    try {
        const session = await getServerSession(authOptions);
        const user: User = session?.user as User;

        if (!session || !session.user ) {
            console.log("Couldn't find session");
            return Response.json(
                {
                    success: false,
                    message: `Couldn't find session`
                },
                { status: 500 }
            )
        }

        const userId = new mongoose.Types.ObjectId(user._id);
        const foundUser = await UserModel.aggregate([
                {$match: {_id: userId}},
                { $unwind: { path: '$messages', preserveNullAndEmptyArrays: true } },
                {$sort: {'messages.createdAt': -1}},
                {$group: {_id: '$_id', messages: {$push: '$messages'}}}
            ])

        if (!foundUser || foundUser.length === 0) {
            console.log("User not found");
            return Response.json(
                {
                    success: false,
                    message: `User not found`
                },
                { status: 200 }
            )
        }

        return Response.json(
                {
                    success: true,
                    messages: foundUser[0].messages
                },
                { status: 200 }
            )
    } catch (err) {
        console.log("Error in db connection in getting messages");
        return Response.json(
            {
                success: false,
                message: `Error in db connection in getting messages, ${err}`
            },
            { status: 500 }
        )
    }
}