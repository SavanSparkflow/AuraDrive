import React, { useState, useEffect } from 'react';
import {
  History,
  RotateCcw,
  Download,
  Trash2,
  Clock,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles
} from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useDriveStore } from '../../store/driveStore';
import { formatBytes } from '../../utils/formatBytes';
import { formatDate } from '../../utils/formatDate';
import { getFileIcon } from '../../utils/fileHelpers';

export default function VersionHistoryModal() {
  const {
    versionHistoryItem,
    setVersionHistoryItem,
    fetchFileVersions,
    restoreFileVersion,
    deleteFileVersion
  } = useDriveStore();

  const [isLoading, setIsLoading] = useState(false);
  const [versionData, setVersionData] = useState(null);
  const [restoringVer, setRestoringVer] = useState(null);
  const [deletingVer, setDeletingVer] = useState(null);

  useEffect(() => {
    if (versionHistoryItem) {
      loadVersions(versionHistoryItem._id);
    }
  }, [versionHistoryItem]);

  const loadVersions = async (fileId) => {
    setIsLoading(true);
    const data = await fetchFileVersions(fileId);
    setVersionData(data);
    setIsLoading(false);
  };

  if (!versionHistoryItem) return null;

  const currentFile = versionData?.currentFile || versionHistoryItem;
  const currentVersionNum = versionData?.currentVersion || currentFile.currentVersion || 1;
  const versionsList = versionData?.versions || currentFile.versions || [];
  const iconMeta = getFileIcon(currentFile.mimetype, currentFile.name);
  const Icon = iconMeta.icon;

  const handleDownloadUrl = (url, name, verNum) => {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = `v${verNum}_${name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRestore = async (verNum) => {
    setRestoringVer(verNum);
    const res = await restoreFileVersion(currentFile._id, verNum);
    if (res.success) {
      await loadVersions(currentFile._id);
    }
    setRestoringVer(null);
  };

  const handleDelete = async (verNum) => {
    if (!window.confirm(`Are you sure you want to permanently delete version v${verNum}?`)) {
      return;
    }
    setDeletingVer(verNum);
    const res = await deleteFileVersion(currentFile._id, verNum);
    if (res.success) {
      await loadVersions(currentFile._id);
    }
    setDeletingVer(null);
  };

  return (
    <Modal
      isOpen={Boolean(versionHistoryItem)}
      onClose={() => setVersionHistoryItem(null)}
      title="File Version History"
      maxWidth="max-w-xl"
    >
      <div className="space-y-6">
        {/* Header file info card */}
        <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
          <div className={`p-2.5 rounded-xl ${iconMeta.bg} ${iconMeta.color} shrink-0`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-slate-900 truncate">{currentFile.name}</h4>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>{formatBytes(currentFile.size)}</span>
              <span>•</span>
              <span className="text-brand-600 font-semibold">Current: v{currentVersionNum}</span>
              <span>•</span>
              <span>{versionsList.length} previous version{versionsList.length === 1 ? '' : 's'}</span>
            </div>
          </div>
        </div>

        {/* Versions Timeline List */}
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
            <p className="text-xs">Loading version timeline...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Version Timeline
            </h5>

            {/* Current Active Version Card */}
            <div className="relative p-4 rounded-2xl border-2 border-brand-500/80 bg-brand-50/30 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="px-2.5 py-1 rounded-lg bg-brand-600 text-white font-bold text-xs shrink-0 shadow-xs">
                    v{currentVersionNum}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">Active Version</span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Current
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(currentFile.updatedAt || currentFile.createdAt, true)}
                      </span>
                      <span>•</span>
                      <span>{formatBytes(currentFile.size)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  icon={Download}
                  onClick={() => handleDownloadUrl(currentFile.url, currentFile.name, currentVersionNum)}
                  className="shrink-0 bg-white"
                >
                  Download
                </Button>
              </div>
            </div>

            {/* Historical Versions List */}
            {versionsList.length === 0 ? (
              <div className="p-6 text-center bg-slate-50/60 border border-dashed border-slate-200 rounded-2xl text-xs text-slate-500">
                <History className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                <p className="font-medium text-slate-700">No previous versions yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  When you upload an updated file with the same name, previous versions will be archived here automatically.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {versionsList
                  .slice()
                  .sort((a, b) => b.versionNumber - a.versionNumber)
                  .map((ver) => (
                    <div
                      key={ver.versionNumber}
                      className="p-3.5 rounded-2xl border border-slate-200/80 bg-white hover:bg-slate-50/60 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs shrink-0">
                          v{ver.versionNumber}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800">
                            Archived on {formatDate(ver.uploadedAt, true)}
                          </p>
                          <p className="text-[11px] text-slate-400">{formatBytes(ver.size)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Download}
                          title="Download this version"
                          onClick={() => handleDownloadUrl(ver.url, currentFile.name, ver.versionNumber)}
                          className="p-2 text-slate-500 hover:text-slate-800"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          icon={RotateCcw}
                          isLoading={restoringVer === ver.versionNumber}
                          onClick={() => handleRestore(ver.versionNumber)}
                          className="text-xs text-brand-600 hover:text-brand-700 hover:bg-brand-50 border-brand-200"
                        >
                          Restore
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          title="Delete version permanently"
                          isLoading={deletingVer === ver.versionNumber}
                          onClick={() => handleDelete(ver.versionNumber)}
                          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setVersionHistoryItem(null)}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
