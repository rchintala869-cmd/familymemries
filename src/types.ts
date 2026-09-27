export interface MemoryPhoto {
  id: string;
  title: string;
  caption: string;
  album: string;
  imageUrl: string;
  dateTaken: string;
  uploadedAt: string;
  location?: string;
  familyMembers?: string[];
  isOriginalDefault?: boolean;
}

export interface AlbumSummary {
  name: string;
  count: number;
  coverImage: string;
  description?: string;
}
