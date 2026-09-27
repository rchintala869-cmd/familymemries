import React, { useState } from 'react';
import { MemoryPhoto } from '../types.ts';
import {
  Plus,
  Lock,
  Eye,
  Edit3,
  Trash2,
  Calendar,
  MapPin,
  Search,
  FolderPlus,
  Clock,
  Download,
  ShieldCheck,
  Sparkles,
  CheckSquare,
  Square,
  AlertTriangle,
} from 'lucide-react';

interface FamilyPortalProps {
  memories: MemoryPhoto[];
  onOpenAddPhotoModal: () => void;
  onLockPortal: () => void;
  onViewPublicGallery: () => void;
  onSelectPhoto: (photo: MemoryPhoto) => void;
  onEditPhoto: (photo: MemoryPhoto) => void;
  onDeletePhoto: (photoId: string) => void;
  onBulkDeletePhotos?: (photoIds: string[]) => void;
}

export const FamilyPortal: React.FC<FamilyPortalProps> = ({
  memories,
  onOpenAddPhotoModal,
  onLockPortal,
  onViewPublicGallery,
  onSelectPhoto,
  onEditPhoto,
  onDeletePhoto,
  onBulkDeletePhotos,
}) => {
  const [selectedAlbum, setSelectedAlbum] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedForDeletion, setSelectedForDeletion] = useState<string[]>([]);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  // Extract all unique albums from memories
  const albumNames = Array.from(new Set(memories.map((m) => m.album)));

  // Filter memories
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

  const handleDeleteConfirm = (id: string) => {
    onDeletePhoto(id);
    setConfirmDeleteId(null);
    setSelectedForDeletion((prev) => prev.filter((item) => item !== id));
  };

  const handleBulkDeleteConfirm = () => {
    if (selectedForDeletion.length === 0) return;
    if (onBulkDeletePhotos) {
      onBulkDeletePhotos(selectedForDeletion);
    } else {
      selectedForDeletion.forEach((id) => onDeletePhoto(id));
    }
    setSelectedForDeletion([]);
    setShowBulkConfirm(false);
    setIsDeleteMode(false);
  };

  const toggleSelectPhoto = (id: string) => {
    setSelectedForDeletion((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredMemories.map((p) => p.id);
    if (selectedForDeletion.length === allFilteredIds.length) {
      setSelectedForDeletion([]);
    } else {
      setSelectedForDeletion(allFilteredIds);
    }
  };

  const handleDownload = (photo: MemoryPhoto) => {
    const link = document.createElement('a');
    link.href = photo.imageUrl;
    link.download = `${photo.title.toLowerCase().replace(/\s+/g, '_')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Welcoming Header for Family Members */}
      <div className="bg-[#FAF7F2] border border-[#E4D9C8] rounded-2xl p-6 sm:p-8 mb-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#8C6D46] uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4 text-[#8C6D46]" />
              <span>Chintala Family Portal · Verified Access (SRBS)</span>
            </div>
            <h1 className="font-serif-display text-3xl sm:text-4xl font-semibold text-[#2B2620]">
              Chintala's Family Portal
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-[#6B5F50] max-w-2xl leading-relaxed">
              Curate our family archives, upload new high-resolution memories saved permanently worldwide,
              organize albums, and manage or delete photos from the collection.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onViewPublicGallery}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium text-[#4D4438] bg-white border border-[#DDD3C5] hover:bg-[#F2EAE0] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Public View</span>
            </button>

            <button
              onClick={onOpenAddPhotoModal}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-[#8C6D46] hover:bg-[#785C38] rounded-xl shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add Photos</span>
            </button>

            {/* Dedicated Delete Photos Button */}
            <button
              onClick={() => {
                setIsDeleteMode(!isDeleteMode);
                if (isDeleteMode) setSelectedForDeletion([]);
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                isDeleteMode
                  ? 'bg-red-600 text-white border-red-700 shadow-sm'
                  : 'bg-[#FDF4F4] text-[#8A3030] hover:bg-[#FDECEC] border-[#F2CFCF]'
              }`}
              title="Delete photos from the portal"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isDeleteMode ? 'Exit Delete Mode' : 'Delete Photos'}</span>
            </button>

            <button
              onClick={onLockPortal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium text-[#574E43] bg-white border border-[#DDD3C5] hover:bg-[#EFE9DF] rounded-xl transition-colors cursor-pointer whitespace-nowrap"
              title="Log Out and Lock Family Portal"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Portal</span>
            </button>
          </div>
        </div>

        {/* Unboxed Metadata Stats */}
        <div className="mt-6 pt-5 border-t border-[#E8DFC8] flex flex-wrap items-center gap-5 text-xs text-[#706454]">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-[#2B2620] tabular-nums">{memories.length}</span>
            <span>Memories in Archive</span>
          </div>
          <span className="text-[#D0C4B4]" aria-hidden="true">·</span>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-[#2B2620] tabular-nums">{albumNames.length}</span>
            <span>Albums</span>
          </div>
          <span className="text-[#D0C4B4]" aria-hidden="true">·</span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#8C6D46]" />
            <span>Firebase Firestore Permanent Storage Active</span>
          </div>
        </div>
      </div>

      {/* Delete Photos Toolbar (When Deletion Mode is Active) */}
      {isDeleteMode && (
        <div className="mb-6 p-4 bg-red-50/90 border border-red-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-100 text-red-700 rounded-xl">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-red-950">
                Photo Deletion Mode
              </p>
              <p className="text-xs text-red-800">
                {selectedForDeletion.length > 0
                  ? `${selectedForDeletion.length} photograph${selectedForDeletion.length === 1 ? '' : 's'} selected for permanent deletion.`
                  : 'Click any photo card to select it, or click the red "Delete Photo" button directly.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1.5 text-xs font-semibold text-red-900 bg-red-100 hover:bg-red-200 rounded-lg transition-colors cursor-pointer"
            >
              {selectedForDeletion.length === filteredMemories.length && filteredMemories.length > 0
                ? 'Deselect All'
                : 'Select All'}
            </button>

            <button
              disabled={selectedForDeletion.length === 0}
              onClick={() => setShowBulkConfirm(true)}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedForDeletion.length})</span>
            </button>

            <button
              onClick={() => {
                setIsDeleteMode(false);
                setSelectedForDeletion([]);
              }}
              className="px-3 py-1.5 text-xs font-medium text-[#5C5245] hover:text-[#2B2620] cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Album Selector & Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        {/* Album Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedAlbum('all')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              selectedAlbum === 'all'
                ? 'bg-[#2B2620] text-white shadow-xs'
                : 'bg-white border border-[#DDD3C5] text-[#5C5245] hover:bg-[#F2EAE0]'
            }`}
          >
            All Albums ({memories.length})
          </button>
          {albumNames.map((album) => {
            const count = memories.filter((m) => m.album === album).length;
            return (
              <button
                key={album}
                onClick={() => setSelectedAlbum(album)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
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

        {/* Search & Actions */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search portal memories..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#DDD3C5] rounded-xl text-xs sm:text-sm text-[#2B2620] placeholder-[#A49A8D] focus:outline-none focus:ring-2 focus:ring-[#8C6D46]/20 focus:border-[#8C6D46]"
            />
            <Search className="w-4 h-4 text-[#8C7E6D] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <button
            onClick={onOpenAddPhotoModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#8C6D46] hover:bg-[#F4ECE2] border border-[#DFCFC0] rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            <FolderPlus className="w-4 h-4" />
            <span>New Memory</span>
          </button>
        </div>
      </div>

      {/* Grid View */}
      {filteredMemories.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white border border-dashed border-[#DDD3C5] rounded-2xl">
          <div className="w-12 h-12 rounded-full bg-[#F3ECE1] text-[#8C6D46] flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="text-[#3E362C] text-base font-semibold">No photographs found in this view</p>
          <p className="text-xs text-[#7B7062] mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No memories match "${searchQuery}".`
              : 'Add your first photograph to this album from your local device.'}
          </p>
          <button
            onClick={onOpenAddPhotoModal}
            className="mt-4 px-4 py-2 bg-[#8C6D46] hover:bg-[#785C38] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Upload Photo Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMemories.map((photo) => {
            const isSelected = selectedForDeletion.includes(photo.id);

            return (
              <article
                key={photo.id}
                className={`bg-white p-3 sm:p-3.5 pb-5 sm:pb-6 rounded-xs shadow-md hover:shadow-xl border border-[#E8E2D5] transition-all duration-300 flex flex-col group relative ${
                  isSelected
                    ? 'border-red-500 ring-2 ring-red-400/40'
                    : 'hover:-translate-y-1'
                }`}
              >
                {/* Image Preview & Quick Actions with Polaroid White Framing */}
                <div
                  className="relative aspect-4/3 overflow-hidden bg-[#ECE5DB] rounded-2xs cursor-pointer mb-3.5"
                  onClick={() => {
                    if (isDeleteMode) {
                      toggleSelectPhoto(photo.id);
                    } else {
                      onSelectPhoto(photo);
                    }
                  }}
                >
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-104"
                  />

                  {/* Album tag overlay */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2 py-0.5 bg-[#2B2620]/80 backdrop-blur-xs text-white text-[10px] font-medium rounded-md shadow-xs">
                      {photo.album}
                    </span>
                  </div>

                  {/* Delete Mode Checkbox */}
                  {isDeleteMode && (
                    <div className="absolute top-2.5 right-2.5 z-10">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectPhoto(photo.id);
                        }}
                        className={`p-1.5 rounded-lg shadow-sm transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-red-600 text-white'
                            : 'bg-white/90 text-neutral-600 hover:bg-white'
                        }`}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Management Action Buttons on Hover (When not in delete mode) */}
                  {!isDeleteMode && (
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPhoto(photo);
                        }}
                        className="p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-md transition-colors cursor-pointer"
                        title="View Full Resolution"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(photo);
                        }}
                        className="p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-md transition-colors cursor-pointer"
                        title="Download Photo"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditPhoto(photo);
                        }}
                        className="p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-md transition-colors cursor-pointer"
                        title="Edit Details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(photo.id);
                        }}
                        className="p-1.5 bg-red-700 hover:bg-red-800 text-white rounded-md transition-colors cursor-pointer"
                        title="Delete Photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Polaroid Bottom Margin with Script Title & Metadata */}
                <div className="px-1 flex flex-col justify-between flex-1">
                  <div>
                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#807464] mb-1">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3 text-[#8C6D46]" />
                        <span>{photo.dateTaken}</span>
                      </span>
                      {photo.location && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="flex items-center gap-1 truncate max-w-[130px]">
                            <MapPin className="w-3 h-3 text-[#8C6D46]" />
                            <span>{photo.location}</span>
                          </span>
                        </>
                      )}
                    </div>

                    {/* Script Title */}
                    <h3
                      onClick={() => onSelectPhoto(photo)}
                      className="font-script text-2xl text-[#2B2620] hover:text-[#8C6D46] cursor-pointer transition-colors leading-tight line-clamp-1"
                    >
                      {photo.title}
                    </h3>

                    {/* Caption */}
                    <p className="mt-1 text-xs text-[#5E5448] leading-relaxed line-clamp-2 font-light">
                      {photo.caption}
                    </p>
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-4 pt-2.5 border-t border-[#F0E8DC] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-[#8C7E6D] text-[10px]">
                      <Clock className="w-3 h-3" />
                      <span>
                        Uploaded{' '}
                        {new Date(photo.uploadedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => onEditPhoto(photo)}
                        className="text-[#8C6D46] hover:text-[#5E482C] font-semibold text-xs cursor-pointer"
                      >
                        Edit
                      </button>

                      {/* Prominent Direct Delete Button */}
                      <button
                        onClick={() => setConfirmDeleteId(photo.id)}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-semibold text-xs cursor-pointer"
                        title="Delete photo permanently"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Single Photo Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="w-full max-w-md bg-[#FAF8F5] border border-[#E0D7C9] rounded-2xl p-6 sm:p-7 shadow-2xl text-[#2B2620]">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-red-100 text-red-700 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif-display text-xl sm:text-2xl font-semibold text-[#2B2620]">
                  Delete Photo Permanently?
                </h3>
                <span className="text-xs text-red-600 font-medium">Permanent Deletion</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#6E6355] leading-relaxed">
              This photo will be permanently removed from Chintala's family archive and deleted from storage. 
              It will no longer appear in the Public Gallery or Family Portal.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-[#E8DFD3]">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-xs font-semibold text-[#6E6355] hover:text-[#2B2620] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConfirm(confirmDeleteId)}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Photo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="w-full max-w-md bg-[#FAF8F5] border border-[#E0D7C9] rounded-2xl p-6 sm:p-7 shadow-2xl text-[#2B2620]">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-red-100 text-red-700 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif-display text-xl sm:text-2xl font-semibold text-[#2B2620]">
                  Delete {selectedForDeletion.length} Selected Photos?
                </h3>
                <span className="text-xs text-red-600 font-medium">Bulk Permanent Removal</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#6E6355] leading-relaxed">
              Are you sure you want to permanently delete all {selectedForDeletion.length} selected photographs? 
              This will remove them from the worldwide archive and cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-[#E8DFD3]">
              <button
                onClick={() => setShowBulkConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-[#6E6355] hover:text-[#2B2620] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDeleteConfirm}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Selected Photos</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

