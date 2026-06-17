import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import { useI18n } from "@/i18n/I18nProvider";
import type { Frame } from "@/lib/types";
import { formatSeconds } from "@/lib/utils";

interface PreviewProps {
  frames: Frame[];
  aspect: number;
}

export function Preview({ frames, aspect }: PreviewProps) {
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  const imgsRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const elapsedRef = useRef(0);
  const lastRef = useRef<number | null>(null);
  const playingRef = useRef(false);

  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    playingRef.current = playing;
    if (playing) lastRef.current = null;
  }, [playing]);

  useEffect(() => {
    frames.forEach((f) => {
      if (!imgsRef.current.has(f.id)) {
        const img = new Image();
        img.src = f.url;
        imgsRef.current.set(f.id, img);
      }
    });
    const ids = new Set(frames.map((f) => f.id));
    for (const key of [...imgsRef.current.keys()]) {
      if (!ids.has(key)) imgsRef.current.delete(key);
    }
  }, [frames]);

  const total = frames.reduce((s, f) => s + f.duration, 0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = 1000;
    const H = Math.round(W / aspect);
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;

    const loop = (now: number) => {
      if (lastRef.current == null) lastRef.current = now;
      const dt = now - lastRef.current;
      lastRef.current = now;
      if (playingRef.current) elapsedRef.current += dt;

      const sum = frames.reduce((s, f) => s + f.duration, 0);
      ctx.fillStyle = "#0E1116";
      ctx.fillRect(0, 0, W, H);

      if (frames.length > 0 && sum > 0) {
        const t = (elapsedRef.current / 1000) % sum;
        let acc = 0;
        let curIndex = 0;
        for (let i = 0; i < frames.length; i++) {
          if (t < acc + frames[i].duration) {
            curIndex = i;
            break;
          }
          acc += frames[i].duration;
        }
        const img = imgsRef.current.get(frames[curIndex].id);
        if (img && img.complete && img.naturalWidth) {
          const r = Math.min(W / img.naturalWidth, H / img.naturalHeight);
          const dw = img.naturalWidth * r;
          const dh = img.naturalHeight * r;
          ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
        }
        if (progressRef.current) {
          progressRef.current.style.width = `${(t / sum) * 100}%`;
        }
        if (counterRef.current) {
          counterRef.current.textContent = `${curIndex + 1} / ${frames.length}`;
        }
      } else {
        if (progressRef.current) progressRef.current.style.width = "0%";
        if (counterRef.current) counterRef.current.textContent = "0 / 0";
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [frames, aspect]);

  function restart() {
    elapsedRef.current = 0;
    lastRef.current = null;
  }

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-line bg-stage">
        <canvas
          ref={canvasRef}
          className="mx-auto block h-auto w-auto max-w-full"
          style={{ aspectRatio: String(aspect), maxHeight: "70vh" }}
        />
      </div>

      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-line">
        <div ref={progressRef} className="h-full bg-amber" style={{ width: "0%" }} />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="primary"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? t("pause") : t("play")}
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button size="icon" variant="secondary" onClick={restart} aria-label={t("restart")}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-4 font-mono text-xs text-muted">
          <span ref={counterRef}>0 / 0</span>
          <span>{t("total")} {formatSeconds(total)}</span>
        </div>
      </div>
    </div>
  );
}
