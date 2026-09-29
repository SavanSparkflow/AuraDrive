import React, { useEffect } from 'react';
import { HardDrive, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDriveStore } from '../../store/driveStore';
import { formatBytes } from '../../utils/formatBytes';

export default function StorageWidget() {
  const { user } = useAuthStore();
  const { storageStats, fetchStorageStats } = useDriveStore();

  useEffect(() => {
    fetchStorageStats();
  }, [fetchStorageStats, user?.storageUsed]);

  const used = user?.storageUsed || storageStats?.totalUsed || 0;
  const limit = user?.storageLimit || storageStats?.storageLimit || 15 * 1024 * 1024 * 1024;
  const percentage = Math.min(Math.round((used / limit) * 100), 100);

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-b from-brand-50/70 to-slate-50 border border-brand-100/80">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2 text-brand-700 font-semibold text-xs">
          <HardDrive className="w-4 h-4" />
          <span>Storage</span>
        </div>
        <span className="text-xs font-bold text-brand-900">{percentage}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-500"
          style={{ width: `${Math.max(percentage, 3)}%` }}
        />
      </div>

      <p className="text-[11px] text-slate-500 font-medium">
        <span className="font-semibold text-slate-800">{formatBytes(used)}</span> of{' '}
        {formatBytes(limit)} used
      </p>
    </div>
  );
}
