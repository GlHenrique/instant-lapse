import { memo, useEffect, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import type { Frame } from "@/lib/types";
import { formatSeconds } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface FrameItemProps {
  frame: Frame;
  index: number;
  total: number;
  onRemove: (id: string) => void;
  onDuration: (id: string, value: number) => void;
  onMove: (id: string, targetIndex: number) => void;
}

function FrameItemBase({
  frame,
  index,
  total,
  onRemove,
  onDuration,
  onMove,
}: FrameItemProps) {
  const { t } = useI18n();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: frame.id });

  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function startEdit() {
    doneRef.current = false;
    setEditing(true);
  }

  function finish(apply: boolean) {
    if (doneRef.current) return;
    doneRef.current = true;
    setEditing(false);
    if (!apply) return;
    const n = parseInt(inputRef.current?.value ?? "", 10);
    if (!Number.isFinite(n)) return;
    const target = Math.max(1, Math.min(total, n)) - 1;
    if (target !== index) onMove(frame.id, target);
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative w-40 shrink-0 rounded-xl border border-line bg-panel2 p-2",
        isDragging && "ring-2 ring-amber shadow-2xl"
      )}
    >
      <div className="absolute left-2 top-2 z-10 flex items-center gap-1">
        {editing ? (
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            defaultValue={index + 1}
            aria-label={t("positionInput")}
            onBlur={() => finish(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") finish(true);
              else if (e.key === "Escape") finish(false);
            }}
            className="w-10 rounded-md border border-amber bg-ink px-1 py-0.5 text-center font-mono text-xs text-amber outline-none"
          />
        ) : (
          <button
            onClick={startEdit}
            aria-label={t("changePosition")}
            className="rounded-md bg-ink/80 px-1.5 py-0.5 font-mono text-xs text-amber transition-colors hover:bg-amber hover:text-ink"
          >
            {String(index + 1).padStart(2, "0")}
          </button>
        )}
      </div>

      <button
        onClick={() => onRemove(frame.id)}
        className="absolute right-2 top-2 z-10 grid h-6 w-6 place-items-center rounded-md bg-ink/80 text-muted transition-colors hover:bg-red-500/80 hover:text-white"
        aria-label={t("removeImage")}
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="relative aspect-video overflow-hidden rounded-lg bg-ink">
        <img
          src={frame.thumbUrl}
          alt={t("frameAlt", { n: index + 1 })}
          className="h-full w-full object-cover"
          draggable={false}
          loading="lazy"
          decoding="async"
        />
        <button
          {...attributes}
          {...listeners}
          className="absolute inset-x-0 bottom-0 flex h-7 cursor-grab items-center justify-center bg-ink/60 text-muted transition-colors hover:bg-ink/80 hover:text-fg active:cursor-grabbing"
          aria-label={t("dragToReorder")}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-2 px-0.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">{t("duration")}</span>
          <span className="font-mono text-xs text-fg">
            {formatSeconds(frame.duration)}
          </span>
        </div>
        <input
          type="range"
          min={0.1}
          max={10}
          step={0.1}
          value={frame.duration}
          onChange={(e) => onDuration(frame.id, Number(e.target.value))}
          className="mt-1.5 w-full"
        />
      </div>
    </div>
  );
}

export const FrameItem = memo(FrameItemBase);
