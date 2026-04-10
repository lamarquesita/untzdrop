import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-server';
import { sendTicketEmail } from '@/lib/email';
import { headers } from 'next/headers';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const sig = headersList.get('stripe-signature');

    if (!sig) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.order_id;

        if (orderId) {
          // Fetch order with event + listing info
          const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .select(`
              *,
              events ( name, date, venue, image_url ),
              listings ( ticket_file_path )
            `)
            .eq('id', orderId)
            .single();

          if (orderError || !order) {
            console.error('Error fetching order:', orderError);
            break;
          }

          // Update order status to delivered
          await supabaseAdmin
            .from('orders')
            .update({
              status: 'delivered',
              updated_at: new Date().toISOString(),
            })
            .eq('id', orderId);

          console.log(`Order ${orderId} marked as delivered`);

          // Process referral reward if applicable
          try {
            const { data: pendingReferral } = await supabaseAdmin
              .from('referrals')
              .select('id, referrer_id')
              .eq('referred_id', order.buyer_id)
              .eq('status', 'pending')
              .maybeSingle();

            if (pendingReferral) {
              // Mark referral as completed
              await supabaseAdmin
                .from('referrals')
                .update({ status: 'completed', completed_at: new Date().toISOString() })
                .eq('id', pendingReferral.id);

              // Add S/15 credit to referrer
              await supabaseAdmin.rpc('increment_credit', {
                user_id: pendingReferral.referrer_id,
                amount: 15.00,
              });

              console.log(`Referral reward: S/15 credited to ${pendingReferral.referrer_id}`);
            }
          } catch (refError) {
            console.error('Referral reward error:', refError);
            // Don't fail the webhook
          }

          // Send email with ticket
          if (order.delivery_email && order.listings?.ticket_file_path) {
            try {
              // Generate a long-lived signed URL for the ticket (7 days)
              const { data: signedUrlData } = await supabaseAdmin.storage
                .from('ticket-files')
                .createSignedUrl(order.listings.ticket_file_path, 7 * 24 * 3600);

              if (signedUrlData?.signedUrl) {
                await sendTicketEmail({
                  to: order.delivery_email,
                  eventName: order.events?.name ?? 'Evento',
                  eventDate: order.events?.date ?? '',
                  venue: order.events?.venue ?? '',
                  orderNumber: order.order_number,
                  ticketType: order.ticket_type,
                  quantity: order.ticket_quantity,
                  ticketDownloadUrl: signedUrlData.signedUrl,
                  pricePerTicket: Number(order.price_per_ticket),
                  serviceFee: Number(order.service_fee),
                  total: Number(order.total_amount),
                  eventImageUrl: order.events?.image_url ?? null,
                });
                console.log(`Ticket email sent to ${order.delivery_email}`);
              }
            } catch (emailError) {
              console.error('Error sending ticket email:', emailError);
              // Don't fail the webhook if email fails
            }
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const failedPayment = event.data.object;
        const failedOrderId = failedPayment.metadata.order_id;

        if (failedOrderId) {
          await supabaseAdmin
            .from('orders')
            .update({
              status: 'cancelled',
              updated_at: new Date().toISOString(),
            })
            .eq('id', failedOrderId);

          console.log(`Order ${failedOrderId} marked as cancelled`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
