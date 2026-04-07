"use client";

import LegalLayout from "@/components/LegalLayout";

export default function TermsPage() {
  return (
    <LegalLayout
      title="Términos Suplementarios para Vendedores"
      subtitle="Términos adicionales que aplican a todos los usuarios de la Plataforma de UntzDrop que actúen como Vendedores de boletos."
      date="20 de marzo de 2026"
    >

          <p>
            Estos Términos Suplementarios (&quot;Términos&quot;) se aplican a todos los usuarios de la Plataforma de UntzDrop (incluyendo cualquier Servicio) que actúen como Vendedores de boletos. Según se utiliza en el presente, un usuario que desee vender boletos puede publicar los boletos en UntzDrop como &quot;Vendedor&quot;.
          </p>
          <p>
            Estos Términos están sujetos al <a href="/user-agreement">Acuerdo de Usuario</a> de UntzDrop. Cualquier término en mayúsculas utilizado en el presente que no esté definido tiene el significado dado a dicho término en el Acuerdo de Usuario. La violación de estos Términos Suplementarios puede llevar a la suspensión o terminación de la Cuenta.
          </p>
          <p>
            UntzDrop puede modificar cualquiera de estos Términos en cualquier momento, con o sin previo aviso, sujeto a la ley aplicable.
          </p>
          <p>
            En caso de un cambio en estos Términos, publicaremos una versión revisada de estos Términos aquí, que reemplazará automáticamente cualquier término anterior publicado aquí. Su uso continuado de untzdrop.com y los Servicios de UntzDrop, según se definen en el Acuerdo de Usuario, después de la publicación de cualquier Término revisado constituirá su aceptación de los Términos revisados. Si no está de acuerdo con el Acuerdo de Usuario o los Términos, no continúe usando untzdrop.com ni los servicios de UntzDrop.
          </p>

          {/* ── 1 ── */}
          <h2>1. Publicar Boletos para Venta</h2>
          <p>
            Como parte del proceso de publicación, el Vendedor debe proporcionar información precisa como la descripción del evento, fecha, sección, fila y asiento. Los Vendedores también deben asegurarse de que dichas publicaciones permanezcan precisas. Un Vendedor que publica un boleto para venta en la Plataforma elige vender ese boleto a un precio fijo. El precio fijo puede aumentarse o reducirse siempre que un Comprador no haya comprado los boletos.
          </p>
          <p>
            Los Vendedores están obligados a divulgar si los boletos indican que es una vista limitada u obstruida, solo para silla de ruedas, accesible para silla de ruedas, libre de alcohol, solo mayores de 21 años, o detrás o al costado del escenario, y cualquier otra información que pueda ser relevante para un Comprador. Cierta información es legalmente requerida para ciertos venues, como el valor nominal del boleto. El Vendedor debe proporcionar dicha información legalmente requerida. Una vez enviados, los boletos estarán disponibles para compra inmediata por un Comprador.
          </p>

          <h3>1.1 Restricciones de Publicación</h3>
          <p>Los Vendedores tienen expresamente prohibido publicar para venta:</p>
          <ul>
            <li>Boletos que no poseen o no les han sido asignados (&quot;Boletos Especulativos&quot;);</li>
            <li>Boletos robados;</li>
            <li>Boletos de tipo &quot;recojo en puerta&quot; o &quot;will-call&quot; únicamente;</li>
            <li>Boletos que no otorguen acceso al evento a menos que se indique claramente;</li>
            <li>Asientos no consecutivos;</li>
            <li>Boletos inválidos o cuya venta esté legalmente prohibida;</li>
            <li>Boletos obtenidos mediante el uso de bots, software automatizado, scripts u otros medios tecnológicos que eludan los límites de compra, controles de acceso, colas virtuales, CAPTCHAs u otras medidas de seguridad establecidas por los emisores de boletos, los organizadores de eventos o las plataformas de venta primaria. La obtención de boletos por estos medios podrá constituir un delito informático de conformidad con la Ley N° 30096 (Ley de Delitos Informáticos del Perú).</li>
          </ul>
          <p>No se permite incluir información personal en las notas del vendedor.</p>

          {/* ── 2 ── */}
          <h2>2. Completar Tu Venta</h2>
          <p>
            Completar una venta significa seguir todos los pasos para enviar los boletos comprados, a tiempo y según lo prometido en su publicación. El cumplimiento de órdenes confirmadas, incluyendo la entrega de boletos, es responsabilidad del Vendedor. Si sus boletos requieren entrega manual, aceptación o reclamación por parte del Comprador a través de una plataforma de boletos de terceros, usted asume todo el riesgo de no aceptación o transferencia fallida, y dicho fallo será tratado como no entrega bajo estos Términos.
          </p>

          <h3>2.1 Plazos de Entrega</h3>
          <div>
            <table>
              <thead>
                <tr>
                  <th>Tiempo antes del evento</th>
                  <th>Plazo de entrega</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Más de 24 horas</td>
                  <td>Dentro de 24 horas (a menos que se indique lo contrario, como un retraso en la transferencia de terceros)</td>
                </tr>
                <tr>
                  <td>12 – 24 horas</td>
                  <td>Dentro de 12 horas</td>
                </tr>
                <tr>
                  <td>6 – 12 horas</td>
                  <td>Dentro de 2 horas</td>
                </tr>
                <tr>
                  <td>0 – 6 horas</td>
                  <td>Dentro de 1 hora</td>
                </tr>
                <tr>
                  <td>Después del inicio del evento</td>
                  <td>Dentro de 15 minutos</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>2.2 Órdenes Abandonadas</h3>
          <p>
            Si sus boletos se han vendido pero no puede cumplir con la orden o hubo un problema con el cumplimiento, se considera una &quot;Orden Abandonada&quot;. UntzDrop se reserva el derecho de designar, a su entera discreción, cualquier acción del Vendedor en violación de estos Términos o del Acuerdo de Usuario como una Orden Abandonada, incluyendo pero no limitado a las siguientes situaciones:
          </p>
          <ul>
            <li>El Vendedor no puede cumplir con la orden;</li>
            <li>La entrega de boletos falla;</li>
            <li>UntzDrop rechaza cualquier cambio solicitado a la publicación original y cancela la orden;</li>
            <li>Los boletos entregados son inválidos, fraudulentos, falsificados, incorrectos o tergiversados.</li>
          </ul>
          <p>
            En caso de que ocurra una Orden Abandonada, UntzDrop puede, a su entera discreción, cobrar al Vendedor una cantidad de <strong>hasta o superior al 200% del precio de los boletos vendidos</strong> para compensarnos por los gastos en los que incurrimos para cumplir con nuestras obligaciones con el Comprador. UntzDrop se reserva el derecho de suspender o terminar su Cuenta de UntzDrop en caso de una Orden Abandonada. Si un Vendedor cree que un cargo por no entrega ha sido aplicado por error, puede contactar al equipo de servicio al cliente de UntzDrop dentro de las 48 horas posteriores a la notificación del cargo con la evidencia correspondiente.
          </p>

          {/* ── 3 ── */}
          <h2>3. Pagos</h2>
          <p>
            Antes o después de su primera venta en UntzDrop, puede configurar su cuenta con nuestro proveedor de pagos de terceros. Para configurar una cuenta y así recibir pagos por sus ventas en UntzDrop, se le requiere aceptar y adherirse a cualquier término y condición adicional asociado con el proveedor de pagos de terceros.
          </p>
          <p>
            Después de la recepción del dinero del Comprador por parte de UntzDrop, UntzDrop, a través de su proveedor de pagos de terceros, remitirá al Vendedor el precio del/los boleto(s), menos cualquier tarifa, cargo, compensación y otros montos adeudados a UntzDrop de conformidad con los términos del presente. Los pagos se procesan típicamente dentro de uno (1) a dos (2) días hábiles después de la confirmación de la entrega válida del boleto y la recepción por parte de UntzDrop de una solicitud de retiro. Sin embargo, el tiempo real de pago puede variar según el método de pago elegido por el Vendedor, la fecha del evento y los requisitos específicos de la plataforma de boletos. En algunos casos, los pagos pueden ocurrir uno (1) a dos (2) días hábiles después del evento por razones de seguridad. Se pueden imponer tarifas adicionales de retiro a Vendedores no basados en Perú, las cuales serán deducidas del monto total de remesa a la entera discreción de UntzDrop.
          </p>
          <p>
            Usted acepta y reconoce que el Comprador aplicable (y no UntzDrop) es el único responsable del pago por los boletos que usted proporciona. Usted además acepta y reconoce que UntzDrop no tiene ninguna responsabilidad ni obligación de realizar o remitir ningún pago a usted (como Vendedor) por cualquier boleto proporcionado a menos que y en la medida en que UntzDrop haya recibido efectivamente el pago de las Tarifas del Comprador aplicable por dichos boletos.
          </p>

          {/* ── 4 ── */}
          <h2>4. Comunicación con Compradores</h2>
          <p>
            UntzDrop puede proporcionar a los Vendedores cierta información relacionada con los Compradores, como su información de contacto, para que los Vendedores puedan enviarles los boletos. Los Vendedores tienen prohibido usar dicha información para cualquier propósito que no sea el cumplimiento de sus obligaciones de proporcionar los boletos comprados a los Compradores. Los Vendedores no incluirán, en ninguna comunicación a ningún Comprador, ningún contenido o información que no sean los boletos comprados o para coordinar la transferencia de los mismos. Otras solicitudes, información de contacto, o marketing o publicidad están prohibidos. UntzDrop no es responsable de ningún uso de dicha información proporcionada por el Vendedor.
          </p>

          {/* ── 5 ── */}
          <h2>5. Políticas Generales del Vendedor</h2>
          <p>
            Como Vendedor, usted otorga a UntzDrop permiso para debitar su saldo o cargar la tarjeta de crédito o débito asociada con su cuenta registrada por todos y cada uno de los cargos, tarifas, responsabilidades, daños y gastos incurridos por UntzDrop si en cualquier momento el Vendedor no entrega los boletos que ha publicado o entrega boletos inválidos, fraudulentos, falsificados, incorrectos o tergiversados.
          </p>
          <p>
            Puede haber ocasiones en que UntzDrop requiera que los boletos publicados sean entregados a UntzDrop antes de la venta. Al venderse los boletos, UntzDrop los entregará al Comprador en nombre del Vendedor. En caso de que los boletos no se vendan, o la publicación sea eliminada, los boletos serán devueltos y aceptados por el Vendedor.
          </p>
          <p>
            UntzDrop no garantiza que los boletos que publique se vendan, que usted ganará una cantidad particular de dinero comercializando y vendiendo boletos en UntzDrop, o que algún Comprador completará alguna transacción con usted o podrá pagar por los boletos. Además, UntzDrop no garantiza que los boletos serán publicados de alguna manera particular o con alguna preferencia o que aparecerán dentro de algún período de tiempo particular. UntzDrop se reserva el derecho de restringir la publicación de boletos para venta y de eliminar publicaciones de boletos no vendidos para cualquier evento.
          </p>
          <p>
            Si tiene una disputa con uno o más usuarios (incluyendo Compradores u otros Vendedores), usted libera a UntzDrop y todas las compañías afiliadas, funcionarios, directores, agentes, matrices, subsidiarias, representantes legales y empleados de cualquier reclamación, demanda y daños (reales y consecuentes) de todo tipo y naturaleza, conocidos y desconocidos, sospechados y no sospechados, divulgados y no divulgados, que surjan de o estén de alguna manera conectados con dicha disputa.
          </p>
          <p>
            El Vendedor acepta indemnizar y mantener indemne a UntzDrop de cualquier pérdida, costo, responsabilidad y gasto (incluyendo honorarios razonables de abogados) relacionados con o que surjan del incumplimiento o presunto incumplimiento del Vendedor de estos Términos Suplementarios.
          </p>

          {/* ── 6 ── */}
          <h2>6. Cancelación y Postergación de Eventos</h2>
          <p>
            UntzDrop notificará al Vendedor de cualquier evento cancelado. Si necesita que se le devuelvan sus boletos para obtener un reembolso del precio de compra original, debe contactarnos en <a href="mailto:ayuda@untzdrop.com">ayuda@untzdrop.com</a>.
          </p>
          <p>
            Si un evento es postergado, los Vendedores tienen prohibido revender, invalidar o cambiar boletos para eventos postergados.
          </p>

          {/* ── 7 ── */}
          <h2>7. Impuestos</h2>
          <p>
            UntzDrop no es responsable de ninguna manera por la exactitud o idoneidad de cualquier pago de cualquier impuesto aplicable en su nombre, excepto según lo requiera la ley. Como Vendedor, usted es responsable de recaudar y remitir todos los impuestos internacionales, federales, estatales o municipales aplicables en conexión con las ventas de boletos, excepto donde la ley nos requiera calcular, recaudar y remitir el impuesto a las ventas sobre dichas ventas.
          </p>
          <p>
            Emitimos formularios tributarios al concluir el año calendario a cualquier Vendedor que cumpla con los umbrales establecidos por SUNAT para documentar dichas ventas según los requisitos tributarios. Usted acepta proporcionar a UntzDrop su número de RUC u otro número de identificación tributaria, si es necesario, para que UntzDrop proporcione información a las autoridades tributarias relevantes relacionada con los pagos que recibe de nosotros.
          </p>

          {/* ── Contacto ── */}
          <h2>Contacto</h2>
          <p>
            UntzDrop S.A.C.<br />
            Correo electrónico: <a href="mailto:ayuda@untzdrop.com">ayuda@untzdrop.com</a><br />
            Sitio web: untzdrop.com
          </p>
    </LegalLayout>
  );
}
