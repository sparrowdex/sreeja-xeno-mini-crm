import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const suggestionId = formData.get("suggestionId") as string;

    if (!suggestionId) {
      return NextResponse.json({ error: "Missing suggestionId" }, { status: 400 });
    }

    await prisma.campaignSuggestion.update({
      where: { id: suggestionId },
      data: { status: "dismissed" }
    });

    // We can redirect back to the home page to show the updated list
    return NextResponse.redirect(new URL("/", req.url), 303);
  } catch (error) {
    console.error("Error dismissing suggestion:", error);
    return NextResponse.json({ error: "Failed to dismiss suggestion" }, { status: 500 });
  }
}
