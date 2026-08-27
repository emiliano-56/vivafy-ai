import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const {
      email,
      password,
      username,
      firstName,
      lastName,
      packageType,
      credits,
    } = await req.json();

    const { data, error } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          username,
        },
      });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    await new Promise((r) => setTimeout(r, 1000));

    await supabaseAdmin
      .from("profiles")
      .update({
        package: packageType,
        credits,
      })
      .eq("id", data.user.id);

    return NextResponse.json({
      success: true,
      user: data.user,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}