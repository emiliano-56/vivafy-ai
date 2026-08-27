import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const { count: totalUsers } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const { count: commercial } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("package", "ZoopAI Commercial");

    const { count: platinum } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("package", "Platinum Edition");

    const { count: agent } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("package", "ZoopAI Agent");

    const { count: studio } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("package", "Studio Engine");

    return NextResponse.json({
      totalUsers,
      commercial,
      platinum,
      agent,
      studio,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load metrics" },
      { status: 500 }
    );
  }
}