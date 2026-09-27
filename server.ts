import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Increase payload limits for photo uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Storage folders for persistent photos and database
const DATA_DIR = path.resolve(__dirname, 'data');
const UPLOADS_DIR = path.resolve(DATA_DIR, 'uploads');
const MEMORIES_FILE = path.resolve(DATA_DIR, 'memories.json');

// Ensure data and upload directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded user photos permanently
app.use('/uploads', express.static(UPLOADS_DIR));

// Helper: read memories
function readMemoriesFromDisk(): any[] {
  try {
    if (fs.existsSync(MEMORIES_FILE)) {
      const data = fs.readFileSync(MEMORIES_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading memories.json:', err);
  }
  return [];
}

// Helper: write memories
function writeMemoriesToDisk(memories: any[]): boolean {
  try {
    fs.writeFileSync(MEMORIES_FILE, JSON.stringify(memories, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing memories.json:', err);
    return false;
  }
}

// Helper: save base64 image data to file on disk so it is lightweight & permanently accessible
function persistImageFile(imageUrl: string, photoId: string): string {
  if (!imageUrl || !imageUrl.startsWith('data:image/')) {
    return imageUrl;
  }
  try {
    const matches = imageUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches || matches.length < 3) {
      return imageUrl;
    }
    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const base64Data = matches[2];
    const filename = `photo_${photoId.replace(/[^a-zA-Z0-9_-]/g, '')}_${Date.now()}.${ext}`;
    const filePath = path.resolve(UPLOADS_DIR, filename);

    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
    return `/uploads/${filename}`;
  } catch (err) {
    console.error('Error persisting image to disk:', err);
    return imageUrl;
  }
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// GET all memories
app.get('/api/memories', (req, res) => {
  const memories = readMemoriesFromDisk();
  res.json({ success: true, memories });
});

// POST new memory
app.post('/api/memories', (req, res) => {
  try {
    const memory = req.body;
    if (!memory || !memory.id || !memory.title) {
      return res.status(400).json({ success: false, error: 'Missing required memory fields' });
    }

    // Persist base64 image to disk if applicable
    memory.imageUrl = persistImageFile(memory.imageUrl, memory.id);

    const memories = readMemoriesFromDisk();
    // Prepend new memory
    const updatedMemories = [memory, ...memories.filter((m) => m.id !== memory.id)];
    writeMemoriesToDisk(updatedMemories);

    res.json({ success: true, memory });
  } catch (err) {
    console.error('Failed to save memory:', err);
    res.status(500).json({ success: false, error: 'Failed to save memory' });
  }
});

// PUT update memory
app.put('/api/memories/:id', (req, res) => {
  try {
    const { id } = req.params;
    const memoryUpdates = req.body;
    const memories = readMemoriesFromDisk();

    const existingIndex = memories.findIndex((m) => m.id === id);
    if (existingIndex === -1) {
      return res.status(404).json({ success: false, error: 'Memory not found' });
    }

    if (memoryUpdates.imageUrl && memoryUpdates.imageUrl.startsWith('data:image/')) {
      memoryUpdates.imageUrl = persistImageFile(memoryUpdates.imageUrl, id);
    }

    memories[existingIndex] = { ...memories[existingIndex], ...memoryUpdates };
    writeMemoriesToDisk(memories);

    res.json({ success: true, memory: memories[existingIndex] });
  } catch (err) {
    console.error('Failed to update memory:', err);
    res.status(500).json({ success: false, error: 'Failed to update memory' });
  }
});

// DELETE single memory
app.delete('/api/memories/:id', (req, res) => {
  try {
    const { id } = req.params;
    const memories = readMemoriesFromDisk();
    const photoToDelete = memories.find((m) => m.id === id);

    // If it has a local /uploads/ image file, clean it up
    if (photoToDelete?.imageUrl?.startsWith('/uploads/')) {
      const filename = path.basename(photoToDelete.imageUrl);
      const filePath = path.resolve(UPLOADS_DIR, filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.warn('Could not delete image file:', e);
        }
      }
    }

    const filtered = memories.filter((m) => m.id !== id);
    writeMemoriesToDisk(filtered);

    res.json({ success: true, deletedId: id });
  } catch (err) {
    console.error('Failed to delete memory:', err);
    res.status(500).json({ success: false, error: 'Failed to delete memory' });
  }
});

// POST bulk delete memories
app.post('/api/memories/bulk-delete', (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: 'No IDs provided' });
    }

    const memories = readMemoriesFromDisk();
    const idSet = new Set(ids);

    // Clean up local files
    memories.forEach((photo) => {
      if (idSet.has(photo.id) && photo.imageUrl?.startsWith('/uploads/')) {
        const filename = path.basename(photo.imageUrl);
        const filePath = path.resolve(UPLOADS_DIR, filename);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (e) {
            console.warn('Could not delete image file:', e);
          }
        }
      }
    });

    const filtered = memories.filter((m) => !idSet.has(m.id));
    writeMemoriesToDisk(filtered);

    res.json({ success: true, deletedCount: ids.length });
  } catch (err) {
    console.error('Failed to bulk delete memories:', err);
    res.status(500).json({ success: false, error: 'Failed to bulk delete memories' });
  }
});

// POST sync/initialize memories from client
app.post('/api/memories/sync', (req, res) => {
  try {
    const { memories } = req.body;
    if (Array.isArray(memories)) {
      const current = readMemoriesFromDisk();
      if (current.length === 0) {
        writeMemoriesToDisk(memories);
      }
      return res.json({ success: true, count: current.length || memories.length });
    }
    res.status(400).json({ success: false, error: 'Invalid memories payload' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to sync memories' });
  }
});

// Start dev or production server
async function start() {
  const isProd = process.env.NODE_ENV === 'production';
  const distDir = path.resolve(__dirname, 'dist');

  if (isProd && fs.existsSync(distDir)) {
    app.use(express.static(distDir));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  } else {
    // Development mode with Vite middlewares
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Chintala's Family Memories server running on http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
