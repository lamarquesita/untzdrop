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

    // Check if user already has a Connect account
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_connect_account_id, stripe_connect_onboarded, email')
      .eq('id', user.id)
      .single();

    let accountId = profile?.stripe_connect_account_id;

    if (!accountId) {
      // Create a new Express Connect account
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'PE',
        capabilities: {
          transfers: { requested: true },
        },
        tos_acceptance: {
          service_agreement: 'recipient',
        },
        metadata: {
          user_id: user.id,
        },
        ...(profile?.email ? { email: profile.email } : {}),
      });

      accountId = account.id;

      // Save to profile
      await supabaseAdmin
        .from('profiles')
        .update({ stripe_connect_account_id: accountId })
        .eq('id', user.id);
    }

    // Create onboarding link — use request origin so it works in dev + prod
    const origin = request.headers.get('origin') || request.headers.get('referer')?.replace(/\/[^/]*$/, '') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const siteUrl = origin.replace(/\/$/, '');

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${siteUrl}/profile?connect=refresh`,
      return_url: `${siteUrl}/profile?connect=success`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url });

  } catch (error: unknown) {
    console.error('Connect onboard error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
