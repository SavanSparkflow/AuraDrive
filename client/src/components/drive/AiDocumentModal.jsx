import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Sparkles,
  Bot,
  FileText,
  MessageSquare,
  ScanText,
  Copy,
  Check,
  RefreshCw,
  Send,
  X,
  Zap,
  Loader2,
  FileCode,
  Image as ImageIcon
} from 'lucide-react';
import { useDriveStore } from '../../store/driveStore';
import Button from '../common/Button';
import toast from 'react-hot-toast';

function MarkdownViewer({ content, className = '' }) {
  if (!content) return null;

  // Clean HTML breaks (<br>, <br/>) and normalize before rendering
  const formattedContent = String(content)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/&nbsp;/gi, ' ');

  return (
    <div className={`prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed text-slate-200 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-base sm:text-lg font-bold text-white mt-3 mb-2 pb-1 border-b border-slate-700/60" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-sm sm:text-base font-bold text-brand-300 mt-3 mb-2" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xs sm:text-sm font-semibold text-slate-100 mt-2 mb-1" {...props} />
          ),
          p: ({ node, ...props }) => <p className="mb-2 text-slate-200 leading-relaxed" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
          em: ({ node, ...props }) => <em className="italic text-slate-300" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 mb-2 text-slate-200" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1 mb-2 text-slate-200" {...props} />,
          li: ({ node, ...props }) => <li className="text-slate-200 pl-0.5" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-brand-500 bg-slate-800/60 pl-3 py-1.5 my-2 rounded-r-xl text-slate-300 italic" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-3 rounded-xl border border-slate-700 bg-slate-900/90 shadow-sm">
              <table className="w-full text-left text-xs border-collapse divide-y divide-slate-700" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-slate-800/80 text-brand-300 font-semibold uppercase text-[10px] tracking-wider" {...props} />
          ),
          th: ({ node, ...props }) => <th className="px-3 py-2.5 border-r border-slate-700 last:border-r-0" {...props} />,
          tbody: ({ node, ...props }) => <tbody className="divide-y divide-slate-800/80" {...props} />,
          tr: ({ node, ...props }) => <tr className="hover:bg-slate-800/40 transition-colors" {...props} />,
          td: ({ node, ...props }) => <td className="px-3 py-2 border-r border-slate-800 last:border-r-0 text-slate-200 align-top" {...props} />,
          code: ({ node, inline, ...props }) =>
            inline ? (
              <code className="px-1.5 py-0.5 rounded-md bg-slate-800 text-brand-300 font-mono text-[11px] border border-slate-700/50" {...props} />
            ) : (
              <pre className="p-3 rounded-xl bg-slate-950 font-mono text-xs overflow-x-auto my-2 border border-slate-800 text-slate-200" {...props} />
            )
        }}
      >
        {formattedContent}
      </ReactMarkdown>
    </div>
  );
}

export default function AiDocumentModal() {
  const {
    aiModalItem,
    isAiModalOpen,
    setIsAiModalOpen,
    summarizeFileAction,
    chatWithFileAction,
    ocrFileAction
  } = useDriveStore();

  const isImage = aiModalItem?.mimetype?.startsWith('image/');
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'chat' | 'ocr'

  // Summary state
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [hasCopiedSummary, setHasCopiedSummary] = useState(false);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const chatBottomRef = useRef(null);

  // OCR state
  const [ocrText, setOcrText] = useState('');
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [hasCopiedOcr, setHasCopiedOcr] = useState(false);

  useEffect(() => {
    if (!aiModalItem) return;

    // Load cached values
    if (aiModalItem.aiSummary) {
      setSummary(aiModalItem.aiSummary);
    } else {
      handleSummarize();
    }

    if (aiModalItem.ocrText) {
      setOcrText(aiModalItem.ocrText);
    } else if (isImage) {
      handleOcr();
    }

    // Reset chat
    setMessages([
      {
        role: 'assistant',
        content: `👋 Hello! I have indexed **"${aiModalItem.name}"**. What would you like to know about this file?`
      }
    ]);
  }, [aiModalItem]);

  useEffect(() => {
    if (activeTab === 'chat' && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  if (!isAiModalOpen || !aiModalItem) return null;

  const handleSummarize = async () => {
    setIsSummarizing(true);
    const res = await summarizeFileAction(aiModalItem._id);
    if (res.success && res.summary) {
      setSummary(res.summary);
    }
    setIsSummarizing(false);
  };

  const handleOcr = async () => {
    setIsOcrLoading(true);
    const res = await ocrFileAction(aiModalItem._id);
    if (res.success && res.ocrText) {
      setOcrText(res.ocrText);
    }
    setIsOcrLoading(false);
  };

  const handleSendMessage = async (customPrompt = null) => {
    const text = (customPrompt || inputQuestion).trim();
    if (!text || isChatting) return;

    const userMsg = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputQuestion('');
    setIsChatting(true);

    const res = await chatWithFileAction(aiModalItem._id, newMessages, text);
    if (res.success && res.reply) {
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);
    } else {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '⚠️ Sorry, I could not process your request right now. Please try again.' }
      ]);
    }
    setIsChatting(false);
  };

  const copyToClipboard = (text, type = 'summary') => {
    navigator.clipboard.writeText(text);
    if (type === 'summary') {
      setHasCopiedSummary(true);
      setTimeout(() => setHasCopiedSummary(false), 2000);
    } else {
      setHasCopiedOcr(true);
      setTimeout(() => setHasCopiedOcr(false), 2000);
    }
    toast.success('Copied to clipboard!');
  };

  const suggestedQuestions = [
    'What are the core key points?',
    'List all action items and next steps',
    'Explain any complex technical terms simply',
    'Extract dates, names, or numbers mentioned'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl h-[85vh] bg-slate-900 rounded-3xl shadow-2xl border border-slate-700/80 flex flex-col overflow-hidden animate-scale-in text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-brand-600 to-fuchsia-600 text-white shadow-lg shadow-brand-500/20 shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white truncate">{aiModalItem.name}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  Pollinations AI
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">AI Document Summarizer & Smart Assistant</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAiModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-6 border-b border-slate-800 bg-slate-900/60 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs font-semibold transition-all ${
              activeTab === 'summary'
                ? 'border-brand-500 text-brand-400 bg-brand-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>AI Executive Summary</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs font-semibold transition-all ${
              activeTab === 'chat'
                ? 'border-brand-500 text-brand-400 bg-brand-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat with File</span>
          </button>

          {isImage && (
            <button
              type="button"
              onClick={() => setActiveTab('ocr')}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs font-semibold transition-all ${
                activeTab === 'ocr'
                  ? 'border-brand-500 text-brand-400 bg-brand-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <ScanText className="w-4 h-4" />
              <span>AI Vision OCR</span>
            </button>
          )}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/40">
          {/* TAB 1: SUMMARY */}
          {activeTab === 'summary' && (
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Instant executive key insights generated by Pollinations AI</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSummarize}
                    disabled={isSummarizing}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    title="Regenerate Summary"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSummarizing ? 'animate-spin text-brand-400' : ''}`} />
                    <span>Regenerate</span>
                  </button>

                  {summary && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(summary, 'summary')}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/30 flex items-center gap-1.5 transition-colors"
                    >
                      {hasCopiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{hasCopiedSummary ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>
              </div>

              {isSummarizing ? (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-3xl bg-brand-600/20 border border-brand-500/40 flex items-center justify-center animate-pulse">
                      <Bot className="w-8 h-8 text-brand-400 animate-bounce" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-white">Analyzing Document...</h4>
                    <p className="text-xs text-slate-400 max-w-sm mt-1">
                      Extracting key takeaways, bullet highlights, and thematic topics via Pollinations AI.
                    </p>
                  </div>
                </div>
              ) : summary ? (
                <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
                  <MarkdownViewer content={summary} />
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400">
                  <p>No summary generated yet.</p>
                  <Button variant="primary" size="sm" onClick={handleSummarize} className="mt-3">
                    Generate Summary
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CHAT */}
          {activeTab === 'chat' && (
            <div className="max-w-3xl mx-auto h-full flex flex-col">
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        msg.role === 'user'
                          ? 'bg-brand-600 text-white'
                          : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white'
                      }`}
                    >
                      {msg.role === 'user' ? '👤' : <Sparkles className="w-4 h-4" />}
                    </div>

                    <div
                      className={`p-4 rounded-2xl text-xs sm:text-sm max-w-[85%] leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-brand-600 text-white rounded-tr-none whitespace-pre-wrap'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-lg'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        msg.content
                      ) : (
                        <MarkdownViewer content={msg.content} />
                      )}
                    </div>
                  </div>
                ))}

                {isChatting && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs rounded-tl-none flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
                      <span>Thinking with file context...</span>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Suggested Questions */}
              {messages.length <= 2 && (
                <div className="py-2 flex flex-wrap gap-2">
                  {suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(q)}
                      className="px-3 py-1.5 rounded-xl text-xs bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors text-left"
                    >
                      ✨ {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Chat Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="pt-3 border-t border-slate-800 flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder={`Ask anything about "${aiModalItem.name}"...`}
                  value={inputQuestion}
                  onChange={(e) => setInputQuestion(e.target.value)}
                  disabled={isChatting}
                  className="flex-1 bg-slate-900 border border-slate-700/80 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  type="submit"
                  disabled={!inputQuestion.trim() || isChatting}
                  className="p-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white transition-all disabled:opacity-40 disabled:hover:bg-brand-600 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: OCR */}
          {activeTab === 'ocr' && (
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <ScanText className="w-4 h-4 text-emerald-400" />
                  <span>AI Vision reads text, numbers, codes, and invoices from images</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOcr}
                    disabled={isOcrLoading}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isOcrLoading ? 'animate-spin text-brand-400' : ''}`} />
                    <span>Re-scan OCR</span>
                  </button>

                  {ocrText && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(ocrText, 'ocr')}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 transition-colors"
                    >
                      {hasCopiedOcr ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{hasCopiedOcr ? 'Copied' : 'Copy Text'}</span>
                    </button>
                  )}
                </div>
              </div>

              {isOcrLoading ? (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center animate-pulse">
                    <ScanText className="w-8 h-8 text-emerald-400 animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-white">Extracting Text from Image...</h4>
                    <p className="text-xs text-slate-400 max-w-sm mt-1">
                      Scanning text, receipts data, tables, and details with Pollinations Vision AI.
                    </p>
                  </div>
                </div>
              ) : ocrText ? (
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl prose prose-invert max-w-none text-slate-200 text-xs sm:text-sm font-mono whitespace-pre-wrap leading-relaxed">
                  {ocrText}
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400">
                  <p>No OCR text extracted yet.</p>
                  <Button variant="primary" size="sm" onClick={handleOcr} className="mt-3">
                    Extract Text from Image
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
