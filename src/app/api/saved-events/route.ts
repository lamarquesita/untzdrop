import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseFromRequest } from '@/lib/supabase-server';

// GET — list saved event IDs for current user
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseFromRequest(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ saved: [] });
    }

    const { data } = await supabase
      .from('saved_events')
      .select('event_id')
      .eq('user_id', user.id);

    return NextResponse.json({ saved: (data ?? []).map(d => d.event_id) });
  } catch {
    return NextResponse.json({ saved: [] });
  }
}

// POST — toggle save/unsave
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseFromRequest(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { event_id } = await request.json();
    if (!event_id) {
      return NextResponse.json({ error: 'event_id required' }, { status: 400 });
    }

    // Check if already saved
    const { data: existing } = await supabase
      .from('saved_events')
      .select('id')
      .eq('user_id', user.id)
      .eq('event_id', event_id)
      .maybeSingle();

    if (existing) {
      // Unsave
      await supabase.from('saved_events').delete().eq('id', existing.id);
      return NextResponse.json({ saved: false });
    } else {
      // Save
      await supabase.from('saved_events').insert({ user_id: user.id, event_id });
      return NextResponse.json({ saved: true });
    }
  } catch (error) {
    console.error('Saved events error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
