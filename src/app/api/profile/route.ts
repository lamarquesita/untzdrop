import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseFromRequest, supabaseAdmin } from '@/lib/supabase-server';

// GET /api/profile — fetch current user's profile + stats
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseFromRequest(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch profile
    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Auto-generate referral code if missing
    if (profile && !profile.referral_code) {
      const code = user.id.replace(/-/g, '').slice(0, 6).toUpperCase();
      await supabaseAdmin
        .from('profiles')
        .update({ referral_code: code })
        .eq('id', user.id);
      profile = { ...profile, referral_code: code };
    }

    // Fetch reviews about this user
    const { data: reviews } = await supabaseAdmin
      .from('reviews')
      .select(`
        id, rating, text, created_at,
        reviewer:profiles!reviews_reviewer_id_fkey ( full_name )
      `)
      .eq('reviewed_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    // Compute stats from orders
    const { data: salesData } = await supabaseAdmin
      .from('orders')
      .select('total_amount, service_fee, status')
      .eq('seller_id', user.id);

    const completedSales = (salesData ?? []).filter(s => ['delivered', 'completed'].includes(s.status));
    const totalEarnings = completedSales.reduce((sum, s) => sum + Number(s.total_amount) - Number(s.service_fee), 0);
    const pendingSales = (salesData ?? []).filter(s => s.status === 'paid');
    const pendingBalance = pendingSales.reduce((sum, s) => sum + Number(s.total_amount) - Number(s.service_fee), 0);

    // Compute rating
    const allReviews = reviews ?? [];
    const avgRating = allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0;

    // Fetch saved events
    const { data: savedEvents } = await supabase
      .from('saved_events')
      .select(`
        event_id,
        events ( id, name, image_url, date, venue )
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch events attended (completed orders)
    const { data: attendedEvents } = await supabaseAdmin
      .from('orders')
      .select(`
        events ( id, name, image_url )
      `)
      .eq('buyer_id', user.id)
      .in('status', ['delivered', 'completed'])
      .limit(8);

    const highlights = (attendedEvents ?? [])
      .map((o: any) => o.events)
      .filter(Boolean)
      .filter((e: any, i: number, arr: any[]) => arr.findIndex((x: any) => x.id === e.id) === i)
      .slice(0, 4);

    return NextResponse.json({
      profile: {
        ...profile,
        displayName: profile?.full_name || user.phone?.slice(-4) || 'Usuario',
        phone: user.phone,
      },
      stats: {
        rating: Math.round(avgRating * 10) / 10,
        totalRatings: allReviews.length,
        exchanges: completedSales.length,
        reviewCount: allReviews.length,
      },
      wallet: {
        balance: Math.round(pendingBalance * 100) / 100,
        siteCredit: Math.round((profile?.credit_balance || 0) * 100) / 100,
        payoutsYTD: Math.round(totalEarnings * 100) / 100,
      },
      reviews: allReviews.map((r: any) => ({
        id: r.id,
        author: r.reviewer?.full_name || 'Anónimo',
        rating: r.rating,
        text: r.text || '',
        date: r.created_at,
      })),
      highlights,
      savedEvents: (savedEvents ?? []).map((s: any) => s.events).filter(Boolean),
    });

  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/profile — update profile
export async function PUT(request: NextRequest) {
  try {
    const supabase = createSupabaseFromRequest(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updates: Record<string, any> = {};

    if (body.full_name !== undefined) updates.full_name = body.full_name;
    if (body.email !== undefined) updates.email = body.email;
    if (body.bio !== undefined) updates.bio = body.bio;
    if (body.avatar_url !== undefined) updates.avatar_url = body.avatar_url;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({ profile });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
