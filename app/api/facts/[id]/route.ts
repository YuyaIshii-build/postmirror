//app/api/facts/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { NextApiRequest } from "next";
import type { NextResponse as NextApiResponse } from "next/server";

import type { NextRequest as RequestWithParams } from "next/server";
import type { NextResponse as Response } from "next/server";
import type { NextFetchEvent } from "next/server";
import type { NextApiHandler } from "next";

import type { NextApiRequest as Req, NextApiResponse as Res } from "next";
import type { NextApiHandler as Handler } from "next";

import type { RouteHandlerContext } from "next/dist/server/future/route-modules/app-route/module";

export async function PATCH(
  req: NextRequest,
  context: RouteHandlerContext
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
  context: RouteHandlerContext
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