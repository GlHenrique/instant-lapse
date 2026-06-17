import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import multer from "multer";
import { spawn } from "node:child_process";
import { promises as fs, existsSync, mkdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import ffmpegPath from "ffmpeg-static";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

const MAX_FILE_SIZE_MB = numEnv("MAX_FILE_SIZE_MB", 30);
const MAX_FILES = numEnv("MAX_FILES", 1000);
const FFMPEG_CRF = numEnv("FFMPEG_CRF", 20);
const FFMPEG_PRESET = process.env.FFMPEG_PRESET || "veryfast";

app.use(cors());

const UPLOAD_DIR = path.join(os.tmpdir(), "instant-lapse-uploads");
mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const ext =
        extFromMime(file.mimetype) ?? (path.extname(file.originalname) || ".png");
      cb(null, `${crypto.randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024, files: MAX_FILES },
});

function handleUpload(req: Request, res: Response, next: NextFunction) {
  upload.array("frames")(req, res, (err: unknown) => {
    if (!err) return next();
    const saved = (req.files as Express.Multer.File[]) ?? [];
    saved.forEach((f) => f.path && fs.rm(f.path, { force: true }).catch(() => {}));
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_COUNT") {
        return res
          .status(400)
          .json({ error: `Too many images. The maximum is ${MAX_FILES} per video.` });
      }
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          error: `An image is too large. The maximum is ${MAX_FILE_SIZE_MB} MB per image.`,
        });
      }
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    }
    return res.status(500).json({ error: "Upload failed." });
  });
}

const RESOLUTIONS = {
  "720p": { w: 1280, h: 720 },
  "1080p": { w: 1920, h: 1080 },
  square: { w: 1080, h: 1080 },
  vertical: { w: 1080, h: 1920 },
} as const;

type ResKey = keyof typeof RESOLUTIONS;

app.get("/api/health", (_req, res) => {
  const ffmpegOk = ffmpegPath != null && existsSync(ffmpegPath);
  res.json({
    ok: true,
    ffmpeg: ffmpegOk,
    maxFiles: MAX_FILES,
    maxFileSizeMb: MAX_FILE_SIZE_MB,
  });
});

app.post("/api/render", handleUpload, async (req, res) => {
  const files = (req.files as Express.Multer.File[]) ?? [];
  if (files.length === 0) {
    return res.status(400).json({ error: "Send at least one image." });
  }

  let durations: number[] = [];
  try {
    durations = JSON.parse(String(req.body.durations ?? "[]"));
    if (!Array.isArray(durations)) throw new Error("not array");
  } catch {
    return res.status(400).json({ error: "Invalid durations list." });
  }

  const fps = clampInt(req.body.fps, 1, 60, 30);
  const resKey = String(req.body.resolution ?? "720p") as ResKey;
  const { w, h } = RESOLUTIONS[resKey] ?? RESOLUTIONS["720p"];

  const sorted = [...files].sort(
    (a, b) => numPrefix(a.originalname) - numPrefix(b.originalname)
  );

  const workdir = path.join(os.tmpdir(), `tl-${crypto.randomUUID()}`);
  await fs.mkdir(workdir, { recursive: true });

  try {
    const listLines: string[] = [];
    for (let i = 0; i < sorted.length; i++) {
      const safePath = sorted[i].path.replace(/'/g, "'\\''");
      const dur = clampNum(durations[i], 0.04, 60, 2);
      listLines.push(`file '${safePath}'`);
      listLines.push(`duration ${dur.toFixed(3)}`);
      if (i === sorted.length - 1) {
        listLines.push(`file '${safePath}'`);
      }
    }

    const listPath = path.join(workdir, "list.txt");
    await fs.writeFile(listPath, listLines.join("\n"));

    const outPath = path.join(workdir, "timelapse.mp4");
    const vf = [
      `scale=${w}:${h}:force_original_aspect_ratio=decrease`,
      `pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:color=black`,
      `format=yuv420p`,
    ].join(",");

    const args = [
      "-y",
      "-f", "concat",
      "-safe", "0",
      "-i", listPath,
      "-vf", vf,
      "-r", String(fps),
      "-c:v", "libx264",
      "-preset", FFMPEG_PRESET,
      "-crf", String(FFMPEG_CRF),
      "-pix_fmt", "yuv420p",
      "-movflags", "+faststart",
      outPath,
    ];

    await runFfmpeg(args);

    const data = await fs.readFile(outPath);
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Length", String(data.length));
    res.setHeader("Content-Disposition", 'attachment; filename="timelapse.mp4"');
    res.send(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate the video. Check the server log." });
  } finally {
    await Promise.all(
      files.map((f) => fs.rm(f.path, { force: true }).catch(() => {}))
    );
    fs.rm(workdir, { recursive: true, force: true }).catch(() => {});
  }
});

function runFfmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!ffmpegPath) return reject(new Error("ffmpeg binary not found."));
    const proc = spawn(ffmpegPath, args);
    let stderr = "";
    proc.stderr.on("data", (d) => (stderr += d.toString()));
    proc.on("error", reject);
    proc.on("close", (code, signal) => {
      if (code === 0) resolve();
      else
        reject(
          new Error(
            `ffmpeg exited with code ${code}${
              signal ? ` (signal ${signal})` : ""
            }: ${stderr.slice(-800)}`
          )
        );
    });
  });
}

function numPrefix(name: string): number {
  const m = name.match(/^(\d+)/);
  return m ? Number(m[1]) : Number.MAX_SAFE_INTEGER;
}

function extFromMime(mime: string): string | null {
  const map: Record<string, string> = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/bmp": ".bmp",
  };
  return map[mime] ?? null;
}

function clampInt(v: unknown, min: number, max: number, fallback: number): number {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function clampNum(v: unknown, min: number, max: number, fallback: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function numEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw == null || raw.trim() === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

app.listen(PORT, () => {
  console.log(`Timelapse server at http://localhost:${PORT}`);
  console.log(`FFmpeg: ${ffmpegPath ?? "NOT FOUND"}`);
});
