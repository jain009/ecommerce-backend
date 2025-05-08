import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // File types to allow
  const filetypes = /jpeg|jpg|png|webp/; // Allow jpeg, jpg, png, webp
  const mimetype = filetypes.test(file.mimetype); // Validate mimetype (e.g., image/jpeg)
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase()); // Validate file extension (e.g., .jpg)

  if (mimetype && extname) {
    return cb(null, true); // File is valid
  }

  const error = new Error(`Unsupported file type: ${file.originalname}`);
  error.status = 415; // Unsupported Media Type error
  cb(error); // Reject the file
};

// Initialize multer with configuration
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

// Upload route
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  
  return res.status(201).json({
    message: 'Upload successful',
    imageUrl: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`,
  });
});

export default router;
