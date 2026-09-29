import React, { useState } from 'react';
import { Copy, Check, Globe, Lock, Share2, ExternalLink } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useDriveStore } from '../../store/driveStore';
import toast from 'react-hot-toast';

export default function ShareModal() {
  const { shareItem, setShareItem, toggleShare } = useDriveStore();
  const [copied, setCopied] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  if (!shareItem) return null;

  const shareUrl = shareItem.shareLink || `${window.location.origin}/share/${shareItem.shareToken || ''}`;

  const handleCopy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggle = async () => {
    setIsToggling(true);
    await toggleShare(shareItem._id, !shareItem.isPublic);
    setIsToggling(false);
  };

  return (
    <Modal
      isOpen={!!shareItem}
      onClose={() => setShareItem(null)}
      title="Share File"
      subtitle={`Configure link sharing access for "${shareItem.name}"`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        {/* Toggle Access Card */}
        <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${shareItem.isPublic ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
              {shareItem.isPublic ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {shareItem.isPublic ? 'Public Link Sharing Active' : 'Restricted (Only You)'}
              </p>
              <p className="text-xs text-slate-500">
                {shareItem.isPublic
                  ? 'Anyone with this unique link can view and download this file'
                  : 'Only your account has access to this file'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggle}
            disabled={isToggling}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              shareItem.isPublic ? 'bg-brand-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                shareItem.isPublic ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Share Link Input with Copy Button */}
        {shareItem.isPublic ? (
          <div className="space-y-2 animate-fade-in">
            <label className="text-xs font-semibold text-slate-700">Public Access Link</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-slate-100/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 font-mono focus:outline-none select-all"
              />
              <Button
                type="button"
                variant="primary"
                onClick={handleCopy}
                icon={copied ? Check : Copy}
                className="shrink-0"
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-brand-50/50 border border-brand-100 text-xs text-brand-800">
            💡 Toggle the switch above to generate an instant, secure public link you can share with colleagues, friends, or clients.
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={() => setShareItem(null)}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
