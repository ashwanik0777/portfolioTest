import { NextResponse } from "next/server";
import { storage } from "@/server/storage";

export async function GET() {
  try {
    const resume = await storage.getResume();
    return NextResponse.json(resume);
  } catch (error) {
    console.error("Error fetching resume:", error);
    return NextResponse.json({ message: "Failed to fetch resume" }, { status: 500 });
  }
}