import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseFromRequest, supabaseAdmin } from '@/lib/supabase-server';
import { stripe } from '@/lib/stripe';

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseFromRequest(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_connect_account_id, stripe_connect_onboarded')
      .eq('id', user.id)
      .single();

    if (!profile?.stripe_connect_account_id) {
      return NextResponse.json({
        connected: false,
        onboarded: false,
        payoutsEnabled: false,
      });
    }

    // Check account status with Stripe
    const account = await stripe.accounts.retrieve(profile.stripe_connect_account_id);
    const onboarded = account.details_submitted ?? false;
    const payoutsEnabled = account.payouts_enabled ?? false;

    // Update profile if onboarding just completed
    if (onboarded && !profile.stripe_connect_onboarded) {
      await supabaseAdmin
        .from('profiles')
        .update({ stripe_connect_onboarded: true })
        .eq('id', user.id);
    }

    return NextResponse.json({
      connected: true,
      onboarded,
      payoutsEnabled,
      accountId: profile.stripe_connect_account_id,
    });

  } catch (error) {
    console.error('Connect status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
