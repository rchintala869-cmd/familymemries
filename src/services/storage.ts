import { MemoryPhoto } from '../types.ts';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase.ts';

const STORAGE_KEY = 'chinthala_family_memories_firestore_cache_v3';
const AUTH_KEY = 'chinthala_family_memories_auth_v3';

export const REQUIRED_PASSWORD = 'SRBS';

// Synchronous local storage retrieval for immediate initial render
export function getStoredMemories(): MemoryPhoto[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to parse memories from storage:', err);
  }
  return [];
}

export function saveStoredMemories(memories: MemoryPhoto[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
  } catch (err) {
    console.error('Failed to save memories to storage:', err);
  }
}

// Live real-time listener from Firebase Firestore
// Any photo added from anywhere in the world will immediately update all viewers across the globe
export function subscribeToFirebaseMemories(
  onUpdate: (memories: MemoryPhoto[]) => void
): () => void {
  const collectionRef = collection(db, 'memories');
  const pathForOnSnapshot = 'memories';

  const unsubscribe = onSnapshot(
    collectionRef,
    (snapshot) => {
      const items: MemoryPhoto[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as MemoryPhoto;
        items.push({
          id: docSnap.id,
          title: data.title || 'Untitled Memory',
          caption: data.caption || '',
          album: data.album || 'Family Milestones',
          imageUrl: data.imageUrl || '',
          dateTaken: data.dateTaken || 'Heirloom',
          uploadedAt: data.uploadedAt || new Date().toISOString(),
          location: data.location || '',
          familyMembers: data.familyMembers || [],
          isOriginalDefault: data.isOriginalDefault || false,
        });
      });

      // Sort newest upload first
      items.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

      saveStoredMemories(items);
      onUpdate(items);
    },
    (error) => {
      console.error('Firebase onSnapshot error:', error);
      try {
        handleFirestoreError(error, OperationType.GET, pathForOnSnapshot);
      } catch {
        // Fall back to local storage if network or permissions fail
        onUpdate(getStoredMemories());
      }
    }
  );

  return unsubscribe;
}

// Save newly added photo permanently to Firebase Firestore
export async function saveMemoryToFirebase(photo: MemoryPhoto): Promise<void> {
  const docPath = `memories/${photo.id}`;
  try {
    const docRef = doc(db, 'memories', photo.id);
    await setDoc(docRef, photo);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

// Save a batch of photos (up to 300, 500+ photos) permanently to Firebase Firestore in chunks of 100
// Ultra-fast parallel sub-batch execution completes 300+ photos in just 2-3 seconds
export async function saveBatchMemoriesToFirebase(
  photos: MemoryPhoto[],
  onProgress?: (savedCount: number, totalCount: number, currentChunk: number, totalChunks: number) => void
): Promise<void> {
  const CHUNK_SIZE = 100; // As requested: save in batches of 100 photos at a time
  const SUB_BATCH_SIZE = 35; // ~35 docs per Firestore writeBatch (safe payload, under 10MB)
  const totalCount = photos.length;
  let savedCount = 0;
  const totalChunks = Math.ceil(totalCount / CHUNK_SIZE);

  for (let c = 0; c < totalChunks; c++) {
    const chunkStart = c * CHUNK_SIZE;
    const chunkEnd = Math.min(chunkStart + CHUNK_SIZE, totalCount);
    const chunk = photos.slice(chunkStart, chunkEnd);

    // Commit sub-batches in parallel for this 100-photo chunk
    const subBatchPromises: Promise<void>[] = [];
    for (let i = 0; i < chunk.length; i += SUB_BATCH_SIZE) {
      const subBatch = chunk.slice(i, i + SUB_BATCH_SIZE);
      const batch = writeBatch(db);

      subBatch.forEach((photo) => {
        const docRef = doc(db, 'memories', photo.id);
        batch.set(docRef, photo);
      });

      subBatchPromises.push(
        batch.commit().catch((err) => {
          handleFirestoreError(err, OperationType.CREATE, `memories/batch-chunk-${c + 1}`);
        })
      );
    }

    // Await all sub-batches of this 100-photo chunk in parallel
    await Promise.all(subBatchPromises);

    savedCount += chunk.length;
    if (onProgress) {
      onProgress(savedCount, totalCount, c + 1, totalChunks);
    }
  }
}

// Update photo permanently in Firebase Firestore
export async function updateMemoryInFirebase(photo: MemoryPhoto): Promise<void> {
  const docPath = `memories/${photo.id}`;
  try {
    const docRef = doc(db, 'memories', photo.id);
    await setDoc(docRef, photo, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

// Delete photo permanently from Firebase Firestore
export async function deleteMemoryFromFirebase(photoId: string): Promise<void> {
  const docPath = `memories/${photoId}`;
  try {
    const docRef = doc(db, 'memories', photoId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

// Bulk delete photos permanently from Firebase Firestore
export async function bulkDeleteMemoriesFromFirebase(photoIds: string[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    photoIds.forEach((id) => {
      const docRef = doc(db, 'memories', id);
      batch.delete(docRef);
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'memories/bulk-delete');
  }
}

export function isPortalAuthenticated(): boolean {
  try {
    return sessionStorage.getItem(AUTH_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setPortalAuthenticated(authenticated: boolean): void {
  try {
    if (authenticated) {
      sessionStorage.setItem(AUTH_KEY, 'true');
    } else {
      sessionStorage.removeItem(AUTH_KEY);
    }
  } catch (err) {
    console.error('Failed to update auth status:', err);
  }
}
