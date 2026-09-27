import React, { useEffect } from 'react';
import { MemoryPhoto } from '../types.ts';
import { X, ChevronLeft, ChevronRight, Download, Calendar, MapPin, Tag, Edit3, Trash2 } from 'lucide-react';

interface PhotoLightboxProps {
  photo: MemoryPhoto | null;
  photos: MemoryPhoto[];
  isOpen: boolean;
  onClose: () => void;
  onSelectPhoto: (photo: MemoryPhoto) => void;
  isAuthenticated: boolean;
  onEdit?: (photo: MemoryPhoto) => void;
  onDelete?: (photoId: string) => void;
}

export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
  photo,
  photos,
  isOpen,
  onClose,
  onSelectPhoto,
  isAuthenticated,
  onEdit,
  onDelete,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || !photo) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (!isOpen || !photo) return null;

  const currentIndex = photos.findIndex((p) => p.id === photo.id);
  const handlePrev = () => {
    if (photos.length <= 1) return;
    const prevIdx = (currentIndex - 1 + photos.length) % photos.length;
    onSelectPhoto(photos[prevIdx]);
  };

  const handleNext = () => {
    if (photos.length <= 1) return;
    const nextIdx = (currentIndex + 1) % photos.length;
    onSelectPhoto(photos[nextIdx]);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = photo.imageUrl;
    link.download = `${photo.title.toLowerCase().replace(/\s+/g, '_')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md text-white animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top action bar */}
      <div 
        className="absolute top-0 inset-x-0 h-16 px-4 sm:px-6 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-300">
          <span className="font-serif-display text-white text-lg font-semibold truncate max-w-xs sm:max-w-md">
            {photo.title}
          </span>
          <span className="text-neutral-500">·</span>
          <span className="text-neutral-400">
            {currentIndex + 1} of {photos.length}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Download button */}
          <button
            onClick={handleDownload}
            className="p-2 sm:px-3 sm:py-1.5 text-xs font-medium text-white/90 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Download high-resolution photograph"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </button>

          {/* Edit/Delete if authenticated */}
          {isAuthenticated && onEdit && (
            <button
              onClick={() => onEdit(photo)}
              className="p-2 sm:px-3 sm:py-1.5 text-xs font-medium text-white/90 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Edit photo details"
            >
              <Edit3 className="w-4 h-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>
          )}

          {isAuthenticated && onDelete && (
            <button
              onClick={() => onDelete(photo.id)}
              className="p-2 sm:px-3 sm:py-1.5 text-xs font-medium text-red-300 hover:text-red-200 bg-red-950/40 hover:bg-red-900/60 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Delete photo"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          )}

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer ml-1"
            aria-label="Close high-resolution viewer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Image with Navigation Arrows */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full h-full flex flex-col md:flex-row items-center justify-center p-4 sm:p-10 pt-16 pb-24 md:pb-12 max-w-7xl mx-auto"
      >
        {/* Prev Arrow */}
        {photos.length > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all z-10 cursor-pointer"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next Arrow */}
        {photos.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all z-10 cursor-pointer"
            aria-label="Next photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Media Frame */}
        <div className="relative max-h-[75vh] w-auto max-w-4xl flex items-center justify-center">
          <img
            src={photo.imageUrl}
            alt={photo.title}
            className="max-h-[72vh] max-w-full object-contain rounded-lg shadow-2xl"
          />
        </div>
      </div>

      {/* Bottom Information Drawer / Scrim */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/85 to-transparent pt-6 pb-5 px-6 sm:px-12 z-20"
      >
        <div className="max-w-4xl mx-auto">
          {/* Unboxed Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 mb-1.5">
            <span className="text-[#D1B898] font-medium">{photo.album}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{photo.dateTaken}</span>
            </span>
            {photo.location && (
              <>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{photo.location}</span>
                </span>
              </>
            )}
          </div>

          <h3 className="font-serif-display text-lg sm:text-xl font-medium text-white">
            {photo.title}
          </h3>

          <p className="mt-1 text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-3xl line-clamp-2 sm:line-clamp-none">
            {photo.caption}
          </p>

          {photo.familyMembers && photo.familyMembers.length > 0 && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-neutral-400">
              <Tag className="w-3.5 h-3.5 text-[#D1B898]" />
              <span>Pictured: {photo.familyMembers.join(', ')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
