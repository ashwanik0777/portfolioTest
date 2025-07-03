import { NextResponse } from "next/server";
import { storage } from "@/server/storage";

export async function GET() {
  try {
    const experiences = await storage.getAllExperiences();
    return NextResponse.json(experiences);
  } catch (error) {
    console.error("Error fetching experiences:", error);
    return NextResponse.json({ message: "Failed to fetch experiences" }, { status: 500 });
  }
}