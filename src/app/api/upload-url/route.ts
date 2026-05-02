import { NextRequest, NextResponse } from "next/server";
import { processUrl } from "@/lib/urlFetcher";
import { ProcessedDocument, UploadResponse } from "@/lib/types";
import { documentCache } from "@/lib/documentCache";

export async function POST(request: NextRequest) {
  const start = Date.now();

  try {
    const body = await request.json();
    const { url } = body;

    // Validate URL
    if (!url || typeof url !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "URL is required and must be a string.",
        } as UploadResponse,
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store",
            "X-Processing-Time": `${Date.now() - start}ms`,
          },
        }
      );
    }

    // Process URL
    let document: ProcessedDocument;
    try {
      document = await processUrl(url);
    } catch (error: any) {
      console.error("URL processing error:", error);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to process URL: ${error.message || "Unknown error"}`,
        } as UploadResponse,
        {
          status: 500,
          headers: {
            "Cache-Control": "no-store",
            "X-Processing-Time": `${Date.now() - start}ms`,
          },
        }
      );
    }

    // Skip benefit extraction to conserve API quota
    document.benefits = [];

    // Store in cache
    documentCache.set(document.id, document);

    console.log(
      `URL document processed: ${document.id} (${document.benefits.length} benefits extracted) in ${Date.now() - start}ms`
    );

    const response: UploadResponse = {
      success: true,
      documentId: document.id,
      document,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "X-Processing-Time": `${Date.now() - start}ms`,
      },
    });
  } catch (error: any) {
    console.error("URL upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: `URL processing failed: ${error.message || "Unknown error"}`,
      } as UploadResponse,
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
          "X-Processing-Time": `${Date.now() - start}ms`,
        },
      }
    );
  }
}
