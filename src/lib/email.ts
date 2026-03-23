import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendTicketEmail({
  to,
  eventName,
  eventDate,
  venue,
  orderNumber,
  ticketType,
  quantity,
  ticketDownloadUrl,
}: {
  to: string;
  eventName: string;
  eventDate: string;
  venue: string;
  orderNumber: string;
  ticketType: string;
  quantity: number;
  ticketDownloadUrl: string;
}) {
  if (!resend) {
    console.warn('RESEND_API_KEY not set — skipping email');
    return;
  }

  const dateStr = new Date(eventDate).toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  await resend.emails.send({
    from: 'UntzDrop <tickets@untzdrop.com>',
    to,
    subject: `🎟️ Tu boleto para ${eventName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; background: #0a0a0f; color: #fff; padding: 40px 30px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 24px; margin: 0; color: #EA580B;">UntzDrop</h1>
          <p style="color: #888; font-size: 14px; margin-top: 8px;">Tu boleto está listo</p>
        </div>

        <div style="background: #181818; border: 1px solid #2A2A2A; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h2 style="font-size: 18px; margin: 0 0 8px;">${eventName}</h2>
          <p style="color: #888; font-size: 14px; margin: 4px 0;">${dateStr}</p>
          <p style="color: #666; font-size: 14px; margin: 4px 0;">${venue}</p>
          <div style="margin-top: 12px;">
            <span style="background: ${ticketType === 'vip' ? '#D946EF26' : '#3B82F626'}; color: ${ticketType === 'vip' ? '#D946EF' : '#3B82F6'}; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 4px; text-transform: uppercase;">${ticketType}</span>
            <span style="color: #888; font-size: 13px; margin-left: 8px;">× ${quantity}</span>
          </div>
        </div>

        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${ticketDownloadUrl}" style="display: inline-block; background: #EA580B; color: #fff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 14px 32px; border-radius: 8px;">
            Descargar Boleto
          </a>
        </div>

        <div style="background: #181818; border: 1px solid #2A2A2A; border-radius: 12px; padding: 16px; text-align: center;">
          <p style="color: #666; font-size: 12px; margin: 0;">Orden: <span style="color: #fff; font-family: monospace;">${orderNumber}</span></p>
          <p style="color: #555; font-size: 11px; margin-top: 8px;">
            También puedes ver tu boleto en tu <a href="https://untzdrop.com/dashboard" style="color: #EA580B; text-decoration: none;">dashboard</a>
          </p>
        </div>

        <p style="color: #444; font-size: 11px; text-align: center; margin-top: 24px;">
          © UntzDrop 2026 — Lima, Perú
        </p>
      </div>
    `,
  });
}
