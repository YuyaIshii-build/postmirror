//app/api/facts/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCHリクエスト（更新）
export async function PATCH(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop(); // URLからID抽出

  if (!id) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { text, tags } = body;

    if (!text || !tags) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const updated = await prisma.fact.update({
      where: { id },
      data: { text, tags },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("❌ 更新エラー:", error);
    return NextResponse.json({ error: "Failed to update fact" }, { status: 500 });
  }
}

// DELETEリクエスト（削除）
export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop(); // URLからID抽出

  if (!id) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  try {
    await prisma.fact.delete({
      where: { id },
    });

    return NextResponse.json({ message: "削除成功" }, { status: 200 });
  } catch (error) {
    console.error("❌ 削除エラー:", error);
    return NextResponse.json({ error: "Failed to delete fact" }, { status: 500 });
  }
}