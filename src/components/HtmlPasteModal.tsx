import React, { useState } from "react";
import { X, FileCode2, Loader2, Sparkles } from "lucide-react";

interface HtmlPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onParseHtml: (html: string) => void;
  isLoading: boolean;
}

export const HtmlPasteModal: React.FC<HtmlPasteModalProps> = ({
  isOpen,
  onClose,
  onParseHtml,
  isLoading,
}) => {
  const [htmlContent, setHtmlContent] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!htmlContent.trim() || isLoading) return;
    onParseHtml(htmlContent.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/75">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <FileCode2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Paste Amazon Raw HTML
              </h3>
              <p className="text-xs text-slate-500">
                Directly parse downloaded or copied Amazon product / search HTML
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>HTML Source Code:</span>
              <span className="text-slate-400 font-normal">
                {htmlContent.length > 0 ? `${(htmlContent.length / 1024).toFixed(1)} KB` : "Supports product & search pages"}
              </span>
            </label>
            <textarea
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              placeholder="Right-click on an Amazon page -> 'View Page Source' -> Copy and paste HTML here..."
              rows={12}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white transition-colors"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Extracts title, price, star ratings, sizes, materials & specs</span>
            </div>
            <button
              type="submit"
              disabled={isLoading || !htmlContent.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Parsing HTML...</span>
                </>
              ) : (
                <span>Extract Product Data</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
