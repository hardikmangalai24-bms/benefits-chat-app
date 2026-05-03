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
  uploadFromUrl: (url: string) => Promise<void>;
  clearDocument: () => void;
  setError: (error: string | null) => void;
}

const UPLOAD_TIMEOUT = 120000; // 120 seconds — AI extraction can be slow

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
      set({ uploadProgress: 10 });

      // Prepare form data
      const formData = new FormData();
      formData.append("pdf", file);

      set({ uploadProgress: 20 });

      // Single API call — upload processes PDF AND extracts benefits
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        signal: abortController.signal,
      });

      set({ uploadProgress: 60 });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Upload failed with status ${uploadResponse.status}`
        );
      }

      const uploadData = await uploadResponse.json();

      if (!uploadData.success || !uploadData.documentId || !uploadData.document) {
        throw new Error(uploadData.error || "Upload failed — no document returned");
      }

      set({ uploadProgress: 90 });

      // Use the document directly from the upload response
      // (the server already extracted benefits)
      const document: ProcessedDocument = uploadData.document;

      // Success!
      set({
        document,
        uploadProgress: 100,
        isExtracting: false,
      });

      console.log(
        "Document uploaded successfully:",
        document.id,
        `(${document.benefits?.length || 0} benefits, ${document.sections?.length || 0} sections)`
      );
    } catch (error: any) {
      console.error("Upload error:", error);

      let errorMessage = "Failed to upload document";

      if (error.name === "AbortError") {
        errorMessage = "Upload timed out. Please try a smaller document.";
      } else if (error.message === "Failed to fetch" || error.message === "NetworkError when attempting to fetch resource.") {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      set({
        error: errorMessage,
        uploadProgress: 0,
        isExtracting: false,
        document: null,
      });

      // RE-THROW so the caller (page.tsx) knows it failed
      throw new Error(errorMessage);
    } finally {
      clearTimeout(timeoutId);
      set({ isUploading: false });
    }
  },

  uploadFromUrl: async (url: string) => {
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
      set({ uploadProgress: 15 });

      // Call URL upload API
      const response = await fetch("/api/upload-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
        signal: abortController.signal,
      });

      set({ uploadProgress: 50 });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `URL processing failed with status ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.success || !data.documentId || !data.document) {
        throw new Error(data.error || "URL processing failed — no document returned");
      }

      set({ uploadProgress: 80 });

      // Use document directly from response
      const document: ProcessedDocument = data.document;

      // Success!
      set({
        document,
        uploadProgress: 100,
        isExtracting: false,
      });

      console.log("URL document uploaded successfully:", document.id);
    } catch (error: any) {
      console.error("URL upload error:", error);

      let errorMessage = "Failed to process URL";

      if (error.name === "AbortError") {
        errorMessage = "URL fetch timed out. Please try again.";
      } else if (error.message === "Failed to fetch" || error.message === "NetworkError when attempting to fetch resource.") {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      set({
        error: errorMessage,
        uploadProgress: 0,
        isExtracting: false,
        document: null,
      });

      // RE-THROW so the caller knows it failed
      throw new Error(errorMessage);
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
