import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Download,
  Share2,
  Calendar,
  HardDrive,
  User,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import Logo from '../components/common/Logo';
import Button from '../components/common/Button';
import { getFileIcon, getFileTypeCategory } from '../utils/fileHelpers';
import { formatBytes } from '../utils/formatBytes';
import { formatDate } from '../utils/formatDate';

export default function SharedView() {
  const { shareToken } = useParams();
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSharedFile = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`/api/files/public/${shareToken}`);
        setFile(res.data.file);
        setIsLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Shared file is not accessible or link has expired.');
        setIsLoading(false);
      }
    };

    if (shareToken) {
      fetchSharedFile();
    }
  }, [shareToken]);

  const handleDownload = () => {
    if (!file) return;
    const link = document.createElement('a');
    link.href = file.url;
    link.target = '_blank';
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 animate-spin text-brand-600 mb-3" />
        <p className="text-sm font-medium text-slate-600">Loading shared document...</p>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-200 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">File Not Available</h2>
          <p className="text-xs text-slate-500">{error || 'This link may have expired or public access was revoked by the owner.'}</p>
          <div className="pt-2">
            <Link to="/">
              <Button variant="primary" size="sm">
                Back to AuraDrive
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const category = getFileTypeCategory(file.mimetype, file.name);
  const iconMeta = getFileIcon(file.mimetype, file.name);
  const Icon = iconMeta.icon;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Header */}
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between">
        <Logo to="/" />
        <div className="flex items-center gap-3">
          <Button variant="primary" size="sm" icon={Download} onClick={handleDownload}>
            Download File
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Info card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className={`p-3.5 rounded-2xl shrink-0 ${iconMeta.bg} ${iconMeta.color}`}>
              <Icon className="w-7 h-7" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                {file.name}
              </h1>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <User className="w-3.5 h-3.5 text-brand-600" />
                  Shared by {file.owner?.name || 'AuraDrive User'}
                </span>
                <span>•</span>
                <span>{formatBytes(file.size)}</span>
                <span>•</span>
                <span>{formatDate(file.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="primary" icon={Download} onClick={handleDownload}>
              Download
            </Button>
          </div>
        </div>

        {/* Media Preview Box */}
        <div className="flex-1 min-h-[420px] bg-slate-900/5 rounded-3xl border border-slate-200/80 flex items-center justify-center p-4 sm:p-8 overflow-hidden">
          {category === 'image' ? (
            <img
              src={file.url}
              alt={file.name}
              className="max-h-[60vh] max-w-full rounded-2xl object-contain shadow-md"
            />
          ) : category === 'video' ? (
            <video
              src={file.url}
              controls
              autoPlay
              className="w-full max-w-3xl max-h-[60vh] rounded-2xl shadow-xl bg-black"
            />
          ) : category === 'audio' ? (
            <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg border border-slate-200 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center">
                <Icon className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm truncate">{file.name}</h3>
              <audio src={file.url} controls className="w-full" />
            </div>
          ) : file.mimetype?.includes('pdf') ? (
            <iframe
              src={file.url}
              title={file.name}
              className="w-full h-[65vh] rounded-2xl shadow-xl border border-slate-200 bg-white"
            />
          ) : (
            <div className="max-w-md bg-white p-8 rounded-3xl shadow-lg border border-slate-200 text-center space-y-4">
              <div className={`w-16 h-16 mx-auto rounded-2xl ${iconMeta.bg} ${iconMeta.color} flex items-center justify-center`}>
                <Icon className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">{file.name}</h3>
              <p className="text-xs text-slate-500">
                Click download below to save this file directly to your local computer.
              </p>
              <Button variant="primary" icon={Download} onClick={handleDownload}>
                Download ({formatBytes(file.size)})
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
