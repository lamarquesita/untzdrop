import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseFromRequest } from '@/lib/supabase-server';
import { stripe } from '@/lib/stripe';

// Creates a SetupIntent for $0 card verification
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseFromRequest(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const setupIntent = await stripe.setupIntents.create({
      usage: 'off_session',
      metadata: { user_id: user.id },
    });

    return NextResponse.json({ client_secret: setupIntent.client_secret });
  } catch (error) {
    console.error('Verify card error:', error);
    return NextResponse.json({ error: 'Error al verificar tarjeta' }, { status: 500 });
  }
}
