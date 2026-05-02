import { create } from "zustand";
import { ProcessedDocument } from "@/lib/types";

interface DocumentStore {
  document: ProcessedDocument | null;
  isUploading: boolean;
  isExtracting: boolean;
  uploadProgress: number; // 0-100
  error: string | null;

  // Actions
  uploadDocument: (file: File) => Promise<void>;
  clearDocument: () => void;
  setError: (error: string | null) => void;
}

const UPLOAD_TIMEOUT = 30000; // 30 seconds

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  document: null,
  isUploading: false,
  isExtracting: false,
  uploadProgress: 0,
  error: null,

  uploadDocument: async (file: File) => {
    // Reset state
    set({
      isUploading: true,
      uploadProgress: 0,
      error: null,
      document: null,
    });

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), UPLOAD_TIMEOUT);

    try {
      // Simulate progress: 0 -> 30 (upload phase)
      set({ uploadProgress: 10 });

      // Prepare form data
      const formData = new FormData();
      formData.append("pdf", file);

      set({ uploadProgress: 20 });

      // Call upload API
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        signal: abortController.signal,
      });

      set({ uploadProgress: 30 });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(
          errorData.error || `Upload failed with status ${uploadResponse.status}`
        );
      }

      const uploadData = await uploadResponse.json();

      if (!uploadData.success || !uploadData.documentId) {
        throw new Error(uploadData.error || "Upload failed");
      }

      // Simulate progress: 30 -> 70 (processing phase)
      set({ uploadProgress: 50 });

      const documentId = uploadData.documentId;

      // Call extract API
      set({ isExtracting: true, uploadProgress: 60 });

      const extractResponse = await fetch("/api/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ documentId }),
        signal: abortController.signal,
      });

      set({ uploadProgress: 70 });

      if (!extractResponse.ok) {
        const errorData = await extractResponse.json();
        throw new Error(
          errorData.error || `Extraction failed with status ${extractResponse.status}`
        );
      }

      const extractData = await extractResponse.json();

      // Simulate progress: 70 -> 100 (extraction phase)
      set({ uploadProgress: 90 });

      // Build complete ProcessedDocument
      const document: ProcessedDocument = {
        ...uploadData.document,
        benefits: extractData.benefits || [],
      };

      // Success!
      set({
        document,
        uploadProgress: 100,
        isExtracting: false,
      });

      console.log("Document uploaded successfully:", document.id);
    } catch (error: any) {
      console.error("Upload error:", error);

      let errorMessage = "Failed to upload document";

      if (error.name === "AbortError") {
        errorMessage = "Upload timed out after 30 seconds. Please try again.";
      } else if (error.message.includes("Failed to fetch")) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      set({
        error: errorMessage,
        uploadProgress: 0,
        isExtracting: false,
      });
    } finally {
      clearTimeout(timeoutId);
      set({ isUploading: false });
    }
  },

  clearDocument: () => {
    set({
      document: null,
      isUploading: false,
      isExtracting: false,
      uploadProgress: 0,
      error: null,
    });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));

// Made with Bob
