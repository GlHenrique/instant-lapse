import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import type { Frame } from "@/lib/types";
import { FrameItem } from "./FrameItem";

interface FilmstripProps {
  frames: Frame[];
  onReorder: (frames: Frame[]) => void;
  onRemove: (id: string) => void;
  onDuration: (id: string, value: number) => void;
  onMove: (id: string, targetIndex: number) => void;
}

export function Filmstrip({
  frames,
  onReorder,
  onRemove,
  onDuration,
  onMove,
}: FilmstripProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = frames.findIndex((f) => f.id === active.id);
    const newIndex = frames.findIndex((f) => f.id === over.id);
    onReorder(arrayMove(frames, oldIndex, newIndex));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={frames.map((f) => f.id)}
        strategy={horizontalListSortingStrategy}
      >
        <div className="thin-scroll flex gap-3 overflow-x-auto pb-3">
          {frames.map((frame, i) => (
            <FrameItem
              key={frame.id}
              frame={frame}
              index={i}
              total={frames.length}
              onRemove={onRemove}
              onDuration={onDuration}
              onMove={onMove}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
