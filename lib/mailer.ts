import "server-only";
import nodemailer from "nodemailer";

export class MailNotConfiguredError extends Error {}

interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

function createTransport() {
  const host = process.env.SMTP_HOST?.trim();
  if (!host) return null;
  const port = Number(process.env.SMTP_PORT ?? 587);
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
}

export async function sendMail(message: MailMessage) {
  const transport = createTransport();
  if (!transport) {
    if (process.env.NODE_ENV === "production") {
      throw new MailNotConfiguredError("Email delivery isn't configured. Set SMTP_HOST in .env.");
    }
    console.info(`[mailer:dev] To: ${message.to} | ${message.subject}\n${message.text}`);
    return;
  }
  await transport.sendMail({ from: process.env.SMTP_FROM ?? process.env.SMTP_USER, ...message });
}
