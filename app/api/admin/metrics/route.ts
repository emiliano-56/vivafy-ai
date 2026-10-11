import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const { count: totalUsers } = await supabaseAdmin
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

    return NextResponse.json({
      totalUsers,
      frontEnd,
      platinum,
      agenticPro,
      studio,
      reseller,
      whitelabel,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load metrics" },
      { status: 500 }
    );
  }
}
