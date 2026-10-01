import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  Globe,
  Lock,
  Share2,
  ExternalLink,
  KeyRound,
  Calendar,
  ShieldCheck,
  Clock
} from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useDriveStore } from '../../store/driveStore';
import toast from 'react-hot-toast';

export default function ShareModal() {
  const { shareItem, setShareItem, toggleShare } = useDriveStore();
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Security settings
  const [enablePassword, setEnablePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [expiresIn, setExpiresIn] = useState('never');

  useEffect(() => {
    if (shareItem) {
      setEnablePassword(!!shareItem.hasPassword);
      setPassword('');
      setExpiresIn('never');
    }
  }, [shareItem]);

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
    setIsSaving(true);
    await toggleShare(shareItem._id, !shareItem.isPublic);
    setIsSaving(false);
  };

  const handleSaveSecurity = async (e) => {
    e?.preventDefault();
    setIsSaving(true);
    await toggleShare(
      shareItem._id,
      true,
      enablePassword ? password : null,
      expiresIn
    );
    setIsSaving(false);
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
            <div
              className={`p-2.5 rounded-xl ${
                shareItem.isPublic ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {shareItem.isPublic ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {shareItem.isPublic ? 'Public Link Sharing Active' : 'Restricted (Only You)'}
              </p>
              <p className="text-xs text-slate-500">
                {shareItem.isPublic
                  ? 'Anyone with this link can view this file'
                  : 'Only your account has access to this file'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggle}
            disabled={isSaving}
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
        {shareItem.isPublic && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-1.5">
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

            {/* Advanced Security Options */}
            <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <span>Link Protection & Security</span>
              </div>

              {/* Password Protection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enablePassword}
                      onChange={(e) => setEnablePassword(e.target.checked)}
                      className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                    />
                    <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                    <span>Password Protect</span>
                  </label>
                </div>

                {enablePassword && (
                  <input
                    type="password"
                    placeholder="Enter security password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  />
                )}
              </div>

              {/* Link Expiration */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Link Expiration</span>
                </label>
                <select
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
                >
                  <option value="never">Never expires</option>
                  <option value="1h">Expires in 1 hour</option>
                  <option value="1d">Expires in 24 hours (1 day)</option>
                  <option value="7d">Expires in 7 days</option>
                  <option value="30d">Expires in 30 days</option>
                </select>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSaveSecurity}
                  isLoading={isSaving}
                >
                  Apply Security Settings
                </Button>
              </div>
            </div>
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
