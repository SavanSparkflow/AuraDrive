# 🌌 AuraDrive — Enterprise Cloud Storage & Drive Platform

> A sleek, high-performance cloud storage web application inspired by Google Drive with modern **Violet & Slate** SaaS aesthetics. Built on the MERN stack with Cloudinary CDN integration, AuraDrive features recursive directory trees, file versioning, drag-and-drop file organization, ZIP archiving, multi-select bulk operations, and color-coded tagging.

---

## ✨ Key Features & Capabilities

### 📁 Advanced File & Folder Management
- **Hierarchical Directory Tree:** Create unlimited nested subfolders with custom color themes and automatic path inheritance.
- **Drag & Drop Move (File & Folder Reorganization):**
  - Drag files or folders directly onto any folder card to move them.
  - Drag items onto parent breadcrumb links to move them up directory levels.
- **Interactive Move Modal with Expandable Tree:**
  - Full recursive folder tree browser with expand/collapse (`>`), instant search filter, and path destination preview.
  - Circular reference protection (prevents moving a folder into itself or its own subfolders).
- **Smart Collapsing Breadcrumbs:** Automatic ellipsis (`...`) dropdown menu for deep subfolder paths to keep navigation clean.

### 📦 Bulk Actions & ZIP Archives
- **Multi-Select Toolbar:** Select multiple files and folders with checkboxes or Ctrl/Cmd-click.
- **Folder ZIP Download:** 1-click download of entire folder hierarchies as `.zip` archives via streaming backend archiving.
- **Bulk Operations:** Multi-item ZIP download, bulk move, bulk tagging, bulk starring, bulk trash/restore, and bulk deletion.

### ⏳ File Version History & Recovery
- **Automatic File Versioning:** Uploading a file with an identical name saves previous iterations in version history.
- **Version Timeline & Restore:** Inspect previous file sizes and dates, download past versions, or restore any previous version to active.

### 🏷️ Color-Coded Tags & Labels
- **Custom Tagging:** Assign color-coded organizational tags (e.g., "Work", "Tax", "Urgent", "Personal", "Design") to files and folders.
- **Tag Filtering:** Filter drive view by custom tags for rapid asset retrieval.

### 🚀 Upload & Media Previewing
- **Drag & Drop Screen Upload:** Drop files anywhere on screen with animated dropzone overlays and live upload progress bars.
- **Chunked File Uploads:** Upload large files in pieces for network reliability.
- **Instant Media Preview:** In-app rich preview modal for photos, 4K videos, audio waveforms, PDFs, and code files.
- **Cloudinary CDN Acceleration:** Global CDN asset delivery with automatic optimization.

### 🔒 Sharing, Security & Trash
- **1-Click Public Link Sharing:** Generate unique share tokens with a dedicated public preview page.
- **Favorites & Starred:** Star important files and folders for instant access in the Starred tab.
- **Two-Stage Trash & Recovery:** Soft delete to trash with 1-click restore or permanent wipe.
- **Storage Analytics:** Live real-time visual breakdown of storage used across Images, Videos, Documents, and Audio.
- **1-Click Demo Login:** Quick test credentials button for immediate guest testing.

---

## 🛠 Tech Stack

### Frontend (`/client`)
- **React 18 & Vite:** Lightning-fast HMR and bundling.
- **Tailwind CSS:** Custom theme with modern SaaS palette (Primary `#7C3AED`, Slate `#0F172A`).
- **Zustand:** Centralized global reactive state management for Drive & Auth.
- **Lucide React:** Consistent modern iconography.
- **React Dropzone:** Smooth drag-and-drop file ingestion.
- **React Hot Toast:** Elegant toast notifications.
- **Axios:** HTTP client with automatic Bearer token interceptor and blob handling.
- **Date-fns:** Human-readable timestamps and relative dates.

### Backend (`/server`)
- **Node.js & Express:** Scalable RESTful API architecture.
- **MongoDB & Mongoose:** Hierarchical schemas with parent references and path indexing.
- **Cloudinary SDK & Multer:** High-speed streaming file buffer uploads.
- **Archiver & Axios:** Server-side streaming ZIP archive generator.
- **JWT & Bcrypt.js:** Secure token authentication and password hashing.
- **Zod:** Robust schema validation for user requests.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (Local instance on `mongodb://localhost:27017` or MongoDB Atlas URI)
- **Cloudinary Account** (Get free credentials from [cloudinary.com](https://cloudinary.com))

### 2. Environment Configuration
Create a `.env` file in the `server` directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/auradrive
JWT_SECRET=auradrive_super_secret_jwt_key_2026
CLIENT_URL=http://localhost:5173

# Cloudinary Credentials
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Installation & Running

#### Start Backend Server:
```bash
cd server
npm install
npm run dev
```
*Backend runs on `http://localhost:5000`*

#### Start Frontend Client:
```bash
cd client
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 📡 API Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login user & return JWT token |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |
| `PUT` | `/api/auth/profile` | Update profile details / avatar |

### 📁 Folders (`/api/folders`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/folders` | Create new folder `{ name, parentFolderId, color }` |
| `GET` | `/api/folders?parentId=...` | List folders in directory (or pass `all=true` for full tree) |
| `GET` | `/api/folders/:id` | Get folder details and breadcrumb trail |
| `GET` | `/api/folders/:id/download-zip` | Download entire folder as ZIP archive |
| `PUT` | `/api/folders/:id/move` | Move folder to a new destination folder |
| `PUT` | `/api/folders/:id/rename` | Rename folder |
| `PUT` | `/api/folders/:id/star` | Toggle star status |
| `PUT` | `/api/folders/:id/tags` | Update folder tags |
| `PUT` | `/api/folders/:id/trash` | Move folder to trash or restore |
| `DELETE` | `/api/folders/:id` | Permanently delete folder and all contents |

### 📄 Files (`/api/files`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/files/upload` | Upload file to Cloudinary |
| `POST` | `/api/files/chunk-upload` | Upload chunked file part |
| `POST` | `/api/files/download-zip` | Download multiple selected files as ZIP |
| `POST` | `/api/files/bulk-move` | Bulk move selected files & folders |
| `POST` | `/api/files/bulk-tag` | Bulk add/update tags |
| `POST` | `/api/files/bulk-star` | Bulk star/unstar items |
| `POST` | `/api/files/bulk-trash` | Bulk trash/restore items |
| `POST` | `/api/files/bulk-delete` | Bulk permanently delete items |
| `GET` | `/api/files?folderId=...&type=...` | Get files in folder with type filters |
| `GET` | `/api/files/starred` | Get all starred files & folders |
| `GET` | `/api/files/recent` | Get recently modified files |
| `GET` | `/api/files/trash` | Get trashed items |
| `GET` | `/api/files/search?q=...` | Global search across files and folders |
| `GET` | `/api/files/storage-stats` | Real-time storage usage breakdown |
| `GET` | `/api/files/public/:shareToken` | Public view of shared file |
| `GET` | `/api/files/:id/versions` | Get file version history list |
| `PUT` | `/api/files/:id/restore-version/:versionNumber` | Restore a previous file version |
| `DELETE` | `/api/files/:id/versions/:versionNumber` | Delete a specific past version |
| `PUT` | `/api/files/:id/move` | Move file to target folder |
| `PUT` | `/api/files/:id/rename` | Rename file |
| `PUT` | `/api/files/:id/star` | Toggle star status |
| `PUT` | `/api/files/:id/tags` | Update file tags |
| `PUT` | `/api/files/:id/trash` | Move file to trash or restore |
| `PUT` | `/api/files/:id/share` | Toggle public share link |
| `DELETE` | `/api/files/:id` | Permanently delete file |
| `DELETE` | `/api/files/trash/empty` | Empty entire trash |

---

## 📂 Project Structure

```
AuraDrive/
├── client/                     # Frontend (React 18 + Vite + Tailwind)
│   ├── src/
│   │   ├── api/                # Axios instance with interceptors
│   │   ├── components/
│   │   │   ├── common/         # Button, Input, Modal, Dropdown
│   │   │   ├── drive/          # FileCard, FolderCard, MoveModal, Breadcrumbs, BulkActionBar, TagModal, VersionHistoryModal
│   │   │   └── layout/         # Navbar, Sidebar, AppLayout, Footer
│   │   ├── pages/              # Dashboard, Starred, Trash, Shared, Settings, Static Pages
│   │   ├── store/              # Zustand Auth and Drive stores
│   │   └── utils/              # File helpers, byte formatting, date utilities
│   └── package.json
│
├── server/                     # Backend (Node.js + Express + MongoDB)
│   ├── src/
│   │   ├── config/             # Cloudinary & MongoDB connections
│   │   ├── controllers/        # Auth, File, and Folder controllers
│   │   ├── middlewares/        # JWT Auth, Multer, Error handlers
│   │   ├── models/             # User, File, and Folder Mongoose models
│   │   ├── routes/             # Auth, File, and Folder express routes
│   │   └── server.js           # Express app entrypoint
│   └── package.json
└── README.md
```

---

## 📄 License
This project is licensed under the MIT License.
