import { Express, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { existsSync, createReadStream } from 'fs';
import { nanoid } from 'nanoid';

// File storage configuration
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = req.body.path || '/';
    const fullPath = path.join('./uploads', uploadPath);
    
    try {
      await fs.mkdir(fullPath, { recursive: true });
      cb(null, fullPath);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: (req, file, cb) => {
    // Keep original filename for better organization
    cb(null, file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types but track APK files
    cb(null, true);
  }
});

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  path: string;
  createdAt: string;
  mimeType?: string;
  isApk?: boolean;
}

export function registerFileRoutes(app: Express) {
  // Create APK storage directory
  const apkDir = path.join('./uploads', 'apk-builds');
  fs.mkdir(apkDir, { recursive: true }).catch(console.error);

  // List files and folders
  app.get('/api/files', async (req: Request, res: Response) => {
    try {
      const requestedPath = (req.query.path as string) || '/';
      const fullPath = path.join('./uploads', requestedPath);
      
      if (!existsSync(fullPath)) {
        await fs.mkdir(fullPath, { recursive: true });
      }

      const items = await fs.readdir(fullPath, { withFileTypes: true });
      const files: FileItem[] = [];

      for (const item of items) {
        const itemPath = path.join(fullPath, item.name);
        const relativePath = path.join(requestedPath, item.name).replace(/\\/g, '/');
        const stats = await fs.stat(itemPath);
        
        const fileItem: FileItem = {
          id: nanoid(),
          name: item.name,
          type: item.isDirectory() ? 'folder' : 'file',
          path: relativePath,
          createdAt: stats.ctime.toISOString(),
        };

        if (item.isFile()) {
          fileItem.size = stats.size;
          fileItem.mimeType = getMimeType(item.name);
          fileItem.isApk = item.name.endsWith('.apk');
        }

        files.push(fileItem);
      }

      // Sort: folders first, then files, alphabetically
      files.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'folder' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });

      res.json(files);
    } catch (error) {
      console.error('Error listing files:', error);
      res.status(500).json({ error: 'Failed to list files' });
    }
  });

  // Upload file
  app.post('/api/files/upload', upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const fileInfo: FileItem = {
        id: nanoid(),
        name: req.file.filename,
        type: 'file',
        size: req.file.size,
        path: path.join(req.body.path || '/', req.file.filename).replace(/\\/g, '/'),
        createdAt: new Date().toISOString(),
        mimeType: req.file.mimetype,
        isApk: req.file.filename.endsWith('.apk')
      };

      res.json({ message: 'File uploaded successfully', file: fileInfo });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  });

  // Create folder
  app.post('/api/files/folder', async (req: Request, res: Response) => {
    try {
      const { name, path: parentPath } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Folder name is required' });
      }

      const fullPath = path.join('./uploads', parentPath || '/', name);
      await fs.mkdir(fullPath, { recursive: true });

      res.json({ message: 'Folder created successfully' });
    } catch (error) {
      console.error('Error creating folder:', error);
      res.status(500).json({ error: 'Failed to create folder' });
    }
  });

  // Download file
  app.get('/api/files/download', async (req: Request, res: Response) => {
    try {
      const filePath = req.query.path as string;
      
      if (!filePath) {
        return res.status(400).json({ error: 'File path is required' });
      }

      const fullPath = path.join('./uploads', filePath);
      
      if (!existsSync(fullPath)) {
        return res.status(404).json({ error: 'File not found' });
      }

      const stats = await fs.stat(fullPath);
      if (stats.isDirectory()) {
        return res.status(400).json({ error: 'Cannot download a directory' });
      }

      const fileName = path.basename(fullPath);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', getMimeType(fileName) || 'application/octet-stream');
      
      const fileStream = createReadStream(fullPath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('Error downloading file:', error);
      res.status(500).json({ error: 'Failed to download file' });
    }
  });

  // Delete file or folder
  app.delete('/api/files', async (req: Request, res: Response) => {
    try {
      const { path: filePath } = req.body;
      
      if (!filePath) {
        return res.status(400).json({ error: 'File path is required' });
      }

      const fullPath = path.join('./uploads', filePath);
      
      if (!existsSync(fullPath)) {
        return res.status(404).json({ error: 'File or folder not found' });
      }

      const stats = await fs.stat(fullPath);
      
      if (stats.isDirectory()) {
        await fs.rmdir(fullPath, { recursive: true });
      } else {
        await fs.unlink(fullPath);
      }

      res.json({ message: 'File or folder deleted successfully' });
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({ error: 'Failed to delete file or folder' });
    }
  });

  // Special endpoint to save APK builds
  app.post('/api/files/save-apk', upload.single('apk'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No APK file provided' });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const apkName = `construction-manager-${timestamp}.apk`;
      const apkPath = path.join('./uploads/apk-builds', apkName);

      // Move the uploaded file to APK directory
      await fs.rename(req.file.path, apkPath);

      const fileInfo: FileItem = {
        id: nanoid(),
        name: apkName,
        type: 'file',
        size: req.file.size,
        path: `/apk-builds/${apkName}`,
        createdAt: new Date().toISOString(),
        mimeType: 'application/vnd.android.package-archive',
        isApk: true
      };

      res.json({ 
        message: 'APK saved successfully', 
        file: fileInfo,
        downloadUrl: `/api/files/download?path=${encodeURIComponent(fileInfo.path)}`
      });
    } catch (error) {
      console.error('Error saving APK:', error);
      res.status(500).json({ error: 'Failed to save APK file' });
    }
  });
}

// Helper function to determine MIME type
function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.apk': 'application/vnd.android.package-archive',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.zip': 'application/zip',
    '.tar.gz': 'application/gzip',
    '.txt': 'text/plain',
    '.json': 'application/json',
    '.xml': 'application/xml',
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}