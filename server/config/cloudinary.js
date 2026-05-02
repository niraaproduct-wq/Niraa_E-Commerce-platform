const cloudinary = require('cloudinary').v2;

// Check for missing environment variables
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn('[Cloudinary] Warning: Cloudinary environment variables are missing!');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a Buffer (from multer memoryStorage) to Cloudinary.
 * @param {Buffer} buffer
 * @param {object} options  e.g. { folder: 'niraa/banners' }
 * @returns {Promise<object>} Cloudinary upload result
 */
const uploadBuffer = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    if (!buffer) return reject(new Error('No buffer provided to uploadBuffer'));
    
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
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
