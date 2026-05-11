const multer = require('multer');
const path = require('path');
const logger = require('../utils/logger');

// Allowed MIME types for image uploads
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
];

// Allowed extensions
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype) || !ALLOWED_EXTENSIONS.includes(ext)) {
    logger.warn(`[Upload] Rejected file: ${file.originalname} (type: ${file.mimetype}, ext: ${ext})`);
    return cb(new Error(`Invalid file type. Only images are allowed (jpeg, png, webp, gif, avif).`), false);
  }
  cb(null, true);
};

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1, // Only one file per request
  },
  fileFilter,
});

module.exports = upload;
