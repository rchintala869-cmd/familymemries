import { MemoryPhoto } from '../types.ts';

// Initial memories starts empty as requested - all real photos will be added by the user and saved permanently to Firebase Firestore
export const INITIAL_MEMORIES: MemoryPhoto[] = [];

export const PRESET_ALBUMS = [
  'Family Milestones',
  'Family Gatherings',
  'Portraits & Generations',
  'Vacations & Travels',
  'Holidays & Celebrations',
];
