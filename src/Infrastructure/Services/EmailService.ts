import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { env } from "@/shared/config/env";

/**
 * Configure the SMTP transporter with validated environment variables.
 */
const transportOptions: SMTPTransport.Options = {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
};

const transporter = nodemailer.createTransport(transportOptions);

/**
 * Wraps email content in a clean, minimal layout.
 * @param content The HTML content for the email body.
 */
export const wrapEmailHtml = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; background-color: #f4f7f6; color: #333; line-height: 1.6; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { text-align: center; border-bottom: 1px solid #e0e0e0; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { margin: 0; color: #1a1a1a; font-size: 24px; }
        .content { font-size: 16px; }
        .footer { text-align: center; margin-top: 40px; color: #888; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>PageRoastAI</h1>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} PageRoastAI. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

/**
 * Masks an email address for safe logging. e.g. "alex@example.com" → "a***@e***.com"
 */
function maskEmail(email: string): string {
    const [local, domain] = email.split("@");
    if (!local || !domain) return "***@***";
    const domainParts = domain.split(".");
    const maskedLocal = local[0] + "***";
    const maskedDomain = domainParts.map((p) => p[0] + "***").join(".");
    return `${maskedLocal}@${maskedDomain}`;
}

export async function sendEmail(to: string, subject: string, html: string) {
    const isProd = process.env.NODE_ENV === "production";
    const safeRecipient = isProd ? "[redacted]" : maskEmail(to);

    try {
        console.log(`[Email] Sending subject="${subject}" to=${safeRecipient}`);
        const info = await transporter.sendMail({
            from: env.SMTP_FROM,
            to,
            subject,
            html: wrapEmailHtml(html),
        });
        console.log(`[Email] Sent OK messageId=${info.messageId}`);
        return { data: info, error: null };
    } catch (err: unknown) {
        const rawMessage = err instanceof Error ? err.message : String(err);
        // Strip the raw recipient address from any SMTP error messages
        const safeMessage = rawMessage.replaceAll(to, safeRecipient);
        console.error(`[Email] Send failed to=${safeRecipient}: ${safeMessage}`);
        return { data: null, error: safeMessage };
    }
}
