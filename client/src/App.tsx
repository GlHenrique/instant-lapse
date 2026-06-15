import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Film, Loader2, Sparkles, Trash2 } from "lucide-react";
import { Button } from "./components/ui/button";
import { LogoMark } from "./components/Logo";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { useI18n } from "./i18n/I18nProvider";
import { Card } from "./components/ui/card";
import { Uploader } from "./components/Uploader";
import { Filmstrip } from "./components/Filmstrip";
import { Preview } from "./components/Preview";
import { Settings } from "./components/Settings";
import { renderTimelapse, fetchLimits, DEFAULT_LIMITS, type Limits } from "./lib/api";
import { toJpegIfHeic } from "./lib/heic";
import { makeThumbnail } from "./lib/thumbnail";
import { RESOLUTION_META, type Frame, type ResolutionKey } from "./lib/types";
import { formatSeconds } from "./lib/utils";

let idCounter = 0;
const nextId = () => `f${Date.now().toString(36)}-${idCounter++}`;

export default function App() {
  const { t } = useI18n();
  const [frames, setFrames] = useState<Frame[]>([]);
  const [resolution, setResolution] = useState<ResolutionKey>("720p");
  const [fps, setFps] = useState(30);

  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const resultUrlRef = useRef<string | null>(null);
  const [fileName, setFileName] = useState("timelapse");
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null
  );
  const [limits, setLimits] = useState<Limits>(DEFAULT_LIMITS);

  useEffect(() => {
    fetchLimits().then(setLimits);
  }, []);

  const addFiles = useCallback(
    async (incoming: File[]) => {
      setError(null);

      const warnings: string[] = [];

      const sizeOk = incoming.filter(
        (f) => f.size <= limits.maxFileSizeMb * 1024 * 1024
      );
      const skippedSize = incoming.length - sizeOk.length;
      if (skippedSize > 0) {
        warnings.push(
          t("tooLargeSkipped", { n: skippedSize, mb: limits.maxFileSizeMb })
        );
      }

      const available = Math.max(0, limits.maxFiles - frames.length);
      const files = sizeOk.slice(0, available);
      const skippedCount = sizeOk.length - files.length;
      if (skippedCount > 0) {
        warnings.push(t("limitReached", { max: limits.maxFiles, n: skippedCount }));
      }

      if (warnings.length) setError(warnings.join(" "));
      if (files.length === 0) return;

      setProgress({ done: 0, total: files.length });
      try {
        const prepared: Frame[] = [];
        let done = 0;
        for (const file of files) {
          const ready = await toJpegIfHeic(file);
          const thumbUrl = await makeThumbnail(ready);
          prepared.push({
            id: nextId(),
            file: ready,
            url: URL.createObjectURL(ready),
            thumbUrl,
            duration: 1,
          });
          done += 1;
          setProgress({ done, total: files.length });
        }
        setFrames((prev) => [...prev, ...prepared]);
      } catch {
        setError(t("loadError"));
      } finally {
        setProgress(null);
      }
    },
    [t, frames.length, limits]
  );

  const removeFrame = useCallback((id: string) => {
    setFrames((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target) {
        URL.revokeObjectURL(target.url);
        URL.revokeObjectURL(target.thumbUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const setDuration = useCallback((id: string, value: number) => {
    setFrames((prev) =>
      prev.map((f) => (f.id === id ? { ...f, duration: value } : f))
    );
  }, []);

  const applyToAll = useCallback((seconds: number) => {
    setFrames((prev) => prev.map((f) => ({ ...f, duration: seconds })));
  }, []);

  const clearAll = useCallback(() => {
    setFrames((prev) => {
      prev.forEach((f) => {
        URL.revokeObjectURL(f.url);
        URL.revokeObjectURL(f.thumbUrl);
      });
      return [];
    });
  }, []);

  function setResult(url: string | null) {
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    resultUrlRef.current = url;
    setResultUrl(url);
  }

  async function handleGenerate() {
    if (frames.length === 0) return;
    setRendering(true);
    setError(null);
    try {
      const blob = await renderTimelapse(frames, fps, resolution);
      setResult(URL.createObjectURL(blob));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("unexpectedError"));
    } finally {
      setRendering(false);
    }
  }

  function downloadResult() {
    if (!resultUrl) return;
    const safe = fileName.trim().replace(/[^a-z0-9-_ ]/gi, "").trim() || "timelapse";
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `${safe}.mp4`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  useEffect(() => {
    return () => {
      frames.forEach((f) => {
        URL.revokeObjectURL(f.url);
        URL.revokeObjectURL(f.thumbUrl);
      });
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const aspect = RESOLUTION_META[resolution].aspect;
  const totalDuration = frames.reduce((s, f) => s + f.duration, 0);
  const hasFrames = frames.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:py-12">
      <header className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LogoMark className="h-11 w-11" />
          <div>
            <h1 className="font-display text-2xl font-extrabold leading-none tracking-tight">
              Instant Lapse
            </h1>
            <p className="text-sm text-muted">{t("tagline")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {hasFrames && (
            <Button variant="ghost" size="sm" onClick={clearAll}>
              <Trash2 className="h-4 w-4" /> {t("clearAll")}
            </Button>
          )}
          <LanguageSwitcher />
        </div>
      </header>

      {!hasFrames ? (
        <section className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl font-extrabold leading-tight md:text-5xl">
            {t("heroTitleA")}
            <span className="text-amber"> {t("heroTitleB")}</span>.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted">{t("heroSubtitle")}</p>
          <div className="mt-8">
            <Uploader onAdd={addFiles} />
          </div>
          {progress && (
            <p className="mt-4 flex items-center justify-center gap-2 text-sm text-muted">
              <Loader2 className="h-4 w-4 animate-spin" /> {t("processing")}{" "}
              <span className="font-mono text-fg">
                {progress.done}/{progress.total}
              </span>
            </p>
          )}
          {error && (
            <p className="mt-4 text-sm text-red-300">{error}</p>
          )}
        </section>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0 space-y-6">
            <Card className="p-4 md:p-5">
              <div className="mb-4 flex items-center gap-2 text-sm text-muted">
                <Film className="h-4 w-4 text-amber" />
                <span>{t("livePreview")}</span>
              </div>
              <Preview frames={frames} aspect={aspect} />
            </Card>

            <Card className="p-4 md:p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted">
                  {t(
                    frames.length === 1 ? "imagesCountOne" : "imagesCountOther",
                    { count: frames.length }
                  )}
                </p>
              </div>
              <Filmstrip
                frames={frames}
                onReorder={setFrames}
                onRemove={removeFrame}
                onDuration={setDuration}
              />
              <div className="mt-4">
                <Uploader onAdd={addFiles} compact />
                {progress && (
                  <p className="mt-2 flex items-center gap-2 text-sm text-muted">
                    <Loader2 className="h-4 w-4 animate-spin" /> {t("processing")}{" "}
                    <span className="font-mono text-fg">
                      {progress.done}/{progress.total}
                    </span>
                  </p>
                )}
              </div>
            </Card>
          </div>

          <aside className="space-y-6">
            <Card className="p-5">
              <Settings
                resolution={resolution}
                onResolution={setResolution}
                fps={fps}
                onFps={setFps}
                onApplyToAll={applyToAll}
              />
            </Card>

            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="text-muted">{t("videoDuration")}</span>
                <span className="font-mono text-fg">
                  {formatSeconds(totalDuration)}
                </span>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                disabled={rendering}
                onClick={handleGenerate}
              >
                {rendering ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> {t("generating")}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" /> {t("generate")}
                  </>
                )}
              </Button>

              {error && (
                <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {error}
                </p>
              )}

              {resultUrl && !rendering && (
                <div className="mt-5 border-t border-line pt-5">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-teal">
                    {t("videoReady")}
                  </p>
                  <video
                    src={resultUrl}
                    controls
                    loop
                    className="w-full rounded-lg border border-line bg-ink"
                  />
                  <label className="mt-3 block text-xs font-medium uppercase tracking-wider text-muted">
                    {t("fileName")}
                  </label>
                  <div className="mt-1 flex items-center rounded-lg border border-line bg-ink focus-within:border-teal">
                    <input
                      type="text"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      placeholder="timelapse"
                      className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-fg outline-none placeholder:text-muted"
                    />
                    <span className="px-3 text-sm text-muted">.mp4</span>
                  </div>
                  <Button
                    variant="secondary"
                    className="mt-3 w-full"
                    onClick={downloadResult}
                  >
                    <Download className="h-4 w-4" /> {t("downloadMp4")}
                  </Button>
                </div>
              )}
            </Card>
          </aside>
        </div>
      )}

      <footer className="mt-16 space-y-1 text-center text-xs text-muted">
        <p>{t("footerRendered")} <b>{t("footerNoCloud")}</b></p>
        <p>© {new Date().getFullYear()} Instant Lapse · {t("rights")}</p>
      </footer>
    </div>
  );
}
