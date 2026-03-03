import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { authOptions } from "../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { User } from "next-auth";

export async function POST(req: Request) {
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
        const { newPersonality } = await req.json();

        if (!newPersonality) {
            return Response.json(
                { success: false, message: "Personality is required" },
                { status: 400 }
            );
        }

        if (!user.isVerified) {
            return Response.json(
                { success: false, message: "You are not verified. Please verify to proceed." },
                { status: 400 }
            );
        }

        const updatedUser = await UserModel.findByIdAndUpdate(
            user._id,
            { personality: newPersonality.trim().slice(0, 200) },
            { new: true }
        );

        if (!updatedUser) {
            return Response.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        return Response.json(
            { success: true, message: "Personality updated successfully" },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error updating personality:", error);
        return Response.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}