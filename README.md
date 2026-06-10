# ⚡ Event Media Platform

An advanced, high-fidelity web platform for hosting, searching, and managing event media albums. Powered by deep-learning AI facial recognition, automated image tagging, and real-time interaction metrics.

---

## 🚀 Key Features

* **🤳 AI Facial Recognition**: Upload a reference selfie to instantly match and retrieve all photos of you across all public and private event galleries.
* **🏷️ Smart AI Image Tagging**: Every uploaded photo is automatically classified using a pre-trained **MobileNetV2** model to generate rich, contextual hashtag pills (e.g. `#nature`, `#sports`, `#dining`).
* **🔗 Advanced Social Sharing**: Share photos and videos via direct links, WhatsApp, X (Twitter), or Facebook. Nearby friends can scan a dynamically generated **QR Code** directly from your screen.
* **📊 Analytical Dashboard**: Gain insights into platform activity with real-time statistics displaying total events, media counts, top photographers, and the most liked image.
* **⭐ Interactive Features**: Support for hollow/solid star favorites, media likes, notifications inbox, and a dedicated floating comments thread modal.
* **🌓 Light & Dark Theme switchers**: A theme toggler supporting cohesive styling across slate panels and glassmorphism elements.
* **🎬 HTML5 Video Support**: Automatic format detection and responsive playback of video files in grids and lightbox views.
* **☁️ Cloudinary Storage Integration**: Automated fallback to local disk storage if cloud configurations are omitted.

---

## 🛠️ Technology Stack

* **Frontend**: Next.js 16 (App Router), React 19, Lucide icons, Sonner toasts, and TailwindCSS.
* **Backend**: Node.js, Express, TypeScript, Prisma (PostgreSQL), and Multer.
* **AI Engine**: Python 3, TensorFlow (Keras), DeepFace, and NumPy.
* **Cloud Storage**: Cloudinary integration.

---

## 📂 Project Structure

```
event-media-platform/
├── backend/                  # Express Node.js & Prisma Server
│   ├── prisma/               # Database Schema and Migrations
│   ├── python/               # DeepFace & MobileNetV2 Tagging Scripts
│   ├── src/                  # TypeScript Controllers and Routes
│   └── uploads/              # Local Media Storage Backup folder
├── docs/                     # Production Deployment Guides
└── frontend/                 # Next.js Web Client Application
```

---

## 💻 Local Setup & Execution

### Prerequisites
- Node.js (v18+)
- PostgreSQL server active
- Python (v3.10+) with `pip install deepface tf-keras`

### 1. Database Configuration
1. Start your local PostgreSQL server and create a database named `event_media_db`.
2. Configure your connection parameters inside `backend/.env`:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/event_media_db"
   JWT_SECRET="supersecretkey"
   ```

### 2. Run Backend Dev Server
```bash
cd backend
npm install
npx prisma db push        # Push schemas to PostgreSQL
npm run dev               # Start server on http://localhost:5000
```

### 3. Run Frontend Dev Server
```bash
cd frontend
npm install
npm run dev               # Start client on http://localhost:3000
```

---

## ☁️ Cloud deployment

