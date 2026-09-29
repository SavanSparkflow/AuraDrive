import {
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileCode,
  FileArchive,
  FileSpreadsheet,
  File
} from 'lucide-react';

export function getFileTypeCategory(mimetype = '', filename = '') {
  const mime = mimetype.toLowerCase();
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) {
    return 'image';
  }
  if (mime.startsWith('video/') || ['mp4', 'mov', 'webm', 'mkv', 'avi'].includes(ext)) {
    return 'video';
  }
  if (mime.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(ext)) {
    return 'audio';
  }
  if (
    mime.includes('pdf') ||
    mime.includes('word') ||
    mime.includes('officedocument') ||
    ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'].includes(ext)
  ) {
    return 'document';
  }
  if (
    mime.includes('sheet') ||
    mime.includes('excel') ||
    mime.includes('csv') ||
    ['xlsx', 'xls', 'csv'].includes(ext)
  ) {
    return 'spreadsheet';
  }
  if (
    mime.includes('zip') ||
    mime.includes('compressed') ||
    mime.includes('tar') ||
    ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)
  ) {
    return 'archive';
  }
  if (
    mime.includes('javascript') ||
    mime.includes('json') ||
    mime.includes('html') ||
    mime.includes('xml') ||
    ['js', 'jsx', 'ts', 'tsx', 'json', 'html', 'css', 'py', 'java', 'cpp', 'c', 'sql'].includes(ext)
  ) {
    return 'code';
  }

  return 'other';
}

export function getFileIcon(mimetype = '', filename = '') {
  const category = getFileTypeCategory(mimetype, filename);

  switch (category) {
    case 'image':
      return { icon: FileImage, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' };
    case 'video':
      return { icon: FileVideo, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200' };
    case 'audio':
      return { icon: FileAudio, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200' };
    case 'document':
      return { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' };
    case 'spreadsheet':
      return { icon: FileSpreadsheet, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    case 'code':
      return { icon: FileCode, color: 'text-cyan-500', bg: 'bg-cyan-50', border: 'border-cyan-200' };
    case 'archive':
      return { icon: FileArchive, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' };
    default:
      return { icon: File, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' };
  }
}
