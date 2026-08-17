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
  { word: "كتب", letters: ["ك", "ت", "ب"] },
  { word: "رتب", letters: ["ر", "ت", "ب"] },
  { word: "سلم", letters: ["س", "ل", "م"] },
  { word: "علم", letters: ["ع", "ل", "م"] },
  { word: "طائرة", letters: ["ط", "ا", "ئ", "ر", "ة"] },
  { word: "سيارة", letters: ["س", "ي", "ا", "ر", "ة"] },
  { word: "عمارة", letters: ["ع", "م", "ا", "ر", "ة"] },
  { word: "الحيوانات", letters: ["ا", "ل", "ح", "ي", "و", "ا", "ن", "ا", "ت"] },
  { word: "الإعلانات", letters: ["ا", "ل", "إ", "ع", "ل", "ا", "ن", "ا", "ت"] },
];

// --- DnD Components ---
function DraggableItem({ id, label, onClick, isDragging }: { id: string; label: string; onClick?: () => void; isDragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
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
        if (isDragging) return;
        onClick?.();
      }}
      className={`word-pop w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center font-extrabold text-3xl bg-white text-sky-900 border-2 border-sky-100 rounded-2xl shadow-sm hover:shadow-md transition-transform duration-200 cursor-grab touch-none select-none
         ${isDragging ? "opacity-30 cursor-grabbing" : "hover:-translate-y-1"}
      `}
    >
      <span>{label}</span>
    </div>
  );
}

function DroppableSlot({ id, index, item, isWrong, isSuccess, onSlotClick, activeId }: { id: string; index: number; item: { id: string; val: string } | null; isWrong: boolean; isSuccess?: boolean; onSlotClick?: (index: number) => void; activeId?: string | null }) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`relative flex flex-col items-center justify-center p-3 rounded-3xl border-4 min-w-[70px] min-h-[70px] sm:min-w-[90px] sm:min-h-[90px] transition-all 
      ${isOver ? "border-sky-500 bg-sky-50 scale-105" : "border-dashed border-gray-300 bg-white/50"}
      ${isWrong ? "bg-red-50 border-red-300 animate-pulse" : ""}
      ${isSuccess ? "border-green-400 bg-green-50" : ""}
    `}
    >
      <span className="absolute -top-3 -right-3 w-6 h-6 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 shadow-sm z-10">
        {index + 1}
      </span>
      {item ? (
        <DraggableItem id={item.id} label={item.val} onClick={() => onSlotClick?.(index)} isDragging={activeId === item.id} />
      ) : (
        <span className="text-gray-300 text-3xl opacity-30">📥</span>
      )}
    </div>
  );
}

function DroppablePool({ id, items, onPoolItemClick, activeId }: { id: string; items: { id: string; val: string }[]; onPoolItemClick?: (item: { id: string; val: string }) => void; activeId?: string | null }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`w-full min-h-[140px] p-4 sm:p-6 rounded-3xl border-4 transition-all flex flex-wrap gap-2 sm:gap-4 justify-center items-center relative
      ${isOver ? "border-sky-500 bg-sky-50/50" : "border-dashed border-sky-200 bg-sky-50/30"}
    `}
    >
      {items.length === 0 ? (
        <span className="text-gray-400 font-medium text-sm sm:text-lg">سحب الحروف هنا لإعادة الترتيب</span>
      ) : (
        items.map((item) => {
          return <DraggableItem key={item.id} id={item.id} label={item.val} onClick={() => onPoolItemClick?.(item)} isDragging={activeId === item.id} />;
        })
      )}
    </div>
  );
}

export default function MemorySession8() {
  const [currentStep, setCurrentStep] = useState(0);
  const [wordPool, setWordPool] = useState<{ id: string; val: string }[]>([]);
  const [wordSlots, setWordSlots] = useState<({ id: string; val: string } | null)[]>([]);
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
    const initialPool = currentData.letters.map((letter, idx) => ({
      id: `${currentStep}-letter-${idx}`,
      val: letter,
    }));
    setWordPool(initialPool);
    setWordSlots(Array(currentData.letters.length).fill(null));
    setWrongSlots([]);
    setFeedback(null);
    setActiveId(null);
  }, [currentStep]);

  const handleResetSession = () => {
    setActiveId(null);
    if (currentStep === 0) {
      const currentData = act1Data[0];
      const initialPool = currentData.letters.map((letter, idx) => ({
        id: `0-letter-${idx}`,
        val: letter,
      }));
      setWordPool(initialPool);
      setWordSlots(Array(currentData.letters.length).fill(null));
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

    const activeIdStr = active.id as string;
    const overId = over.id as string;

    // Find the item
    const poolItem = wordPool.find(item => item.id === activeIdStr);
    const slotItemIndex = wordSlots.findIndex(item => item?.id === activeIdStr);
    const item = poolItem || (slotItemIndex !== -1 ? wordSlots[slotItemIndex] : null);

    if (!item) return;

    const sourceIsPool = !!poolItem;
    const sourceSlotIndex = slotItemIndex;

    if (overId.startsWith("slot-")) {
      const targetSlotIndex = parseInt(overId.split("-")[1]);
      const newPool = [...wordPool];
      const newSlots = [...wordSlots];

      const itemInTarget = newSlots[targetSlotIndex];
      if (itemInTarget && itemInTarget.id !== activeIdStr) {
        newPool.push(itemInTarget);
      }

      newSlots[targetSlotIndex] = item;

      if (sourceIsPool) {
        newPool.splice(newPool.findIndex(w => w.id === activeIdStr), 1);
      } else if (sourceSlotIndex !== -1 && sourceSlotIndex !== targetSlotIndex) {
        newSlots[sourceSlotIndex] = null;
      }

      setWordPool(newPool);
      setWordSlots(newSlots);
    } else if (overId === "pool") {
      if (!sourceIsPool) {
        const newPool = [...wordPool, item];
        const newSlots = [...wordSlots];
        newSlots[sourceSlotIndex] = null;
        setWordPool(newPool);
        setWordSlots(newSlots);
      }
    }
  };

  // Tap-to-move click handlers
  const handlePoolItemClick = (item: { id: string; val: string }) => {
    const firstEmptyIndex = wordSlots.indexOf(null);
    if (firstEmptyIndex !== -1) {
      const newSlots = [...wordSlots];
      newSlots[firstEmptyIndex] = item;
      setWordSlots(newSlots);

      const newPool = wordPool.filter((w) => w.id !== item.id);
      setWordPool(newPool);

      setWrongSlots([]);
      setFeedback(null);
    }
  };

  const handleSlotClick = (slotIndex: number) => {
    const item = wordSlots[slotIndex];
    if (item) {
      const newSlots = [...wordSlots];
      newSlots[slotIndex] = null;
      setWordSlots(newSlots);

      setWordPool([...wordPool, item]);
      setWrongSlots([]);
      setFeedback(null);
    }
  };

  const checkAnswer = () => {
    const currentData = act1Data[currentStep];
    const wrongs: number[] = [];

    wordSlots.forEach((slot, index) => {
      if (!slot || slot.val !== currentData.letters[index]) wrongs.push(index);
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

  const activeItem = wordPool.find(w => w.id === activeId) || wordSlots.find(w => w?.id === activeId);

  const renderActivity = () => {
    const currentData = act1Data[currentStep];
    return (
      <div className="flex flex-col items-center w-full max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-extrabold text-indigo-900 drop-shadow-sm" dir="rtl">
            {currentData.word}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 font-medium">
            فكك الكلمة إلى حروفها الأصلية بالترتيب الصحيح (من اليمين لليسار)
          </p>
        </div>

        <DndContext 
          sensors={sensors}
          onDragStart={(e) => setActiveId(e.active.id as string)}
          onDragEnd={handleDragEnd}
        >
          {/* Target Slots */}
          <div className="w-full bg-indigo-50/50 p-8 rounded-3xl border-2 border-indigo-100 flex flex-col items-center gap-6 shadow-sm">
            <h3 className="text-xl font-bold text-indigo-800">مربعات الحروف</h3>
            <div className="flex flex-wrap justify-center gap-3 w-full" dir="rtl">
              {wordSlots.map((item, idx) => (
                <div key={`slot-${idx}`}>
                  <DroppableSlot 
                    id={`slot-${idx}`} 
                    index={idx}
                    item={item}
                    isWrong={wrongSlots.includes(idx)}
                    isSuccess={feedback === "correct"}
                    onSlotClick={handleSlotClick}
                    activeId={activeId}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Word Pool */}
          <div className="w-full mt-8">
            <DroppablePool 
              id="pool" 
              items={wordPool} 
              onPoolItemClick={handlePoolItemClick} 
              activeId={activeId}
            />
          </div>

          <DragOverlay dropAnimation={{ duration: 250, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
            {activeItem ? <DraggableItem id={activeItem.id} label={activeItem.val} isDragging /> : null}
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
      title="الحصة 8: الترميز والتنظيم"
      activityTitle="النشاط 1: تفكيك الكلمات إلى حروف"
      isCompleted={isFinished}
      onRestart={handleResetSession}
      nextSessionPath="/therapy/memory/session-9"
    >
      {!isFinished && renderActivity()}
    </SessionContainer>
  );
}

