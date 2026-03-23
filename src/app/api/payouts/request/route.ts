import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseFromRequest, supabaseAdmin } from '@/lib/supabase-server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseFromRequest(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get profile with Connect account
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_connect_account_id, stripe_connect_onboarded')
      .eq('id', user.id)
      .single();

    if (!profile?.stripe_connect_account_id || !profile.stripe_connect_onboarded) {
      return NextResponse.json(
        { error: 'Debes completar la configuración de pagos primero' },
        { status: 400 }
      );
    }

    // Calculate available balance from delivered/completed orders
    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('total_amount, service_fee')
      .eq('seller_id', user.id)
      .in('status', ['delivered', 'completed']);

    // Get already paid out amounts
    const { data: existingPayouts } = await supabaseAdmin
      .from('payouts')
      .select('amount')
      .eq('seller_id', user.id)
      .in('status', ['pending', 'processing', 'completed']);

    const totalEarnings = (orders ?? []).reduce(
      (sum, o) => sum + Number(o.total_amount) - Number(o.service_fee), 0
    );
    const totalPaidOut = (existingPayouts ?? []).reduce(
      (sum, p) => sum + Number(p.amount), 0
    );
    const availableBalance = Math.round((totalEarnings - totalPaidOut) * 100) / 100;

    if (availableBalance <= 0) {
      return NextResponse.json(
        { error: 'No tienes balance disponible para solicitar' },
        { status: 400 }
      );
    }

    // Create Stripe Transfer to Connected Account
    const transfer = await stripe.transfers.create({
      amount: Math.round(availableBalance * 100), // centavos
      currency: 'pen',
      destination: profile.stripe_connect_account_id,
      metadata: {
        user_id: user.id,
      },
    });

    // Record payout
    const { data: payout, error: payoutError } = await supabase
      .from('payouts')
      .insert({
        seller_id: user.id,
        amount: availableBalance,
        currency: 'PEN',
        status: 'processing',
        stripe_transfer_id: transfer.id,
      })
      .select()
      .single();

    if (payoutError) {
      console.error('Error recording payout:', payoutError);
    }

    // Mark related orders as completed
    await supabaseAdmin
      .from('orders')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('seller_id', user.id)
      .in('status', ['delivered']);

    return NextResponse.json({
      success: true,
      amount: availableBalance,
      transfer_id: transfer.id,
    });

  } catch (error) {
    console.error('Payout request error:', error);
    return NextResponse.json({ error: 'Error procesando el pago' }, { status: 500 });
  }
}
