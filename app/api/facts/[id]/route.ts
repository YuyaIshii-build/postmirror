import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const factId = context.params.id;

  try {
    const body = await req.json();
    const { text, tags } = body;

    if (!text || !tags) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const updated = await prisma.fact.update({
      where: { id: factId },
      data: { text, tags },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("❌ 更新エラー:", error);
    return NextResponse.json({ error: "Failed to update fact" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const factId = context.params.id;

  try {
    await prisma.fact.delete({
      where: { id: factId },
    });

    return NextResponse.json({ message: "削除成功" }, { status: 200 });
  } catch (error) {
    console.error("❌ 削除エラー:", error);
    return NextResponse.json({ error: "Failed to delete fact" }, { status: 500 });
  }
}