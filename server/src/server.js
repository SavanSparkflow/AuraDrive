const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'AuraDrive Cloud Storage API',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/folders', require('./routes/folderRoutes'));
app.use('/api/files', require('./routes/fileRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// Background Auto-Empty Trash Policy (runs every 6 hours to purge > 30-day-old trash)
const File = require('./models/File');
const Folder = require('./models/Folder');
const User = require('./models/User');
const { cloudinary } = require('./config/cloudinary');

async function runAutoTrashPurge() {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const expiredFiles = await File.find({ isTrashed: true, trashedAt: { $lte: thirtyDaysAgo } });

    if (expiredFiles.length > 0) {
      console.log(`[Auto-Trash Worker] Found ${expiredFiles.length} files older than 30 days. Purging...`);
      for (const f of expiredFiles) {
        if (f.publicId) {
          try {
            await cloudinary.uploader.destroy(f.publicId, { resource_type: f.resourceType || 'auto' });
          } catch (_) {}
        }
        await User.findByIdAndUpdate(f.owner, { $inc: { storageUsed: -(f.size || 0) } });
        await File.findByIdAndDelete(f._id);
      }
    }

    await Folder.deleteMany({ isTrashed: true, trashedAt: { $lte: thirtyDaysAgo } });
  } catch (err) {
    console.warn('[Auto-Trash Worker] Notice:', err.message);
  }
}

// Run once 10 seconds after boot, then every 6 hours
setTimeout(runAutoTrashPurge, 10000);
setInterval(runAutoTrashPurge, 6 * 60 * 60 * 1000);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route '${req.originalUrl}' not found`
  });
});

// Global Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 AuraDrive Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
});

