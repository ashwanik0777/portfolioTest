import { NextResponse } from "next/server";
import { storage } from "@/server/storage";
import { insertContactSchema } from "@/shared/schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = insertContactSchema.parse(body);
    
    const contact = await storage.createContact(validatedData);
    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error("Error creating contact:", error);
    return NextResponse.json({ message: "Failed to submit contact form" }, { status: 500 });
  }
}