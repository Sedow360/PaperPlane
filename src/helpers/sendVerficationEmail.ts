import { getResend } from "@/lib/resend";
import VerificationEmail from "../../email/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
    email: string,
    username: string,
    code: string
): Promise<ApiResponse> {
    const resend = getResend();
    try {
        await resend.emails.send({
                from: "onboarding@resend.dev",
                to: email,
                subject: "Paper Plane | Verification Code",
                react: VerificationEmail({username, otp: code})
        });

        return {
            success: true,
            message: `Email sent successfully to ${email}`
        }
    } catch (err) {
        return {
            success: false,
            message: `Error in sending email ${err}`
        }
    }
}