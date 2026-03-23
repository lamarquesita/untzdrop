import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const { event_name, event_link, event_date } = await request.json();

    if (!event_name || event_name.trim().length === 0) {
      return NextResponse.json({ error: 'Event name is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('event_requests')
      .insert({
        event_name: event_name.trim(),
        event_link: event_link?.trim() || null,
        event_date: event_date || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating event request:', error);
      return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data.id });

  } catch (error) {
    console.error('Event request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
