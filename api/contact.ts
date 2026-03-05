import type { VercelRequest, VercelResponse } from "@vercel/node";
import nodemailer from "nodemailer";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, company, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are required." });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Please provide a valid email address." });
  }

  const adminEmail = process.env.EMAIL;
  const adminPass = process.env.PASS;

  if (!adminEmail || !adminPass) {
    return res.status(500).json({ error: "Email service not configured." });
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: adminEmail, pass: adminPass },
  });

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeCompany = company ? escapeHtml(company) : "";
  const safeMessage = escapeHtml(message);

  try {
    await transporter.sendMail({
      from: adminEmail,
      to: adminEmail,
      replyTo: email,
      subject: `New Contact Form Submission from ${safeName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
          <div style="background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #16a34a; margin: 0; font-size: 24px; font-weight: bold;">GMB Briefcase</h1>
              <div style="width: 60px; height: 4px; background-color: #16a34a; margin: 10px auto; border-radius: 2px;"></div>
              <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">New Contact Form Submission</p>
            </div>
            <div style="color: #374151; line-height: 1.6; font-size: 15px;">
              <div style="background-color: #f0fdf4; padding: 16px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #16a34a;">
                <p style="margin: 0 0 8px 0;"><strong>Name:</strong> ${safeName}</p>
                <p style="margin: 0 0 8px 0;"><strong>Email:</strong> <a href="mailto:${safeEmail}" style="color: #16a34a;">${safeEmail}</a></p>
                ${safeCompany ? `<p style="margin: 0;"><strong>Company:</strong> ${safeCompany}</p>` : ""}
              </div>
              <h3 style="color: #16a34a; margin: 20px 0 10px 0; font-size: 16px;">Message:</h3>
              <div style="background-color: #f9fafb; padding: 16px; border-radius: 6px; border: 1px solid #e5e7eb;">
                <p style="margin: 0; white-space: pre-wrap;">${safeMessage}</p>
              </div>
            </div>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #6b7280; font-size: 13px; margin: 0;">This message was sent via the GMB Briefcase contact form.</p>
            </div>
          </div>
        </div>
      `,
    });

    await transporter.sendMail({
      from: adminEmail,
      to: email,
      subject: "Thank you for contacting GMB Briefcase!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
          <div style="background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #16a34a; margin: 0; font-size: 24px; font-weight: bold;">GMB Briefcase</h1>
              <div style="width: 60px; height: 4px; background-color: #16a34a; margin: 10px auto; border-radius: 2px;"></div>
            </div>
            <div style="color: #374151; line-height: 1.6; font-size: 15px;">
              <p>Hello <strong>${safeName}</strong>,</p>
              <p>Thank you for reaching out to us! We've received your message and our team will get back to you within 24 hours.</p>
              <div style="background-color: #f0fdf4; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #16a34a;">
                <p style="margin: 0; color: #16a34a; font-weight: 500;">Here's what you sent us:</p>
                <p style="margin: 8px 0 0 0; color: #374151; white-space: pre-wrap;">${safeMessage}</p>
              </div>
              <p>In the meantime, feel free to explore our platform and see how GMB Briefcase can help you manage and grow your local business presence.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://gmbbriefcase.com" style="background-color: #16a34a; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
                  Visit GMB Briefcase
                </a>
              </div>
              <p style="margin-bottom: 5px;">Best regards,</p>
              <p style="margin: 0; font-weight: 500; color: #16a34a;">The GMB Briefcase Team</p>
            </div>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #6b7280; font-size: 13px; margin: 0;">GMB Briefcase — Manage &amp; Grow Your Local Business</p>
            </div>
          </div>
        </div>
      `,
    });

    return res.status(200).json({ success: true, message: "Message sent successfully!" });
  } catch (error: any) {
    console.error("Contact form error:", error);
    return res.status(500).json({ error: "Failed to send email. Please try again later." });
  }
}
