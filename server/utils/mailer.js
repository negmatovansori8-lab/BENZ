const FROM = process.env.MAIL_FROM || 'BENZ <noreply@hacerr.pp.ua>';

export function isMailConfigured() {
  return Boolean(String(process.env.RESEND_API_KEY || '').trim());
}

export async function sendCodeEmail(to, code) {
  const key = String(process.env.RESEND_API_KEY || '').trim();
  if (!key) {
    const err = new Error('Mail is not configured');
    err.statusCode = 503;
    throw err;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      subject: `Рамзи BENZ: ${code}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:480px">
        <h2>BENZ</h2>
        <p>Рамзи шумо:</p>
        <p style="font-size:32px;font-weight:bold;letter-spacing:6px">${code}</p>
        <p>Ин 6 рақамро дар сайт ворид кунед. Рамз 10 дақиқа эътибор дорад.</p>
      </div>`,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    const err = new Error('Email was not sent');
    err.statusCode = 502;
    err.details = text.slice(0, 200);
    throw err;
  }
}
