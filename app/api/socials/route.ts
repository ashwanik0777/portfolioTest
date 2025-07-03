import { NextResponse } from "next/server";
import { storage } from "@/server/storage";

export async function GET() {
  try {
    const socials = await storage.getAllSocials();
    return NextResponse.json(socials);
  } catch (error) {
    console.error("Error fetching socials:", error);
    return NextResponse.json({ message: "Failed to fetch socials" }, { status: 500 });
  }
}