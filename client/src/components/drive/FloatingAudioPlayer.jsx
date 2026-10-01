import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  Music,
  Maximize2
} from 'lucide-react';
import { useDriveStore } from '../../store/driveStore';

export default function FloatingAudioPlayer() {
  const { activeAudioTrack, setActiveAudioTrack, setMediaPlayerItem } = useDriveStore();
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef(null);

  useEffect(() => {
    if (activeAudioTrack && audioRef.current) {
      if (activeAudioTrack.currentTime) {
        audioRef.current.currentTime = activeAudioTrack.currentTime;
      }
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [activeAudioTrack]);

  if (!activeAudioTrack) return null;

  const { file } = activeAudioTrack;

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 w-80 bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/80 p-3 text-white flex flex-col gap-2 animate-slide-left">
      <audio
        ref={audioRef}
        src={file.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center shrink-0">
            <Music className="w-4 h-4 animate-pulse" />
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold text-slate-100 truncate">{file.name}</p>
            <p className="text-[10px] text-slate-400 font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={togglePlay}
            className="w-7 h-7 rounded-lg bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center shadow-xs"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={() => {
              setMediaPlayerItem(file);
              setActiveAudioTrack(null);
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            title="Expand Full Player"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setActiveAudioTrack(null)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mini Progress bar */}
      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
        <div
          style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
          className="h-full bg-brand-500 rounded-full transition-all duration-200"
        />
      </div>
    </div>
  );
}
