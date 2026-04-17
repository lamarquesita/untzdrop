import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseFromRequest, supabaseAdmin } from '@/lib/supabase-server';

// GET — list all profile photos for current user
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseFromRequest(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: files } = await supabaseAdmin.storage
      .from('avatars')
      .list(user.id, { limit: 4, sortBy: { column: 'created_at', order: 'asc' } });

    const photos = (files ?? []).map((f) => {
      const { data } = supabaseAdmin.storage.from('avatars').getPublicUrl(`${user.id}/${f.name}`);
      return data.publicUrl;
    });

    return NextResponse.json({ photos });
  } catch (error) {
    console.error('Avatar list error:', error);
    return NextResponse.json({ photos: [] });
  }
}

// POST — upload a new profile photo (max 4)
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseFromRequest(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check current count
    const { data: existing } = await supabaseAdmin.storage.from('avatars').list(user.id, { limit: 10 });
    if ((existing ?? []).length >= 4) {
      return NextResponse.json({ error: 'Máximo 4 fotos' }, { status: 400 });
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const filePath = `${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('avatars')
      .upload(filePath, file, { contentType: file.type, upsert: true });

    if (uploadError) {
      console.error('Avatar upload error:', uploadError);
      return NextResponse.json({ error: 'Error al subir la foto' }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage.from('avatars').getPublicUrl(filePath);
    const avatarUrl = urlData.publicUrl;

    // Update avatar_url to the first photo if not set
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single();

    if (!profile?.avatar_url) {
      await supabaseAdmin.from('profiles').update({ avatar_url: avatarUrl }).eq('id', user.id);
    }

    return NextResponse.json({ avatar_url: avatarUrl });
  } catch (error) {
    console.error('Avatar error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE — remove a profile photo by URL
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createSupabaseFromRequest(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: 'URL required' }, { status: 400 });
    }

    const path = url.split('/avatars/').pop();
    if (!path || !path.startsWith(user.id)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    await supabaseAdmin.storage.from('avatars').remove([path]);

    // If this was the avatar_url, update to next photo or null
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single();

    if (profile?.avatar_url === url) {
      const { data: remaining } = await supabaseAdmin.storage.from('avatars').list(user.id, { limit: 1, sortBy: { column: 'created_at', order: 'asc' } });
      if (remaining && remaining.length > 0) {
        const { data: newUrl } = supabaseAdmin.storage.from('avatars').getPublicUrl(`${user.id}/${remaining[0].name}`);
        await supabaseAdmin.from('profiles').update({ avatar_url: newUrl.publicUrl }).eq('id', user.id);
      } else {
        await supabaseAdmin.from('profiles').update({ avatar_url: null }).eq('id', user.id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Avatar delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
