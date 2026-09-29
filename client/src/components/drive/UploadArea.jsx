import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useDriveStore } from '../../store/driveStore';

export default function UploadArea() {
  const { isUploading, uploadProgress } = useDriveStore();

  if (!isUploading) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-down">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-4 w-80 max-w-[calc(100vw-48px)]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-brand-600 animate-spin" />
            <span className="text-xs font-bold text-slate-800">Uploading to AuraDrive...</span>
          </div>
          <span className="text-xs font-bold text-brand-600">{uploadProgress}%</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-600 to-purple-500 transition-all duration-300 rounded-full"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
