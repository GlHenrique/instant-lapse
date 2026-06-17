<div align="center">

<img src="client/public/favicon.svg" alt="Instant Lapse logo" width="96" height="96" />

# Instant Lapse

### Turn a sequence of images into a timelapse video — right in your browser.

Upload your photos, set how long each frame stays on screen, reorder them by drag-and-drop, watch a live preview, and export a ready-to-share MP4.
Everything runs on your own machine — **your images never leave your computer.**

<br />

[![Live demo](https://img.shields.io/badge/Live_demo-instant--lapse.vercel.app-000000?logo=vercel&logoColor=white)](https://instant-lapse.vercel.app/)

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![FFmpeg](https://img.shields.io/badge/FFmpeg-bundled-007808?logo=ffmpeg&logoColor=white)](https://ffmpeg.org)

**🔗 Live demo: [instant-lapse.vercel.app](https://instant-lapse.vercel.app/)**

<sub>The hosted demo runs the editor, live preview and HEIC conversion fully in the browser. Final MP4 export requires the backend to be running.</sub>

[Features](#-features) · [Quick start](#-quick-start) · [How it works](#-how-it-works) · [Configuration](#-configuration) · [Production build](#-production-build)

</div>

---

## ✨ Features

- 🖼️ **Drag-and-drop upload** — add as many images as you like, including HEIC (auto-converted in the browser).
- 🔀 **Reorder visually** — rearrange frames directly on the filmstrip.
- ⏲️ **Per-frame timing** — set the duration of each image individually, or apply one duration to all at once.
- 👀 **Live canvas preview** — see your timelapse play in real time as you edit, with nothing to render first.
- 🎞️ **Flexible export** — choose resolution (720p, 1080p, square, or vertical) and FPS, then export an MP4.
- 🔒 **Fully local** — images are processed on your own machine and removed right after rendering.

## 🧱 Tech stack

| Layer  | Technology |
| ------ | ---------- |
| **Frontend** | React · Vite · TypeScript · TailwindCSS (shadcn-style components) |
| **Backend**  | Node · Express · TypeScript |
| **Video**    | FFmpeg — bundled via [`ffmpeg-static`](https://www.npmjs.com/package/ffmpeg-static), no manual install required |

## 📦 Project structure

```
timelapse-app/
├── client/   # frontend (Vite + React)
└── server/   # backend (Express)
```

## 🚀 Quick start

> **Requirements:** [Node.js 18+](https://nodejs.org). Open two terminals — one for the backend, one for the frontend.

**1. Backend**

```bash
cd server
npm install
npm run dev          # runs on http://localhost:3001
```

**2. Frontend**

```bash
cd client
npm install
npm run dev          # opens on http://localhost:5173
```

Vite proxies `/api` to the backend automatically — just open **http://localhost:5173** and start creating.

## 🎬 How it works

1. **Upload** — drag in or select multiple images.
2. **Reorder** — drag each frame by its handle on the filmstrip.
3. **Duration** — tune the time for each image individually, or apply one duration to all of them from the side panel.
4. **Preview** — the canvas player simulates the timelapse in real time as you edit, with nothing to generate.
5. **Generate** — pick a resolution (720p, 1080p, square, or vertical) and FPS, then click **Generate MP4**. The server assembles the video with FFmpeg.
6. **Download** — watch the result in the player and download the `.mp4`.

## ⚙️ Configuration

### Frontend (`client`)

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_API_URL` | `""` (same origin) | Backend address baked in at build time. |

### Backend (`server`)

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `3001` | Server port. |
| `MAX_FILE_SIZE_MB` | `30` | Maximum size of each uploaded image (MB). |
| `MAX_FILES` | `1000` | Maximum number of images per render. |
| `FFMPEG_CRF` | `20` | Video quality (0 = lossless; ~18–28 is the useful range; higher = smaller file, lower quality). |
| `FFMPEG_PRESET` | `veryfast` | x264 preset (speed vs. compression): `ultrafast` … `veryslow`. |

**Example:**

```bash
cd server && MAX_FILE_SIZE_MB=50 FFMPEG_CRF=23 FFMPEG_PRESET=medium npm run dev
```

## 🏗️ Production build

```bash
# backend
cd server && npm run build && npm start

# frontend
cd client && npm run build && npm run preview
```

To point the frontend at a different backend address, set `VITE_API_URL` at build time:

```bash
VITE_API_URL=https://my-server npm run build
```

## 🔧 Technical notes

- The backend receives images as `multipart/form-data`, saves them to a temporary directory, builds an FFmpeg `concat` file with each frame's duration, and renders with `libx264` / `yuv420p` (compatible with any player).
- Images of different sizes are resized and centered (letterbox) to fit the chosen format.
- Temporary files are deleted after every render.

---

<div align="center">
<sub>Built with FFmpeg · React · Express — runs entirely on your machine.</sub>
</div>
