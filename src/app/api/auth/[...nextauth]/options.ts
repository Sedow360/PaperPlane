import { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                identifier: { label: "Email or Username", type: "text", placeholder: "xyz@example.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials: Record<string, string> | undefined): Promise<User | null> {
                await dbConnect();
                try {
                    const user = await UserModel.findOne({
                        $or: [
                            {email: credentials?.identifier},
                            {username: credentials?.identifier}
                        ]
                    });

                    if (!user) {
                        throw new Error("No user found");
                    }

                    if (!user.isVerified) {
                        throw new Error("Please verify your account before login");
                    }

                    const isCorrectPass = await bcrypt.compare(credentials?.password as string, user.password);
                    if (isCorrectPass) {
                        return {
                            id: user._id.toString(),
                            _id: user._id.toString(),
                            email: user.email,
                            username: user.username,
                            isVerified: user.isVerified,
                            isAcceptingMessages: user.isAcceptingMessages,
                        };

                    } else throw new Error("Something went wrong");
                } catch (e) {
                    throw new Error(`Something went wrong, ${e}`);
                }
            }
        })
    ],
    session: {strategy: "jwt"},
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async session({ session, token }) {
            if (token) {
                session.user!._id = token._id;
                session.user!.isVerified = token.isVerified;
                session.user!.isAcceptingMessages = token.isAcceptingMessages;
                session.user!.username = token.username;
            }
            return session
        },
        async jwt({ token, user  }) {
            if (user) {
                token._id = user._id?.toString();
                token.isVerified = user.isVerified;
                token.isAcceptingMessages = user.isAcceptingMessages;
                token.username = user.username;
            }
            return token
        }
    },
    pages: {
        signIn: "/sign-in"
    }
};