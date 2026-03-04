import UserModel from "@/models/User";
import dbConnect from "@/lib/dbConnect";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerficationEmail";

export async function POST(req: Request) {
    await dbConnect();

    try {
        const {username, email, password} = await req.json();

        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true
        });

        if (existingUserVerifiedByUsername) {
            return Response.json({
                success: false, message: "Username is already taken"
            }, {status: 400});
        }
        const existingUserByEmail = await UserModel.findOne({email});
        const existingUnverifiedByUsername = await UserModel.findOne({
            username,
            isVerified: false
        });

        // If username is taken by an unverified account with a DIFFERENT email, delete it
        if (existingUnverifiedByUsername && existingUnverifiedByUsername.email !== email) {
            await UserModel.deleteOne({ _id: existingUnverifiedByUsername._id });
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        if (existingUserByEmail) {
            if (existingUserByEmail.isVerified) {
                return Response.json({
                    success: false, message: "Email is already registered"
                }, {status: 400});
            }

            const hashed = await bcrypt.hash(password, 10);
            const expDate = new Date();
            expDate.setHours(expDate.getHours() + 1);

            existingUserByEmail.password = hashed;
            existingUserByEmail.verifyCode = code;
            existingUserByEmail.verifyCodeExp = expDate;
            await existingUserByEmail.save();
        } else {
            const hashed = await bcrypt.hash(password, 10);
            const expDate = new Date();
            expDate.setHours(expDate.getHours() + 1);

            const newUser = new UserModel({
                username: username,
                email: email,
                password: hashed,
                verifyCode: code,
                verifyCodeExp: expDate,
                isVerified: false,
                isAcceptingMessages: true,
                messages: []
            })
            
            await newUser.save();
        }

        //sending verification email
        const emailSent = await sendVerificationEmail(email, username, code);

        if (!emailSent.success) {
            return Response.json({
                success: false,
                message: emailSent.message
            }, {status: 500});
        }

        return Response.json({
                success: true,
                message: `User ${username} has registered successfully.Please verify your email.`
            }, {status: 200});

    } catch (error) {
        console.log("Error in user registration");
        return Response.json({
            success: false,
            message: `Error in user registration: ${error}`
        }, {status: 500});
    }
}