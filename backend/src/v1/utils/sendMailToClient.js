import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
export default async function sendForgotPasswordEmail(to_email, image_url) {
  try {
    const data = await resend.emails.send({
      from: process.env.RESEND_SENDER_EMAIL || "onboarding@resend.dev",
      to: [to_email],
      subject: "Project Confirmation",
      html: `
        <h3>Project Data</h3>
   
      `,
    });

    console.log("Email sent successfully:", data);
    return true;
  } catch (err) {
    console.error("Error sending email:", err);
    return false;
  }
}
