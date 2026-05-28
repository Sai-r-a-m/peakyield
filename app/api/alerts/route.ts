import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } =
      await supabaseAdmin
        .from("alerts")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      alerts: data,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(
  req: NextRequest
) {
  try {
    const { id } =
      await req.json();

    const { error } =
      await supabaseAdmin
        .from("alerts")
        .update({
          is_read: true,
        })
        .eq("id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}