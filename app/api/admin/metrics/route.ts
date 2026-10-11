import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const { count: totalUsers, error: totalUsersError } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const { count: frontEnd } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("package", "AI-Front End");

    const { count: platinum } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("package", "Vivafy AI - Platinum Edition");

    const { count: agenticPro } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("package", "Vivafy AI - Agentic PRO");

    const { count: studio } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("package", "Vivafy AI Studio");

    const { count: reseller } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("package", "Vivafy AI - Reseller");

    const { count: whitelabel } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("package", "Vivafy AI - Whitelabel");

    if (totalUsersError) {
      throw totalUsersError;
    }

    return NextResponse.json({
      totalUsers: totalUsers ?? 0,
      frontEnd: frontEnd ?? 0,
      platinum: platinum ?? 0,
      agenticPro: agenticPro ?? 0,
      studio: studio ?? 0,
      reseller: reseller ?? 0,
      whitelabel: whitelabel ?? 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load metrics" },
      { status: 500 }
    );
  }
}
