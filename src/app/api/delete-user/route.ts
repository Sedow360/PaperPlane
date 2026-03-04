import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { authOptions } from "../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { User } from "next-auth";

export async function DELETE(req: Request) {
    await dbConnect();

    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return Response.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const user: User = session.user as User;

        if (!user.isVerified) {
            return Response.json(
                { success: false, message: "You are not verified. Please verify to proceed." },
                { status: 400 }
            );
        }

        const deletedUser = await UserModel.findByIdAndDelete(user._id);

        if (!deletedUser) {
            return Response.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        return Response.json(
            { success: true, message: "Account deleted successfully" },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error deleting user:", error);
        return Response.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}