const multer = require('multer');
const path = require('path');
const cloudinary = require('../config/cloudinary');

// Use Memory Storage so we can inspect and stream to Cloudinary
const storage = multer.memoryStorage();

// Multer upload instance with 100MB limit per file
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100 MB max file size
  }
});

// Helper function to upload buffer to Cloudinary using upload_stream
const uploadToCloudinary = (fileBuffer, originalName, mimeType) => {
  return new Promise((resolve, reject) => {
    // Determine Cloudinary resource_type
    let resourceType = 'raw';
    if (mimeType.startsWith('image/')) {
      resourceType = 'image';
    } else if (mimeType.startsWith('video/') || mimeType.startsWith('audio/')) {
      resourceType = 'video';
    }

    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const publicId = `auradrive_${Date.now()}_${baseName}`;

    // Options for cloudinary upload
    const uploadOptions = {
      resource_type: resourceType,
      public_id: publicId,
      folder: 'auradrive_uploads',
      use_filename: true,
      unique_filename: true
    };

    // If Cloudinary credentials are mock/default or not configured, let's provide a helpful mock URL fallback
    if (
      !process.env.CLOUDINARY_API_KEY ||
      process.env.CLOUDINARY_API_KEY === '123456789012345' ||
      !process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUD_NAME === 'demo'
    ) {
      console.warn('⚠️ Cloudinary demo credentials detected. Using placeholder upload response.');
      const isImg = mimeType.startsWith('image/');
      const mockUrl = isImg 
        ? `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80`
        : `https://raw.githubusercontent.com/aura-drive/assets/main/${originalName}`;
      
      return resolve({
        secure_url: mockUrl,
        public_id: `auradrive_demo_${Date.now()}`,
        resource_type: resourceType,
        format: ext.replace('.', '') || 'bin',
        bytes: fileBuffer.length
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        console.error('Cloudinary stream upload error:', error);
        return reject(error);
      }
      resolve(result);
    });

    uploadStream.end(fileBuffer);
  });
};

module.exports = {
  upload,
  uploadToCloudinary
};
