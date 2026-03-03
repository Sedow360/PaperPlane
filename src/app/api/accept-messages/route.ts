import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { authOptions } from "../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { User } from "next-auth";

export async function POST(req: Request) {
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

        const userId = user._id, { acceptMessages } = await req.json();
        const updatedUser = await UserModel.findByIdAndUpdate(
                userId,
                {isAcceptingMessages: acceptMessages},
                {returnDocument: 'after'}
            );
        
        if (!updatedUser) {
            console.log("Couldn't find user");
            return Response.json(
                {
                    success: false,
                    message: `Couldn't find user`
                }, { status: 401 }
            )
        }

        return Response.json(
                {
                    success: true,
                    message: `Mode switched`,
                    updatedUser
                }, { status: 200 }
            )
    } catch (error) {
        console.log("Error in db connection in POST accepting messages");
        return Response.json(
            {
                success: false,
                message: `Error in db connection in POST accepting messages, ${error}`
            },
            { status: 500 }
        )
    }
}

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

        const userId = user._id;
        const foundUser = await UserModel.findById(userId);
        
        if (!foundUser) {
            console.log("Couldn't find user");
            return Response.json(
                {
                    success: false,
                    message: `Couldn't find user`
                }, { status: 404 }
            )
        }

        return Response.json(
                {
                    success: true,
                    isAcceptingMessages: foundUser.isAcceptingMessages,
                }, { status: 200 }
            )
    } catch (error) {
        console.log("Error in db connection in GET accepting messages");
        return Response.json(
            {
                success: false,
                message: `Error in db connection in GET accepting messages, ${error}`
            },
            { status: 500 }
        )
    }
}