import {
  X,
  Download,
  Share2,
  Star,
  FileText,
  ExternalLink,
  Calendar,
  HardDrive,
  FileType,
  FileCode,
  Crop,
  Highlighter,
  Play
} from 'lucide-react';
import { useDriveStore } from '../../store/driveStore';
import { getFileTypeCategory, getFileIcon } from '../../utils/fileHelpers';
import { formatBytes } from '../../utils/formatBytes';
import { formatDate } from '../../utils/formatDate';
import Button from '../common/Button';

export default function FilePreviewModal() {
  const {
    previewItem,
    setPreviewItem,
    toggleStar,
    setShareItem,
    setTextEditorItem,
    setImageEditorItem,
    setPdfViewerItem,
    setMediaPlayerItem
  } = useDriveStore();

  if (!previewItem) return null;

  const category = getFileTypeCategory(previewItem.mimetype, previewItem.name);
  const iconMeta = getFileIcon(previewItem.mimetype, previewItem.name);
  const Icon = iconMeta.icon;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = previewItem.url;
    link.target = '_blank';
    link.download = previewItem.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenShare = () => {
    const itemToShare = previewItem;
    setPreviewItem(null);
    setShareItem(itemToShare);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      {/* Dark Blur Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={() => setPreviewItem(null)}
      />

      {/* Main Container */}
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200/50 flex flex-col overflow-hidden z-10 animate-scale-in">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white/90 backdrop-blur-md">
          <div className="flex items-center gap-3 truncate min-w-0 pr-4">
            <div className={`p-2 rounded-xl shrink-0 ${iconMeta.bg} ${iconMeta.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {previewItem.name}
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                <span>{formatBytes(previewItem.size)}</span>
                <span>•</span>
                <span>{formatDate(previewItem.createdAt)}</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Contextual Editor Launcher */}
            {(previewItem.name?.match(/\.(txt|md|js|jsx|ts|tsx|json|html|css|py|env|csv|sql|xml|yaml|yml)$/i) || previewItem.mimetype?.includes('text') || previewItem.mimetype?.includes('json')) && (
              <Button
                variant="outline"
                size="sm"
                icon={FileCode}
                onClick={() => {
                  const item = previewItem;
                  setPreviewItem(null);
                  setTextEditorItem(item);
                }}
                className="hidden sm:inline-flex text-xs border-brand-200 text-brand-700 bg-brand-50 hover:bg-brand-100"
              >
                Open Editor
              </Button>
            )}

            {previewItem.mimetype?.startsWith('image/') && (
              <Button
                variant="outline"
                size="sm"
                icon={Crop}
                onClick={() => {
                  const item = previewItem;
                  setPreviewItem(null);
                  setImageEditorItem(item);
                }}
                className="hidden sm:inline-flex text-xs border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100"
              >
                Edit Photo
              </Button>
            )}

            {(previewItem.mimetype?.includes('pdf') || previewItem.name?.toLowerCase().endsWith('.pdf')) && (
              <Button
                variant="outline"
                size="sm"
                icon={Highlighter}
                onClick={() => {
                  const item = previewItem;
                  setPreviewItem(null);
                  setPdfViewerItem(item);
                }}
                className="hidden sm:inline-flex text-xs border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100"
              >
                PDF Annotator
              </Button>
            )}

            {(previewItem.mimetype?.startsWith('video/') || previewItem.mimetype?.startsWith('audio/')) && (
              <Button
                variant="outline"
                size="sm"
                icon={Play}
                onClick={() => {
                  const item = previewItem;
                  setPreviewItem(null);
                  setMediaPlayerItem(item);
                }}
                className="hidden sm:inline-flex text-xs border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100"
              >
                Cinema Player
              </Button>
            )}

            <button
              type="button"
              onClick={() => toggleStar(previewItem._id, 'file')}
              className={`p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors ${
                previewItem.isStarred ? 'text-amber-500 border-amber-200 bg-amber-50/50' : 'text-slate-500'
              }`}
              title="Star item"
            >
              <Star className={`w-4 h-4 ${previewItem.isStarred ? 'fill-current' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleOpenShare}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <Button
              variant="primary"
              size="sm"
              icon={Download}
              onClick={handleDownload}
              className="hidden sm:inline-flex"
            >
              Download
            </Button>

            <button
              type="button"
              onClick={() => setPreviewItem(null)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 min-h-[360px] max-h-[calc(92vh-130px)] bg-slate-900/5 flex items-center justify-center p-4 sm:p-8 overflow-auto">
          {category === 'image' ? (
            <div className="max-w-full max-h-full flex items-center justify-center">
              <img
                src={previewItem.url}
                alt={previewItem.name}
                className="max-h-[65vh] max-w-full rounded-xl object-contain shadow-lg border border-slate-200/50"
              />
            </div>
          ) : category === 'video' ? (
            <div className="w-full max-w-3xl flex justify-center">
              <video
                src={previewItem.url}
                controls
                autoPlay
                className="w-full max-h-[65vh] rounded-2xl shadow-xl bg-black"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          ) : category === 'audio' ? (
            <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-200 text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-brand-100 text-brand-600 flex items-center justify-center shadow-inner">
                <Icon className="w-10 h-10" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-base truncate">{previewItem.name}</h4>
                <p className="text-xs text-slate-400 mt-1">{formatBytes(previewItem.size)}</p>
              </div>
              <audio src={previewItem.url} controls className="w-full" />
            </div>
          ) : previewItem.mimetype.includes('pdf') || previewItem.name?.toLowerCase().endsWith('.pdf') ? (
            <div className="w-full h-full flex flex-col items-center">
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(previewItem.url)}&embedded=true`}
                title={previewItem.name}
                className="w-full h-[68vh] rounded-2xl shadow-xl border border-slate-200 bg-white"
                onError={(e) => {
                  console.warn('Iframe load error, fallback to direct object');
                }}
              />
            </div>
          ) : (
            /* Generic / Document Placeholder */
            <div className="max-w-md bg-white p-8 rounded-3xl shadow-lg border border-slate-200 text-center space-y-4">
              <div className={`w-20 h-20 mx-auto rounded-3xl ${iconMeta.bg} ${iconMeta.color} flex items-center justify-center`}>
                <Icon className="w-10 h-10" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base truncate">{previewItem.name}</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Preview not directly rendered for this format ({previewItem.mimetype || 'Unknown'}).
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <Button variant="primary" icon={Download} onClick={handleDownload}>
                  Download to View
                </Button>
                <a
                  href={previewItem.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open in Tab</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer Details */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <FileType className="w-3.5 h-3.5 text-slate-400" />
              {previewItem.mimetype}
            </span>
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-slate-400" />
              {formatBytes(previewItem.size)}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {formatDate(previewItem.createdAt)}
            </span>
          </div>

          <div className="sm:hidden w-full pt-1">
            <Button variant="primary" size="sm" icon={Download} onClick={handleDownload} className="w-full">
              Download File
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
