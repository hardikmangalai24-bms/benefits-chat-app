// Document Section Types
export interface DocumentSection {
  id: string;
  sectionNumber: string;        // e.g. "4.2.1", "Schedule A", "Clause 7(b)"
  title: string;
  content: string;
  pageNumber: number;
  embedding?: number[];         // optional for semantic search
}

// Benefit Types
export interface ExtractedBenefit {
  id: string;
  category: BenefitCategory;
  title: string;
  description: string;
  exactValue: string;           // e.g. "5% cashback", "₹500 voucher", "2x points"
  conditions: string[];         // spending thresholds, caps, exclusions
  sectionRef: string;           // e.g. "§4.2.1"
  sectionId: string;
  pageNumber: number;
  confidence: 'high' | 'medium' | 'low';
}

export type BenefitCategory =
  | 'cashback'
  | 'rewards'
  | 'vouchers'
  | 'insurance'
  | 'lounge_access'
  | 'fuel_surcharge'
  | 'milestone'
  | 'dining'
  | 'travel'
  | 'shopping'
  | 'other';

// Chat Message Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  citations?: Citation[];
  followUpQuestions?: string[];
  benefitCards?: ExtractedBenefit[];
  isLoading?: boolean;
}

export interface Citation {
  sectionNumber: string;
  sectionTitle: string;
  excerpt: string;
  pageNumber: number;
  sectionId: string;
}

// Document Types
export interface ProcessedDocument {
  id: string;
  name: string;
  filename: string;
  uploadedAt: Date;
  pageCount: number;
  sections: DocumentSection[];
  benefits: ExtractedBenefit[];
  rawText: string;
  summary: string;
  metadata?: {
    pageCount: number;
    extractedAt: string;
    processingTime: number;
  };
}

// API Request/Response Types
export interface ChatRequest {
  message: string;
  documentId: string;
  conversationHistory: { role: 'user' | 'assistant'; content: string }[];
}

export interface StreamChunk {
  type: 'text' | 'citation' | 'follow_up' | 'benefit_card' | 'done' | 'error';
  data: string | Citation | string[] | ExtractedBenefit | CitationData | null;
}

export interface CitationData {
  sectionId: string;
  sectionNumber: string;
  excerpt: string;
}

export interface UploadResponse {
  success: boolean;
  documentId?: string;
  error?: string;
  document?: ProcessedDocument;
}

// Store Types (for backward compatibility with existing code)
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  citations?: Citation[];
  benefits?: ExtractedBenefit[];
  followUpQuestions?: string[];
  isLoading?: boolean;
}

export interface Document {
  id: string;
  name: string;
  text: string;
  benefits: ExtractedBenefit[];
}

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatStore {
  messages: Message[];
  isStreaming: boolean;
  streamingMessageId: string | null;
  error: string | null;
  sendMessage: (content: string, documentId?: string) => Promise<void>;
  addMessage: (message: Message) => void;
  addFollowUpAsMessage: (question: string, documentId?: string) => Promise<void>;
  clearChat: () => void;
}

export interface DocumentStore {
  document: Document | null;
  setDocument: (document: Document) => void;
  clearDocument: () => void;
}

// Legacy type alias for backward compatibility
export type BenefitHighlight = ExtractedBenefit;
export type Benefit = ExtractedBenefit;

// Made with Bob
