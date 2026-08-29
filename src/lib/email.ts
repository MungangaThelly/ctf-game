type EmailInput = { to: string; subject: string; text: string; html: string };

export async function sendEmail(input: EmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) throw new Error('Email service is not configured');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, ...input }),
  });
  if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
}
