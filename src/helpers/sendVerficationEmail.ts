import { transporter } from "@/lib/nodemailer";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
  email: string,
  username: string,
  code: string
): Promise<ApiResponse> {
  try {
    await transporter.sendMail({
      from: `"Paper Plane" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Paper Plane | Verification Code",
      html: `
  <div style="font-family: Roboto, Verdana, sans-serif; max-width: 480px; margin: auto;">
    <h2>Hello ${username},</h2>
    <p>Thank you for registering. Please use the following verification code to complete your registration:</p>
    <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 24px 0; color: #1e3a8a;">
      ${code}
    </div>
    <a href="http://localhost:3000/verify/${username}" 
       style="display: inline-block; margin-top: 16px; padding: 12px 24px; background-color: #1e3a8a; color: white; text-decoration: none; border-radius: 8px; font-size: 16px;">
      Verify your account
    </a>
    <p style="color: #888; margin-top: 24px;">If you did not request this code, please ignore this email.</p>
  </div>
`
    });

    return {
      success: true,
      message: `Email sent successfully to ${email}`
    };
  } catch (err) {
    return {
      success: false,
      message: `Error in sending email: ${err}`
    };
  }
}
