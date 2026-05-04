const cloudinary = require('cloudinary').v2;

// Check for missing environment variables
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn('[Cloudinary] Warning: Cloudinary environment variables are missing!');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 120000, // 120 second timeout (up from default ~60s)
});

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
        console.error('[Cloudinary] Upload Stream Error:', err);
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
  return cloudinary.uploader.destroy(publicId).catch((err) =>
    console.warn('[Cloudinary] deleteImage failed:', err.message)
  );
};

module.exports = {
  cloudinary,
  uploadBuffer,
  deleteImage
};
