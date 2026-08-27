import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { email, packageType, credits } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email required' },
        { status: 400 }
      );
    }

    const { data: profile, error: findError } = await supabaseAdmin
      .from('profiles')
      .select('credits')
      .eq('email', email)
      .single();

    if (findError || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const currentCredits = profile.credits || 0;
    const newCredits = currentCredits + Number(credits);

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        credits: newCredits,
        package: packageType,
      })
      .eq('email', email);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      newCredits,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}