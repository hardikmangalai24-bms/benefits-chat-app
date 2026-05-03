/**
 * Tests for Export Report functionality
 */

import { generateReport, formatAsJSON, formatAsMarkdown, formatAsText } from '../exportReport';
import { ChatMessage, ProcessedDocument } from '../types';

describe('Export Report', () => {
  const mockMessages: ChatMessage[] = [
    {
      id: 'user_1',
      role: 'user',
      content: 'What are the benefits?',
      timestamp: new Date('2024-01-01T10:00:00Z'),
    },
    {
      id: 'assistant_1',
      role: 'assistant',
      content: 'Here are the key benefits found in the document...',
      timestamp: new Date('2024-01-01T10:00:05Z'),
      citations: [
        {
          sectionNumber: '4.2.1',
          sectionTitle: 'Cashback Benefits',
          excerpt: 'Get 5% cashback on all purchases',
          pageNumber: 5,
          sectionId: 'section_1',
        },
      ],
    },
  ];

  const mockDocument: ProcessedDocument = {
    id: 'doc_1',
    name: 'Test Credit Card Agreement',
    filename: 'test-card.pdf',
    uploadedAt: new Date('2024-01-01T09:00:00Z'),
    pageCount: 10,
    sections: [
      {
        id: 'section_1',
        sectionNumber: '4.2.1',
        title: 'Cashback Benefits',
        content: 'Get 5% cashback on all purchases',
        pageNumber: 5,
      },
    ],
    benefits: [
      {
        id: 'benefit_1',
        category: 'cashback',
        title: '5% Cashback',
        description: 'Earn 5% cashback on all purchases',
        exactValue: '5% cashback',
        conditions: ['Minimum spend ₹500', 'Maximum ₹1000 per month'],
        sectionRef: '§4.2.1',
        sectionId: 'section_1',
        pageNumber: 5,
        confidence: 'high',
      },
    ],
    rawText: 'Document text...',
    summary: 'This is a credit card agreement with cashback benefits.',
  };

  describe('generateReport', () => {
    it('should generate a basic report', () => {
      const report = generateReport(mockMessages, null, { format: 'json' });
      
      expect(report).toHaveProperty('generatedAt');
      expect(report).toHaveProperty('conversation');
      expect(report.conversation).toHaveLength(2);
    });

    it('should include document info when provided', () => {
      const report = generateReport(mockMessages, mockDocument, {
        format: 'json',
        includeMetadata: true,
      });
      
      expect(report).toHaveProperty('documentInfo');
      expect(report.documentInfo?.name).toBe('Test Credit Card Agreement');
      expect(report.documentInfo?.benefitsCount).toBe(1);
    });

    it('should include benefits when requested', () => {
      const report = generateReport(mockMessages, mockDocument, {
        format: 'json',
        includeBenefits: true,
      });
      
      expect(report).toHaveProperty('benefits');
      expect(report.benefits).toHaveLength(1);
      expect(report.benefits?.[0].title).toBe('5% Cashback');
    });

    it('should include citations when requested', () => {
      const report = generateReport(mockMessages, mockDocument, {
        format: 'json',
        includeCitations: true,
      });
      
      const assistantMsg = report.conversation.find(m => m.role === 'assistant');
      expect(assistantMsg?.citations).toBeDefined();
      expect(assistantMsg?.citations).toHaveLength(1);
    });

    it('should filter out welcome messages', () => {
      const messagesWithWelcome: ChatMessage[] = [
        {
          id: 'welcome',
          role: 'assistant',
          content: 'Welcome!',
          timestamp: new Date(),
        },
        ...mockMessages,
      ];
      
      const report = generateReport(messagesWithWelcome, null, { format: 'json' });
      expect(report.conversation).toHaveLength(2);
      expect(report.conversation.every(m => m.content !== 'Welcome!')).toBe(true);
    });
  });

  describe('formatAsJSON', () => {
    it('should format report as valid JSON', () => {
      const report = generateReport(mockMessages, mockDocument, {
        format: 'json',
        includeMetadata: true,
        includeBenefits: true,
      });
      
      const json = formatAsJSON(report);
      expect(() => JSON.parse(json)).not.toThrow();
      
      const parsed = JSON.parse(json);
      expect(parsed).toHaveProperty('generatedAt');
      expect(parsed).toHaveProperty('conversation');
    });
  });

  describe('formatAsMarkdown', () => {
    it('should format report as markdown', () => {
      const report = generateReport(mockMessages, mockDocument, {
        format: 'markdown',
        includeMetadata: true,
        includeBenefits: true,
      });
      
      const markdown = formatAsMarkdown(report);
      expect(markdown).toContain('# IBM Bob Report');
      expect(markdown).toContain('## Document Information');
      expect(markdown).toContain('## Extracted Benefits');
      expect(markdown).toContain('## Conversation History');
    });

    it('should include benefit details in markdown', () => {
      const report = generateReport(mockMessages, mockDocument, {
        format: 'markdown',
        includeBenefits: true,
      });
      
      const markdown = formatAsMarkdown(report);
      expect(markdown).toContain('5% Cashback');
      expect(markdown).toContain('cashback');
      expect(markdown).toContain('Minimum spend ₹500');
    });
  });

  describe('formatAsText', () => {
    it('should format report as plain text', () => {
      const report = generateReport(mockMessages, mockDocument, {
        format: 'txt',
        includeMetadata: true,
      });
      
      const text = formatAsText(report);
      expect(text).toContain('IBM BOB REPORT');
      expect(text).toContain('DOCUMENT INFORMATION');
      expect(text).toContain('CONVERSATION HISTORY');
    });

    it('should use separators in text format', () => {
      const report = generateReport(mockMessages, mockDocument, { format: 'txt' });
      const text = formatAsText(report);
      
      expect(text).toContain('='.repeat(80));
      expect(text).toContain('-'.repeat(80));
    });
  });
});

// Made with Bob