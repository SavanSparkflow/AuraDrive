import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  RotateCw,
  Repeat,
  Tv,
  Download,
  Music,
  Video as VideoIcon,
  Radio
} from 'lucide-react';
import { useDriveStore } from '../../store/driveStore';
import Button from '../common/Button';

export default function MediaPlayerModal() {
  const { mediaPlayerItem, setMediaPlayerItem, setActiveAudioTrack } = useDriveStore();
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLooping, setIsLooping] = useState(false);

  const mediaRef = useRef(null);

  useEffect(() => {
    if (mediaPlayerItem) {
      setIsPlaying(true);
      setCurrentTime(0);
    }
  }, [mediaPlayerItem]);

  if (!mediaPlayerItem) return null;

  const isAudio = mediaPlayerItem.mimetype?.startsWith('audio/');

  const togglePlay = () => {
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause();
      } else {
        mediaRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      setCurrentTime(mediaRef.current.currentTime);
      setDuration(mediaRef.current.duration || 0);
    }
  };

  const handleSeek = (e) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (mediaRef.current) {
      mediaRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e) => {
    const vol = Number(e.target.value);
    setVolume(vol);
    setIsMuted(vol === 0);
    if (mediaRef.current) {
      mediaRef.current.volume = vol;
    }
  };

  const toggleMute = () => {
    if (mediaRef.current) {
      mediaRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleRateChange = (rate) => {
    setPlaybackRate(rate);
    if (mediaRef.current) {
      mediaRef.current.playbackRate = rate;
    }
  };

  const handlePiP = async () => {
    if (mediaRef.current && document.pictureInPictureEnabled) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await mediaRef.current.requestPictureInPicture();
        }
      } catch (err) {
        console.warn('PiP error:', err);
      }
    }
  };

  const handleFullscreen = () => {
    if (mediaRef.current) {
      if (mediaRef.current.requestFullscreen) {
        mediaRef.current.requestFullscreen();
      }
    }
  };

  const handleSendToBackground = () => {
    setActiveAudioTrack({
      file: mediaPlayerItem,
      isPlaying: true,
      currentTime
    });
    setMediaPlayerItem(null);
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 rounded-3xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden animate-scale-in text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className={`p-2.5 rounded-2xl shrink-0 ${isAudio ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'}`}>
              {isAudio ? <Music className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
            </div>
            <div className="truncate">
              <h3 className="text-sm sm:text-base font-bold text-white truncate">{mediaPlayerItem.name}</h3>
              <p className="text-[11px] text-slate-400">{isAudio ? 'AuraDrive Hi-Fi Audio Player' : 'Cinema Video Stream'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isAudio && (
              <Button
                variant="outline"
                size="sm"
                icon={Radio}
                onClick={handleSendToBackground}
                className="text-xs border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Play in Background
              </Button>
            )}

            <button
              type="button"
              onClick={() => setMediaPlayerItem(null)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Media Viewing Screen */}
        <div className="bg-black flex items-center justify-center min-h-[340px] max-h-[58vh] overflow-hidden relative group">
          {isAudio ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-brand-600/20 text-brand-400 flex items-center justify-center ring-8 ring-brand-500/10 animate-pulse">
                <Music className="w-12 h-12" />
              </div>
              <audio
                ref={mediaRef}
                src={mediaPlayerItem.url}
                autoPlay
                loop={isLooping}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
              />
            </div>
          ) : (
            <video
              ref={mediaRef}
              src={mediaPlayerItem.url}
              autoPlay
              loop={isLooping}
              onTimeUpdate={handleTimeUpdate}
              onClick={togglePlay}
              className="w-full max-h-[58vh] object-contain cursor-pointer"
            />
          )}
        </div>

        {/* Custom Media Controls Bar */}
        <div className="p-5 bg-slate-900 border-t border-slate-800 space-y-4">
          {/* Progress Seek Bar */}
          <div className="space-y-1">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full accent-brand-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Buttons Row */}
          <div className="flex items-center justify-between gap-4">
            {/* Play, Rewind, Fast Forward */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  if (mediaRef.current) mediaRef.current.currentTime = Math.max(currentTime - 10, 0);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Rewind 10s"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={togglePlay}
                className="w-11 h-11 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (mediaRef.current) mediaRef.current.currentTime = Math.min(currentTime + 10, duration);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Forward 10s"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsLooping(!isLooping)}
                className={`p-2 rounded-xl transition-colors ${
                  isLooping ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Repeat Loop"
              >
                <Repeat className="w-4 h-4" />
              </button>
            </div>

            {/* Center: Playback Speed Chips */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
              {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => handleRateChange(rate)}
                  className={`px-2 py-0.5 rounded-lg transition-colors font-mono ${
                    playbackRate === rate ? 'bg-brand-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* Right: Volume & Fullscreen / PiP */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="text-slate-400 hover:text-white"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 sm:w-20 accent-brand-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                />
              </div>

              {!isAudio && (
                <>
                  <button
                    type="button"
                    onClick={handlePiP}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Picture in Picture"
                  >
                    <Tv className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleFullscreen}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Fullscreen"
                  >
                    <Maximize className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
