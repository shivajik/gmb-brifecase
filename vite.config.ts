import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import "dotenv/config";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5000,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    {
      name: "api-contact",
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url !== "/api/contact") return next();
          if (req.method !== "POST") {
            res.statusCode = 405;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Method not allowed" }));
            return;
          }

          let body = "";
          req.on("data", (chunk: Buffer) => { body += chunk.toString(); });
          req.on("end", async () => {
            try {
              const { name, email, company, message } = JSON.parse(body);
              if (!name || !email || !message) {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: "Name, email, and message are required." }));
                return;
              }

              const nodemailer = await import("nodemailer");
              const adminEmail = process.env.EMAIL;
              const adminPass = process.env.PASS;

              if (!adminEmail || !adminPass) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: "Email service not configured." }));
                return;
              }

              const transporter = nodemailer.default.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: { user: adminEmail, pass: adminPass },
              });

              await transporter.sendMail({
                from: adminEmail,
                to: adminEmail,
                replyTo: email,
                subject: `New Contact Form Submission from ${name}`,
                html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f8fafc;border-radius:8px;"><div style="background:#fff;padding:40px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.1);"><h1 style="color:#16a34a;text-align:center;">GMB Briefcase</h1><div style="background:#f0fdf4;padding:16px;border-radius:6px;margin:20px 0;border-left:4px solid #16a34a;"><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p>${company ? `<p><strong>Company:</strong> ${company}</p>` : ""}</div><h3 style="color:#16a34a;">Message:</h3><div style="background:#f9fafb;padding:16px;border-radius:6px;border:1px solid #e5e7eb;"><p style="white-space:pre-wrap;">${message}</p></div></div></div>`,
              });

              await transporter.sendMail({
                from: adminEmail,
                to: email,
                subject: "Thank you for contacting GMB Briefcase!",
                html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f8fafc;border-radius:8px;"><div style="background:#fff;padding:40px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.1);"><h1 style="color:#16a34a;text-align:center;">GMB Briefcase</h1><p>Hello <strong>${name}</strong>,</p><p>Thank you for reaching out! We'll get back to you within 24 hours.</p><div style="background:#f0fdf4;padding:16px;border-radius:6px;margin:20px 0;border-left:4px solid #16a34a;"><p style="color:#16a34a;font-weight:500;">Your message:</p><p style="white-space:pre-wrap;">${message}</p></div><p style="margin-bottom:5px;">Best regards,</p><p style="color:#16a34a;font-weight:500;">The GMB Briefcase Team</p></div></div>`,
              });

              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ success: true, message: "Message sent successfully!" }));
            } catch (err: any) {
              console.error("Contact form error:", err);
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Failed to send email. Please try again later." }));
            }
          });
        });
      },
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
