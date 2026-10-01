import React, { useState } from 'react';
import {
  X,
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize,
  Minimize,
  Highlighter,
  MessageSquare,
  FileText,
  Trash2,
  Plus
} from 'lucide-react';
import { useDriveStore } from '../../store/driveStore';
import Button from '../common/Button';

export default function PdfViewerModal() {
  const { pdfViewerItem, setPdfViewerItem } = useDriveStore();
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState([
    { id: 1, text: 'Important certificate document. Verified on MERN stack completion.', page: 1, date: 'Just now' }
  ]);
  const [newNoteText, setNewNoteText] = useState('');

  if (!pdfViewerItem) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfViewerItem.url;
    link.download = pdfViewerItem.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printWindow = window.open(pdfViewerItem.url, '_blank');
    if (printWindow) {
      printWindow.focus();
      printWindow.print();
    }
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    setNotes([
      ...notes,
      {
        id: Date.now(),
        text: newNoteText.trim(),
        page: 1,
        date: 'Just now'
      }
    ]);
    setNewNoteText('');
  };

  const handleDeleteNote = (id) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className={`relative w-full ${isFullscreen ? 'h-full max-w-none rounded-none' : 'max-w-6xl h-[92vh] rounded-3xl'} bg-slate-900 shadow-2xl border border-slate-700 flex flex-col overflow-hidden animate-scale-in text-slate-100 transition-all`}>
        {/* Header Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h3 className="text-sm font-bold text-white truncate">{pdfViewerItem.name}</h3>
              <p className="text-[11px] text-slate-400">PDF Reader & Annotation Studio</p>
            </div>
          </div>

          {/* Center Tools: Zoom & Rotate */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-800 p-1 rounded-2xl border border-slate-700">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(z - 15, 50))}
              className="p-1.5 rounded-xl hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono px-2 text-slate-300 min-w-[50px] text-center">{zoom}%</span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(z + 15, 200))}
              className="p-1.5 rounded-xl hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-700 mx-1" />
            <button
              type="button"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="p-1.5 rounded-xl hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Rotate Page"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowNotes(!showNotes)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                showNotes ? 'bg-brand-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Notes ({notes.length})</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden sm:block"
              title="Print Document"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Download PDF"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden sm:block"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setPdfViewerItem(null)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewer Workspace */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Document Viewer */}
          <div className="flex-1 bg-slate-950 p-4 sm:p-6 flex items-center justify-center overflow-auto">
            <div
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'center center',
                transition: 'transform 0.2s ease-out'
              }}
              className="w-full h-full max-w-4xl"
            >
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(pdfViewerItem.url)}&embedded=true`}
                title={pdfViewerItem.name}
                className="w-full h-full min-h-[500px] rounded-2xl shadow-2xl border border-slate-800 bg-white"
              />
            </div>
          </div>

          {/* Notes & Annotations Sidebar */}
          {showNotes && (
            <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 animate-slide-left">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Highlighter className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Page Annotations</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNotes(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Add Note Input */}
              <form onSubmit={handleAddNote} className="p-4 border-b border-slate-800 space-y-2">
                <textarea
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Add a note or annotation..."
                  rows="2"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-brand-500 resize-none"
                />
                <Button type="submit" variant="primary" size="sm" icon={Plus} className="w-full justify-center">
                  Add Note
                </Button>
              </form>

              {/* Notes List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-xl space-y-1.5 group hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                      <span className="px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300">Page {note.page}</span>
                      <div className="flex items-center gap-2">
                        <span>{note.date}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note.id)}
                          className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">{note.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
