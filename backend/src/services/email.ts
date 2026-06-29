import { environment } from "../config/environment";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<void> {
  const apiKey = environment.resendApiKey;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not configured — skipping email");
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: environment.emailFrom || "Volunteer Yatra <notifications@volunteeryatra.com>",
        to,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend API error:", err);
    }
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

export function registrationConfirmationHtml(eventName: string, participantName: string, eventDate: string, eventLocation: string | null): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8f9fc; margin: 0; padding: 0;">
      <div style="max-width: 480px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="background: #16a34a; padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Registration Confirmed!</h1>
        </div>
        <div style="padding: 32px 24px;">
          <p style="color: #1e293b; font-size: 15px; line-height: 1.5;">Hi <strong>${participantName}</strong>,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.5;">You have successfully registered for:</p>
          <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="color: #0f172a; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">${eventName}</p>
            <p style="color: #475569; font-size: 13px; margin: 4px 0;">📅 ${eventDate}</p>
            ${eventLocation ? `<p style="color: #475569; font-size: 13px; margin: 4px 0;">📍 ${eventLocation}</p>` : ""}
          </div>
          <p style="color: #475569; font-size: 13px; line-height: 1.5;">If you have any questions, please contact the event organizer.</p>
        </div>
        <div style="border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center;">
          <p style="color: #94a3b8; font-size: 11px; margin: 0;">Volunteer Yatra — Empowering Communities, Transforming Lives.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
