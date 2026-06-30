import { environment } from "../config/environment";

export function registrationConfirmationHtml(
  eventName: string,
  participantName: string,
  eventDate: string,
  location: string | null
): string {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #16a34a;">Registration Confirmed!</h2>
      <p>Hi <strong>${participantName}</strong>,</p>
      <p>You're registered for <strong>${eventName}</strong>.</p>
      <table style="margin: 16px 0; border-collapse: collapse;">
        <tr><td style="padding: 6px 12px; color: #475569;">Date</td><td style="padding: 6px 12px; font-weight: 600;">${eventDate}</td></tr>
        ${location ? `<tr><td style="padding: 6px 12px; color: #475569;">Location</td><td style="padding: 6px 12px; font-weight: 600;">${location}</td></tr>` : ""}
      </table>
      <p style="color: #475569; font-size: 14px;">See you there!</p>
    </div>
  `;
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  if (!environment.resendApiKey) {
    console.warn("RESEND_API_KEY not configured. Skipping email to", to);
    return;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${environment.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: environment.emailFrom,
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Failed to send email:", errText);
    }
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}
