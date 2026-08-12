const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTPEmail = async (email, otp) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Laptop & Printer Store <onboarding@resend.dev>",
      to: [email],
      subject: "Your Login OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 16px; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="margin: 0; color: #111827;">Laptop & Printer Store</h2>
            <p style="margin: 8px 0 0; color: #6b7280;">Your one-time login code</p>
          </div>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 12px; text-align: center; margin: 24px 0;">
            <span style="display: inline-block; font-size: 32px; letter-spacing: 8px; font-weight: 700; color: #111827;">${otp}</span>
          </div>

          <p style="margin: 0 0 8px; color: #374151;">This OTP will expire in 5 minutes.</p>
          <p style="margin: 0; color: #6b7280;">If you did not request this OTP, you can safely ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend API rejected the request. Full error:", JSON.stringify(error, null, 2));
      throw new Error(error.message || "Failed to send OTP email");
    }

    return data;
  } catch (error) {
    console.error("OTP email delivery failed:", error.message);
    throw new Error("We couldn't send the verification code. Please try again.");
  }
};

module.exports = sendOTPEmail;
