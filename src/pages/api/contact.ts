import type {APIRoute} from 'astro';
import {Resend} from 'resend';
import {appendFile, mkdir} from 'fs/promises';
import {join} from 'path';

// Este endpoint necesita ejecutarse en server para aceptar POSTs
export const prerender = false;

// GET rápido para comprobar si Resend/ML está configurado (no expone secretos)
export const GET: APIRoute = async () => {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const SENDER_EMAIL = process.env.SENDER_EMAIL;
  const RECEIVER_EMAIL = process.env.RECEIVER_EMAIL || SENDER_EMAIL || 'martinginernavarro7@gmail.com';
  const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;
  const hasResend = Boolean(RESEND_API_KEY && SENDER_EMAIL && RECEIVER_EMAIL);
  const hasMailerLite = Boolean(MAILERLITE_API_KEY);
  return new Response(JSON.stringify({ hasResend, hasMailerLite, provider: hasMailerLite ? 'mailerlite' : hasResend ? 'resend' : 'formsubmit/fallback', receiver: !!RECEIVER_EMAIL }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const contentType = request.headers.get('content-type') || '';

    let data: any = null;

    // Si es JSON explícito
    if (contentType.includes('application/json')) {
      const text = await request.text();
      if (!text) {
        return new Response(JSON.stringify({ error: 'Request body vacío.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      try {
        data = JSON.parse(text);
      } catch (err) {
        return new Response(JSON.stringify({ error: 'JSON inválido en el body.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } else if (
      contentType.includes('application/x-www-form-urlencoded') ||
      contentType.includes('multipart/form-data') ||
      contentType === ''
    ) {
      // Intentar parsear como form-data (útil si el formulario se envía sin fetch)
      try {
        const form = await request.formData();
        // Si no contiene campos, formData() puede estar vacío
        const name = form.get('name')?.toString() || '';
        const email = form.get('email')?.toString() || '';
        const message = form.get('message')?.toString() || '';
        data = { name, email, message };
      } catch (err) {
        // fallback: leer texto por si viene raw
        const text = await request.text();
        if (text) {
          try {
            data = JSON.parse(text);
          } catch (e) {
            // no podemos parsear
            return new Response(JSON.stringify({ error: 'Body no procesable.' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            });
          }
        } else {
          return new Response(JSON.stringify({ error: 'Request body vacío.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }
    } else {
      // Otros content-types -> intentar texto
      const text = await request.text();
      if (!text) {
        return new Response(JSON.stringify({ error: 'Request body vacío.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      try {
        data = JSON.parse(text);
      } catch (err) {
        return new Response(JSON.stringify({ error: 'JSON inválido en el body.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    const { name, email, message } = data ?? {};

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Faltan campos obligatorios.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Preparar datos comunes
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const SENDER_EMAIL = process.env.SENDER_EMAIL;
    const RECEIVER_EMAIL = process.env.RECEIVER_EMAIL || SENDER_EMAIL || 'martinginernavarro7@gmail.com';
    const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;
    const MAILERLITE_SENDER = process.env.MAILERLITE_SENDER || SENDER_EMAIL || `no-reply@localhost`;

    const subject = `Nuevo mensaje de ${name} — ${email}`;
    const textBody = `Nombre: ${name}\nEmail: ${email}\n\nMensaje:\n${message}`;
    const htmlBody = `
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${message.replace(/\n/g, '<br/>')}</p>
    `;

    // 1) Intentar MailerLite si hay API key (envío texto plano + html)
    if (MAILERLITE_API_KEY) {
      try {
        const mlEndpoint = 'https://api.mailerlite.com/api/v2/email/send';
        const mlPayload = {
          subject,
          from: { email: MAILERLITE_SENDER, name: 'Portfolio' },
          to: [{ email: RECEIVER_EMAIL }],
          html: htmlBody,
          plain_text: textBody,
        };

        const resML = await fetch(mlEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
            'X-MailerLite-ApiKey': MAILERLITE_API_KEY,
          },
          body: JSON.stringify(mlPayload),
        });

        if (resML.ok) {
          return new Response(JSON.stringify({ success: true, provider: 'mailerlite' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        const bodyML = await resML.text().catch(() => '');
        console.error('MailerLite send failed:', resML.status, bodyML);
        // Si falla, caemos a Resend
      } catch (err) {
        console.error('MailerLite error:', err);
        // continuar a siguiente proveedor
      }
    }

    // 2) Intentar Resend si está configurado
    const hasResend = Boolean(RESEND_API_KEY && SENDER_EMAIL && RECEIVER_EMAIL);
    if (hasResend) {
      try {
        const resend = new Resend(RESEND_API_KEY as string);
        await resend.emails.send({
          from: SENDER_EMAIL as string,
          to: RECEIVER_EMAIL,
          subject,
          text: textBody,
          html: htmlBody,
        });

        return new Response(JSON.stringify({ success: true, provider: 'resend' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err) {
        console.error('Resend send error:', err);
        // continuar a fallback
      }
    }

    // 3) Fallback a FormSubmit (server-side) y guardar localmente si falla
    try {
      const endpoint = `https://formsubmit.co/ajax/${encodeURIComponent(RECEIVER_EMAIL)}`;
      const params = new URLSearchParams();
      params.append('name', name);
      params.append('email', email);
      params.append('message', message);

      const resFS = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
        body: params.toString(),
      });

      const bodyFS = await resFS.json().catch(() => ({}));
      if (resFS.ok) {
        return new Response(JSON.stringify({ success: true, provider: 'formsubmit' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Si FormSubmit responde con error, guardamos el mensaje localmente y devolvemos éxito
      const tmpDir = join(process.cwd(), 'tmp');
      await mkdir(tmpDir, { recursive: true }).catch(() => null);
      const logPath = join(tmpDir, 'contact-messages.log');
      const logLine = JSON.stringify({ provider: 'local', name, email, message, meta: bodyFS }) + '\n';
      await appendFile(logPath, logLine, { encoding: 'utf8' }).catch(() => null);

      return new Response(JSON.stringify({ success: true, provider: 'local' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.error('FormSubmit fallback error:', err);
      // En caso de error de red, también salvamos localmente
      const tmpDir = join(process.cwd(), 'tmp');
      await mkdir(tmpDir, { recursive: true }).catch(() => null);
      const logPath = join(tmpDir, 'contact-messages.log');
      const logLine = JSON.stringify({ provider: 'local', name, email, message, error: String(err) }) + '\n';
      await appendFile(logPath, logLine, { encoding: 'utf8' }).catch(() => null);

      return new Response(JSON.stringify({ success: true, provider: 'local' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (err: any) {
    console.error('Contact API error:', err);
    return new Response(JSON.stringify({ error: err?.message || 'Error interno.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
