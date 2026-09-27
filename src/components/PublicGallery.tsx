import React, { useState } from 'react';
import { MemoryPhoto } from '../types.ts';
import { Lock, Calendar, MapPin, Eye, Search, Sparkles, Plus, Camera, Heart } from 'lucide-react';

interface PublicGalleryProps {
  memories: MemoryPhoto[];
  isAuthenticated: boolean;
  selectedAlbum: string;
  onPhotoClick: (photo: MemoryPhoto) => void;
  onSelectAlbum: (album: string) => void;
  onOpenAddPhotoModal?: () => void;
  onOpenPasswordModal?: () => void;
}

export const PublicGallery: React.FC<PublicGalleryProps> = ({
  memories,
  isAuthenticated,
  selectedAlbum,
  onPhotoClick,
  onSelectAlbum,
  onOpenAddPhotoModal,
  onOpenPasswordModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique album names from actual uploaded memories
  const albumNames = Array.from(new Set(memories.map((m) => m.album).filter(Boolean)));

  // Filter memories by album and search
  const filteredMemories = memories.filter((photo) => {
    const matchesAlbum = selectedAlbum === 'all' || photo.album === selectedAlbum;
    const matchesSearch =
      searchQuery.trim() === '' ||
      photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.album.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (photo.location && photo.location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesAlbum && matchesSearch;
  });

  // Array of gentle rotations for organic polaroid look
  const rotations = ['-rotate-2', 'rotate-1.5', '-rotate-1', 'rotate-2', '-rotate-2.5', 'rotate-1'];

  return (
    <section id="gallery-grid" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Emotional Red Velvet Ribbon Welcome Quote Banner */}
      <div className="relative mb-12 mx-auto max-w-4xl px-2 sm:px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#4A0A14] via-[#751122] to-[#4A0A14] text-[#FFF5EA] p-6 sm:p-7 shadow-2xl border-y-2 border-[#D4AF37]/60 text-center">
          {/* Golden embroidered edge filigree lines */}
          <div className="absolute inset-x-8 top-2 h-px bg-gradient-to-r from-transparent via-[#FFDF73]/80 to-transparent" />
          <div className="absolute inset-x-8 bottom-2 h-px bg-gradient-to-r from-transparent via-[#FFDF73]/80 to-transparent" />

          {/* Left & Right Brass Ribbon Tips */}
          <div className="absolute top-1/2 left-3 -translate-y-1/2 hidden sm:block text-[#D4AF37]/60 text-lg">
            ❖
          </div>
          <div className="absolute top-1/2 right-3 -translate-y-1/2 hidden sm:block text-[#D4AF37]/60 text-lg">
            ❖
          </div>

          <div className="flex items-center justify-center gap-2 text-xs font-cinzel uppercase tracking-[0.28em] text-[#FFDF73] mb-2 font-bold drop-shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#FFDF73]" />
            <span>Our Legacy & Golden Heritage</span>
            <Sparkles className="w-3.5 h-3.5 text-[#FFDF73]" />
          </div>

          <p className="font-serif italic text-lg sm:text-2xl text-[#FFF0E2] leading-relaxed max-w-2xl mx-auto drop-shadow-md">
            &ldquo;Every photograph is a heartbeat preserved in time, a golden thread binding our generations with honor, warmth, and enduring love.&rdquo;
          </p>

          <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-[#E5B581] font-mono tracking-widest uppercase">
            <Heart className="w-3 h-3 text-[#FFDF73] fill-current" />
            <span>Cherished Across The Chinthala Generations</span>
            <Heart className="w-3 h-3 text-[#FFDF73] fill-current" />
          </div>
        </div>
      </div>

      {/* Section Subheader & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#8C6D46] font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>PERMANENT CLOUD ARCHIVE</span>
          </span>
          <h2 className="font-serif-display text-3xl sm:text-4xl md:text-5xl font-semibold text-[#2B2620] mt-1">
            {selectedAlbum === 'all' ? 'Family Memories' : selectedAlbum}
          </h2>
          <p className="text-xs sm:text-sm text-[#736859] mt-1">
            {filteredMemories.length} {filteredMemories.length === 1 ? 'photograph' : 'photographs'} saved permanently in Firebase ·{' '}
            {isAuthenticated ? (
              <span className="text-[#8C6D46] font-semibold">Family portal unlocked</span>
            ) : (
              <span>Visible to all people worldwide · Click any photo to unlock full details</span>
            )}
          </p>
        </div>

        {/* Search Input & Action */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memories..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#DDD3C5] rounded-xl text-xs sm:text-sm text-[#2B2620] placeholder-[#A49A8D] focus:outline-none focus:ring-2 focus:ring-[#8C6D46]/20 focus:border-[#8C6D46] shadow-2xs transition-all"
            />
            <Search className="w-4 h-4 text-[#8C7E6D] absolute left-3 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8C7E6D] hover:text-[#2B2620] cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {isAuthenticated && onOpenAddPhotoModal && (
            <button
              onClick={onOpenAddPhotoModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#8C6D46] hover:bg-[#785C38] text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add Photo</span>
            </button>
          )}
        </div>
      </div>

      {/* Album Filter Ribbon (Only if there are uploaded albums) */}
      {albumNames.length > 0 && (
        <div className="mb-10 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[#E8DFC8]/60">
          <button
            onClick={() => onSelectAlbum('all')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              selectedAlbum === 'all'
                ? 'bg-[#2B2620] text-white shadow-xs'
                : 'bg-white border border-[#DDD3C5] text-[#5C5245] hover:bg-[#F2EAE0]'
            }`}
          >
            All Memories ({memories.length})
          </button>
          {albumNames.map((album) => {
            const count = memories.filter((m) => m.album === album).length;
            return (
              <button
                key={album}
                onClick={() => onSelectAlbum(album)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  selectedAlbum === album
                    ? 'bg-[#2B2620] text-white shadow-xs'
                    : 'bg-white border border-[#DDD3C5] text-[#5C5245] hover:bg-[#F2EAE0]'
                }`}
              >
                {album} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Empty State when no photos exist yet */}
      {filteredMemories.length === 0 ? (
        <div className="text-center py-20 px-6 bg-white border border-dashed border-[#DDD3C5] rounded-3xl max-w-2xl mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#F4EDE2] text-[#8C6D46] flex items-center justify-center mx-auto mb-4 shadow-xs">
            <Camera className="w-8 h-8" />
          </div>

          <h3 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#2B2620]">
            The Permanent Archive Is Ready
          </h3>

          <p className="mt-2 text-xs sm:text-sm text-[#736859] max-w-md mx-auto leading-relaxed">
            All photos uploaded are saved permanently in Firebase Firestore and viewable by everyone in the world.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={onOpenAddPhotoModal}
                className="px-6 py-3 bg-[#8C6D46] hover:bg-[#785C38] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Photos (1–500+)</span>
              </button>
            ) : (
              <button
                onClick={onOpenPasswordModal}
                className="px-6 py-3 bg-[#8C6D46] hover:bg-[#785C38] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Family Login (SRBS) To Add Photos</span>
              </button>
            )}

            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2.5 text-xs text-[#5C5245] hover:text-[#2B2620] cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Polaroid Photo Grid with Tilt Hover and Handwritten Caveat Captions */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 pt-2">
          {filteredMemories.map((photo, index) => {
            const rotationClass = rotations[index % rotations.length];

            return (
              <article
                key={photo.id}
                onClick={() => onPhotoClick(photo)}
                className={`group cursor-pointer bg-white p-3.5 sm:p-4 pb-6 sm:pb-7 rounded-xs shadow-lg hover:shadow-2xl border border-[#E8E2D5] transition-all duration-300 transform ${rotationClass} hover:rotate-0 hover:scale-104 hover:z-20 relative`}
              >
                {/* Vintage Tape Accent at Top */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#E8DEC8]/85 backdrop-blur-2xs border-t border-b border-black/10 rotate-[-1.5deg] shadow-xs z-10 pointer-events-none" />

                {/* Photo Display */}
                <div className="relative aspect-4/3 overflow-hidden bg-[#ECE5DB] rounded-2xs mb-4">
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Lock / High-Res Indicator */}
                  <div className="absolute top-2.5 right-2.5">
                    {isAuthenticated ? (
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-[#2B2620]/80 backdrop-blur-xs text-white text-[10px] font-medium rounded-md shadow-xs">
                        <Eye className="w-3 h-3 text-[#D1B898]" />
                        <span>High-Res</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-[#2B2620]/85 backdrop-blur-xs text-white text-[10px] font-medium rounded-md shadow-xs group-hover:bg-[#8C6D46] transition-colors">
                        <Lock className="w-3 h-3 text-[#E6D7C2]" />
                        <span>SRBS</span>
                      </span>
                    )}
                  </div>

                  {/* Album Tag */}
                  <div className="absolute bottom-2 left-2">
                    <span className="px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[10px] rounded font-medium">
                      {photo.album}
                    </span>
                  </div>
                </div>

                {/* Polaroid Bottom Margin with Caveat Handwritten Font */}
                <div className="px-1 text-center">
                  <h4 className="font-caveat text-2xl sm:text-3xl text-[#2B2620] group-hover:text-[#8C6D46] transition-colors leading-tight line-clamp-1 font-bold">
                    {photo.title}
                  </h4>

                  <p className="mt-1 text-xs text-[#6B5F50] line-clamp-2 leading-relaxed font-light">
                    {photo.caption}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-[#F2ECE1] flex items-center justify-between text-[11px] text-[#8C7E6D]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#8C6D46]" />
                      <span>{photo.dateTaken}</span>
                    </span>
                    {photo.location && (
                      <span className="flex items-center gap-1 line-clamp-1 max-w-[140px]">
                        <MapPin className="w-3 h-3 text-[#8C6D46]" />
                        <span className="truncate">{photo.location}</span>
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
