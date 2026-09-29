const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'File name is required'],
      trim: true
    },
    url: {
      type: String,
      required: [true, 'File URL is required']
    },
    publicId: {
      type: String,
      required: [true, 'Cloudinary public_id is required']
    },
    resourceType: {
      type: String,
      enum: ['image', 'video', 'raw', 'auto'],
      default: 'auto'
    },
    format: {
      type: String,
      default: ''
    },
    size: {
      type: Number,
      required: [true, 'File size is required'] // In bytes
    },
    mimetype: {
      type: String,
      required: [true, 'File mime type is required']
    },
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      default: null, // null means root directory
      index: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    isStarred: {
      type: Boolean,
      default: false,
      index: true
    },
    isTrashed: {
      type: Boolean,
      default: false,
      index: true
    },
    trashedAt: {
      type: Date,
      default: null
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    shareLink: {
      type: String,
      default: null
    },
    shareToken: {
      type: String,
      default: null,
      index: true
    },
    tags: [
      {
        name: { type: String, trim: true },
        color: { type: String, default: '#7C3AED' }
      }
    ],
    currentVersion: {
      type: Number,
      default: 1
    },
    versions: [
      {
        versionNumber: { type: Number, required: true },
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        resourceType: { type: String, default: 'auto' },
        format: { type: String, default: '' },
        size: { type: Number, required: true },
        mimetype: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Compound index for queries
fileSchema.index({ owner: 1, folderId: 1, isTrashed: 1 });
fileSchema.index({ name: 'text' });

module.exports = mongoose.model('File', fileSchema);
