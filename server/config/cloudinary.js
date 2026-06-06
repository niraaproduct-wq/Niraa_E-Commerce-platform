const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');

let isConfigured = false;
let hasWarned = false;

const configureCloudinary = () => {
  if (isConfigured) return true;

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    if (!hasWarned) {
      logger.info('[Cloudinary] Cloudinary credentials not configured. File uploads will be disabled.');
      hasWarned = true;
    }
    return false;
  }

  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      timeout: 120000, // 120 second timeout (up from default ~60s)
    });
    isConfigured = true;
    logger.info('[Cloudinary] Successfully configured');
    return true;
  } catch (error) {
    logger.warn(`[Cloudinary] Configuration failed: ${error.message}`);
    return false;
  }
};

/**
 * Upload a Buffer (from multer memoryStorage) to Cloudinary.
 * Auto-compresses to WebP at quality 80, max 1200px width.
 * @param {Buffer} buffer
 * @param {object} options  e.g. { folder: 'niraa/banners' }
 * @returns {Promise<object>} Cloudinary upload result
 */
const uploadBuffer = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    if (!buffer) return reject(new Error('No buffer provided to uploadBuffer'));
    
    if (!configureCloudinary()) {
      return reject(new Error('Cloudinary is not configured. Cannot upload file.'));
    }

    // Merge in auto-compress transformation so large images are
    // shrunk on Cloudinary's side before the URL is returned
    const uploadOptions = {
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' }, // never exceed 1200×1200
        { quality: 'auto:good', fetch_format: 'auto' } // pick best format (WebP/AVIF)
      ],
      ...options, // caller can still override
    };

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (err, result) => {
      if (err) {
        logger.error('[Cloudinary] Upload Stream Error:', { error: err.message });
        return reject(err);
      }
      resolve(result);
    });

    stream.end(buffer);
  });

/**
 * Delete an image from Cloudinary by its public_id.
 * Silently ignores missing/null IDs.
 * @param {string|null} publicId
 */
const deleteImage = (publicId) => {
  if (!publicId) return Promise.resolve();
  
  if (!configureCloudinary()) {
    logger.debug('[Cloudinary] Skipping delete, not configured');
    return Promise.resolve();
  }

  return cloudinary.uploader.destroy(publicId).catch((err) =>
    logger.warn('[Cloudinary] deleteImage failed: ' + err.message)
  );
};

module.exports = {
  cloudinary,
  uploadBuffer,
  deleteImage
};
