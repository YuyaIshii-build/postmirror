// app/api/seed-user/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const existing = await prisma.user.findFirst({
      where: { name: "test-user" },
    });

    if (existing) {
      return NextResponse.json({
        message: "すでに存在しています",
        userId: existing.id,
      });
    }

    const newUser = await prisma.user.create({
      data: {
        name: "test-user",
      },
    });

    return NextResponse.json({
      message: "ユーザー作成完了",
      userId: newUser.id,
    });
  } catch (error) {
    console.error("❌ ユーザー作成失敗:", error);
    return NextResponse.json({ error: "作成に失敗しました" }, { status: 500 });
  }
}
