import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";

export async function DELETE(req: NextRequest) {
    const { messageId } = await req.json();
    await dbConnect();

    console.log("Entered route")
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        await UserModel.updateOne(
            { username: session.user.username },
            { $pull: { messages: { _id: messageId } } }
        );

        return Response.json({ success: true, message: "Message deleted" }, { status: 200 });
    } catch (error) {
        return Response.json({ success: false, message: error }, { status: 500 });
    }
}