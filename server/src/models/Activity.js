const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    action: {
      type: String,
      enum: [
        'upload',
        'rename',
        'move',
        'trash',
        'restore',
        'delete',
        'star',
        'unstar',
        'share',
        'unshare',
        'copy',
        'tag_update',
        'create_folder'
      ],
      required: true
    },
    itemType: {
      type: String,
      enum: ['file', 'folder'],
      required: true
    },
    itemName: {
      type: String,
      required: true
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

activitySchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
