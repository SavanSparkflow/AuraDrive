# 🌌 AuraDrive — Next-Generation Cloud Storage & Productivity Suite

> A modern, enterprise-grade cloud storage and file management platform inspired by Google Drive with ultra-clean **Violet & Slate** SaaS aesthetics. Built on the MERN stack with Cloudinary CDN integration, AuraDrive pairs deep file organization (hierarchical trees, versioning, drag-and-drop, ZIP archiving) with standout interactive tools (In-app Code Editor, Photo Studio, PDF Annotator, Video/Audio Player, and Password-Protected Sharing).

---

## ✨ Key Features & Capabilities

### ⚡ 1. Power-User Productivity & Shortcuts
- **🖱️ Right-Click Context Menu:**
  - Context menu across Files, Folders, and empty Canvas space.
  - Quick access to Download, In-App Editors, Rename, Copy, Paste, Move, Tags, Version History, Share, Star, and Trash.
- **⌨️ Global Keyboard Shortcuts:**
  - `Ctrl + C` / `Ctrl + V`: Instant copy & paste for files and recursive folder trees.
  - `Delete`: Move selected items directly to Trash.
  - `F2`: Quick rename selected item.
  - `/`: Focus search bar immediately.
  - `Escape`: Close active modals, drawers, or context menus.
- **📌 Pinned & Quick Access Bar:**
  - Dedicated top bar on Drive home displaying pinned and frequently accessed items with 1-click direct launcher.

---

### 🛠️ 2. In-App Interactive Standout Tools (Zero Downloads Required)
- **📝 In-App Code, Markdown & Text Editor:**
  - Live in-browser editing for `.txt`, `.md`, `.js`, `.json`, `.css`, `.html`, `.ts`, and `.py`.
  - Split-screen live Markdown preview, line numbering, character/word counters, and dark theme.
  - 1-click cloud overwrite creating an automatic new file version.
- **🖼️ In-App Photo Studio & Cropper:**
  - Real-time HTML5 canvas photo editing.
  - **Transform:** 90° clockwise/counter-clockwise rotation, horizontal flip, and vertical flip.
  - **Adjustments:** Dynamic brightness, contrast, and saturation sliders (20% to 200%).
  - **Color Filters:** Instant presets (*Vibrant*, *B&W / Grayscale*, *Sepia*, *Vintage*, *Invert*).
  - 1-click cloud overwrite or direct local PNG download.
- **📄 PDF Viewer & Annotations Studio:**
  - Embedded Google Docs viewer engine preventing unwanted auto-downloads on raw PDF files.
  - Zoom in/out, 90° rotation, full-screen mode, and native browser printing.
  - Sidebar for page notes and persistent sticky annotations.
- **🎬 Cinema Video Streaming Player:**
  - High-performance streaming player with speed controls (0.5x – 2x), theater mode, picture-in-picture (PiP), and full keyboard navigation.
- **🎵 Persistent Floating Audio Player:**
  - Bottom-docked floating music/podcast player with timeline scrub, volume control, track switching, and continuous playback while browsing files.

---

### 🔍 3. Global Full-Text Search & Multi-Filter Studio
- **Deep Search:** Search items instantly by name or extension across the entire drive hierarchy.
- **Multi-Criteria Filter Modal:**
  - **File Category:** All, Images, Videos, Audio, Documents, PDFs, Code / Text.
  - **Date Modified:** Anytime, Today, Past 7 Days, Past 30 Days, Past Year.
  - **Size Limits:** Min and Max file size bounds (in MB).

---

### 📜 4. Activity Audit Logs & Storage Analytics
- **📜 Live Activity & Audit Log Drawer:**
  - Complete chronological timeline of every user event: Uploads, Renames, Moves, Copies, Stars, Shares, Tags, and Trash operations.
  - Auto-backfill engine ensures past files are automatically indexed.
- **📊 Storage Breakdown & Visualizer:**
  - Donut & segmented progress visualizer displaying storage usage categorized across Images, Videos, Documents, Audio, and Archives.

---

### 🔒 5. Advanced Share Security & Access Control
- **🔑 Password-Protected Public Links:**
  - Secure shared files with bcrypt-hashed passwords.
  - Public recipients are prompted with a sleek password verification unlock modal.
- **⏱️ Expiring Share Links:**
  - Set expiration timers (1 Hour, 24 Hours, 7 Days, 30 Days, or Never).
  - Expired links automatically revoke access with a clean status screen.

---

### 📁 6. Hierarchical Directory & Organization
- **Hierarchical Directory Tree:** Create unlimited nested subfolders with custom color themes and automatic path inheritance.
- **Drag & Drop Move:** Drag files or folders directly onto folder cards or breadcrumb paths.
- **Smart Collapsing Breadcrumbs:** Automatic ellipsis (`...`) dropdown menu for deep subfolder structures.
- **Interactive Folder Tree Browser:** Expand/collapse (`>`) tree with search filter and circular-reference protection.
- **Folder & Multi-Item ZIP Download:** 1-click streaming ZIP packaging of entire folder trees.
- **Color-Coded Tags & Labels:** Tag items with custom colors (*Work, Urgent, Personal, Finance, Design*) and filter views.
- **File Version History:** Inspect previous file revisions, download snapshots, or restore previous versions to active.
- **Two-Stage Trash:** Soft delete with 1-click restore or permanent shredding.

---

## 🛠 Tech Stack

### Frontend (`/client`)
- **Framework:** React 18 & Vite
- **Styling:** Tailwind CSS (Custom Dark / Slate & Violet SaaS palette)
- **State Management:** Zustand (Auth Store & Drive Store)
- **Icons & UI:** Lucide React, React Hot Toast
- **File Ingestion:** React Dropzone, HTML5 Canvas API
- **Networking:** Axios with automatic JWT Bearer token interceptor
- **Date Formatting:** Date-fns

### Backend (`/server`)
- **Runtime:** Node.js & Express
- **Database:** MongoDB & Mongoose
- **Cloud Storage:** Cloudinary SDK & Multer (Streaming upload buffer)
- **Archive Generator:** Archiver (Streaming server-side ZIP creation)
- **Security:** JSON Web Tokens (JWT), Bcrypt.js, Helmet, CORS
- **Validation:** Zod Schema Validation

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (Local instance on `mongodb://localhost:27017` or MongoDB Atlas URI)
- **Cloudinary Account** (Credentials from [cloudinary.com](https://cloudinary.com))

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
| `POST` | `/api/folders/:id/copy` | Clone / duplicate folder hierarchy recursively |
| `GET` | `/api/folders?parentId=...` | List folders in directory (or `all=true` for full tree) |
| `GET` | `/api/folders/:id` | Get folder details and breadcrumb trail |
| `GET` | `/api/folders/:id/download-zip` | Download folder tree as ZIP archive |
| `PUT` | `/api/folders/:id/move` | Move folder to target destination folder |
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
| `POST` | `/api/files/:id/copy` | Clone / duplicate a single file |
| `POST` | `/api/files/public/:shareToken/verify-password` | Verify password on protected shared link |
| `GET` | `/api/files?folderId=...&type=...` | Get files with type filtering |
| `GET` | `/api/files/search` | Full-text search with type, date, and size filters |
| `GET` | `/api/files/starred` | Get starred items |
| `GET` | `/api/files/recent` | Get recently active items |
| `GET` | `/api/files/trash` | Get trashed items |
| `GET` | `/api/files/storage-stats` | Real-time storage usage breakdown |
| `GET` | `/api/files/public/:shareToken` | Public preview of shared file |
| `GET` | `/api/files/:id/versions` | Get file version history |
| `PUT` | `/api/files/:id/content` | Save edited text/code or canvas blob as new version |
| `PUT` | `/api/files/:id/restore-version/:versionNumber` | Restore previous file version |
| `PUT` | `/api/files/:id/move` | Move file |
| `PUT` | `/api/files/:id/rename` | Rename file |
| `PUT` | `/api/files/:id/star` | Toggle star |
| `PUT` | `/api/files/:id/tags` | Update tags |
| `PUT` | `/api/files/:id/trash` | Move to trash or restore |
| `PUT` | `/api/files/:id/share` | Configure public share link (with password & expiry) |
| `DELETE` | `/api/files/:id` | Permanently delete file |
| `DELETE` | `/api/files/trash/empty` | Empty entire trash |

### 📜 Activity Logs (`/api/activities`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/activities?page=1&limit=30` | Get paginated timeline audit logs |
| `DELETE` | `/api/activities` | Clear activity history |

---

## 📂 Project Structure

```
AuraDrive/
├── client/                     # Frontend (React 18 + Vite + Tailwind)
│   ├── src/
│   │   ├── api/                # Axios instance with interceptors
│   │   ├── components/
│   │   │   ├── common/         # Button, Input, Modal, Dropdown
│   │   │   ├── drive/          # FileCard, FolderCard, ContextMenu, QuickAccessBar, 
│   │   │   │                   # TextEditorModal, ImageEditorModal, PdfViewerModal, 
│   │   │   │                   # MediaPlayerModal, FloatingAudioPlayer, ActivityDrawer,
│   │   │   │                   # StorageAnalyticsModal, MoveModal, TagModal, VersionHistoryModal
│   │   │   └── layout/         # Navbar, Sidebar, AppLayout, Footer
│   │   ├── pages/              # Dashboard, Starred, Trash, Shared, SharedView, Settings, Static Pages
│   │   ├── store/              # Zustand Auth and Drive stores
│   │   └── utils/              # File helpers, byte formatting, date utilities
│   └── package.json
│
├── server/                     # Backend (Node.js + Express + MongoDB)
│   ├── src/
│   │   ├── config/             # Cloudinary & MongoDB connections
│   │   ├── controllers/        # Auth, File, Folder, and Activity controllers
│   │   ├── middlewares/        # JWT Auth, Multer, Error handlers
│   │   ├── models/             # User, File, Folder, and Activity Mongoose models
│   │   ├── routes/             # Auth, File, Folder, and Activity express routes
│   │   ├── utils/              # Activity logger, async handlers
│   │   └── server.js           # Express app entrypoint
│   └── package.json
└── README.md
```

---

## 📄 License
This project is licensed under the MIT License.
