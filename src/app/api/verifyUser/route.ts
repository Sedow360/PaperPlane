import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";

export async function POST(req: Request) {
    await dbConnect();

    try {
        const { username, code } = await req.json();
        const decodedUsername = decodeURIComponent(username);
        const decodedCode = decodeURIComponent(code);

        const user = await UserModel.findOne({ username: decodedUsername });
        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: `User not found`
                }, { status: 404 }
            )
        }
        if (user.isVerified) {
            return Response.json(
                {
                    success: false,
                    message: `User is already verified`
                }, { status: 400 }
            )
        }

        const validCode = user.verifyCode === decodedCode.toString();
        const isNotExpiredCode = new Date(user.verifyCodeExp) > new Date();

        if (validCode && isNotExpiredCode) {
            user.isVerified = true;
            user.verifyCode = "verfied";
            user.verifyCodeExp = new Date(0);

            await user.save();

            return Response.json(
                {
                    success: true,
                    message: `${user.username} is verified successfully`
                }, { status: 200 }
            )
        } else if (!isNotExpiredCode) {
            return Response.json(
                {
                    success: false,
                    message: `Verification Code has expired. Please signup again!`
                }, { status: 400 }
            )
        } else {
            return Response.json(
                {
                    success: false,
                    message: `Please enter the valid code`
                }, { status: 400 }
            )
        }
    } catch (error) {
        console.log("Error in verifying user");
        return Response.json(
            {
                success: false,
                message: `Error in verifying user, ${error}`
            },
            { status: 500 }
        )
    }
}

export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
      return Response.json(
        { success: false, message: "Username is required" },
        { status: 200 }
      );
    }

    const user = await UserModel.findOne({ username });

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 200 }
      );
    }

    return Response.json(
      {
        success: user.isVerified,
        message: user.isVerified ? "Verified" : "Not verified",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return Response.json(
      { success: false, message: "Error checking verification status" },
      { status: 500 }
    );
  }
}