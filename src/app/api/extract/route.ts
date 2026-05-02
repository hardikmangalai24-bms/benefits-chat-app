import { NextRequest, NextResponse } from "next/server";
import { documentCache } from "@/lib/documentCache";
import { BenefitCategory } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { documentId } = body;

    // Validate documentId
    if (!documentId || typeof documentId !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "documentId is required and must be a string",
        },
        { status: 400 }
      );
    }

    // Look up document in cache
    const document = documentCache.get(documentId);

    if (!document) {
      return NextResponse.json(
        {
          success: false,
          error: `Document not found: ${documentId}. Please upload the document first.`,
        },
        { status: 404 }
      );
    }

    // Extract unique categories
    const categories = Array.from(
      new Set(document.benefits.map((b) => b.category))
    ) as BenefitCategory[];

    // Return benefits data
    return NextResponse.json(
      {
        benefits: document.benefits,
        categories,
        summary: document.summary,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error: any) {
    console.error("Extract error:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Failed to extract benefits: ${error.message || "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}

// Made with Bob
