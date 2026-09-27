/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { MemoryPhoto } from './types.ts';
import {
  getStoredMemories,
  subscribeToFirebaseMemories,
  saveMemoryToFirebase,
  updateMemoryInFirebase,
  deleteMemoryFromFirebase,
  bulkDeleteMemoriesFromFirebase,
  isPortalAuthenticated,
  setPortalAuthenticated,
} from './services/storage.ts';
import { Header } from './components/Header.tsx';
import { Hero } from './components/Hero.tsx';
import { PublicGallery } from './components/PublicGallery.tsx';
import { CallToActionBanner } from './components/CallToActionBanner.tsx';
import { FamilyPortal } from './components/FamilyPortal.tsx';
import { PasswordModal } from './components/PasswordModal.tsx';
import { AddPhotoModal } from './components/AddPhotoModal.tsx';
import { EditPhotoModal } from './components/EditPhotoModal.tsx';
import { PhotoLightbox } from './components/PhotoLightbox.tsx';
import { Footer } from './components/Footer.tsx';
import { LegacyEntranceOverlay } from './components/LegacyEntranceOverlay.tsx';
import { CheckCircle2, UploadCloud } from 'lucide-react';

export default function App() {
  const [memories, setMemories] = useState<MemoryPhoto[]>(() => getStoredMemories());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => isPortalAuthenticated());
  const [activeView, setActiveView] = useState<'gallery' | 'portal'>(() => {
    return isPortalAuthenticated() ? 'portal' : 'gallery';
  });

  // Royal Heirloom Keepsake Chest entrance state
  const [isEntranceOpen, setIsEntranceOpen] = useState(true);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [targetPhotoForPassword, setTargetPhotoForPassword] = useState<MemoryPhoto | null>(null);

  const [isAddPhotoModalOpen, setIsAddPhotoModalOpen] = useState(false);
  const [droppedFilesForModal, setDroppedFilesForModal] = useState<File[] | null>(null);
  const [isGlobalDragging, setIsGlobalDragging] = useState(false);
  const globalDragCounter = useRef(0);

  const [editingPhoto, setEditingPhoto] = useState<MemoryPhoto | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<MemoryPhoto | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Subscribe to real-time live Firebase Firestore updates
  // Any photo added from anywhere in the world will immediately update all viewers across the globe
  useEffect(() => {
    const unsubscribe = subscribeToFirebaseMemories((liveMemories) => {
      setMemories(liveMemories);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Global window drag-and-drop support: dragging a photo into the window opens the AddPhotoModal seamlessly
  useEffect(() => {
    const handleWindowDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      globalDragCounter.current += 1;
      if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
        setIsGlobalDragging(true);
      }
    };

    const handleWindowDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
      if (!isGlobalDragging && e.dataTransfer?.types.includes('Files')) {
        setIsGlobalDragging(true);
      }
    };

    const handleWindowDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      globalDragCounter.current -= 1;
      if (globalDragCounter.current <= 0) {
        globalDragCounter.current = 0;
        setIsGlobalDragging(false);
      }
    };

    const handleWindowDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      globalDragCounter.current = 0;
      setIsGlobalDragging(false);

      const droppedFiles: File[] = [];
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          const f = e.dataTransfer.files[i];
          if (f.type.startsWith('image/')) {
            droppedFiles.push(f);
          }
        }
      }

      if (droppedFiles.length > 0) {
        setDroppedFilesForModal(droppedFiles);
        if (isAuthenticated) {
          setIsAddPhotoModalOpen(true);
        } else {
          // If visitor drags files, ask password to unlock and save
          setIsPasswordModalOpen(true);
        }
      }
    };

    window.addEventListener('dragenter', handleWindowDragEnter);
    window.addEventListener('dragover', handleWindowDragOver);
    window.addEventListener('dragleave', handleWindowDragLeave);
    window.addEventListener('drop', handleWindowDrop);

    return () => {
      window.removeEventListener('dragenter', handleWindowDragEnter);
      window.removeEventListener('dragover', handleWindowDragOver);
      window.removeEventListener('dragleave', handleWindowDragLeave);
      window.removeEventListener('drop', handleWindowDrop);
    };
  }, [isAuthenticated, isGlobalDragging]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Handle Photo Card click on Public Homepage / Gallery
  const handlePhotoClick = (photo: MemoryPhoto) => {
    if (isAuthenticated) {
      // User is authenticated as family member -> open high-res lightbox
      setLightboxPhoto(photo);
    } else {
      // Global visitor clicked photo -> prompt requires password lock modal
      setTargetPhotoForPassword(photo);
      setIsPasswordModalOpen(true);
    }
  };

  // Password verification success
  const handlePasswordSuccess = () => {
    setPortalAuthenticated(true);
    setIsAuthenticated(true);
    setIsPasswordModalOpen(false);
    showToast("Access Granted! Welcome to Chinthala's Family Portal.");

    if (droppedFilesForModal && droppedFilesForModal.length > 0) {
      // If user had dropped files, open the add photo modal immediately
      setIsAddPhotoModalOpen(true);
      setActiveView('portal');
    } else if (targetPhotoForPassword) {
      setLightboxPhoto(targetPhotoForPassword);
      setTargetPhotoForPassword(null);
      setActiveView('portal');
    } else {
      setActiveView('portal');
    }
  };

  const handleLockPortal = () => {
    setPortalAuthenticated(false);
    setIsAuthenticated(false);
    setActiveView('gallery');
    setLightboxPhoto(null);
    setTargetPhotoForPassword(null);
    setDroppedFilesForModal(null);
    showToast('Family Portal locked. Returned to public view.');
  };

  // Add new photo: save permanently to Firebase Firestore
  const handleAddPhoto = async (newPhoto: MemoryPhoto) => {
    try {
      showToast(`Saving "${newPhoto.title}" permanently to Firebase Firestore...`);
      await saveMemoryToFirebase(newPhoto);
      setDroppedFilesForModal(null);
      showToast(`"${newPhoto.title}" saved permanently to Firebase! Visible to everyone worldwide.`);
    } catch (err) {
      console.error('Failed to save to Firebase:', err);
      showToast('Error saving to Firebase. Please try again.');
    }
  };

  // Batch save multiple photos: successfully committed in chunks of 100
  const handleAddPhotosBatch = async (newPhotos: MemoryPhoto[]) => {
    setDroppedFilesForModal(null);
    showToast(`All ${newPhotos.length} photos saved permanently to Firebase Database!`);
  };

  // Edit photo: update permanently in Firebase Firestore
  const handleSaveEditedPhoto = async (updatedPhoto: MemoryPhoto) => {
    try {
      await updateMemoryInFirebase(updatedPhoto);
      if (lightboxPhoto && lightboxPhoto.id === updatedPhoto.id) {
        setLightboxPhoto(updatedPhoto);
      }
      showToast(`Updated "${updatedPhoto.title}" permanently in Firebase.`);
    } catch (err) {
      console.error('Failed to update in Firebase:', err);
      showToast('Error updating in Firebase. Please try again.');
    }
  };

  // Delete single photo: remove permanently from Firebase Firestore
  const handleDeletePhoto = async (photoId: string) => {
    try {
      if (lightboxPhoto && lightboxPhoto.id === photoId) {
        setLightboxPhoto(null);
      }
      await deleteMemoryFromFirebase(photoId);
      showToast('Photo permanently deleted from Firebase.');
    } catch (err) {
      console.error('Failed to delete from Firebase:', err);
      showToast('Error deleting from Firebase. Please try again.');
    }
  };

  // Bulk delete photos: remove permanently from Firebase Firestore
  const handleBulkDeletePhotos = async (photoIds: string[]) => {
    try {
      const idSet = new Set(photoIds);
      if (lightboxPhoto && idSet.has(lightboxPhoto.id)) {
        setLightboxPhoto(null);
      }
      await bulkDeleteMemoriesFromFirebase(photoIds);
      showToast(`${photoIds.length} photos permanently deleted from Firebase.`);
    } catch (err) {
      console.error('Failed to bulk delete from Firebase:', err);
      showToast('Error deleting photos from Firebase.');
    }
  };

  // Unique album list from actual uploaded photos
  const existingAlbums = Array.from(new Set(memories.map((m) => m.album).filter(Boolean)));

  return (
    <div className="relative min-h-screen bg-[#0E0D0C]">
      {/* Royal Heirloom Keepsake Chest Overlay Screen */}
      {isEntranceOpen && (
        <LegacyEntranceOverlay onUnlockComplete={() => setIsEntranceOpen(false)} />
      )}

      {/* Main Site Content with Smooth Spring Fade-Up Reveal Animation */}
      <div
        className={`min-h-screen flex flex-col bg-[#FAF8F5] text-[#2B2620] relative transition-all duration-1000 ease-out transform ${
          isEntranceOpen
            ? 'opacity-0 translate-y-8 pointer-events-none scale-98'
            : 'opacity-100 translate-y-0 pointer-events-auto scale-100'
        }`}
      >
        {/* Global Drag & Drop Overlay (Visible whenever user drags an image anywhere into the browser window) */}
        {isGlobalDragging && (
          <div className="fixed inset-0 z-100 bg-[#2B2620]/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center pointer-events-none animate-in fade-in duration-150">
            <div className="w-24 h-24 rounded-3xl bg-[#D4A373] text-[#0E0D0C] flex items-center justify-center mb-6 shadow-2xl scale-110 animate-bounce">
              <UploadCloud className="w-12 h-12" />
            </div>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-semibold mb-2">
              Drop Photograph Here
            </h2>
            <p className="text-sm sm:text-base text-neutral-300 max-w-md">
              Release to add this photo directly into Chinthala's Family Archive and save it permanently to Firebase Firestore.
            </p>
            <div className="mt-4 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-mono text-[#E5B581]">
              Permanent Firebase Cloud Storage Active
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toastMessage && (
          <div
            role="status"
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-[#2B2620] text-white text-xs sm:text-sm font-medium rounded-xl shadow-xl border border-[#4A4237] animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <CheckCircle2 className="w-4 h-4 text-[#D1B898] shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Bar Header with Replay Entrance Action */}
        <Header
          isAuthenticated={isAuthenticated}
          activeView={activeView}
          onNavigate={(view) => setActiveView(view)}
          onOpenPasswordModal={() => {
            setTargetPhotoForPassword(null);
            setIsPasswordModalOpen(true);
          }}
          onOpenAddPhotoModal={() => {
            setDroppedFilesForModal(null);
            setIsAddPhotoModalOpen(true);
          }}
          onLockPortal={handleLockPortal}
          onReplayEntrance={() => setIsEntranceOpen(true)}
        />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeView === 'portal' && isAuthenticated ? (
          <FamilyPortal
            memories={memories}
            onOpenAddPhotoModal={() => {
              setDroppedFilesForModal(null);
              setIsAddPhotoModalOpen(true);
            }}
            onLockPortal={handleLockPortal}
            onViewPublicGallery={() => setActiveView('gallery')}
            onSelectPhoto={(photo) => setLightboxPhoto(photo)}
            onEditPhoto={(photo) => setEditingPhoto(photo)}
            onDeletePhoto={handleDeletePhoto}
            onBulkDeletePhotos={handleBulkDeletePhotos}
          />
        ) : (
          <>
            {/* Hero Section */}
            <Hero
              photoCount={memories.length}
              albumCount={existingAlbums.length}
              isAuthenticated={isAuthenticated}
              onOpenPasswordModal={() => {
                setTargetPhotoForPassword(null);
                setIsPasswordModalOpen(true);
              }}
              onOpenAddPhotoModal={() => {
                setDroppedFilesForModal(null);
                setIsAddPhotoModalOpen(true);
              }}
              onSelectAlbum={(album) => setSelectedAlbum(album)}
              selectedAlbum={selectedAlbum}
              albums={existingAlbums}
            />

            {/* Public Photo Grid */}
            <PublicGallery
              memories={memories}
              isAuthenticated={isAuthenticated}
              selectedAlbum={selectedAlbum}
              onPhotoClick={handlePhotoClick}
              onSelectAlbum={(album) => setSelectedAlbum(album)}
              onOpenAddPhotoModal={() => {
                setDroppedFilesForModal(null);
                setIsAddPhotoModalOpen(true);
              }}
              onOpenPasswordModal={() => {
                setTargetPhotoForPassword(null);
                setIsPasswordModalOpen(true);
              }}
            />

            {/* Call to Action Banner */}
            <CallToActionBanner
              onOpenAddPhotoModal={() => {
                setDroppedFilesForModal(null);
                setIsAddPhotoModalOpen(true);
              }}
              onOpenPasswordModal={() => {
                setTargetPhotoForPassword(null);
                setIsPasswordModalOpen(true);
              }}
              isAuthenticated={isAuthenticated}
            />
          </>
        )}
      </main>

      {/* Password Verification Modal (SRBS check) */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setTargetPhotoForPassword(null);
          setDroppedFilesForModal(null);
        }}
        onSuccess={handlePasswordSuccess}
        targetPhotoTitle={targetPhotoForPassword?.title}
      />

      {/* Add Photo / Album Modal */}
      <AddPhotoModal
        isOpen={isAddPhotoModalOpen}
        onClose={() => {
          setIsAddPhotoModalOpen(false);
          setDroppedFilesForModal(null);
        }}
        onAddPhoto={handleAddPhoto}
        onAddPhotosBatch={handleAddPhotosBatch}
        existingAlbums={existingAlbums}
        initialFiles={droppedFilesForModal}
      />

      {/* Edit Photo Modal */}
      <EditPhotoModal
        isOpen={Boolean(editingPhoto)}
        onClose={() => setEditingPhoto(null)}
        photo={editingPhoto}
        onSave={handleSaveEditedPhoto}
        existingAlbums={existingAlbums}
      />

      {/* High-Resolution Photo Lightbox */}
      <PhotoLightbox
        photo={lightboxPhoto}
        photos={
          selectedAlbum === 'all'
            ? memories
            : memories.filter((m) => m.album === selectedAlbum)
        }
        isOpen={Boolean(lightboxPhoto)}
        onClose={() => setLightboxPhoto(null)}
        onSelectPhoto={(photo) => setLightboxPhoto(photo)}
        isAuthenticated={isAuthenticated}
        onEdit={(photo) => {
          setLightboxPhoto(null);
          setEditingPhoto(photo);
        }}
        onDelete={(photoId) => {
          handleDeletePhoto(photoId);
        }}
      />

      {/* Footer */}
      <Footer
        isAuthenticated={isAuthenticated}
        onOpenPasswordModal={() => {
          setTargetPhotoForPassword(null);
          setIsPasswordModalOpen(true);
        }}
        onLockPortal={handleLockPortal}
      />
      </div>
    </div>
  );
}
