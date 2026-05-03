"use client";

import { useState } from "react";
import { useChatStore } from "@/store/chatStore";
import { useDocumentStore } from "@/store/documentStore";
import { exportReport, downloadReport, ExportOptions } from "@/lib/exportReport";

export default function ExportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const messages = useChatStore((state) => state.messages);
  const document = useDocumentStore((state) => state.document);

  const handleExport = async (format: 'json' | 'markdown' | 'html' | 'txt') => {
    setIsExporting(true);
    try {
      const options: ExportOptions = {
        format,
        includeMetadata: true,
        includeBenefits: true,
        includeCitations: true,
        includeTimestamps: true,
      };

      const content = exportReport(messages, document, options);
      downloadReport(content, format);
      
      setIsOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Don't show button if no messages
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
        disabled={isExporting}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <span className="font-medium">Export Report</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Choose Export Format
              </p>
            </div>
            
            <div className="py-1">
              <button
                onClick={() => handleExport('json')}
                disabled={isExporting}
                className="w-full px-4 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 disabled:opacity-50"
              >
                <span className="text-2xl">📄</span>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    JSON
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Structured data format
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleExport('markdown')}
                disabled={isExporting}
                className="w-full px-4 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 disabled:opacity-50"
              >
                <span className="text-2xl">📝</span>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Markdown
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Easy to read & edit
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleExport('html')}
                disabled={isExporting}
                className="w-full px-4 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 disabled:opacity-50"
              >
                <span className="text-2xl">🌐</span>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    HTML
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Formatted web page
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleExport('txt')}
                disabled={isExporting}
                className="w-full px-4 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 disabled:opacity-50"
              >
                <span className="text-2xl">📋</span>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Plain Text
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Simple text file
                  </div>
                </div>
              </button>
            </div>

            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {document ? (
                  <>
                    <span className="font-medium">{messages.length}</span> messages •{" "}
                    <span className="font-medium">{document.benefits?.length || 0}</span> benefits
                  </>
                ) : (
                  <>
                    <span className="font-medium">{messages.length}</span> messages
                  </>
                )}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Made with Bob