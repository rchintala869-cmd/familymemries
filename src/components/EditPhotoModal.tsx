import React, { useState, useEffect } from 'react';
import { MemoryPhoto } from '../types.ts';
import { X, Save, Calendar, MapPin, Tag } from 'lucide-react';
import { PRESET_ALBUMS } from '../data/initialMemories.ts';

interface EditPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  photo: MemoryPhoto | null;
  onSave: (updatedPhoto: MemoryPhoto) => void;
  existingAlbums: string[];
}

export const EditPhotoModal: React.FC<EditPhotoModalProps> = ({
  isOpen,
  onClose,
  photo,
  onSave,
  existingAlbums,
}) => {
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [album, setAlbum] = useState('');
  const [isCustomAlbum, setIsCustomAlbum] = useState(false);
  const [customAlbumName, setCustomAlbumName] = useState('');
  const [dateTaken, setDateTaken] = useState('');
  const [location, setLocation] = useState('');
  const [familyMembersInput, setFamilyMembersInput] = useState('');

  const allAvailableAlbums = Array.from(
    new Set([...existingAlbums, ...PRESET_ALBUMS])
  );

  useEffect(() => {
    if (photo && isOpen) {
      setTitle(photo.title);
      setCaption(photo.caption);
      setAlbum(photo.album);
      setIsCustomAlbum(false);
      setCustomAlbumName('');
      setDateTaken(photo.dateTaken);
      setLocation(photo.location || '');
      setFamilyMembersInput(photo.familyMembers?.join(', ') || '');
    }
  }, [photo, isOpen]);

  if (!isOpen || !photo) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAlbum = isCustomAlbum ? customAlbumName.trim() : album;
    if (!title.trim() || !finalAlbum) return;

    const familyMembers = familyMembersInput
      .split(',')
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    onSave({
      ...photo,
      title: title.trim(),
      caption: caption.trim(),
      album: finalAlbum,
      dateTaken: dateTaken.trim(),
      location: location.trim() || undefined,
      familyMembers: familyMembers.length > 0 ? familyMembers : undefined,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-[#FAF8F5] border border-[#E0D7C9] rounded-2xl shadow-2xl p-6 sm:p-8 text-[#2B2620] my-8"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#7F7466] hover:text-[#2B2620] hover:bg-[#EFE9DF] rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="font-serif-display text-2xl font-semibold text-[#2B2620] mb-4">
          Edit Memory Details
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#50473D] uppercase tracking-wider mb-1.5">
              Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#D9CFBF] rounded-xl text-sm text-[#2B2620] focus:ring-2 focus:ring-[#8C6D46]/20 focus:border-[#8C6D46]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#50473D] uppercase tracking-wider">
                  Album *
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomAlbum(!isCustomAlbum)}
                  className="text-xs text-[#8C6D46] underline font-medium cursor-pointer"
                >
                  {isCustomAlbum ? 'Choose Existing' : '+ New'}
                </button>
              </div>

              {isCustomAlbum ? (
                <input
                  type="text"
                  required
                  value={customAlbumName}
                  onChange={(e) => setCustomAlbumName(e.target.value)}
                  placeholder="New album name"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D9CFBF] rounded-xl text-sm text-[#2B2620]"
                />
              ) : (
                <select
                  value={album}
                  onChange={(e) => setAlbum(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D9CFBF] rounded-xl text-sm text-[#2B2620]"
                >
                  {allAvailableAlbums.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#50473D] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#8C6D46]" />
                <span>Date Taken</span>
              </label>
              <input
                type="text"
                value={dateTaken}
                onChange={(e) => setDateTaken(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#D9CFBF] rounded-xl text-sm text-[#2B2620]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#50473D] uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#8C6D46]" />
              <span>Location</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#D9CFBF] rounded-xl text-sm text-[#2B2620]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#50473D] uppercase tracking-wider mb-1.5">
              Caption / Story
            </label>
            <textarea
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#D9CFBF] rounded-xl text-sm text-[#2B2620]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#50473D] uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-[#8C6D46]" />
              <span>Family Members Pictured (comma separated)</span>
            </label>
            <input
              type="text"
              value={familyMembersInput}
              onChange={(e) => setFamilyMembersInput(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#D9CFBF] rounded-xl text-sm text-[#2B2620]"
            />
          </div>

          <div className="pt-3 border-t border-[#E8DFD3] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#665B4E] hover:text-[#2B2620] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#8C6D46] hover:bg-[#785C38] text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
