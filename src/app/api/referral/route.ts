import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseFromRequest, supabaseAdmin } from '@/lib/supabase-server';

// POST — link new user to referrer
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseFromRequest(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { referral_code } = await request.json();
    if (!referral_code) {
      return NextResponse.json({ error: 'No referral code' }, { status: 400 });
    }

    // Find the referrer by code
    const { data: referrer } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('referral_code', referral_code.toUpperCase())
      .single();

    if (!referrer) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
    }

    // Can't refer yourself
    if (referrer.id === user.id) {
      return NextResponse.json({ error: 'Cannot refer yourself' }, { status: 400 });
    }

    // Check if already referred
    const { data: existing } = await supabaseAdmin
      .from('referrals')
      .select('id')
      .eq('referred_id', user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Already referred' }, { status: 400 });
    }

    // Create referral record (pending — completes after first transaction)
    await supabaseAdmin
      .from('referrals')
      .insert({
        referrer_id: referrer.id,
        referred_id: user.id,
        status: 'pending',
        reward_amount: 15.00,
      });

    // Update referred user's profile
    await supabaseAdmin
      .from('profiles')
      .update({ referred_by: referrer.id })
      .eq('id', user.id);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Referral error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
