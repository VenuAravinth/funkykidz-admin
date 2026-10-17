import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

export class MailNotConfiguredError extends Error {}
export class MailDeliveryError extends Error {}

interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

const globalForMail = globalThis as typeof globalThis & { __fkMailTransport?: { key: string; transport: Transporter } };

function mailConfig() {
  const host = process.env.MAIL_HOST?.trim();
  if (!host) return null;
  const port = Number(process.env.MAIL_PORT ?? 587);
  const user = process.env.MAIL_USERNAME?.trim();
  const from = process.env.MAIL_FROM?.trim() || user;
  if (!from) throw new MailNotConfiguredError("Email delivery isn't configured. Set MAIL_FROM in .env.");
  return {
    host,
    port,
    // MAIL_SECURE=true for implicit TLS (usually port 465); otherwise STARTTLS is required on 587.
    secure: process.env.MAIL_SECURE ? process.env.MAIL_SECURE.trim() === "true" : port === 465,
    user,
    pass: process.env.MAIL_PASSWORD,
    from,
  };
}

function getTransport(config: NonNullable<ReturnType<typeof mailConfig>>) {
  const key = `${config.host}:${config.port}:${config.secure}:${config.user}`;
  if (globalForMail.__fkMailTransport?.key !== key) {
    globalForMail.__fkMailTransport = {
      key,
      transport: nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        requireTLS: !config.secure,
        auth: config.user ? { user: config.user, pass: config.pass } : undefined,
        // Fail well inside the browser's 15 s request timeout instead of hanging.
        connectionTimeout: 8_000,
        greetingTimeout: 8_000,
        socketTimeout: 10_000,
      }),
    };
  }
  return globalForMail.__fkMailTransport.transport;
}

export async function sendMail(message: MailMessage) {
  const config = mailConfig();
  if (!config) {
    if (process.env.NODE_ENV === "production") {
      throw new MailNotConfiguredError("Email delivery isn't configured. Set MAIL_HOST in .env.");
    }
    console.info(`[mailer:dev] MAIL_HOST is not set, so nothing was sent.\nTo: ${message.to} | ${message.subject}\n${message.text}`);
    return;
  }
  try {
    await getTransport(config).sendMail({ from: config.from, ...message });
  } catch (err) {
    console.error(`[mailer] Sending "${message.subject}" to ${message.to} failed`, err);
    throw new MailDeliveryError("We couldn't send the email. Please try again in a moment.");
  }
}
