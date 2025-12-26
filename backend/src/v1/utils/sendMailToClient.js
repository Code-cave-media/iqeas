import { Resend } from "resend";
import fs from "fs";
import path from "path";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function sendQuotationEmailToClient(
  to_email,
  client_name,
  project_name,
  message,
  file_path // can be LOCAL or REMOTE
) {
  try {
    let fileBuffer;
    let filename = "quotation.pdf";

    // 🔹 CASE 1: Remote URL (Supabase / S3 / CDN)
    if (file_path.startsWith("http://") || file_path.startsWith("https://")) {
      const response = await fetch(file_path);

      if (!response.ok) {
        throw new Error(`Failed to fetch remote file: ${file_path}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);

      filename = path.basename(new URL(file_path).pathname);
    }

    // 🔹 CASE 2: Local uploaded file
    else {
      const UPLOAD_DIR = path.join(process.cwd(), "uploads");
      const fullPath = path.join(UPLOAD_DIR, file_path);

      if (!fs.existsSync(fullPath)) {
        throw new Error(`Local file not found: ${fullPath}`);
      }

      fileBuffer = fs.readFileSync(fullPath);
      filename = file_path;
    }

    const base64File = fileBuffer.toString("base64");

    const data = await resend.emails.send({
      from:
        process.env.RESEND_SENDER_EMAIL || "IQEAS <admin@iqeasoffshore.com>",
      to: [to_email],
      subject: `Quotation Submission – ${project_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Dear ${client_name},</p>
          <p>${message}</p>
          <p>Please find the attached quotation for your review.</p>
          <br />
          <p>Warm regards,</p>
          <strong>IQEAS Offshore Engineering Private Limited</strong>
        </div>
      `,
      attachments: [
        {
          filename,
          content: base64File,
        },
      ],
    });

    console.log("Quotation email sent:", data);
    return true;
  } catch (error) {
    console.error("Failed to send quotation email:", error);
    return false;
  }
}
