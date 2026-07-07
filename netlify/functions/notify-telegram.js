// notify-telegram.js
//
// Reenvía cada envío del formulario "wishes" (Netlify Forms) como mensaje
// de Telegram. No lo llama el sitio directamente: Netlify lo dispara solo
// cuando configuras la notificación "Outgoing webhook" en el panel
// (Forms → Settings and usage → Form notifications).
//
// Variables de entorno necesarias (Project configuration > Environment
// variables en el panel de Netlify):
//   TELEGRAM_BOT_TOKEN  -> el token que te entrega @BotFather
//   TELEGRAM_CHAT_ID    -> el chat id de quien debe recibir el aviso

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
        }

          const token = process.env.TELEGRAM_BOT_TOKEN;
            const chatId = process.env.TELEGRAM_CHAT_ID;

              if (!token || !chatId) {
                  console.error("Faltan TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID en las variables de entorno de Netlify.");
                      return { statusCode: 500, body: "Missing Telegram config" };
                        }

                          let body;
                            try {
                                body = JSON.parse(event.body || "{}");
                                  } catch (err) {
                                      return { statusCode: 400, body: "Invalid JSON" };
                                        }

                                          const submission = body.payload || body;
                                            const data = submission.data || {};

                                              const nombre = data.nombre && String(data.nombre).trim() ? String(data.nombre).trim() : "Alguien";
                                                const deseo = data.deseo ? String(data.deseo).trim() : "(sin mensaje)";

                                                  const text = `💙 Nuevo deseo para Máximo\n\nDe: ${nombre}\n"${deseo}"`;

                                                    try {
                                                        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                                                              method: "POST",
                                                                    headers: { "Content-Type": "application/json" },
                                                                          body: JSON.stringify({ chat_id: chatId, text }),
                                                                              });

                                                                                  if (!res.ok) {
                                                                                        const errText = await res.text();
                                                                                              console.error("Error de la API de Telegram:", errText);
                                                                                                    return { statusCode: 502, body: "Telegram API error" };
                                                                                                        }
                                                                                                        
                                                                                                            return { statusCode: 200, body: "OK" };
                                                                                                              } catch (err) {
                                                                                                                  console.error("Error enviando a Telegram:", err);
                                                                                                                      return { statusCode: 500, body: "Internal error" };
                                                                                                                        }
                                                                                                                        };
