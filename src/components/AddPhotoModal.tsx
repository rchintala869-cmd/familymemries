import React, { useState, useRef, useEffect } from 'react';
import { MemoryPhoto } from '../types.ts';
import {
  UploadCloud,
  X,
  Plus,
  Image as ImageIcon,
  Calendar,
  MapPin,
  Tag,
  Database,
  CheckCircle2,
  FolderOpen,
  Camera,
  AlertTriangle,
  FileCheck,
  Layers,
} from 'lucide-react';
import { PRESET_ALBUMS } from '../data/initialMemories.ts';
import {
  optimizeBatchImagesForFirestore,
  OptimizedBatchItem,
} from '../utils/imageOptimizer.ts';
import { saveBatchMemoriesToFirebase } from '../services/storage.ts';
import firebaseConfig from '../../firebase-applet-config.json';

interface AddPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPhoto?: (newPhoto: MemoryPhoto) => Promise<void> | void;
  onAddPhotosBatch?: (newPhotos: MemoryPhoto[]) => Promise<void> | void;
  existingAlbums: string[];
  initialFiles?: File[] | null;
}

export const AddPhotoModal: React.FC<AddPhotoModalProps> = ({
  isOpen,
  onClose,
  onAddPhoto,
  onAddPhotosBatch,
  existingAlbums,
  initialFiles,
}) => {
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState(existingAlbums[0] || 'Family Milestones');
  const [isCustomAlbum, setIsCustomAlbum] = useState(false);
  const [customAlbumName, setCustomAlbumName] = useState('');
  const [dateTaken, setDateTaken] = useState(() => {
    return new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  });
  const [location, setLocation] = useState('');
  const [familyMembersInput, setFamilyMembersInput] = useState('');

  // Processed photos ready for upload
  const [processedPhotos, setProcessedPhotos] = useState<OptimizedBatchItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Processing state during file optimization
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState<{ current: number; total: number }>({
    current: 0,
    total: 0,
  });

  // Saving state during permanent Firebase write (in chunks of 100)
  const [showFirebaseConfirm, setShowFirebaseConfirm] = useState(false);
  const [isSavingToFirebase, setIsSavingToFirebase] = useState(false);
  const [savingProgress, setSavingProgress] = useState<{
    saved: number;
    total: number;
    currentChunk: number;
    totalChunks: number;
  }>({ saved: 0, total: 0, currentChunk: 0, totalChunks: 0 });

  const dragCounterRef = useRef(0);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const allAvailableAlbums = Array.from(
    new Set([...existingAlbums, ...PRESET_ALBUMS])
  );

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setCaption('');
      setSelectedAlbum(existingAlbums[0] || 'Family Milestones');
      setIsCustomAlbum(false);
      setCustomAlbumName('');
      setLocation('');
      setFamilyMembersInput('');
      setProcessedPhotos([]);
      setErrorMessage(null);
      setShowFirebaseConfirm(false);
      setIsSavingToFirebase(false);
      setIsDragging(false);
      dragCounterRef.current = 0;

      if (initialFiles && initialFiles.length > 0) {
        handleProcessFiles(initialFiles);
      }
    }
  }, [isOpen, existingAlbums, initialFiles]);

  // Window drag suppression
  useEffect(() => {
    if (!isOpen) return;

    const preventDefaults = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    window.addEventListener('dragover', preventDefaults);
    window.addEventListener('drop', preventDefaults);

    return () => {
      window.removeEventListener('dragover', preventDefaults);
      window.removeEventListener('drop', preventDefaults);
    };
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSavingToFirebase) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isSavingToFirebase]);

  if (!isOpen) return null;

  // Process files (1, 10, 50, 100, 300, 500+ photos)
  const handleProcessFiles = async (filesList: File[] | FileList) => {
    const files: File[] = [];
    for (let i = 0; i < filesList.length; i++) {
      const f = filesList[i];
      if (f && f.type.startsWith('image/')) {
        files.push(f);
      }
    }

    if (files.length === 0) {
      setErrorMessage('Please select or drop valid image files (JPEG, PNG, WEBP, or HEIC).');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);
    setProcessingProgress({ current: 0, total: files.length });

    try {
      const optimized = await optimizeBatchImagesForFirestore(files, (current, total) => {
        setProcessingProgress({ current, total });
      });

      if (optimized.length === 0) {
        setErrorMessage('Could not load selected images. Please try other photos.');
        setIsProcessing(false);
        return;
      }

      setProcessedPhotos(optimized);
      setIsProcessing(false);

      // Default title if empty
      if (!title) {
        if (optimized.length === 1) {
          const clean = optimized[0].name
            .replace(/\.[^/.]+$/, '')
            .replace(/[-_]/g, ' ')
            .replace(/[0-9]/g, '')
            .trim();
          setTitle(clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : 'Family Memory');
        } else {
          setTitle(`Family Memory Collection (${optimized.length} photos)`);
        }
      }
    } catch (err) {
      console.error('Batch processing failed:', err);
      setErrorMessage('Error reading and optimizing the photographs. Please try again.');
      setIsProcessing(false);
    }
  };

  const extractFilesFromDragEvent = (e: React.DragEvent): File[] => {
    const files: File[] = [];
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        const f = e.dataTransfer.files[i];
        if (f.type.startsWith('image/')) {
          files.push(f);
        }
      }
    } else if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        const item = e.dataTransfer.items[i];
        if (item.kind === 'file') {
          const f = item.getAsFile();
          if (f && f.type.startsWith('image/')) {
            files.push(f);
          }
        }
      }
    }
    return files;
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragging(false);

    const files = extractFilesFromDragEvent(e);
    if (files.length > 0) {
      handleProcessFiles(files);
    } else {
      setErrorMessage('No valid image files detected in drop. Please try uploading from your gallery.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFiles(e.target.files);
    }
    e.target.value = '';
  };

  const handleProceedToFirebaseConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (processedPhotos.length === 0) {
      setErrorMessage('Please drag and drop photos or upload photos from your gallery first.');
      return;
    }
    if (!title.trim()) {
      setErrorMessage('Please provide a memorable title or collection name.');
      return;
    }

    const albumFinal = isCustomAlbum ? customAlbumName.trim() : selectedAlbum;
    if (!albumFinal) {
      setErrorMessage('Please choose or enter an album name.');
      return;
    }

    setErrorMessage(null);
    setShowFirebaseConfirm(true);
  };

  // Commit photos in chunks of 100 to Firebase Database
  const handleFinalConfirmSaveToFirebase = async () => {
    if (processedPhotos.length === 0) return;

    const albumFinal = isCustomAlbum ? customAlbumName.trim() : selectedAlbum;
    const familyMembers = familyMembersInput
      .split(',')
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    // Build array of MemoryPhoto items
    const memoryPhotosToSave: MemoryPhoto[] = processedPhotos.map((item, index) => {
      let photoTitle = title.trim();
      if (processedPhotos.length > 1) {
        // Individualized titles if multiple photos
        const cleanOriginalName = item.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]/g, ' ')
          .replace(/[0-9]/g, '')
          .trim();
        if (cleanOriginalName && cleanOriginalName.length > 2) {
          photoTitle = `${title.trim()} - ${cleanOriginalName.charAt(0).toUpperCase() + cleanOriginalName.slice(1)}`;
        } else {
          photoTitle = `${title.trim()} (#${index + 1})`;
        }
      }

      return {
        id: item.id,
        title: photoTitle,
        caption: caption.trim() || 'A cherished heirloom memory preserved in our permanent family collection.',
        album: albumFinal,
        imageUrl: item.dataUrl,
        dateTaken: dateTaken.trim() || 'Recently Added',
        uploadedAt: new Date(Date.now() + index * 10).toISOString(),
        location: location.trim() || undefined,
        familyMembers: familyMembers.length > 0 ? familyMembers : undefined,
        isOriginalDefault: false,
      };
    });

    setIsSavingToFirebase(true);
    setSavingProgress({
      saved: 0,
      total: memoryPhotosToSave.length,
      currentChunk: 1,
      totalChunks: Math.ceil(memoryPhotosToSave.length / 100),
    });

    try {
      // Save permanently in chunks of 100 photos at a time
      await saveBatchMemoriesToFirebase(
        memoryPhotosToSave,
        (saved, total, currentChunk, totalChunks) => {
          setSavingProgress({ saved, total, currentChunk, totalChunks });
        }
      );

      // Trigger app state sync
      if (onAddPhotosBatch) {
        await onAddPhotosBatch(memoryPhotosToSave);
      } else if (onAddPhoto && memoryPhotosToSave.length === 1) {
        await onAddPhoto(memoryPhotosToSave[0]);
      }

      setIsSavingToFirebase(false);
      onClose();
    } catch (err) {
      console.error('Failed to save to Firebase:', err);
      setIsSavingToFirebase(false);
      setErrorMessage('Failed to save permanently to Firebase. Please check connection and try again.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-photo-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={() => {
        if (!isSavingToFirebase) onClose();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#FAF8F5] border border-[#E0D7C9] rounded-3xl shadow-2xl p-6 sm:p-8 text-[#2B2620] my-8"
      >
        {/* Close Button */}
        {!isSavingToFirebase && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-[#7F7466] hover:text-[#2B2620] hover:bg-[#EFE9DF] rounded-xl transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* STEP 2: Explicit Firebase Confirmation Prompt */}
        {showFirebaseConfirm ? (
          <div className="py-2 space-y-6 animate-in fade-in duration-200">
            {/* Firebase Header Badge */}
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[#8C6D46] w-fit">
              <Database className="w-4 h-4 text-amber-600 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Permanent Firebase Database Confirmation
              </span>
            </div>

            <div>
              <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#2B2620]">
                Save {processedPhotos.length} {processedPhotos.length === 1 ? 'Photo' : 'Photos'} Permanently to Firebase Database?
              </h2>
              <p className="text-xs sm:text-sm text-[#6F6456] mt-1.5 leading-relaxed">
                All {processedPhotos.length} photos will be saved permanently to your Firebase Cloud Firestore database in batches of 100 at a time. Once saved, they will be stored forever and visible to everyone across the world on Google.
              </p>
            </div>

            {/* Cloud Database Info Box */}
            <div className="p-4 rounded-2xl bg-white border border-[#E5DDD0] space-y-2 text-xs shadow-xs">
              <div className="flex items-center justify-between text-[#5C5245]">
                <span className="font-medium">Connected Database ID:</span>
                <span className="font-mono text-[11px] text-[#2B2620] font-semibold bg-[#F4EDE2] px-2.5 py-1 rounded-lg">
                  {firebaseConfig.firestoreDatabaseId || 'ai-studio-chintalasfamilym-8ed4564d-7a7e-48da-8307-47326718e9e1'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#5C5245]">
                <span className="font-medium">Batch Save Method:</span>
                <span className="font-medium text-[#8C6D46]">
                  Batches of 100 photos ({Math.ceil(processedPhotos.length / 100)} {Math.ceil(processedPhotos.length / 100) === 1 ? 'batch' : 'batches'} total)
                </span>
              </div>
              <div className="flex items-center justify-between text-[#5C5245]">
                <span className="font-medium">Storage Type:</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Permanent Cloud Firestore (Worldwide)</span>
                </span>
              </div>
            </div>

            {/* Photos Preview Gallery Strip */}
            <div className="p-3.5 bg-[#F2ECE1] rounded-2xl border border-[#DFD6C8] space-y-3">
              <div className="flex items-center justify-between text-xs text-[#7A6E5E]">
                <span className="font-semibold text-[#2B2620]">
                  Target Album: <strong className="text-[#8C6D46]">{isCustomAlbum ? customAlbumName : selectedAlbum}</strong>
                </span>
                <span className="bg-white/80 px-2 py-0.5 rounded-md font-mono text-[11px] text-[#5C5245]">
                  {processedPhotos.length} {processedPhotos.length === 1 ? 'photo' : 'photos'}
                </span>
              </div>

              {/* Thumbnail Strip */}
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1 bg-white/60 rounded-xl">
                {processedPhotos.slice(0, 18).map((p, i) => (
                  <div key={p.id} className="aspect-square rounded-lg overflow-hidden bg-black/10 border border-white/80">
                    <img src={p.dataUrl} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                ))}
                {processedPhotos.length > 18 && (
                  <div className="aspect-square rounded-lg bg-[#E8DFC8] text-[#5C4F3F] flex items-center justify-center text-xs font-bold">
                    +{processedPhotos.length - 18} more
                  </div>
                )}
              </div>
            </div>

            {/* Live Progress Bar during Firebase Save */}
            {isSavingToFirebase && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-[#8C6D46]">
                  <span className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-[#8C6D46] border-t-transparent rounded-full animate-spin" />
                    <span>Saving to Firebase (Batch {savingProgress.currentChunk} of {savingProgress.totalChunks})...</span>
                  </span>
                  <span>
                    {savingProgress.saved} / {savingProgress.total} Saved ({Math.round((savingProgress.saved / savingProgress.total) * 100)}%)
                  </span>
                </div>

                <div className="w-full bg-[#E5DDD0] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#8C6D46] h-full transition-all duration-300 rounded-full"
                    style={{
                      width: `${Math.min(100, Math.round((savingProgress.saved / (savingProgress.total || 1)) * 100))}%`,
                    }}
                  />
                </div>
                <p className="text-[11px] text-[#7A6E5E] text-center">
                  Saving 100 photos at a time to prevent timeout and ensure all {savingProgress.total} photos persist permanently.
                </p>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Confirmation Buttons */}
            <div className="pt-4 border-t border-[#E8DFD3] flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                disabled={isSavingToFirebase}
                onClick={() => setShowFirebaseConfirm(false)}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-[#665B4E] hover:text-[#2B2620] hover:bg-[#EFE9DF] rounded-xl transition-colors cursor-pointer"
              >
                Back to Edit
              </button>

              <button
                type="button"
                disabled={isSavingToFirebase}
                onClick={handleFinalConfirmSaveToFirebase}
                className="w-full sm:w-auto px-6 py-3 bg-[#8C6D46] hover:bg-[#785C38] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSavingToFirebase ? (
                  <span>Saving All {processedPhotos.length} Photos to Firebase...</span>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    <span>Yes, Save All {processedPhotos.length} Photos Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* STEP 1: Add Photo & Details Form */
          <>
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#8C6D46] uppercase tracking-wider mb-1">
                <Plus className="w-4 h-4" />
                <span>Batch Upload • Permanent Firebase Archive</span>
              </div>
              <h2
                id="add-photo-modal-title"
                className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#2B2620]"
              >
                Add Photos (Drag & Drop or Gallery)
              </h2>
              <p className="text-xs sm:text-sm text-[#736859] mt-1">
                Drop 1, 100, 300, or 500+ photos. They will be saved in batches of 100 directly to Firebase Firestore.
              </p>
            </div>

            <form onSubmit={handleProceedToFirebaseConfirm} className="space-y-5">
              {/* PRIMARY UPLOAD CHOICE AREA: Drag & Drop Dropzone + Gallery Upload */}
              <div>
                <label className="block text-xs font-semibold text-[#50473D] uppercase tracking-wider mb-2">
                  Select Photos from Device (Supports 100–500+ Photos) *
                </label>

                {processedPhotos.length > 0 ? (
                  <div className="p-4 rounded-2xl border border-[#D9CFBF] bg-[#ECE5DB] space-y-3 shadow-sm">
                    {/* Top overlay info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-black/75 backdrop-blur-xs text-white text-xs px-3 py-1.5 rounded-xl">
                        <Layers className="w-4 h-4 text-[#D1B898]" />
                        <span className="font-semibold">{processedPhotos.length} {processedPhotos.length === 1 ? 'Photograph' : 'Photographs'} Ready</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => galleryInputRef.current?.click()}
                          className="px-3 py-1.5 bg-white text-[#2B2620] text-xs font-semibold rounded-lg shadow-xs hover:bg-[#FAF8F5] transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <FolderOpen className="w-3.5 h-3.5 text-[#8C6D46]" />
                          <span>Add More</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setProcessedPhotos([])}
                          className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg shadow-xs hover:bg-red-700 transition-colors cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    {/* Thumbnail Grid */}
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 bg-white/70 rounded-xl">
                      {processedPhotos.slice(0, 24).map((p, i) => (
                        <div key={p.id} className="aspect-square rounded-lg overflow-hidden bg-black/10 border border-white shadow-2xs relative group">
                          <img src={p.dataUrl} alt={p.name} className="w-full h-full object-cover" />
                          <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1 rounded">
                            #{i + 1}
                          </span>
                        </div>
                      ))}
                      {processedPhotos.length > 24 && (
                        <div className="aspect-square rounded-lg bg-[#E8DFC8] text-[#5C4F3F] flex items-center justify-center text-xs font-bold">
                          +{processedPhotos.length - 24} more
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Dual-Action Upload Area: Interactive Multi-Photo Drop Zone + Gallery Button */
                  <div className="space-y-3">
                    {/* Zone 1: Rock-Solid Drag and Drop Dropzone (Supports Multiple Files) */}
                    <div
                      onDragEnter={handleDragEnter}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-2xl p-7 sm:p-8 text-center transition-all cursor-pointer ${
                        isDragging
                          ? 'border-[#8C6D46] bg-[#F2EAE0] ring-4 ring-[#8C6D46]/20 scale-[1.01]'
                          : 'border-[#D4C8B6] bg-white hover:border-[#8C6D46] hover:bg-[#FAF7F2]'
                      }`}
                    >
                      {/* Native transparent file input with `multiple` */}
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        tabIndex={-1}
                        aria-label="Drag and drop photos or click to browse"
                        title="Drag and drop photos here or click to select"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={handleFileChange}
                      />

                      {/* Visual Content */}
                      <div className="pointer-events-none select-none flex flex-col items-center">
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-2xs transition-all ${
                            isDragging
                              ? 'bg-[#8C6D46] text-white scale-110'
                              : 'bg-[#F3ECE1] text-[#8C6D46]'
                          }`}
                        >
                          <UploadCloud className="w-7 h-7" />
                        </div>

                        <h4 className="text-base font-semibold text-[#2B2620]">
                          {isDragging ? 'Drop All Photos Now!' : 'Drag and Drop Photos Here (Drop 100, 300, or 500+)'}
                        </h4>

                        <p className="text-xs text-[#857969] mt-1 max-w-md">
                          {isDragging
                            ? 'Release mouse to load all photos into the batch processor'
                            : 'Drop any number of photos from your computer or folders. All photos will be saved permanently.'}
                        </p>

                        <div className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] text-[#8C6D46] font-medium bg-[#F5EDE1] px-3 py-1 rounded-lg">
                          <span>Multiple selection enabled · Saves in batches of 100</span>
                        </div>
                      </div>
                    </div>

                    {/* Zone 2: Gallery Upload Button with Multiple Selection */}
                    <div className="p-4 bg-[#F5EFE6] border border-[#E3D8C8] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-semibold text-[#3D342A] block">
                          Upload from Device Gallery?
                        </span>
                        <span className="text-[11px] text-[#7A6E5E]">
                          Select multiple photos at once from your gallery or folder
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => galleryInputRef.current?.click()}
                          className="flex-1 sm:flex-none px-4 py-2.5 bg-[#8C6D46] hover:bg-[#785C38] text-white text-xs font-semibold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                        >
                          <FolderOpen className="w-4 h-4" />
                          <span>Upload Photos from Your Gallery</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => cameraInputRef.current?.click()}
                          className="px-3.5 py-2.5 bg-white hover:bg-[#F2EAE0] text-[#5C4F3F] text-xs font-semibold rounded-xl border border-[#D9CFBF] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                          title="Open Camera"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Camera</span>
                        </button>
                      </div>
                    </div>

                    {/* Processing Progress Bar */}
                    {isProcessing && (
                      <div className="p-4 bg-amber-50 border border-amber-200 text-[#8C6D46] text-xs rounded-2xl space-y-2">
                        <div className="flex items-center justify-between font-semibold">
                          <span className="flex items-center gap-2">
                            <div className="w-3.5 h-3.5 border-2 border-[#8C6D46] border-t-transparent rounded-full animate-spin" />
                            <span>Optimizing photos from your device...</span>
                          </span>
                          <span>
                            {processingProgress.current} / {processingProgress.total} ({Math.round((processingProgress.current / (processingProgress.total || 1)) * 100)}%)
                          </span>
                        </div>
                        <div className="w-full bg-amber-200/50 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#8C6D46] h-full transition-all duration-200 rounded-full"
                            style={{
                              width: `${Math.min(100, Math.round((processingProgress.current / (processingProgress.total || 1)) * 100))}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Hidden File Picker Inputs with `multiple` */}
                <input
                  ref={galleryInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Title & Album Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="photo-title-input"
                    className="block text-xs font-semibold text-[#50473D] uppercase tracking-wider mb-1.5"
                  >
                    Memory / Batch Title *
                  </label>
                  <input
                    id="photo-title-input"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Grand Celebration 2026"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D9CFBF] rounded-xl text-sm text-[#2B2620] placeholder-[#A69C8E] focus:outline-none focus:ring-2 focus:ring-[#8C6D46]/20 focus:border-[#8C6D46]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="photo-album-select"
                      className="block text-xs font-semibold text-[#50473D] uppercase tracking-wider"
                    >
                      Target Album *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomAlbum(!isCustomAlbum)}
                      className="text-xs text-[#8C6D46] hover:text-[#5E482C] font-semibold underline cursor-pointer"
                    >
                      {isCustomAlbum ? 'Select Existing' : '+ New Album'}
                    </button>
                  </div>

                  {isCustomAlbum ? (
                    <input
                      type="text"
                      required
                      value={customAlbumName}
                      onChange={(e) => setCustomAlbumName(e.target.value)}
                      placeholder="e.g. Summer Vacation 2026"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#D9CFBF] rounded-xl text-sm text-[#2B2620] placeholder-[#A69C8E] focus:outline-none focus:ring-2 focus:ring-[#8C6D46]/20 focus:border-[#8C6D46]"
                    />
                  ) : (
                    <select
                      id="photo-album-select"
                      value={selectedAlbum}
                      onChange={(e) => setSelectedAlbum(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#D9CFBF] rounded-xl text-sm text-[#2B2620] focus:outline-none focus:ring-2 focus:ring-[#8C6D46]/20 focus:border-[#8C6D46] cursor-pointer"
                    >
                      {allAvailableAlbums.map((album) => (
                        <option key={album} value={album}>
                          {album}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Date Taken & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="photo-date-input"
                    className="block text-xs font-semibold text-[#50473D] uppercase tracking-wider mb-1.5 flex items-center gap-1"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#8C6D46]" />
                    <span>Date Taken</span>
                  </label>
                  <input
                    id="photo-date-input"
                    type="text"
                    value={dateTaken}
                    onChange={(e) => setDateTaken(e.target.value)}
                    placeholder="e.g. September 27, 2026"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D9CFBF] rounded-xl text-sm text-[#2B2620] placeholder-[#A69C8E] focus:outline-none focus:ring-2 focus:ring-[#8C6D46]/20 focus:border-[#8C6D46]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="photo-location-input"
                    className="block text-xs font-semibold text-[#50473D] uppercase tracking-wider mb-1.5 flex items-center gap-1"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#8C6D46]" />
                    <span>Location (Optional)</span>
                  </label>
                  <input
                    id="photo-location-input"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Hyderabad, India"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D9CFBF] rounded-xl text-sm text-[#2B2620] placeholder-[#A69C8E] focus:outline-none focus:ring-2 focus:ring-[#8C6D46]/20 focus:border-[#8C6D46]"
                  />
                </div>
              </div>

              {/* Caption / Story */}
              <div>
                <label
                  htmlFor="photo-caption-input"
                  className="block text-xs font-semibold text-[#50473D] uppercase tracking-wider mb-1.5"
                >
                  Family Story / Caption
                </label>
                <textarea
                  id="photo-caption-input"
                  rows={2}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Record the story, laughter, or memories behind these photographs..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D9CFBF] rounded-xl text-sm text-[#2B2620] placeholder-[#A69C8E] focus:outline-none focus:ring-2 focus:ring-[#8C6D46]/20 focus:border-[#8C6D46]"
                />
              </div>

              {/* Family Members in Photo */}
              <div>
                <label
                  htmlFor="photo-members-input"
                  className="block text-xs font-semibold text-[#50473D] uppercase tracking-wider mb-1.5 flex items-center gap-1"
                >
                  <Tag className="w-3.5 h-3.5 text-[#8C6D46]" />
                  <span>Family Members Pictured (comma separated)</span>
                </label>
                <input
                  id="photo-members-input"
                  type="text"
                  value={familyMembersInput}
                  onChange={(e) => setFamilyMembersInput(e.target.value)}
                  placeholder="e.g. Ramesh, Priya, Ananya"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D9CFBF] rounded-xl text-sm text-[#2B2620] placeholder-[#A69C8E] focus:outline-none focus:ring-2 focus:ring-[#8C6D46]/20 focus:border-[#8C6D46]"
                />
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Actions */}
              <div className="pt-3 border-t border-[#E8DFD3] flex items-center justify-between gap-3">
                <span className="text-[11px] text-[#8C7662] flex items-center gap-1 font-medium">
                  <Database className="w-3.5 h-3.5 text-[#8C6D46]" />
                  <span>Saves 100 at a time to Firebase</span>
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 text-xs font-semibold text-[#665B4E] hover:text-[#2B2620] hover:bg-[#EFE9DF] rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processedPhotos.length === 0 || isProcessing}
                    className="px-5 py-2.5 bg-[#8C6D46] hover:bg-[#785C38] disabled:bg-[#BDB2A5] text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Proceed to Save ({processedPhotos.length})</span>
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
