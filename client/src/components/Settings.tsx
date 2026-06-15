import { useState } from "react";
import { Button } from "./ui/button";
import { useI18n } from "@/i18n/I18nProvider";
import { type TKey } from "@/i18n/translations";
import { RESOLUTION_META, type ResolutionKey } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SettingsProps {
  resolution: ResolutionKey;
  onResolution: (r: ResolutionKey) => void;
  fps: number;
  onFps: (f: number) => void;
  onApplyToAll: (seconds: number) => void;
}

const FPS_OPTIONS = [12, 24, 30, 60];

export function Settings({
  resolution,
  onResolution,
  fps,
  onFps,
  onApplyToAll,
}: SettingsProps) {
  const { t } = useI18n();
  const [bulk, setBulk] = useState(1);

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
          {t("format")}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(RESOLUTION_META) as ResolutionKey[]).map((key) => (
            <button
              key={key}
              onClick={() => onResolution(key)}
              className={cn(
                "rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
                resolution === key
                  ? "border-amber bg-amber/10 text-fg"
                  : "border-line bg-panel2 text-muted hover:text-fg"
              )}
            >
              <span className="block font-medium">
                {t(`res_${key}` as TKey)}
              </span>
              <span className="font-mono text-xs opacity-70">
                {RESOLUTION_META[key].aspectLabel}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
          {t("fps")}
        </p>
        <div className="flex gap-2">
          {FPS_OPTIONS.map((f) => (
            <button
              key={f}
              onClick={() => onFps(f)}
              className={cn(
                "flex-1 rounded-xl border py-2 font-mono text-sm transition-colors",
                fps === f
                  ? "border-amber bg-amber/10 text-fg"
                  : "border-line bg-panel2 text-muted hover:text-fg"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">{t("fpsHint")}</p>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
          {t("durationAll")}
        </p>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0.1}
            max={10}
            step={0.1}
            value={bulk}
            onChange={(e) => setBulk(Number(e.target.value))}
            className="flex-1"
          />
          <span className="w-12 text-right font-mono text-sm text-fg">
            {bulk.toFixed(1)}s
          </span>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="mt-3 w-full"
          onClick={() => onApplyToAll(bulk)}
        >
          {t("applyToAll")}
        </Button>
      </div>
    </div>
  );
}
