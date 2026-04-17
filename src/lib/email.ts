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
  customerName,
  pricePerTicket,
  serviceFee,
  total,
  eventImageUrl,
}: {
  to: string;
  eventName: string;
  eventDate: string;
  venue: string;
  orderNumber: string;
  ticketType: string;
  quantity: number;
  ticketDownloadUrl: string;
  customerName?: string;
  pricePerTicket?: number;
  serviceFee?: number;
  total?: number;
  eventImageUrl?: string | null;
}) {
  if (!resend) {
    console.warn('RESEND_API_KEY not set — skipping email');
    return;
  }

  const dateObj = new Date(eventDate);
  const dateStr = dateObj.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = dateObj.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  const purchaseDateStr = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
  const ticketTypeLabel = ticketType === 'vip' ? 'VIP' : 'General Admission (GA)';
  const lineTotal = (pricePerTicket ?? 0) * quantity;
  const subtotal = lineTotal;

  const eventImage = eventImageUrl
    ? `<img src="${eventImageUrl}" alt="${eventName}" style="width:100%;max-width:400px;height:200px;object-fit:cover;border-radius:12px;margin-bottom:15px;box-shadow:0 4px 12px rgba(0,0,0,0.15);">`
    : `<div style="width:100%;max-width:400px;height:200px;border-radius:12px;margin:0 auto 15px;background:#1f2937;border:1px dashed #374151;display:flex;align-items:center;justify-content:center;color:#6b7280;font-size:13px;">Imagen del evento</div>`;

  await resend.emails.send({
    from: 'UntzDrop <alertas@tx.untzdrop.com>',
    replyTo: 'ayuda@untzdrop.com',
    to,
    subject: `✅ Tu orden fue confirmada — ${eventName}`,
    html: `
      <div style="font-family:'Chakra Petch',-apple-system,BlinkMacSystemFont,sans-serif;max-width:500px;margin:20px auto;padding:30px;background:#000;color:#f9fafb;border:1px solid #374151;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.3);line-height:1.6;">

        <div style="text-align:center;border-bottom:2px solid #ea5a0a;padding-bottom:20px;margin-bottom:25px;">
          <img src="https://untzdrop.com/logo.png" alt="UntzDrop" style="max-width:80px;height:auto;">
          <div style="font-size:14px;color:#d1d5db;line-height:1.5;margin-top:12px;">
            <a href="mailto:ayuda@untzdrop.com" style="color:#ea5a0a;text-decoration:none;">ayuda@untzdrop.com</a><br>www.untzdrop.com
          </div>
        </div>

        <div style="text-align:center;padding:20px 0 24px;">
          <div style="font-size:22px;font-weight:700;margin-bottom:4px;">Tu orden fue confirmada</div>
          <div style="font-size:14px;color:#9ca3af;">Orden <span style="color:#ea5a0a;font-weight:600;">#${orderNumber}</span> · ${purchaseDateStr}</div>
        </div>

        <div style="margin-bottom:20px;font-size:15px;background:#1f2937;padding:20px;border-radius:8px;">
          ${customerName ? `<div style="margin-bottom:8px;display:flex;justify-content:space-between;"><strong style="color:#f9fafb;font-weight:600;">Cliente:</strong><span>${customerName}</span></div>` : ''}
          <div style="margin-bottom:0;display:flex;justify-content:space-between;"><strong style="color:#f9fafb;font-weight:600;">Email:</strong><span>${to}</span></div>
        </div>

        <div style="margin:20px 0;text-align:center;">
          ${eventImage}
          <div style="font-size:20px;font-weight:700;color:#ea5a0a;margin-bottom:8px;">${eventName}</div>
          <div style="font-size:14px;color:#d1d5db;margin-bottom:5px;">${dateStr} a las ${timeStr}</div>
          <div style="font-size:14px;color:#d1d5db;">${venue}</div>
        </div>

        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;background:#1f2937;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.3);">
          <thead>
            <tr>
              <th style="text-align:left;padding:12px 15px;background:#374151;border-bottom:2px solid #4b5563;font-weight:600;color:#f9fafb;font-size:14px;">Tipo de Entrada</th>
              <th style="text-align:right;padding:12px 15px;background:#374151;border-bottom:2px solid #4b5563;font-weight:600;color:#f9fafb;font-size:14px;">Cant.</th>
              <th style="text-align:right;padding:12px 15px;background:#374151;border-bottom:2px solid #4b5563;font-weight:600;color:#f9fafb;font-size:14px;">Precio</th>
              <th style="text-align:right;padding:12px 15px;background:#374151;border-bottom:2px solid #4b5563;font-weight:600;color:#f9fafb;font-size:14px;">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="text-align:left;padding:12px 15px;border-bottom:1px solid #374151;font-size:14px;color:#d1d5db;">${ticketTypeLabel}</td>
              <td style="text-align:right;padding:12px 15px;border-bottom:1px solid #374151;font-size:14px;color:#d1d5db;font-weight:500;">${quantity}</td>
              <td style="text-align:right;padding:12px 15px;border-bottom:1px solid #374151;font-size:14px;color:#d1d5db;font-weight:500;">S/ ${(pricePerTicket ?? 0).toFixed(2)}</td>
              <td style="text-align:right;padding:12px 15px;border-bottom:1px solid #374151;font-size:14px;color:#d1d5db;font-weight:500;">S/ ${lineTotal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div style="margin-bottom:20px;font-size:15px;background:#1f2937;padding:20px;border-radius:8px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:15px;"><span>Subtotal:</span><span>S/ ${subtotal.toFixed(2)}</span></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:15px;"><span>Comisión de servicio:</span><span>S/ ${(serviceFee ?? 0).toFixed(2)}</span></div>
          <div style="display:flex;justify-content:space-between;font-weight:700;font-size:18px;border-top:2px solid #ea5a0a;padding-top:12px;margin-top:15px;color:#f9fafb;"><span>Total Pagado:</span><span>S/ ${(total ?? 0).toFixed(2)}</span></div>
        </div>

        <div style="text-align:center;margin:28px 0 8px;">
          <a href="https://untzdrop.com/dashboard" style="display:inline-block;padding:14px 40px;background:#ea5a0a;color:#fff;border-radius:8px;font-size:15px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;text-decoration:none;">Ver Mi Orden</a>
        </div>

        <div style="text-align:center;margin-top:30px;font-size:13px;color:#9ca3af;border-top:1px solid #374151;padding-top:20px;">
          <p style="margin:8px 0;">¿Preguntas? <a href="mailto:ayuda@untzdrop.com" style="color:#ea5a0a;text-decoration:none;">ayuda@untzdrop.com</a></p>
          <div style="margin-top:12px;">
            <a href="https://instagram.com/untzdrop" style="display:inline-block;margin:0 8px;text-decoration:none;">
              <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" width="24" height="24" style="opacity:0.7;">
            </a>
            <a href="https://tiktok.com/@untzdrop" style="display:inline-block;margin:0 8px;text-decoration:none;">
              <img src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png" alt="TikTok" width="24" height="24" style="opacity:0.7;">
            </a>
          </div>
          <p style="margin:8px 0;color:#6b7280;">© UntzDrop 2026 — Lima, Perú</p>
        </div>
      </div>
    `,
  });
}

export async function sendWelcomeEmail({
  to,
  name,
}: {
  to: string;
  name: string;
}) {
  if (!resend) {
    console.warn('RESEND_API_KEY not set — skipping welcome email');
    return;
  }

  await resend.emails.send({
    from: 'UntzDrop <alertas@tx.untzdrop.com>',
    replyTo: 'ayuda@untzdrop.com',
    to,
    subject: `Bienvenido a UntzDrop, ${name} 🎉`,
    html: `
      <div style="font-family: 'Chakra Petch', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 500px; margin: 20px auto; padding: 30px; background: #000000; color: #f9fafb; border: 1px solid #374151; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); line-height: 1.6;">
        <div style="text-align: center; border-bottom: 2px solid #ea5a0a; padding-bottom: 20px; margin-bottom: 25px;">
          <img src="https://untzdrop.com/logo.png" alt="UntzDrop" style="max-width: 80px; height: auto;">
        </div>

        <div style="text-align: center; padding: 20px 0 30px;">
          <div style="font-size: 24px; font-weight: 700; margin-bottom: 12px;">
            Bienvenido a <span style="color: #ea5a0a;">UntzDrop</span>
          </div>
          <div style="font-size: 15px; color: #d1d5db; margin-bottom: 28px;">
            Tu cuenta ya está activa. Compra y vende entradas para los mejores eventos de la escena electrónica.
          </div>
          <a href="https://untzdrop.com" style="display: inline-block; padding: 14px 40px; background: #ea5a0a; color: #ffffff; border-radius: 8px; font-size: 15px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; text-decoration: none;">
            Comprar y Vender
          </a>
        </div>

        <div style="text-align: center; margin-top: 30px; font-size: 13px; color: #9ca3af; border-top: 1px solid #374151; padding-top: 20px;">
          <div style="margin-bottom: 16px;">
            <a href="https://instagram.com/untzdrop" style="display: inline-block; margin: 0 8px; text-decoration: none;">
              <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" width="28" height="28" style="opacity: 0.7;">
            </a>
            <a href="https://tiktok.com/@untzdrop" style="display: inline-block; margin: 0 8px; text-decoration: none;">
              <img src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png" alt="TikTok" width="28" height="28" style="opacity: 0.7;">
            </a>
          </div>
          <p style="margin: 8px 0;">¿Preguntas? <a href="mailto:ayuda@untzdrop.com" style="color: #ea5a0a; text-decoration: none;">ayuda@untzdrop.com</a></p>
          <p style="margin: 8px 0; color: #6b7280;">© UntzDrop 2026 — Lima, Perú</p>
        </div>
      </div>
    `,
  });
}

export async function sendListingConfirmationEmail({
  to,
  listingId,
  eventId,
  eventName,
  eventDate,
  venue,
  ticketType,
  quantity,
  price,
  eventImageUrl,
}: {
  to: string;
  listingId: number;
  eventId: number;
  eventName: string;
  eventDate: string;
  venue: string;
  ticketType: string;
  quantity: number;
  price: number;
  eventImageUrl?: string | null;
}) {
  if (!resend) {
    console.warn('RESEND_API_KEY not set — skipping listing email');
    return;
  }

  const dateObj = new Date(eventDate);
  const dateStr = dateObj.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = dateObj.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  const todayStr = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
  const ticketTypeLabel = ticketType === 'vip' ? 'VIP' : 'General Admission (GA)';
  const totalPrice = price * quantity;
  const platformFee = Math.round(totalPrice * 0.10 * 100) / 100;
  const processingFee = Math.round(totalPrice * 0.03 * 100) / 100;
  const estimatedPayout = totalPrice - platformFee - processingFee;

  const eventImage = eventImageUrl
    ? `<img src="${eventImageUrl}" alt="${eventName}" style="width:100%;max-width:400px;height:200px;object-fit:cover;border-radius:12px;margin-bottom:15px;box-shadow:0 4px 12px rgba(0,0,0,0.15);">`
    : `<div style="width:100%;max-width:400px;height:200px;border-radius:12px;margin:0 auto 15px;background:#1f2937;border:1px dashed #374151;display:flex;align-items:center;justify-content:center;color:#6b7280;font-size:13px;">Imagen del evento</div>`;

  await resend.emails.send({
    from: 'UntzDrop <alertas@tx.untzdrop.com>',
    replyTo: 'ayuda@untzdrop.com',
    to,
    subject: `🎫 Tu entrada para ${eventName} ya está publicada`,
    html: `
      <div style="font-family:'Chakra Petch',-apple-system,BlinkMacSystemFont,sans-serif;max-width:500px;margin:20px auto;padding:30px;background:#000;color:#f9fafb;border:1px solid #374151;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.3);line-height:1.6;">

        <div style="text-align:center;border-bottom:2px solid #ea5a0a;padding-bottom:20px;margin-bottom:25px;">
          <img src="https://untzdrop.com/logo.png" alt="UntzDrop" style="max-width:80px;height:auto;">
          <div style="font-size:14px;color:#d1d5db;line-height:1.5;margin-top:12px;">
            <a href="mailto:ayuda@untzdrop.com" style="color:#ea5a0a;text-decoration:none;">ayuda@untzdrop.com</a><br>www.untzdrop.com
          </div>
        </div>

        <div style="text-align:center;padding:20px 0 24px;">
          <div style="font-size:22px;font-weight:700;margin-bottom:4px;">Tu entrada ya está publicada</div>
          <div style="font-size:14px;color:#9ca3af;">Listado <span style="color:#ea5a0a;font-weight:600;">#${listingId}</span> · ${todayStr}</div>
        </div>

        <div style="margin:20px 0;text-align:center;">
          ${eventImage}
          <div style="font-size:20px;font-weight:700;color:#ea5a0a;margin-bottom:8px;">${eventName}</div>
          <div style="font-size:14px;color:#d1d5db;margin-bottom:5px;">${dateStr} a las ${timeStr}</div>
          <div style="font-size:14px;color:#d1d5db;">${venue}</div>
        </div>

        <div style="margin-bottom:20px;font-size:15px;background:#1f2937;padding:20px;border-radius:8px;">
          <div style="margin-bottom:8px;display:flex;justify-content:space-between;"><strong style="color:#f9fafb;font-weight:600;">Tipo de Entrada:</strong><span>${ticketTypeLabel}</span></div>
          <div style="margin-bottom:8px;display:flex;justify-content:space-between;"><strong style="color:#f9fafb;font-weight:600;">Cantidad:</strong><span>${quantity}</span></div>
          <div style="margin-bottom:0;display:flex;justify-content:space-between;"><strong style="color:#f9fafb;font-weight:600;">Precio Publicado:</strong><span>S/ ${price.toFixed(2)}</span></div>
        </div>

        <div style="background:#1f2937;border:1px solid #374151;border-radius:8px;padding:20px;margin-bottom:20px;">
          <div style="font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#6b7280;margin-bottom:14px;">Pago Estimado</div>
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:15px;color:#d1d5db;"><span>Precio de venta</span><span>S/ ${totalPrice.toFixed(2)}</span></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:15px;color:#d1d5db;"><span>Comisión de plataforma</span><span>- S/ ${platformFee.toFixed(2)}</span></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:15px;color:#d1d5db;"><span>Costo de procesamiento</span><span>- S/ ${processingFee.toFixed(2)}</span></div>
          <div style="display:flex;justify-content:space-between;font-weight:700;font-size:18px;border-top:2px solid #ea5a0a;padding-top:12px;margin-top:12px;color:#f9fafb;"><span>Recibirás</span><span style="color:#ea5a0a;">S/ ${estimatedPayout.toFixed(2)}</span></div>
        </div>

        <div style="font-size:13px;color:#6b7280;text-align:center;margin-bottom:20px;line-height:1.5;">
          El pago se procesará una vez que la entrada se venda y el comprador confirme la recepción.
        </div>

        <div style="text-align:center;margin:24px 0 8px;">
          <a href="https://untzdrop.com/events/${eventId}" style="display:inline-block;padding:14px 40px;background:#ea5a0a;color:#fff;border-radius:8px;font-size:15px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;text-decoration:none;">Ver Mi Listado</a>
        </div>

        <div style="text-align:center;margin-top:30px;font-size:13px;color:#9ca3af;border-top:1px solid #374151;padding-top:20px;">
          <p style="margin:8px 0;">¿Preguntas? <a href="mailto:ayuda@untzdrop.com" style="color:#ea5a0a;text-decoration:none;">ayuda@untzdrop.com</a></p>
          <div style="margin-top:12px;">
            <a href="https://instagram.com/untzdrop" style="display:inline-block;margin:0 8px;text-decoration:none;">
              <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" width="24" height="24" style="opacity:0.7;">
            </a>
            <a href="https://tiktok.com/@untzdrop" style="display:inline-block;margin:0 8px;text-decoration:none;">
              <img src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png" alt="TikTok" width="24" height="24" style="opacity:0.7;">
            </a>
          </div>
          <p style="margin:8px 0;color:#6b7280;">© UntzDrop 2026 — Lima, Perú</p>
        </div>
      </div>
    `,
  });
}


export async function sendOfferConfirmationEmail({
  to,
  offerId,
  eventId,
  eventName,
  eventDate,
  venue,
  ticketType,
  quantity,
  offerPrice,
  eventImageUrl,
}: {
  to: string;
  offerId: number;
  eventId: number;
  eventName: string;
  eventDate: string;
  venue: string;
  ticketType: string;
  quantity: number;
  offerPrice: number;
  eventImageUrl?: string | null;
}) {
  if (!resend) {
    console.warn('RESEND_API_KEY not set — skipping offer email');
    return;
  }

  const dateObj = new Date(eventDate);
  const dateStr = dateObj.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = dateObj.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  const todayStr = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
  const ticketTypeLabel = ticketType === 'vip' ? 'VIP' : 'General Admission (GA)';
  const totalOffer = offerPrice * quantity;

  const eventImage = eventImageUrl
    ? `<img src="${eventImageUrl}" alt="${eventName}" style="width:100%;max-width:400px;height:200px;object-fit:cover;border-radius:12px;margin-bottom:15px;box-shadow:0 4px 12px rgba(0,0,0,0.15);">`
    : '';

  await resend.emails.send({
    from: 'UntzDrop <alertas@tx.untzdrop.com>',
    replyTo: 'ayuda@untzdrop.com',
    to,
    subject: `Tu oferta para ${eventName} fue publicada`,
    html: `
      <div style="font-family:'Chakra Petch',-apple-system,BlinkMacSystemFont,sans-serif;max-width:500px;margin:20px auto;padding:30px;background:#000;color:#f9fafb;border:1px solid #374151;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.3);line-height:1.6;">
        <div style="text-align:center;border-bottom:2px solid #ea5a0a;padding-bottom:20px;margin-bottom:25px;">
          <img src="https://untzdrop.com/logo.png" alt="UntzDrop" style="max-width:80px;height:auto;">
          <div style="font-size:14px;color:#d1d5db;line-height:1.5;margin-top:12px;">
            <a href="mailto:ayuda@untzdrop.com" style="color:#ea5a0a;text-decoration:none;">ayuda@untzdrop.com</a><br>www.untzdrop.com
          </div>
        </div>
        <div style="text-align:center;padding:20px 0 24px;">
          <div style="font-size:22px;font-weight:700;margin-bottom:4px;">Tu oferta fue publicada</div>
          <div style="font-size:14px;color:#9ca3af;">Oferta <span style="color:#ea5a0a;font-weight:600;">#${offerId}</span> \u00b7 ${todayStr}</div>
        </div>
        <div style="margin:20px 0;text-align:center;">
          ${eventImage}
          <div style="font-size:20px;font-weight:700;color:#ea5a0a;margin-bottom:8px;">${eventName}</div>
          <div style="font-size:14px;color:#d1d5db;margin-bottom:5px;">${dateStr} a las ${timeStr}</div>
          <div style="font-size:14px;color:#d1d5db;">${venue}</div>
        </div>
        <div style="background:#1f2937;border:1px solid #374151;border-radius:8px;padding:24px 20px;text-align:center;margin-bottom:20px;">
          <div style="font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#6b7280;margin-bottom:8px;">Tu Oferta</div>
          <div style="font-size:32px;font-weight:700;color:#ea5a0a;margin-bottom:14px;">S/ ${totalOffer.toFixed(2)}</div>
          <div style="font-size:14px;color:#d1d5db;margin-bottom:6px;">${ticketTypeLabel} \u00b7 ${quantity} entrada${quantity > 1 ? 's' : ''}</div>
          <div style="display:inline-block;margin-top:14px;padding:5px 14px;border-radius:20px;font-size:12px;font-weight:600;letter-spacing:0.8px;text-transform:uppercase;background:rgba(234,90,10,0.12);color:#ea5a0a;border:1px solid rgba(234,90,10,0.25);">Activa</div>
        </div>
        <div style="font-size:13px;color:#6b7280;text-align:center;margin-bottom:20px;line-height:1.5;">
          Cuando un vendedor acepte tu oferta, te notificaremos y procesaremos el pago autom\u00e1ticamente. Puedes cancelar o modificar tu oferta en cualquier momento.
        </div>
        <div style="text-align:center;margin:24px 0 8px;">
          <a href="https://untzdrop.com/events/${eventId}" style="display:inline-block;padding:14px 40px;background:#ea5a0a;color:#fff;border-radius:8px;font-size:15px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;text-decoration:none;">Ver Mis Ofertas</a>
        </div>
        <div style="text-align:center;margin-top:30px;font-size:13px;color:#9ca3af;border-top:1px solid #374151;padding-top:20px;">
          <p style="margin:8px 0;">\u00bfPreguntas? <a href="mailto:ayuda@untzdrop.com" style="color:#ea5a0a;text-decoration:none;">ayuda@untzdrop.com</a></p>
          <div style="margin-top:12px;">
            <a href="https://instagram.com/untzdrop" style="display:inline-block;margin:0 8px;text-decoration:none;">
              <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" width="24" height="24" style="opacity:0.7;">
            </a>
            <a href="https://tiktok.com/@untzdrop" style="display:inline-block;margin:0 8px;text-decoration:none;">
              <img src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png" alt="TikTok" width="24" height="24" style="opacity:0.7;">
            </a>
          </div>
          <p style="margin:8px 0;color:#6b7280;">\u00a9 UntzDrop 2026 \u2014 Lima, Per\u00fa</p>
        </div>
      </div>
    `,
  });
}


export async function sendOfferAcceptedEmail({
  to,
  offerId,
  eventName,
  eventDate,
  venue,
  ticketType,
  quantity,
  offerPrice,
  serviceFee,
  total,
  eventImageUrl,
}: {
  to: string;
  offerId: number;
  eventName: string;
  eventDate: string;
  venue: string;
  ticketType: string;
  quantity: number;
  offerPrice: number;
  serviceFee: number;
  total: number;
  eventImageUrl?: string | null;
}) {
  if (!resend) {
    console.warn('RESEND_API_KEY not set — skipping offer accepted email');
    return;
  }

  const dateObj = new Date(eventDate);
  const dateStr = dateObj.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = dateObj.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  const todayStr = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
  const ticketTypeLabel = ticketType === 'vip' ? 'VIP' : 'General Admission (GA)';
  const totalOffer = offerPrice * quantity;

  const eventImage = eventImageUrl
    ? `<img src="${eventImageUrl}" alt="${eventName}" style="width:100%;max-width:400px;height:200px;object-fit:cover;border-radius:12px;margin-bottom:15px;box-shadow:0 4px 12px rgba(0,0,0,0.15);">`
    : '';

  await resend.emails.send({
    from: 'UntzDrop <alertas@tx.untzdrop.com>',
    replyTo: 'ayuda@untzdrop.com',
    to,
    subject: `\u2705 \u00a1Un vendedor acept\u00f3 tu oferta para ${eventName}!`,
    html: `
      <div style="font-family:'Chakra Petch',-apple-system,BlinkMacSystemFont,sans-serif;max-width:500px;margin:20px auto;padding:30px;background:#000;color:#f9fafb;border:1px solid #374151;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.3);line-height:1.6;">
        <div style="text-align:center;border-bottom:2px solid #ea5a0a;padding-bottom:20px;margin-bottom:25px;">
          <img src="https://untzdrop.com/logo.png" alt="UntzDrop" style="max-width:80px;height:auto;">
          <div style="font-size:14px;color:#d1d5db;line-height:1.5;margin-top:12px;">
            <a href="mailto:ayuda@untzdrop.com" style="color:#ea5a0a;text-decoration:none;">ayuda@untzdrop.com</a><br>www.untzdrop.com
          </div>
        </div>
        <div style="text-align:center;padding:20px 0 24px;">
          <div style="font-size:22px;font-weight:700;margin-bottom:4px;">\u00a1Un vendedor acept\u00f3 tu oferta!</div>
          <div style="font-size:14px;color:#9ca3af;">Oferta <span style="color:#ea5a0a;font-weight:600;">#${offerId}</span> \u00b7 ${todayStr}</div>
          <div style="display:inline-block;margin-top:10px;padding:5px 14px;border-radius:20px;font-size:12px;font-weight:600;letter-spacing:0.8px;text-transform:uppercase;background:rgba(5,150,105,0.12);color:#10b981;border:1px solid rgba(5,150,105,0.25);">Aceptada</div>
        </div>
        <div style="margin:20px 0;text-align:center;">
          ${eventImage}
          <div style="font-size:20px;font-weight:700;color:#ea5a0a;margin-bottom:8px;">${eventName}</div>
          <div style="font-size:14px;color:#d1d5db;margin-bottom:5px;">${dateStr} a las ${timeStr}</div>
          <div style="font-size:14px;color:#d1d5db;">${venue}</div>
        </div>
        <div style="margin-bottom:20px;font-size:15px;background:#1f2937;padding:20px;border-radius:8px;">
          <div style="margin-bottom:8px;display:flex;justify-content:space-between;"><strong style="color:#f9fafb;font-weight:600;">Tipo de Entrada:</strong><span>${ticketTypeLabel}</span></div>
          <div style="margin-bottom:0;display:flex;justify-content:space-between;"><strong style="color:#f9fafb;font-weight:600;">Cantidad:</strong><span>${quantity}</span></div>
        </div>
        <div style="margin-bottom:20px;font-size:15px;background:#1f2937;padding:20px;border-radius:8px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:15px;"><span>Tu oferta</span><span>S/ ${totalOffer.toFixed(2)}</span></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:15px;"><span>Comisi\u00f3n de servicio</span><span>S/ ${serviceFee.toFixed(2)}</span></div>
          <div style="display:flex;justify-content:space-between;font-weight:700;font-size:18px;border-top:2px solid #ea5a0a;padding-top:12px;margin-top:12px;color:#f9fafb;"><span>Total cobrado</span><span>S/ ${total.toFixed(2)}</span></div>
        </div>
        <div style="font-size:13px;color:#6b7280;text-align:center;margin-bottom:20px;line-height:1.5;">
          Tu pago fue procesado y la entrada ser\u00e1 transferida a tu cuenta. Recibir\u00e1s una confirmaci\u00f3n cuando est\u00e9 lista.
        </div>
        <div style="text-align:center;margin:24px 0 8px;">
          <a href="https://untzdrop.com/dashboard" style="display:inline-block;padding:14px 40px;background:#ea5a0a;color:#fff;border-radius:8px;font-size:15px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;text-decoration:none;">Ver Mi Entrada</a>
        </div>
        <div style="text-align:center;margin-top:30px;font-size:13px;color:#9ca3af;border-top:1px solid #374151;padding-top:20px;">
          <p style="margin:8px 0;">\u00bfPreguntas? <a href="mailto:ayuda@untzdrop.com" style="color:#ea5a0a;text-decoration:none;">ayuda@untzdrop.com</a></p>
          <div style="margin-top:12px;">
            <a href="https://instagram.com/untzdrop" style="display:inline-block;margin:0 8px;text-decoration:none;">
              <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" width="24" height="24" style="opacity:0.7;">
            </a>
            <a href="https://tiktok.com/@untzdrop" style="display:inline-block;margin:0 8px;text-decoration:none;">
              <img src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png" alt="TikTok" width="24" height="24" style="opacity:0.7;">
            </a>
          </div>
          <p style="margin:8px 0;color:#6b7280;">\u00a9 UntzDrop 2026 \u2014 Lima, Per\u00fa</p>
        </div>
      </div>
    `,
  });
}


export async function sendPayoutOnTheWayEmail({
  to,
  payoutId,
  amount,
  method,
  destination,
  estimatedTime,
}: {
  to: string;
  payoutId: string;
  amount: number;
  method: string;
  destination: string;
  estimatedTime: string;
}) {
  if (!resend) {
    console.warn('RESEND_API_KEY not set — skipping payout email');
    return;
  }

  const todayStr = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });

  await resend.emails.send({
    from: 'UntzDrop <alertas@tx.untzdrop.com>',
    replyTo: 'ayuda@untzdrop.com',
    to,
    subject: `Tu pago de S/ ${amount.toFixed(2)} est\u00e1 en camino`,
    html: `
      <div style="font-family:'Chakra Petch',-apple-system,BlinkMacSystemFont,sans-serif;max-width:500px;margin:20px auto;padding:30px;background:#000;color:#f9fafb;border:1px solid #374151;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.3);line-height:1.6;">
        <div style="text-align:center;border-bottom:2px solid #ea5a0a;padding-bottom:20px;margin-bottom:25px;">
          <img src="https://untzdrop.com/logo.png" alt="UntzDrop" style="max-width:80px;height:auto;">
          <div style="font-size:14px;color:#d1d5db;line-height:1.5;margin-top:12px;">
            <a href="mailto:ayuda@untzdrop.com" style="color:#ea5a0a;text-decoration:none;">ayuda@untzdrop.com</a><br>www.untzdrop.com
          </div>
        </div>
        <div style="text-align:center;padding:20px 0 24px;">
          <div style="font-size:22px;font-weight:700;margin-bottom:4px;">Tu pago est\u00e1 en camino</div>
          <div style="font-size:14px;color:#9ca3af;">Retiro <span style="color:#ea5a0a;font-weight:600;">#${payoutId}</span> \u00b7 ${todayStr}</div>
          <div style="display:inline-block;margin-top:10px;padding:5px 14px;border-radius:20px;font-size:12px;font-weight:600;letter-spacing:0.8px;text-transform:uppercase;background:rgba(5,150,105,0.12);color:#10b981;border:1px solid rgba(5,150,105,0.25);">En proceso</div>
        </div>
        <div style="background:#1f2937;border:1px solid #374151;border-radius:8px;padding:24px 20px;text-align:center;margin-bottom:20px;">
          <div style="font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#6b7280;margin-bottom:8px;">Monto a recibir</div>
          <div style="font-size:36px;font-weight:700;color:#ea5a0a;">S/ ${amount.toFixed(2)}</div>
        </div>
        <div style="margin-bottom:20px;font-size:15px;background:#1f2937;padding:20px;border-radius:8px;">
          <div style="margin-bottom:8px;display:flex;justify-content:space-between;"><strong style="color:#f9fafb;font-weight:600;">M\u00e9todo de retiro:</strong><span>${method}</span></div>
          <div style="margin-bottom:8px;display:flex;justify-content:space-between;"><strong style="color:#f9fafb;font-weight:600;">Destino:</strong><span>${destination}</span></div>
          <div style="margin-bottom:0;display:flex;justify-content:space-between;"><strong style="color:#f9fafb;font-weight:600;">Tiempo estimado:</strong><span>${estimatedTime}</span></div>
        </div>
        <div style="font-size:13px;color:#6b7280;text-align:center;margin-bottom:20px;line-height:1.5;">
          Tu retiro fue solicitado y est\u00e1 siendo procesado. Recibir\u00e1s el dinero en el tiempo indicado. Si no lo ves reflejado despu\u00e9s de ese plazo, cont\u00e1ctanos.
        </div>
        <div style="text-align:center;margin:24px 0 8px;">
          <a href="https://untzdrop.com/dashboard" style="display:inline-block;padding:14px 40px;background:#ea5a0a;color:#fff;border-radius:8px;font-size:15px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;text-decoration:none;">Ver Mi Balance</a>
        </div>
        <div style="text-align:center;margin-top:30px;font-size:13px;color:#9ca3af;border-top:1px solid #374151;padding-top:20px;">
          <p style="margin:8px 0;">\u00bfPreguntas? <a href="mailto:ayuda@untzdrop.com" style="color:#ea5a0a;text-decoration:none;">ayuda@untzdrop.com</a></p>
          <div style="margin-top:12px;">
            <a href="https://instagram.com/untzdrop" style="display:inline-block;margin:0 8px;text-decoration:none;">
              <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" width="24" height="24" style="opacity:0.7;">
            </a>
            <a href="https://tiktok.com/@untzdrop" style="display:inline-block;margin:0 8px;text-decoration:none;">
              <img src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png" alt="TikTok" width="24" height="24" style="opacity:0.7;">
            </a>
          </div>
          <p style="margin:8px 0;color:#6b7280;">\u00a9 UntzDrop 2026 \u2014 Lima, Per\u00fa</p>
        </div>
      </div>
    `,
  });
}

const ADMIN_EMAIL = 'ayuda@untzdrop.com';

export async function sendTicketReviewEmail({
  listingId,
  sellerName,
  sellerEmail,
  eventName,
  eventDate,
  venue,
  ticketType,
  quantity,
  price,
  ticketDownloadUrl,
}: {
  listingId: number;
  sellerName: string;
  sellerEmail: string | null;
  eventName: string;
  eventDate: string;
  venue: string;
  ticketType: string;
  quantity: number;
  price: number;
  ticketDownloadUrl: string;
}) {
  if (!resend) {
    console.warn('RESEND_API_KEY not set — skipping review email');
    return;
  }

  const dateObj = new Date(eventDate);
  const dateStr = dateObj.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const ticketTypeLabel = ticketType === 'vip' ? 'VIP' : 'GA';

  await resend.emails.send({
    from: 'UntzDrop <alertas@tx.untzdrop.com>',
    to: ADMIN_EMAIL,
    subject: `Revisar entrada - ${eventName} (Listing #${listingId})`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;background:#111;color:#fff;padding:30px;border:1px solid #333;">
        <h2 style="color:#ea5a0a;margin:0 0 20px;">Nueva entrada para revisar</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="color:#888;padding:8px 0;">Listing ID</td><td style="padding:8px 0;text-align:right;font-weight:bold;">#${listingId}</td></tr>
          <tr><td style="color:#888;padding:8px 0;">Vendedor</td><td style="padding:8px 0;text-align:right;">${sellerName}</td></tr>
          <tr><td style="color:#888;padding:8px 0;">Email</td><td style="padding:8px 0;text-align:right;">${sellerEmail || 'No registrado'}</td></tr>
          <tr style="border-top:1px solid #333;"><td style="color:#888;padding:8px 0;">Evento</td><td style="padding:8px 0;text-align:right;font-weight:bold;">${eventName}</td></tr>
          <tr><td style="color:#888;padding:8px 0;">Fecha</td><td style="padding:8px 0;text-align:right;">${dateStr}</td></tr>
          <tr><td style="color:#888;padding:8px 0;">Lugar</td><td style="padding:8px 0;text-align:right;">${venue}</td></tr>
          <tr style="border-top:1px solid #333;"><td style="color:#888;padding:8px 0;">Tipo</td><td style="padding:8px 0;text-align:right;">${ticketTypeLabel}</td></tr>
          <tr><td style="color:#888;padding:8px 0;">Cantidad</td><td style="padding:8px 0;text-align:right;">${quantity}</td></tr>
          <tr><td style="color:#888;padding:8px 0;">Precio</td><td style="padding:8px 0;text-align:right;color:#ea5a0a;font-weight:bold;">S/${price} c/u</td></tr>
        </table>
        <div style="text-align:center;margin:24px 0;">
          <a href="${ticketDownloadUrl}" style="display:inline-block;padding:14px 40px;background:#ea5a0a;color:#fff;font-size:15px;font-weight:700;text-decoration:none;">Ver / Descargar Entrada</a>
        </div>
        <p style="font-size:12px;color:#666;text-align:center;">Este enlace expira en 7 dias.</p>
      </div>
    `,
  });
}
