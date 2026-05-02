import { NextRequest, NextResponse } from "next/server";
import { processDocument } from "@/lib/pdf";
import { ProcessedDocument, UploadResponse } from "@/lib/types";
import { documentCache } from "@/lib/documentCache";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request: NextRequest) {
  const start = Date.now();

  try {
    // Validate Content-Type
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        {
          success: false,
          error: "Content-Type must be multipart/form-data",
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

    // Extract file from FormData
    const formData = await request.formData();
    const file = formData.get("pdf") as File | null;

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "No file provided. Please upload a PDF file.",
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

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file type: ${file.type}. Only PDF files are supported.`,
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

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size of 50MB.`,
        } as UploadResponse,
        {
          status: 413,
          headers: {
            "Cache-Control": "no-store",
            "X-Processing-Time": `${Date.now() - start}ms`,
          },
        }
      );
    }

    // Convert to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`Processing PDF: ${file.name} (${file.size} bytes)`);

    // Process document
    let document: ProcessedDocument;
    try {
      document = await processDocument(buffer, file.name);
    } catch (error: any) {
      console.error("Document processing error:", error);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to process PDF: ${error.message || "Unknown error"}`,
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

    // Skip automatic benefit extraction during upload to conserve API quota.
    // The chat can answer benefit questions directly from document sections.
    document.benefits = [];

    // Add processing metadata
    document.metadata = {
      pageCount: document.pageCount,
      extractedAt: new Date().toISOString(),
      processingTime: Date.now() - start,
    };

    // Store in global cache (persists across HMR)
    documentCache.set(document.id, document);

    console.log(
      `Document processed successfully: ${document.id} (${document.benefits.length} benefits, ${document.sections.length} sections) in ${Date.now() - start}ms`
    );

    // Return success response
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
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Upload failed: ${error.message || "Unknown error"}`,
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
