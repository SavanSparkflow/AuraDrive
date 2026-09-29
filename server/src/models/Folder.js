const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Folder name is required'],
      trim: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    parentFolder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      default: null, // null means root directory
      index: true
    },
    path: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder' },
        name: { type: String }
      }
    ],
    color: {
      type: String,
      default: '#7C3AED' // Default Violet color
    },
    isStarred: {
      type: Boolean,
      default: false
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
    tags: [
      {
        name: { type: String, trim: true },
        color: { type: String, default: '#7C3AED' }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Compound index to search easily
folderSchema.index({ owner: 1, parentFolder: 1, isTrashed: 1 });

module.exports = mongoose.model('Folder', folderSchema);
