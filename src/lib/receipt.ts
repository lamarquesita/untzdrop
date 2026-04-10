import { Order } from "@/lib/mockDashboard";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatEventDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function generateReceiptHTML(order: Order): string {
  const ticketTypeLabel = order.ticketType === "vip" ? "VIP" : "General Admission (GA)";
  const subtotal = order.payment.subtotal;
  const fee = order.payment.serviceFee;
  const total = order.payment.total;
  const lineTotal = order.pricePerTicket * order.ticketQuantity;
  const eventImageUrl = order.event.image_url;

  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recibo de Orden - UntzDrop</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@300;400;500;600;700&display=swap');
        body {
            font-family: 'Chakra Petch', sans-serif;
            max-width: 500px;
            margin: 20px auto;
            padding: 30px;
            background: #000000;
            color: #f9fafb;
            border: 1px solid #374151;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            line-height: 1.6;
        }
        .header { text-align: center; border-bottom: 2px solid #ea5a0a; padding-bottom: 20px; margin-bottom: 25px; }
        .logo-container { margin-bottom: 15px; }
        .logo { max-width: 80px; height: auto; }
        .company-info { font-size: 14px; color: #d1d5db; line-height: 1.5; }
        .company-info a { color: #ea5a0a; text-decoration: none; }
        .receipt-info { margin-bottom: 25px; font-size: 15px; background: #1f2937; padding: 20px; border-radius: 8px; }
        .receipt-info div { margin-bottom: 8px; display: flex; justify-content: space-between; }
        .receipt-info div:last-child { margin-bottom: 0; }
        .receipt-info strong { color: #f9fafb; font-weight: 600; }
        .event-section { margin: 25px 0; text-align: center; }
        .event-image { width: 100%; max-width: 400px; height: 200px; object-fit: cover; border-radius: 12px; margin-bottom: 15px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }
        .event-image-placeholder { width: 100%; max-width: 400px; height: 200px; border-radius: 12px; margin: 0 auto 15px; background: #1f2937; border: 1px dashed #374151; display: flex; align-items: center; justify-content: center; color: #6b7280; font-size: 13px; }
        .event-name { font-size: 20px; font-weight: 700; color: #ea5a0a; margin-bottom: 8px; }
        .event-details { font-size: 14px; color: #d1d5db; margin-bottom: 5px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; background: #1f2937; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3); }
        .items-table th, .items-table td { text-align: left; padding: 12px 15px; border-bottom: 1px solid #374151; }
        .items-table th { background: #374151; border-bottom: 2px solid #4b5563; font-weight: 600; color: #f9fafb; font-size: 14px; }
        .items-table td { font-size: 14px; color: #d1d5db; }
        .quantity, .price { text-align: right; font-weight: 500; }
        .totals { border-top: 2px solid #374151; padding-top: 20px; margin-top: 25px; }
        .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 15px; }
        .grand-total { font-weight: 700; font-size: 18px; border-top: 2px solid #ea5a0a; padding-top: 12px; margin-top: 15px; color: #f9fafb; }
        .payment-section { background: #1f2937; padding: 15px; border-radius: 8px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; font-size: 13px; color: #d1d5db; border-top: 1px solid #374151; padding-top: 20px; }
        .footer a { color: #ea5a0a; text-decoration: none; }
        @media print { body { border: none; box-shadow: none; margin: 0; padding: 20px; } }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo-container">
            <img src="https://untzdrop.com/logo.png" alt="UntzDrop" class="logo">
        </div>
        <div class="company-info">
            <a href="mailto:ayuda@untzdrop.com">ayuda@untzdrop.com</a><br>
            www.untzdrop.com
        </div>
    </div>

    <div class="receipt-info">
        <div><strong>Nro. de Orden:</strong> <span>${order.orderNumber}</span></div>
        <div><strong>Fecha:</strong> <span>${formatDate(order.datePurchased)}</span></div>
        <div><strong>Hora:</strong> <span>${formatTime(order.datePurchased)}</span></div>
        <div><strong>Email:</strong> <span>${order.delivery.email}</span></div>
    </div>

    <div class="event-section">
        ${eventImageUrl
          ? `<img src="${eventImageUrl}" alt="${order.event.name}" class="event-image">`
          : `<div class="event-image-placeholder">Imagen del evento</div>`
        }
        <div class="event-name">${order.event.name}</div>
        <div class="event-details">${formatEventDate(order.event.date)} a las ${formatTime(order.event.date)}</div>
        <div class="event-details">${order.event.venue}</div>
    </div>

    <table class="items-table">
        <thead>
            <tr>
                <th>Tipo de Entrada</th>
                <th class="quantity">Cant.</th>
                <th class="price">Precio</th>
                <th class="price">Total</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>${ticketTypeLabel}</td>
                <td class="quantity">${order.ticketQuantity}</td>
                <td class="price">S/ ${order.pricePerTicket.toFixed(2)}</td>
                <td class="price">S/ ${lineTotal.toFixed(2)}</td>
            </tr>
        </tbody>
    </table>

    <div class="totals">
        <div class="total-row">
            <span>Subtotal:</span>
            <span>S/ ${subtotal.toFixed(2)}</span>
        </div>
        <div class="total-row">
            <span>Comisión de servicio:</span>
            <span>S/ ${fee.toFixed(2)}</span>
        </div>
        <div class="total-row grand-total">
            <span>Total Pagado:</span>
            <span>S/ ${total.toFixed(2)}</span>
        </div>
    </div>

    <div class="payment-section">
        <div class="total-row">
            <span>Método de Pago:</span>
            <span>${order.payment.cardBrand}</span>
        </div>
        <div class="total-row">
            <span>Tarjeta:</span>
            <span>****${order.payment.cardLast4}</span>
        </div>
        <div class="total-row">
            <span>Nro. de Orden:</span>
            <span>${order.orderNumber}</span>
        </div>
    </div>

    <div class="footer">
        <p>¿Preguntas? Escríbenos a <a href="mailto:ayuda@untzdrop.com">ayuda@untzdrop.com</a></p>
    </div>
</body>
</html>`;
}

export function openReceipt(order: Order) {
  const html = generateReceiptHTML(order);
  const newWindow = window.open("", "_blank");
  if (newWindow) {
    newWindow.document.write(html);
    newWindow.document.close();
  }
}
