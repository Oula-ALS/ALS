// Emails the teacher through Resend (https://resend.com). If RESEND_API_KEY or
// TEACHER_EMAIL is missing, nothing is sent and the email is printed to the server log.

export type EmailResult = { sent: boolean; reason?: string };

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function emailTeacher(
  subject: string,
  heading: string,
  rows: Array<[string, string]>,
): Promise<EmailResult> {
  const to = process.env.TEACHER_EMAIL;
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Alsama Arabic Lab <onboarding@resend.dev>";
  const text = [heading, "", ...rows.map(([k, v]) => `${k}: ${v}`)].join("\n");

  if (!to || !key) {
    console.info(`[email not sent: not configured]\nSubject: ${subject}\n${text}`);
    return { sent: false, reason: "not_configured" };
  }

  const html = `<h2 style="font-family:sans-serif;color:#351B4A">${escape(heading)}</h2>
<table style="font-family:sans-serif;border-collapse:collapse">${rows
    .map(
      ([k, v]) =>
        `<tr><th align="left" style="padding:4px 12px 4px 0;color:#5C4A6B">${escape(k)}</th><td style="padding:4px 0">${escape(v)}</td></tr>`,
    )
    .join("")}</table>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, text, html }),
    });
    if (!res.ok) {
      console.error("Resend error", res.status, await res.text().catch(() => ""));
      return { sent: false, reason: "send_failed" };
    }
    return { sent: true };
  } catch (e) {
    console.error("Resend error", e);
    return { sent: false, reason: "send_failed" };
  }
}
