const FROM = process.env.MAIL_FROM || 'BENZ <noreply@hacerr.pp.ua>';
const REPLY_TO = String(process.env.MAIL_REPLY_TO || '').trim();

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

async function postResend(key, payload) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const body = await res.text();
  return { res, body };
}

export async function sendCodeEmail(to, code) {
  const key = String(process.env.RESEND_API_KEY || '').trim();
  if (!key) {
    const err = new Error('Mail is not configured');
    err.statusCode = 503;
    throw err;
  }

  const recipient = String(to).trim().toLowerCase();
  const payload = {
    from: FROM,
    to: [recipient],
    subject: `Рамзи BENZ: ${code}`,
    text: `Рамзи BENZ: ${code}\n\nИн 6 рақамро дар сайт ворид кунед.\nРамз 10 дақиқа эътибор дорад.\nАгар нома дар Inbox набошад — папкаи Spam / Промо / Junk-ро кушоед.`,
    html: `<div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;color:#111;line-height:1.5">
      <h2 style="margin:0 0 12px;color:#111">BENZ</h2>
      <p style="margin:0 0 8px">Рамзи шумо барои даромад:</p>
      <p style="font-size:32px;font-weight:bold;letter-spacing:6px;margin:12px 0">${code}</p>
      <p style="margin:0 0 8px">Ин 6 рақамро дар сайт ворид кунед. Рамз 10 дақиқа эътибор дорад.</p>
      <p style="margin:0;color:#555;font-size:13px">Агар дар Inbox набошад — Spam / Промо / Junk-ро кушоед.</p>
    </div>`,
  };
  if (REPLY_TO) payload.reply_to = REPLY_TO;

  let { res, body } = await postResend(key, payload);

  // One retry on transient Resend / network pressure
  if (!res.ok && (res.status === 429 || res.status >= 500)) {
    await new Promise((r) => setTimeout(r, 1200));
    ({ res, body } = await postResend(key, payload));
  }

  if (!res.ok) {
    const hint = resendMessage(body);
    console.error('Resend send failed', res.status, hint, 'to=', recipient);
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

  try {
    const json = JSON.parse(body);
    if (json?.id) console.log('Resend ok', json.id, 'to=', recipient);
  } catch {
    console.log('Resend ok to=', recipient);
  }
}
