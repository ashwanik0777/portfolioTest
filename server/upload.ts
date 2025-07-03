import express, { Express, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";

// Ensure upload directories exist
const createUploadDirectories = () => {
  const directories = [
    path.join(process.cwd(), "uploads"),
    path.join(process.cwd(), "uploads", "profile"),
    path.join(process.cwd(), "uploads", "projects"),
    path.join(process.cwd(), "uploads", "resume")
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

export function setupUpload(app: Express) {
  // Create directories
  createUploadDirectories();

  // Configure storage for multer
  const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      const path = req.body.path || "uploads";
      cb(null, `uploads/${path}`);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  });

  // Create upload middleware
  const upload = multer({
    storage: diskStorage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/svg+xml',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only images, PDFs, and Word documents are allowed.'));
      }
    }
  });

  // Serve static uploads
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // File upload endpoint
  app.post('/api/upload', upload.single('file'), async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
      const filePath = req.file.path;
      const baseUrl = process.env.BASE_URL || `http://localhost:5000`;
      const fileUrl = `${baseUrl}/${filePath.replace(/\\/g, '/')}`;

      // If this is a resume upload, update the resume record
      if (req.body.path === 'resume') {
        await storage.createResume({
          filename: req.file.originalname,
          url: fileUrl,
          uploadedAt: new Date()
        });
      }

      res.status(200).json({
        message: 'File uploaded successfully',
        filename: req.file.originalname,
        url: fileUrl
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'Failed to process uploaded file' });
    }
  });
}
