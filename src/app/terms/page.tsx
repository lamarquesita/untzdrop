"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-extrabold mb-2 font-[family-name:var(--font-chakra)]">
          Términos Suplementarios para Vendedores
        </h1>
        <p className="text-sm text-[#888] mb-10">UntzDrop S.A.C. — Vigente: 20 de marzo de 2026</p>

        <div className="prose-dark space-y-6 text-sm text-[#ccc] leading-relaxed">
          <p>
            Estos Términos Suplementarios para Vendedores (&quot;Términos para Vendedores&quot;) complementan el Acuerdo de Usuario de UntzDrop y establecen las condiciones adicionales aplicables a los usuarios que publican entradas para venta en la Plataforma (&quot;Vendedores&quot;). Al publicar una entrada para venta, usted acepta estar sujeto tanto al Acuerdo de Usuario como a estos Términos para Vendedores.
          </p>
          <p>En caso de conflicto entre estos Términos para Vendedores y el Acuerdo de Usuario, prevalecerán estos Términos para Vendedores en lo que respecta a las actividades de venta.</p>

          <h2 className="text-lg font-bold text-white pt-4">1. Publicar Entradas para Venta</h2>
          <p>Al publicar entradas para venta en la Plataforma, usted declara y garantiza que:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Es el titular legítimo de las entradas o está debidamente autorizado para venderlas.</li>
            <li>Las entradas son auténticas, válidas y no han sido duplicadas, falsificadas ni alteradas.</li>
            <li>Las entradas no han sido reportadas como robadas ni están sujetas a restricciones de transferencia que impidan su venta.</li>
            <li>Toda la información proporcionada sobre las entradas es precisa y completa.</li>
            <li>Las entradas cumplen con todas las leyes y regulaciones aplicables, incluyendo las leyes peruanas sobre reventa de entradas.</li>
            <li>No publicará la misma entrada en múltiples plataformas simultáneamente sin actualizar inmediatamente la disponibilidad.</li>
          </ul>
          <p><strong>Restricciones adicionales:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>No podrá publicar entradas para eventos que hayan ocurrido o cuya fecha de inicio haya pasado.</li>
            <li>No podrá establecer precios que se consideren abusivos o que violen las leyes de protección al consumidor.</li>
            <li>No podrá utilizar prácticas engañosas para inflar artificialmente los precios.</li>
          </ul>
          <p>UntzDrop se reserva el derecho de eliminar publicaciones que considere inadecuadas, fraudulentas o que violen estos Términos.</p>

          <h2 className="text-lg font-bold text-white pt-4">2. Completar Tu Venta</h2>
          <p>Una vez que un comprador adquiere sus entradas, usted está obligado contractualmente a completar la venta.</p>

          <h3 className="text-base font-semibold text-white">2.1 Entrega de Entradas</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Deberá entregar las entradas al comprador dentro del plazo establecido por la Plataforma.</li>
            <li>Las entradas electrónicas deberán transferirse dentro de las 24 horas siguientes a la confirmación de la venta.</li>
            <li>Las entradas físicas deberán enviarse dentro del plazo indicado, utilizando un método de envío con seguimiento.</li>
            <li>Deberá confirmar la entrega a través de la Plataforma.</li>
          </ul>

          <h3 className="text-base font-semibold text-white">2.2 Órdenes Abandonadas</h3>
          <p>Si no completa la entrega de las entradas dentro del plazo establecido (&quot;Orden Abandonada&quot;), UntzDrop podrá:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Cancelar la orden y reembolsar al comprador.</li>
            <li>Cobrarle una penalización por orden abandonada.</li>
            <li>Suspender o cancelar su cuenta de vendedor.</li>
            <li>Retener fondos de ventas futuras como garantía.</li>
            <li>Prohibirle publicar nuevas entradas por un período determinado.</li>
          </ul>

          <h3 className="text-base font-semibold text-white">2.3 Cronogramas de Entrega</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Entradas electrónicas/digitales:</strong> dentro de las 24 horas posteriores a la venta.</li>
            <li><strong>Entradas móviles:</strong> dentro de las 48 horas posteriores a la venta o cuando la transferencia esté disponible.</li>
            <li><strong>Entradas físicas:</strong> con suficiente anticipación para que el comprador las reciba antes del evento.</li>
            <li><strong>Eventos próximos (dentro de 5 días):</strong> entrega inmediata o dentro de las 6 horas.</li>
          </ul>

          <h2 className="text-lg font-bold text-white pt-4">3. Pagos</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Los pagos se procesarán después de que el comprador confirme la recepción de las entradas o después de la realización del evento.</li>
            <li>UntzDrop deducirá las comisiones y tarifas de servicio aplicables del monto de la venta.</li>
            <li>Los pagos se realizarán mediante transferencia bancaria o el método de pago registrado en su cuenta.</li>
            <li>Los tiempos de procesamiento pueden variar entre 5 y 15 días hábiles.</li>
            <li>UntzDrop se reserva el derecho de retener pagos en caso de disputas o sospecha de fraude.</li>
            <li>Todos los montos se expresan en soles peruanos (PEN).</li>
            <li>En caso de contracargo, UntzDrop podrá deducir el monto de pagos futuros.</li>
          </ul>

          <h2 className="text-lg font-bold text-white pt-4">4. Comunicación con Compradores</h2>
          <p>Toda comunicación entre vendedores y compradores debe realizarse exclusivamente a través de la Plataforma. Queda prohibido:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Solicitar o proporcionar información de contacto personal fuera de la Plataforma.</li>
            <li>Intentar completar transacciones fuera de la Plataforma para eludir las tarifas de servicio.</li>
            <li>Enviar comunicaciones comerciales no solicitadas a compradores.</li>
            <li>Utilizar lenguaje abusivo, amenazante o inapropiado.</li>
            <li>Compartir información personal de compradores con terceros.</li>
          </ul>

          <h2 className="text-lg font-bold text-white pt-4">5. Políticas Generales del Vendedor</h2>
          <p>Como vendedor, usted se compromete a:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Mantener actualizada la información de sus publicaciones.</li>
            <li>Responder oportunamente a las consultas de los compradores y de UntzDrop.</li>
            <li>Cumplir con todas las leyes y regulaciones aplicables.</li>
            <li>Mantener un nivel de servicio satisfactorio.</li>
            <li>No participar en prácticas que manipulen artificialmente las calificaciones.</li>
            <li>Cumplir con las políticas de reembolso y devolución de UntzDrop.</li>
          </ul>

          <h2 className="text-lg font-bold text-white pt-4">6. Cancelación de Eventos</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Si el evento es cancelado definitivamente, la venta se cancelará y el comprador recibirá un reembolso. No se le realizará el pago al vendedor.</li>
            <li>Si el evento es aplazado o reprogramado, la venta permanecerá vigente salvo que el comprador solicite un reembolso.</li>
            <li>El vendedor no recibirá compensación por pérdidas derivadas de la cancelación de eventos.</li>
            <li>Si ya recibió el pago por una venta que posteriormente se cancela, deberá reembolsar el monto correspondiente a UntzDrop.</li>
          </ul>

          <h2 className="text-lg font-bold text-white pt-4">7. Impuestos</h2>
          <p>Como vendedor, usted es responsable de:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Determinar y cumplir con todas las obligaciones tributarias aplicables, incluyendo el IGV y el Impuesto a la Renta.</li>
            <li>Emitir los comprobantes de pago correspondientes cuando así lo requiera la legislación peruana.</li>
            <li>Declarar los ingresos obtenidos por la venta de entradas ante SUNAT.</li>
            <li>Asumir cualquier responsabilidad tributaria derivada de sus actividades de venta en la Plataforma.</li>
          </ul>
          <p>UntzDrop no proporciona asesoría tributaria y recomienda consultar con un profesional calificado.</p>

          <h2 className="text-lg font-bold text-white pt-4">Contacto</h2>
          <p>UntzDrop S.A.C.<br />Correo electrónico: <a href="mailto:ayuda@untzdrop.com" className="text-primary">ayuda@untzdrop.com</a><br />Sitio web: untzdrop.com</p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
