import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

// Returns public display names for a list of user IDs.
// Used to show seller/buyer names on event pages without exposing PII.
export async function POST(request: NextRequest) {
  try {
    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ names: {} });
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name')
      .in('id', ids);

    if (error) {
      return NextResponse.json({ names: {} });
    }

    const names: Record<string, string | null> = {};
    for (const row of data ?? []) {
      names[row.id] = row.full_name ?? null;
    }
    return NextResponse.json({ names });
  } catch {
    return NextResponse.json({ names: {} });
  }
}
