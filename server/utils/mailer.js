const FROM = process.env.MAIL_FROM || 'BENZ <noreply@hacerr.pp.ua>';

export function isMailConfigured() {
  return Boolean(String(process.env.RESEND_API_KEY || '').trim());
}

function resendMessage(text) {
  try {
    const json = JSON.parse(text);
    return String(json?.message || json?.error || text || '').slice(0, 280);
  } catch {
    return String(text || '').slice(0, 280);
  }
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
      to: [String(to).trim().toLowerCase()],
      subject: `Рамзи BENZ: ${code}`,
      text: `Рамзи BENZ: ${code}\nИн 6 рақамро дар сайт ворид кунед. Рамз 10 дақиқа эътибор дорад.`,
      html: `<div style="font-family:Arial,sans-serif;max-width:480px;color:#111">
        <h2 style="margin:0 0 12px">BENZ</h2>
        <p>Рамзи шумо:</p>
        <p style="font-size:32px;font-weight:bold;letter-spacing:6px">${code}</p>
        <p>Ин 6 рақамро дар сайт ворид кунед. Рамз 10 дақиқа эътибор дорад.</p>
      </div>`,
    }),
  });

  const body = await res.text();
  if (!res.ok) {
    const hint = resendMessage(body);
    console.error('Resend send failed', res.status, hint);
    const testing = /own email|testing emails|verify a domain/i.test(hint);
    const err = new Error(
      testing
        ? 'Email was not sent to this address. Verify hacerr.pp.ua in Resend.'
        : 'Email was not sent'
    );
    err.statusCode = res.status === 429 ? 429 : 422;
    err.details = hint;
    throw err;
  }
}
