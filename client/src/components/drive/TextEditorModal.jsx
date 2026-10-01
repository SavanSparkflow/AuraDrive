import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  FileCode,
  FileText,
  Eye,
  Edit3,
  Moon,
  Sun,
  Download,
  Loader2,
  Check,
  SplitSquareVertical
} from 'lucide-react';
import { useDriveStore } from '../../store/driveStore';
import Button from '../common/Button';
import toast from 'react-hot-toast';

export default function TextEditorModal() {
  const { textEditorItem, setTextEditorItem, saveFileContentAction } = useDriveStore();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [viewMode, setViewMode] = useState('edit'); // 'edit' | 'preview' | 'split'
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!textEditorItem) return;

    const loadText = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(textEditorItem.url);
        const text = await res.text();
        setContent(text);
        setHasChanges(false);
      } catch (err) {
        console.error('Failed to load text file:', err);
        toast.error('Could not load file contents');
      } finally {
        setIsLoading(false);
      }
    };

    loadText();
  }, [textEditorItem]);

  if (!textEditorItem) return null;

  const isMarkdown = textEditorItem.name.toLowerCase().endsWith('.md');
  const ext = textEditorItem.name.split('.').pop()?.toUpperCase() || 'TXT';

  const lines = content.split('\n');
  const lineCount = lines.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  const handleSave = async () => {
    setIsSaving(true);
    const res = await saveFileContentAction(textEditorItem._id, content);
    setIsSaving(false);
    if (res?.success) {
      setHasChanges(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = textEditorItem.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Simple Markdown renderer
  const renderMarkdown = (text) => {
    const rawLines = text.split('\n');
    return rawLines.map((line, idx) => {
      if (line.startsWith('# ')) {
        return <h1 key={idx} className="text-2xl font-bold border-b pb-2 mb-3 text-slate-900 dark:text-white">{line.slice(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-xl font-bold border-b pb-1 mb-2 text-slate-800 dark:text-slate-100">{line.slice(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-lg font-semibold mb-2 text-slate-700 dark:text-slate-200">{line.slice(4)}</h3>;
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={idx} className="ml-5 list-disc text-sm text-slate-700 dark:text-slate-300">{line.slice(2)}</li>;
      }
      if (line.startsWith('```')) {
        return <div key={idx} className="bg-slate-800 text-emerald-400 p-2 rounded-lg font-mono text-xs my-2">{line}</div>;
      }
      if (!line.trim()) {
        return <div key={idx} className="h-3" />;
      }
      return <p key={idx} className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 mb-1">{line}</p>;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className={`relative w-full max-w-5xl h-[88vh] rounded-3xl shadow-2xl border flex flex-col overflow-hidden animate-scale-in transition-colors duration-200 ${
        isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Top Header Toolbar */}
        <div className={`flex items-center justify-between px-6 py-3.5 border-b backdrop-blur-md ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-100'
        }`}>
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="p-2 rounded-xl bg-brand-600/10 text-brand-500 shrink-0">
              <FileCode className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold truncate">{textEditorItem.name}</h3>
                <span className="px-2 py-0.5 rounded-md bg-brand-500/20 text-brand-400 text-[10px] font-mono font-bold">
                  {ext}
                </span>
                {hasChanges && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Unsaved changes" />
                )}
              </div>
              <p className="text-[11px] text-slate-400">In-App Code & Text Editor</p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 shrink-0">
            {isMarkdown && (
              <div className="flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('edit')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${viewMode === 'edit' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('split')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${viewMode === 'split' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  <SplitSquareVertical className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('preview')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${viewMode === 'preview' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Download File"
            >
              <Download className="w-4 h-4" />
            </button>

            <Button
              variant="primary"
              size="sm"
              icon={Save}
              onClick={handleSave}
              isLoading={isSaving}
              disabled={isLoading || !hasChanges}
            >
              {hasChanges ? 'Save Changes' : 'Saved'}
            </Button>

            <button
              type="button"
              onClick={() => setTextEditorItem(null)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Editor Body */}
        <div className="flex-1 overflow-hidden flex">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
              <p className="text-xs">Loading document...</p>
            </div>
          ) : (
            <>
              {/* Text Input Area with Line Numbers */}
              {(viewMode === 'edit' || viewMode === 'split') && (
                <div className={`flex flex-1 overflow-hidden font-mono text-xs ${viewMode === 'split' ? 'border-r border-slate-700' : ''}`}>
                  {/* Line Numbers Gutter */}
                  <div className="w-12 select-none py-4 pr-3 text-right text-slate-500 bg-slate-950/40 border-r border-slate-800/80 overflow-hidden shrink-0">
                    {lines.map((_, i) => (
                      <div key={i} className="leading-6">
                        {i + 1}
                      </div>
                    ))}
                  </div>

                  {/* Textarea */}
                  <textarea
                    value={content}
                    onChange={(e) => {
                      setContent(e.target.value);
                      setHasChanges(true);
                    }}
                    placeholder="Type or paste your code/text here..."
                    spellCheck="false"
                    className="flex-1 p-4 bg-transparent outline-none resize-none leading-6 font-mono text-xs overflow-auto select-text scrollbar-thin"
                  />
                </div>
              )}

              {/* Markdown Preview Area */}
              {(viewMode === 'preview' || viewMode === 'split') && (
                <div className="flex-1 p-6 overflow-y-auto bg-slate-950/20 leading-relaxed">
                  <div className="max-w-3xl mx-auto">
                    {renderMarkdown(content)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Status Bar */}
        <div className={`px-6 py-2.5 border-t text-[11px] flex items-center justify-between ${
          isDarkMode ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'
        }`}>
          <div className="flex items-center gap-4 font-mono">
            <span>Lines: <strong className="text-slate-300">{lineCount}</strong></span>
            <span>Words: <strong className="text-slate-300">{wordCount}</strong></span>
            <span>Chars: <strong className="text-slate-300">{charCount}</strong></span>
          </div>
          <div className="flex items-center gap-3">
            <span>Encoding: UTF-8</span>
            <span>Mode: {ext}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
