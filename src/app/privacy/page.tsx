"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-extrabold mb-2 font-[family-name:var(--font-chakra)]">
          Política de Privacidad
        </h1>
        <p className="text-sm text-[#888] mb-10">UntzDrop S.A.C. — Vigente: 20 de marzo de 2026</p>

        <div className="prose-dark space-y-6 text-sm text-[#ccc] leading-relaxed">
          <p>
            Esta Política de Privacidad (&quot;Política&quot;) describe cómo UntzDrop S.A.C. (&quot;UntzDrop&quot;, &quot;nosotros&quot;, &quot;nuestro&quot;) recopila, utiliza, almacena, comparte y protege su información personal cuando usted utiliza nuestra plataforma untzdrop.com, nuestra aplicación móvil y servicios relacionados (colectivamente, la &quot;Plataforma&quot;).
          </p>
          <p>
            Esta Política ha sido elaborada en cumplimiento de la Ley de Protección de Datos Personales del Perú (Ley N° 29733), su Reglamento (Decreto Supremo N° 003-2013-JUS) y demás normativa aplicable en materia de protección de datos personales.
          </p>
          <p>
            Al utilizar nuestra Plataforma, usted acepta las prácticas descritas en esta Política. Le recomendamos leer esta Política detenidamente.
          </p>

          <h2 className="text-lg font-bold text-white pt-4">1. Responsable del Tratamiento</h2>
          <p>El responsable del tratamiento de sus datos personales es:</p>
          <p>UntzDrop S.A.C.<br />Correo electrónico: ayuda@untzdrop.com<br />Sitio web: untzdrop.com</p>

          <h2 className="text-lg font-bold text-white pt-4">2. Información que Recopilamos</h2>
          <h3 className="text-base font-semibold text-white">2.1 Información que usted nos proporciona directamente</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Información de registro:</strong> nombre completo, dirección de correo electrónico, número de teléfono, contraseña, fecha de nacimiento.</li>
            <li><strong>Información de perfil:</strong> fotografía, preferencias de eventos, ubicación.</li>
            <li><strong>Información de pago:</strong> datos de tarjeta de crédito o débito, información de cuenta bancaria (procesados de forma segura por nuestros procesadores de pago).</li>
            <li><strong>Información de transacciones:</strong> historial de compras y ventas, detalles de entradas.</li>
            <li><strong>Comunicaciones:</strong> mensajes enviados a través de la Plataforma, consultas de servicio al cliente, comentarios y reseñas.</li>
            <li><strong>Información de verificación de identidad:</strong> documento de identidad (DNI, pasaporte, carné de extranjería) cuando sea requerido para verificación.</li>
          </ul>

          <h3 className="text-base font-semibold text-white">2.2 Información recopilada automáticamente</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Información del dispositivo:</strong> tipo de dispositivo, sistema operativo, identificadores únicos del dispositivo, configuración de idioma.</li>
            <li><strong>Información de uso:</strong> páginas visitadas, funciones utilizadas, tiempo de sesión, patrones de navegación.</li>
            <li><strong>Información de ubicación:</strong> ubicación aproximada basada en dirección IP; ubicación precisa solo con su consentimiento explícito.</li>
            <li><strong>Información de registro (logs):</strong> dirección IP, tipo de navegador, proveedor de servicios de Internet, páginas de referencia.</li>
            <li><strong>Cookies y tecnologías similares:</strong> conforme a nuestra Política de Cookies.</li>
          </ul>

          <h3 className="text-base font-semibold text-white">2.3 Información de terceros</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Información de redes sociales si vincula su cuenta con plataformas como Facebook, Google o Apple.</li>
            <li>Información de procesadores de pago para verificación y prevención de fraude.</li>
            <li>Información pública disponible para verificación de identidad.</li>
          </ul>

          <h2 className="text-lg font-bold text-white pt-4">3. Cookies y Tecnologías Similares</h2>
          <p>Utilizamos cookies y tecnologías similares para mejorar su experiencia en la Plataforma. Para más información, consulte nuestra Política de Cookies disponible en untzdrop.com/cookies.</p>

          <h2 className="text-lg font-bold text-white pt-4">4. Cómo Utilizamos su Información</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Prestación del servicio:</strong> crear y gestionar su cuenta, procesar transacciones, facilitar la compra y venta de entradas, enviar confirmaciones y actualizaciones.</li>
            <li><strong>Comunicaciones:</strong> responder a sus consultas, enviar notificaciones sobre su cuenta y transacciones, proporcionar servicio al cliente.</li>
            <li><strong>Mejora de la Plataforma:</strong> analizar el uso de la Plataforma, identificar tendencias, desarrollar nuevas funcionalidades.</li>
            <li><strong>Seguridad y prevención de fraude:</strong> detectar y prevenir actividades fraudulentas, verificar identidades.</li>
            <li><strong>Personalización:</strong> personalizar su experiencia, mostrar contenido y recomendaciones relevantes.</li>
            <li><strong>Marketing:</strong> enviar comunicaciones promocionales con su consentimiento previo.</li>
            <li><strong>Cumplimiento legal:</strong> cumplir con obligaciones legales, responder a solicitudes de autoridades competentes.</li>
          </ul>

          <h2 className="text-lg font-bold text-white pt-4">5. Base Legal del Tratamiento</h2>
          <p>De conformidad con la Ley N° 29733, tratamos sus datos personales basándonos en las siguientes bases legales:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Consentimiento:</strong> usted ha otorgado su consentimiento para el tratamiento de sus datos personales.</li>
            <li><strong>Ejecución contractual:</strong> el tratamiento es necesario para la ejecución del contrato.</li>
            <li><strong>Obligación legal:</strong> el tratamiento es necesario para cumplir con una obligación legal.</li>
            <li><strong>Interés legítimo:</strong> el tratamiento es necesario para satisfacer intereses legítimos de UntzDrop.</li>
          </ul>

          <h2 className="text-lg font-bold text-white pt-4">6. Conservación de Datos</h2>
          <p>Conservaremos sus datos personales durante el tiempo necesario para cumplir con los fines descritos en esta Política. Los criterios incluyen:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>La duración de su relación contractual con UntzDrop.</li>
            <li>La existencia de obligaciones legales de conservación (mínimo 5 años para obligaciones tributarias).</li>
            <li>La necesidad de conservar datos para la defensa de reclamaciones legales.</li>
            <li>Razones de seguridad y prevención de fraude.</li>
          </ul>

          <h2 className="text-lg font-bold text-white pt-4">7. Divulgación de Información</h2>
          <p>Podemos compartir su información personal con:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Otros usuarios:</strong> información necesaria para completar transacciones.</li>
            <li><strong>Proveedores de servicios:</strong> procesadores de pago (Stripe), proveedores de alojamiento, servicios de análisis.</li>
            <li><strong>Organizadores de eventos:</strong> información necesaria para la verificación y validez de entradas.</li>
            <li><strong>Autoridades competentes:</strong> cuando sea requerido por ley, orden judicial o proceso legal.</li>
            <li><strong>Reestructuración empresarial:</strong> en caso de fusión, adquisición o venta de activos.</li>
          </ul>
          <p><strong>No vendemos sus datos personales a terceros con fines de marketing.</strong></p>

          <h2 className="text-lg font-bold text-white pt-4">8. Transferencias Internacionales de Datos</h2>
          <p>Sus datos personales podrán ser transferidos y tratados en países distintos al Perú, donde nuestros proveedores de servicios operan. Nos aseguraremos de que existan garantías adecuadas para la protección de sus datos.</p>

          <h2 className="text-lg font-bold text-white pt-4">9. Sus Derechos como Titular de Datos Personales</h2>
          <p>De conformidad con la Ley N° 29733, usted tiene los siguientes derechos:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Derecho de acceso:</strong> solicitar información sobre los datos que mantenemos sobre usted.</li>
            <li><strong>Derecho de rectificación:</strong> solicitar la corrección de datos inexactos o incompletos.</li>
            <li><strong>Derecho de cancelación:</strong> solicitar la eliminación de sus datos personales.</li>
            <li><strong>Derecho de oposición:</strong> oponerse al tratamiento de sus datos por motivos legítimos.</li>
            <li><strong>Derecho a revocar el consentimiento:</strong> retirar su consentimiento en cualquier momento.</li>
            <li><strong>Derecho a la portabilidad:</strong> solicitar la entrega de sus datos en formato estructurado.</li>
            <li><strong>Derecho a no ser objeto de decisiones automatizadas.</strong></li>
          </ul>
          <p>Para ejercer cualquiera de estos derechos, envíe su solicitud a <a href="mailto:ayuda@untzdrop.com" className="text-primary">ayuda@untzdrop.com</a>. Responderemos dentro de diez (10) días hábiles.</p>

          <h2 className="text-lg font-bold text-white pt-4">10. Seguridad de la Información</h2>
          <p>Implementamos medidas de seguridad técnicas, administrativas y físicas apropiadas, incluyendo cifrado de datos, controles de acceso, monitoreo de sistemas y evaluaciones periódicas de seguridad.</p>

          <h2 className="text-lg font-bold text-white pt-4">11. Privacidad de Menores</h2>
          <p>La Plataforma no está dirigida a menores de dieciocho (18) años. No recopilamos intencionalmente información personal de menores de edad. Contacte <a href="mailto:ayuda@untzdrop.com" className="text-primary">ayuda@untzdrop.com</a> si cree que un menor ha proporcionado información.</p>

          <h2 className="text-lg font-bold text-white pt-4">12. Modificaciones a esta Política</h2>
          <p>UntzDrop se reserva el derecho de modificar esta Política en cualquier momento. Le notificaremos sobre cambios sustanciales a través de los medios de contacto registrados en su cuenta.</p>

          <h2 className="text-lg font-bold text-white pt-4">13. Contacto</h2>
          <p>UntzDrop S.A.C.<br />Correo electrónico: <a href="mailto:ayuda@untzdrop.com" className="text-primary">ayuda@untzdrop.com</a><br />Sitio web: untzdrop.com</p>
          <p className="text-xs text-[#666]">También puede contactar a la Autoridad Nacional de Protección de Datos Personales (ANPDP) del Ministerio de Justicia y Derechos Humanos del Perú.</p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
