import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.invalid',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'build-only-placeholder'
);

export async function POST(request: Request) {
  try {
    const { email, newPassword } = await request.json();

    if (!email || !newPassword) {
      return Response.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    // Update password using admin API
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      '',
      {
        password: newPassword,
      }
    );

    // First, find the user by email
    const { data: userData, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update the user's password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userData.id,
      {
        password: newPassword,
      }
    );

    if (updateError) {
      return Response.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    return Response.json(
      { success: true, message: 'Password reset successfully' },
      { status: 200 }
    );
  } catch (err: any) {
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
