// functions/api/wish.js
//
// Cloudflare Pages Function — reemplaza a Netlify Forms + Netlify Functions.
// Recibe el envío del formulario "Escribe tu deseo para Máximo" y lo reenvía
// directo como mensaje de Telegram. No hay backend propio ni base de datos.
//
// Variables de entorno necesarias (Cloudflare Pages → Settings →
// Environment variables, en Production y Preview):
//   TELEGRAM_BOT_TOKEN  -> el token que entrega @BotFather
//   TELEGRAM_CHAT_ID    -> el chat id de quien debe recibir el aviso

export async function onRequestPost({ request, env }) {
  try {
    const data = await request.formData();

    // Honeypot anti-spam: si el campo oculto viene lleno, es un bot.
    // Respondemos "ok" igual para no darle pistas, pero no reenviamos nada.
    const honeypot = (data.get("bot-field") || "").toString().trim();
    if (honeypot) {
      return json({ ok: true });
    }

    const nombre = (data.get("nombre") || "").toString().trim() || "Alguien";
    const deseo = (data.get("deseo") || "").toString().trim();

    if (!deseo) {
      return json({ ok: false, error: "missing_message" }, 400);
    }

    const token = env.TELEGRAM_BOT_TOKEN;
    const chatId = env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.error("Faltan TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID en las variables de entorno de Cloudflare Pages.");
      return json({ ok: false, error: "missing_config" }, 500);
    }

    const text = `💙 Nuevo deseo para Máximo\n\nDe: ${nombre}\n"${deseo}"`;

    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });

    if (!tgRes.ok) {
      const errText = await tgRes.text();
      console.error("Error de la API de Telegram:", errText);
      return json({ ok: false, error: "telegram_error" }, 502);
    }

    return json({ ok: true });
  } catch (err) {
    console.error("Error procesando el deseo:", err);
    return json({ ok: false, error: "internal_error" }, 500);
  }
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
