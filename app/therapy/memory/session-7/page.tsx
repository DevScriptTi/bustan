"use client";

import React, { useState, useEffect } from "react";
import SessionContainer from "@/components/therapy/SessionContainer";
import { ArrowLeft } from "lucide-react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDraggable,
  useDroppable,
  DragOverlay,
} from "@dnd-kit/core";

// --- Data ---
const act1Data = [
  { sentence: "أكل الخروف العشب.", words: ["أكل", "الخروف", "العشب"] },
  { sentence: "حديقة منزلي جميلة.", words: ["حديقة", "منزلي", "جميلة"] },
  { sentence: "لعبت أختي بالدمية.", words: ["لعبت", "أختي", "بالدمية"] },
  { sentence: "يوم الجمعة عطلة.", words: ["يوم", "الجمعة", "عطلة"] },
  { sentence: "أحب صديقي العزيز.", words: ["أحب", "صديقي", "العزيز"] },
];

// --- DnD Components ---
function DraggableItem({ id, label, onClick }: { id: string; label: string; onClick?: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { id, label },
  });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        // Prevent click trigger if dragging
        if (isDragging) return;
        if (onClick) onClick();
      }}
      className={`word-pop px-6 py-4 text-xl sm:text-2xl font-bold bg-white text-sky-900 border-2 border-sky-100 rounded-2xl shadow-sm hover:shadow-md transition-transform duration-200 cursor-grab touch-none select-none
         ${isDragging ? "opacity-30 cursor-grabbing" : "hover:-translate-y-1"}
      `}
    >
      <span>{label}</span>
    </div>
  );
}

function DroppableSlot({ id, index, itemKey, isWrong, isSuccess, onSlotClick }: { id: string; index: number; itemKey: string | null; isWrong: boolean; isSuccess?: boolean; onSlotClick?: (index: number) => void }) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`relative flex flex-col items-center justify-center p-3 rounded-3xl border-4 min-w-[120px] min-h-[90px] sm:min-w-[160px] sm:min-h-[110px] transition-all 
      ${isOver ? "border-sky-500 bg-sky-50 scale-105" : "border-dashed border-gray-300 bg-white/50"}
      ${isWrong ? "bg-red-50 border-red-300 animate-pulse" : ""}
      ${isSuccess ? "border-green-400 bg-green-50" : ""}
    `}
    >
      <span className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-6 h-6 sm:w-10 sm:h-10 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center text-xs sm:text-base font-bold text-gray-500 shadow-sm z-10">
        {index + 1}
      </span>
      {itemKey ? (
        <DraggableItem id={itemKey} label={itemKey} onClick={() => onSlotClick?.(index)} />
      ) : (
        <span className="text-gray-300 text-3xl sm:text-4xl opacity-50">📥</span>
      )}
    </div>
  );
}

function DroppablePool({ id, items, onPoolItemClick }: { id: string; items: string[]; onPoolItemClick?: (item: string) => void }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`w-full min-h-[140px] sm:min-h-[180px] p-4 sm:p-6 rounded-3xl border-4 transition-all flex flex-wrap gap-2 sm:gap-4 justify-center items-center relative
      ${isOver ? "border-sky-500 bg-sky-50/50" : "border-dashed border-sky-200 bg-sky-50/30"}
    `}
    >
      {items.length === 0 ? (
        <span className="text-gray-400 font-medium text-sm sm:text-lg">سحب الكلمات هنا لإعادة الترتيب</span>
      ) : (
        items.map((itemKey) => {
          return <DraggableItem key={itemKey} id={itemKey} label={itemKey} onClick={() => onPoolItemClick?.(itemKey)} />;
        })
      )}
    </div>
  );
}

export default function MemorySession7() {
  const [currentStep, setCurrentStep] = useState(0);
  const [wordPool, setWordPool] = useState<string[]>([]);
  const [wordSlots, setWordSlots] = useState<(string | null)[]>([null, null, null]);
  const [wrongSlots, setWrongSlots] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
  );

  // Initialize pool in grammatical order when currentStep changes
  useEffect(() => {
    const currentData = act1Data[currentStep];
    setWordPool([...currentData.words]);
    setWordSlots([null, null, null]);
    setWrongSlots([]);
    setFeedback(null);
    setActiveId(null);
  }, [currentStep]);

  const handleResetSession = () => {
    setActiveId(null);
    if (currentStep === 0) {
      const currentData = act1Data[0];
      setWordPool([...currentData.words]);
      setWordSlots([null, null, null]);
      setWrongSlots([]);
      setFeedback(null);
      setIsFinished(false);
    } else {
      setCurrentStep(0);
      setIsFinished(false);
    }
  };

  // Drag & Drop event handler
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setWrongSlots([]);
    setActiveId(null);
    if (!over) return;

    const activeItem = active.id as string;
    if (!activeItem) return;

    const overId = over.id as string;
    const sourceIsPool = wordPool.includes(activeItem);
    const sourceSlotIndex = wordSlots.indexOf(activeItem);

    if (overId.startsWith("slot-")) {
      const targetSlotIndex = parseInt(overId.split("-")[1]);
      const newPool = [...wordPool];
      const newSlots = [...wordSlots];

      const itemInTarget = newSlots[targetSlotIndex];
      if (itemInTarget && itemInTarget !== activeItem) {
        newPool.push(itemInTarget);
      }

      newSlots[targetSlotIndex] = activeItem;

      if (sourceIsPool) {
        newPool.splice(newPool.indexOf(activeItem), 1);
      } else if (sourceSlotIndex !== -1 && sourceSlotIndex !== targetSlotIndex) {
        newSlots[sourceSlotIndex] = null;
      }

      setWordPool(newPool);
      setWordSlots(newSlots);
    } else if (overId === "pool") {
      if (!sourceIsPool) {
        const newPool = [...wordPool, activeItem];
        const newSlots = [...wordSlots];
        newSlots[sourceSlotIndex] = null;
        setWordPool(newPool);
        setWordSlots(newSlots);
      }
    }
  };

  // Tap-to-move click handlers
  const handlePoolItemClick = (itemKey: string) => {
    const firstEmptyIndex = wordSlots.indexOf(null);
    if (firstEmptyIndex !== -1) {
      const newSlots = [...wordSlots];
      newSlots[firstEmptyIndex] = itemKey;
      setWordSlots(newSlots);

      const newPool = wordPool.filter((w) => w !== itemKey);
      setWordPool(newPool);

      setWrongSlots([]);
      setFeedback(null);
    }
  };

  const handleSlotClick = (slotIndex: number) => {
    const itemKey = wordSlots[slotIndex];
    if (itemKey) {
      const newSlots = [...wordSlots];
      newSlots[slotIndex] = null;
      setWordSlots(newSlots);

      setWordPool([...wordPool, itemKey]);
      setWrongSlots([]);
      setFeedback(null);
    }
  };

  const checkAnswer = () => {
    const currentData = act1Data[currentStep];
    const wrongs: number[] = [];

    wordSlots.forEach((slot, index) => {
      if (slot !== currentData.words[index]) wrongs.push(index);
    });

    if (wrongs.length === 0 && wordSlots.every((s) => s !== null)) {
      setFeedback("correct");
      setTimeout(() => {
        setFeedback(null);
        if (currentStep < act1Data.length - 1) {
          setCurrentStep((prev) => prev + 1);
        } else {
          setIsFinished(true);
        }
      }, 1500);
    } else {
      setWrongSlots(wrongs);
      setFeedback("wrong");
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  const renderActivity = () => {
    const currentData = act1Data[currentStep];
    return (
      <div className="flex flex-col items-center w-full max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-indigo-900 drop-shadow-sm" dir="rtl">
            {currentData.sentence}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 font-medium">
            فكك الجملة إلى كلماتها الأصلية بالترتيب الصحيح (من اليمين لليسار)
          </p>
        </div>

        <DndContext 
          sensors={sensors}
          onDragStart={(e) => setActiveId(e.active.id as string)}
          onDragEnd={handleDragEnd}
        >
          {/* Target Slots */}
          <div className="w-full bg-indigo-50/50 p-8 rounded-3xl border-2 border-indigo-100 flex flex-col items-center gap-6 shadow-sm">
            <h3 className="text-xl font-bold text-indigo-800">مربعات الترتيب</h3>
            <div className="flex flex-wrap md:flex-nowrap justify-center gap-4 w-full" dir="rtl">
              {wordSlots.map((itemKey, idx) => (
                <div key={`slot-${idx}`} className="flex-1 min-w-[120px] max-w-[200px]">
                  <DroppableSlot 
                    id={`slot-${idx}`} 
                    index={idx}
                    itemKey={itemKey}
                    isWrong={wrongSlots.includes(idx)}
                    isSuccess={feedback === "correct"}
                    onSlotClick={handleSlotClick}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Word Pool */}
          <div className="w-full mt-8">
            <DroppablePool 
              id="pool" 
              items={wordPool.filter((word) => activeId !== word)} 
              onPoolItemClick={handlePoolItemClick} 
            />
          </div>

          <DragOverlay dropAnimation={{ duration: 250, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
            {activeId ? <DraggableItem id={activeId} label={activeId} /> : null}
          </DragOverlay>
        </DndContext>

        <div className="mt-12">
          <button
            onClick={checkAnswer}
            className="px-10 py-4 bg-gradient-to-r from-mint-500 to-emerald-500 hover:from-mint-600 hover:to-emerald-600 text-white font-extrabold rounded-full shadow-lg transform hover:scale-105 active:scale-95 transition-all text-2xl flex items-center gap-3"
          >
            <span>✅ تحقق من الإجابة</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <SessionContainer
      title="الحصة 7: الترميز والتنظيم"
      activityTitle="النشاط 1: تفكيك الجمل"
      isCompleted={isFinished}
      onRestart={handleResetSession}
      nextSessionPath="/therapy/memory/session-8"
    >
      {!isFinished && renderActivity()}
    </SessionContainer>
  );
}

