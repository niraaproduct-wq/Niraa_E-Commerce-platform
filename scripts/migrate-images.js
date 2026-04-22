require('dotenv').config();
const { getFirebase } = require('../server/config/firebase');
const cloudinary = require('../server/config/cloudinary');
const path = require('path');
const fs = require('fs');

const migrateImages = async () => {
  try {
    const { db } = getFirebase();
    const snapshot = await db.collection('products').get();
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const images = data.images || (data.image ? [data.image] : []);
      
      let updated = false;
      const newImages = [];
      
      for (const imgUrl of images) {
        if (imgUrl.startsWith('/assets/images/products/')) {
          console.log(`Migrating ${imgUrl} for product ${data.name}...`);
          
          const filename = path.basename(imgUrl);
          const localPath = path.join(__dirname, '../client/src/assets/images/products', filename);
          
          if (!fs.existsSync(localPath)) {
            console.error(`Local file not found: ${localPath}`);
            newImages.push(imgUrl);
            continue;
          }

          try {
            const result = await cloudinary.uploader.upload(localPath, { folder: 'products' });
            console.log(`Success: ${result.secure_url}`);
            newImages.push(result.secure_url);
            updated = true;
          } catch (err) {
            console.error(`Failed to upload ${imgUrl}:`, err.message);
            newImages.push(imgUrl);
          }
        } else {
          newImages.push(imgUrl);
        }
      }
      
      if (updated) {
        await doc.ref.update({
          images: newImages,
          image: newImages[0],
          updatedAt: new Date().toISOString()
        });
        console.log(`Updated product ${data.name} in Firestore`);
      }
    }
    
    console.log('Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateImages();
