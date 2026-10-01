import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Sliders,
  Crop,
  Download,
  Save,
  Wand2,
  Undo2,
  Sparkles,
  Check
} from 'lucide-react';
import { useDriveStore } from '../../store/driveStore';
import Button from '../common/Button';
import toast from 'react-hot-toast';

export default function ImageEditorModal() {
  const { imageEditorItem, setImageEditorItem, saveFileContentAction } = useDriveStore();
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [filter, setFilter] = useState('none');
  const [isSaving, setIsSaving] = useState(false);

  const [isLoaded, setIsLoaded] = useState(false);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const drawImage = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle rotation dimensions
    const isSideways = rotation === 90 || rotation === 270;
    const width = isSideways ? img.naturalHeight : img.naturalWidth;
    const height = isSideways ? img.naturalWidth : img.naturalHeight;

    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);
    ctx.save();

    // Translate to center
    ctx.translate(width / 2, height / 2);

    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);

    // Apply flips
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    // Build filter string
    const filters = [];
    if (brightness !== 100) filters.push(`brightness(${brightness}%)`);
    if (contrast !== 100) filters.push(`contrast(${contrast}%)`);
    if (saturation !== 100) filters.push(`saturate(${saturation}%)`);

    if (filter === 'grayscale') filters.push('grayscale(100%)');
    else if (filter === 'sepia') filters.push('sepia(100%)');
    else if (filter === 'invert') filters.push('invert(100%)');
    else if (filter === 'vintage') {
      filters.push('sepia(50%)');
      filters.push('contrast(120%)');
    } else if (filter === 'vibrant') {
      filters.push('saturate(180%)');
      filters.push('contrast(110%)');
    }

    ctx.filter = filters.length > 0 ? filters.join(' ') : 'none';

    // Draw centered
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    ctx.restore();
  }, [rotation, flipH, flipV, brightness, contrast, saturation, filter]);

  // Load image only when imageEditorItem changes
  useEffect(() => {
    if (!imageEditorItem) {
      setIsLoaded(false);
      imageRef.current = null;
      return;
    }

    // Reset controls for the new item
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setFilter('none');
    setIsLoaded(false);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageEditorItem.url;
    img.onload = () => {
      imageRef.current = img;
      setIsLoaded(true);
    };
    img.onerror = () => {
      toast.error('Failed to load image for editing');
    };
  }, [imageEditorItem]);

  // Re-draw whenever adjustments or loaded status change
  useEffect(() => {
    if (isLoaded) {
      drawImage();
    }
  }, [isLoaded, drawImage]);

  if (!imageEditorItem) return null;

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsSaving(true);
    canvas.toBlob(async (blob) => {
      if (blob) {
        await saveFileContentAction(imageEditorItem._id, blob, imageEditorItem.name);
      }
      setIsSaving(false);
    }, imageEditorItem.mimetype || 'image/png', 0.95);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `edited_${imageEditorItem.name}`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const filtersList = [
    { id: 'none', label: 'Original' },
    { id: 'vibrant', label: 'Vibrant' },
    { id: 'grayscale', label: 'B&W' },
    { id: 'sepia', label: 'Sepia' },
    { id: 'vintage', label: 'Vintage' },
    { id: 'invert', label: 'Invert' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-6xl h-[90vh] bg-slate-900 rounded-3xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden animate-scale-in text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
              <Wand2 className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h3 className="text-sm sm:text-base font-bold text-white truncate">{imageEditorItem.name}</h3>
              <p className="text-[11px] text-slate-400">In-App Photo Studio & Cropper</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setRotation(0);
                setFlipH(false);
                setFlipV(false);
                setBrightness(100);
                setContrast(100);
                setSaturation(100);
                setFilter('none');
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Reset All Edits"
            >
              <Undo2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Download Image"
            >
              <Download className="w-4 h-4" />
            </button>

            <Button
              variant="primary"
              size="sm"
              icon={Save}
              onClick={handleSave}
              isLoading={isSaving}
            >
              Save Overwrite
            </Button>

            <button
              type="button"
              onClick={() => setImageEditorItem(null)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Workspace */}
        <div className="flex-1 flex overflow-hidden">
          {/* Canvas Preview Area */}
          <div className="flex-1 bg-slate-950 p-6 flex items-center justify-center overflow-auto relative">
            <canvas
              ref={canvasRef}
              className="max-h-[70vh] max-w-full rounded-2xl shadow-2xl object-contain border border-slate-800"
            />
          </div>

          {/* Right Editing Sidebar Tools */}
          <div className="w-72 bg-slate-900 border-l border-slate-800 p-5 overflow-y-auto space-y-6 shrink-0">
            {/* Transform / Rotate */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Transform</h4>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center justify-center"
                  title="Rotate Left 90°"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center justify-center"
                  title="Rotate Right 90°"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setFlipH(!flipH)}
                  className={`p-2.5 rounded-xl transition-colors flex items-center justify-center ${
                    flipH ? 'bg-brand-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                  title="Flip Horizontal"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setFlipV(!flipV)}
                  className={`p-2.5 rounded-xl transition-colors flex items-center justify-center ${
                    flipV ? 'bg-brand-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                  title="Flip Vertical"
                >
                  <FlipVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Adjustments */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Adjustments</h4>

              {/* Brightness */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-300 font-medium">
                  <span>Brightness</span>
                  <span>{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="200"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-brand-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                />
              </div>

              {/* Contrast */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-300 font-medium">
                  <span>Contrast</span>
                  <span>{contrast}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="200"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-brand-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                />
              </div>

              {/* Saturation */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-300 font-medium">
                  <span>Saturation</span>
                  <span>{saturation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                  className="w-full accent-brand-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                />
              </div>
            </div>

            {/* Color Filters */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Color Filters</h4>
              <div className="grid grid-cols-2 gap-2">
                {filtersList.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilter(f.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left flex items-center justify-between ${
                      filter === f.id
                        ? 'bg-brand-600/20 border-brand-500 text-brand-300 font-semibold'
                        : 'bg-slate-800 border-slate-700/60 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span>{f.label}</span>
                    {filter === f.id && <Check className="w-3.5 h-3.5 text-brand-400" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
