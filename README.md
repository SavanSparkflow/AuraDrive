# 🌌 AuraDrive — Google Drive Clone (MERN + Cloudinary)

AuraDrive is a modern, high-performance cloud storage web application designed with the **Violet & Slate** SaaS aesthetic. Built on the MERN stack with Cloudinary integration, AuraDrive delivers fast media streaming, recursive folder hierarchies, instant drag-and-drop uploads, and link sharing.

---

## ✨ Key Features

- **Hierarchical Directory Tree:** Create infinite nested folders with custom color tags and automatic breadcrumb path navigation.
- **Drag & Drop Uploads:** Drop files anywhere on screen with animated full-window drop overlays and progress bars.
- **Cloudinary Storage Engine:** Fast global CDN uploads with support for images, 4K videos, audio, PDFs, and code.
- **Instant Media Preview:** In-app rich preview modal for photos, video player, audio player, and document iframe viewer.
- **Global Search:** Instant autocomplete search across all nested files, folders, and MIME types.
- **Link Sharing:** 1-click public shareable links with clipboard copy and public document viewer.
- **Favorites & Starred:** Star important files and folders for quick access in the Starred tab.
- **Trash & Recovery:** Soft delete to trash with 1-click restore or empty trash capability.
- **Storage Analytics:** Live real-time breakdown of storage usage across images, videos, documents, and audio.
- **1-Click Demo Login:** Quick test drive button for instantaneous previewing.

---

## 🛠 Tech Stack

### Frontend (`/client`)
- **React 18 + Vite** (Fast compilation & HMR)
- **Tailwind CSS** (Custom Violet & Slate color system: Primary `#7C3AED`, Background `#F8FAFC`)
- **Zustand** (Global state management for Auth and Drive)
- **Lucide React** (Modern clean icons)
- **React Dropzone** (Drag & drop file upload)
- **React Hot Toast** (Toast alerts)
- **Date-fns** (Timestamps & relative date formatting)
- **Axios** (API requests with automatic Bearer token interceptor)

### Backend (`/server`)
- **Node.js & Express** (RESTful API)
- **MongoDB & Mongoose** (Hierarchical schemas with parent references)
- **Cloudinary SDK & Multer** (Streaming file buffer uploads)
- **JSON Web Tokens (JWT) & Bcrypt.js** (Secure authentication)
- **Zod** (Input validation)

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Running locally on `mongodb://localhost:27017` or MongoDB Atlas URI)
- Cloudinary Account (Optional: works with built-in mock fallback for development)

### 2. Configure Environment Variables
Inside `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/auradrive
JWT_SECRET=auradrive_super_secret_jwt_key_2026
CLIENT_URL=http://localhost:5173

# Cloudinary (Get from https://cloudinary.com/console)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Run the Backend & Frontend
Open two terminal windows:

**Terminal 1 (Backend Server):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
```

Visit **`http://localhost:5173`** in your browser!

---

## 📡 API Endpoint Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login user & return JWT |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |
| `PUT` | `/api/auth/profile` | Update user profile details |

### Folders (`/api/folders`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/folders` | Create folder `{ name, parentFolderId, color }` |
| `GET` | `/api/folders?parentId=...` | List folders in directory or root |
| `GET` | `/api/folders/:id` | Get folder details and breadcrumb trail |
| `PUT` | `/api/folders/:id/rename` | Rename folder |
| `PUT` | `/api/folders/:id/star` | Toggle star status |
| `PUT` | `/api/folders/:id/trash` | Move folder to trash or restore |
| `DELETE` | `/api/folders/:id` | Permanently delete folder and contents |

### Files (`/api/files`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/files/upload` | Upload file via Multer & Cloudinary |
| `GET` | `/api/files?folderId=...&type=...` | Get files in folder with type filters |
| `GET` | `/api/files/starred` | Get all starred files & folders |
| `GET` | `/api/files/recent` | Get recently modified files |
| `GET` | `/api/files/trash` | Get trashed files & folders |
| `GET` | `/api/files/search?q=...` | Global search files & folders |
| `GET` | `/api/files/storage-stats` | Storage usage analytics by category |
| `GET` | `/api/files/public/:shareToken` | Public access shared file endpoint |
| `PUT` | `/api/files/:id/star` | Toggle star on file |
| `PUT` | `/api/files/:id/rename` | Rename file |
| `PUT` | `/api/files/:id/trash` | Move file to trash or restore |
| `PUT` | `/api/files/:id/share` | Toggle public share link |
| `DELETE` | `/api/files/:id` | Permanently delete file |
| `DELETE` | `/api/files/trash/empty` | Empty entire trash |
