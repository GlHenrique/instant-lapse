import { useCallback, useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";

interface UploaderProps {
  onAdd: (files: File[]) => void;
  compact?: boolean;
}

export function Uploader({ onAdd, compact }: UploaderProps) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const handleFiles = useCallback(
    (list: FileList | null) => {
      if (!list) return;
      const images = Array.from(list).filter(
        (f) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name)
      );
      if (images.length) onAdd(images);
    },
    [onAdd]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      className={cn(
        "group cursor-pointer rounded-2xl border-2 border-dashed transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber",
        over ? "border-amber bg-amber/5" : "border-line hover:border-muted",
        compact ? "px-5 py-4" : "px-8 py-14"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <div
        className={cn(
          "flex items-center text-center",
          compact ? "gap-3 justify-start" : "flex-col gap-3 justify-center"
        )}
      >
        <div
          className={cn(
            "grid place-items-center rounded-xl bg-panel2 text-amber transition-transform group-hover:scale-105",
            compact ? "h-10 w-10" : "h-14 w-14"
          )}
        >
          <ImagePlus className={compact ? "h-5 w-5" : "h-7 w-7"} />
        </div>
        <div className={compact ? "text-left" : ""}>
          <p className="font-medium text-fg">
            {compact ? t("addMore") : t("dropHere")}
          </p>
          {!compact && (
            <p className="mt-1 text-sm text-muted">{t("orClick")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
