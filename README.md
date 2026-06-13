# PDF Benefits Chatbot

A Next.js 14 application that uses AI to extract and explain benefits from PDF documents (like credit card terms). Built with TypeScript, Anthropic Claude API, and a beautiful glassmorphism dark theme UI.

## Features

- 📄 **PDF Upload & Processing** - Drag-and-drop PDF upload with automatic text extraction
- 🤖 **AI-Powered Chat** - Streaming responses from Claude Sonnet 4 with contextual citations
- 💎 **Benefit Extraction** - Automatic identification and categorization of benefits
- 🎨 **Glassmorphism UI** - Modern dark theme with glass effects and smooth animations
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🔍 **Smart Citations** - Every AI response includes section references from the source document
- 💬 **Follow-up Suggestions** - Contextual question suggestions after each response
- 🎯 **Demo Mode** - Try the app without uploading a PDF using sample data

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **AI**: Anthropic Claude API (claude-sonnet-4-20250514)
- **PDF Processing**: pdf-parse
- **State Management**: Zustand
- **Styling**: Tailwind CSS with custom glassmorphism utilities
- **Animations**: Framer Motion
- **Markdown**: react-markdown

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with fonts and theme
│   ├── page.tsx                # Landing page with upload interface
│   ├── chat/
│   │   └── page.tsx            # Main chat interface
│   └── api/
│       ├── upload/route.ts     # PDF upload endpoint
│       ├── chat/route.ts       # Streaming chat endpoint
│       └── extract/route.ts    # Benefit extraction endpoint
├── components/
│   ├── ui/
│   │   ├── GlassCard.tsx       # Reusable glassmorphism card
│   │   ├── LoadingDots.tsx     # Animated loading indicator
│   │   ├── CitationBadge.tsx   # Section reference badge
│   │   ├── TypewriterText.tsx  # Animated text reveal
│   │   └── Toast.tsx           # Toast notification system
│   ├── upload/
│   │   ├── DropZone.tsx        # Drag-and-drop PDF uploader
│   │   └── ProcessingState.tsx # Upload progress indicator
│   └── chat/
│       ├── ChatWindow.tsx      # Main chat container
│       ├── MessageBubble.tsx   # Individual message display
│       ├── InputBar.tsx        # Message input with character limit
│       ├── BenefitCard.tsx     # Highlighted benefit display
│       ├── BenefitsPanel.tsx   # Sidebar with all benefits
│       └── FollowUpSuggestions.tsx # Suggested questions
├── lib/
│   ├── pdf.ts                  # PDF parsing utilities
│   ├── claude.ts               # Anthropic client & streaming
│   ├── benefits.ts             # Benefit extraction logic
│   ├── streamParser.ts         # Stream parsing utilities
│   └── types.ts                # TypeScript interfaces
└── store/
    ├── chatStore.ts            # Chat state management
    └── documentStore.ts        # Document state management
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Anthropic API key ([Get one here](https://console.anthropic.com/))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pdf-benefits-chatbot
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.local.example .env.local
```

4. Add your Anthropic API key to `.env.local`:
```env
ANTHROPIC_API_KEY=your_api_key_here
```

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Usage

### Uploading a PDF

1. Click "Upload PDF" or drag and drop a PDF file onto the upload zone
2. Wait for the document to be processed (text extraction + benefit analysis)
3. You'll be redirected to the chat interface automatically

### Using Demo Mode

1. Click "Try Demo Mode" on the landing page
2. Explore the interface with sample credit card benefits data
3. No API key required for demo mode

### Chatting with Your Document

1. Ask questions about benefits in natural language
2. Click on suggested follow-up questions for quick queries
3. View extracted benefits in the sidebar
4. Click any benefit card to learn more about it
5. Citations show which section of the document the AI is referencing

## Key Features Explained

### Benefit Extraction

The app automatically identifies and categorizes benefits into:
- Cashback & Rewards
- Travel & Lounge Access
- Insurance Coverage
- Fuel Surcharge Waivers
- Milestone Bonuses
- Dining & Shopping Offers
- And more...

### Smart Citations

Every AI response includes:
- Section number and title
- Page number reference
- Relevant excerpt from the document
- Direct link to the source section

### Streaming Responses

- Real-time token-by-token streaming from Claude API
- Smooth typewriter effect for natural conversation flow
- Citations and follow-ups appear as they're generated

### TF-IDF Section Ranking

- Intelligent section relevance scoring
- No vector embeddings required
- Fast and efficient context retrieval

## Configuration

### Tailwind Custom Theme

The project includes custom glassmorphism utilities:

```css
.glass-card    /* Glassmorphism card with backdrop blur */
.glass-input   /* Glass-styled input field */
.glass-button  /* Glass-styled button */
```

Custom colors:
- `glass.*` - Glass effect colors
- `accent.cyan` - Primary accent (#00D4FF)
- `accent.purple` - Secondary accent (#A855F7)
- `accent.gold` - Tertiary accent (#F59E0B)
- `dark.*` - Dark theme shades

### Environment Variables

```env
ANTHROPIC_API_KEY=your_api_key_here  # Required for AI features
```

## API Routes

### POST /api/upload
Upload and process a PDF file.

**Request**: `multipart/form-data` with PDF file

**Response**:
```json
{
  "success": true,
  "documentId": "doc_123",
  "document": { /* ProcessedDocument */ }
}
```

### POST /api/chat
Stream chat responses with citations.

**Request**:
```json
{
  "message": "What are the cashback benefits?",
  "documentId": "doc_123",
  "conversationHistory": []
}
```

**Response**: Server-Sent Events stream with JSON chunks

### POST /api/extract
Extract benefits from a document.

**Request**:
```json
{
  "documentId": "doc_123"
}
```

**Response**:
```json
{
  "success": true,
  "benefits": [ /* ExtractedBenefit[] */ ]
}
```

## Performance Optimizations

- Module-level document caching (no database required)
- Efficient PDF parsing with page-by-page extraction
- Streaming responses for instant feedback
- Optimistic UI updates for smooth UX
- Automatic retry logic for failed requests

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- AI powered by [Anthropic Claude](https://www.anthropic.com/)
- UI inspired by modern glassmorphism design trends

## Support

For issues or questions, please open an issue on GitHub.

---

