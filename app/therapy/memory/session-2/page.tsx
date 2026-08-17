"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SessionContainer from "@/components/therapy/SessionContainer";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";

// --- Data ---
const act1Data = [
  { options: ["طبيب", "معلم", "مهندس", "كتاب"], correct: "كتاب" },
  { options: ["برتقال", "تفاح", "عنب", "بطاطا"], correct: "بطاطا" },
  { options: ["مدرسة", "سبورة", "دكان", "قسم"], correct: "دكان" },
  { options: ["خال", "عم", "حاسوب", "جدة"], correct: "حاسوب" },
  { options: ["قيثارة", "مكتب", "طبل", "كمان"], correct: "مكتب" },
];

const act2CorrectSequence = ["مكتب", "حاسوب", "دكان", "بطاطا", "كتاب"];

const act2EmojiMap: Record<string, string> = {
  مكتب: "🖥️",
  حاسوب: "💻",
  دكان: "🏪",
  بطاطا: "🥔",
  كتاب: "📖",
};

// Generic Utility Shuffle Function
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// --- DnD Components ---
function DraggableItem({ id, label, isEmoji = false, textLabel }: { id: string; label: string; isEmoji?: boolean; textLabel?: string }) {
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
      className={`flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border-2 border-sky-100 font-bold cursor-grab active:cursor-grabbing touch-none select-none transition-shadow
         ${isEmoji ? "w-20 h-24 sm:w-28 sm:h-32" : "px-4 py-3 sm:px-6 sm:py-4 text-lg sm:text-2xl text-sky-900"}
         ${isDragging ? "opacity-90 ring-4 ring-sky-400 shadow-2xl scale-105" : "hover:-translate-y-1 hover:shadow-md"}
      `}
    >
      <span className={isEmoji ? "text-4xl sm:text-6xl mb-1 sm:mb-2" : ""}>{label}</span>
      {isEmoji && textLabel && <span className="text-xs sm:text-sm md:text-base text-gray-700 font-bold">{textLabel}</span>}
    </div>
  );
}

// Drop Slot without printed numbers (numbers completely removed for pure memory challenge)
function DroppableSlot({ id, index, itemKey, isWrong, isSuccess, isEmoji = false, emojiMap }: { id: string; index: number; itemKey: string | null; isWrong: boolean; isSuccess?: boolean; isEmoji?: boolean; emojiMap?: Record<string, string> }) {
  const { isOver, setNodeRef } = useDroppable({ id });

  const label = itemKey && isEmoji && emojiMap ? emojiMap[itemKey] : itemKey;

  return (
    <div
      ref={setNodeRef}
      className={`relative flex flex-col items-center justify-center p-2 sm:p-3 rounded-3xl border-4 min-w-[90px] min-h-[110px] sm:min-w-[130px] sm:min-h-[150px] transition-all 
      ${isOver ? "border-sky-500 bg-sky-50 scale-105" : "border-dashed border-gray-300 bg-white/50"}
      ${isWrong ? "bg-red-50 border-red-300 animate-pulse" : ""}
      ${isSuccess ? "border-green-400 bg-green-50" : ""}
    `}
    >
      {itemKey ? <DraggableItem id={itemKey} label={label as string} isEmoji={isEmoji} textLabel={itemKey} /> : <span className="text-gray-300 text-3xl sm:text-4xl opacity-50">📥</span>}
    </div>
  );
}

function DroppablePool({ id, items, isEmoji = false, emojiMap }: { id: string; items: string[]; isEmoji?: boolean; emojiMap?: Record<string, string> }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`w-full min-h-[140px] sm:min-h-[180px] p-4 sm:p-6 rounded-3xl border-4 transition-all flex flex-wrap gap-2 sm:gap-4 justify-center items-center relative
      ${isOver ? "border-sky-500 bg-sky-50/50" : "border-dashed border-sky-200 bg-sky-50/30"}
    `}
    >
      {items.length === 0 ? (
        <span className="text-gray-400 font-medium text-sm sm:text-lg">سحب العناصر من هنا</span>
      ) : (
        items.map((itemKey) => {
          const label = isEmoji && emojiMap ? emojiMap[itemKey] : itemKey;
          return <DraggableItem key={itemKey} id={itemKey} label={label as string} isEmoji={isEmoji} textLabel={itemKey} />;
        })
      )}
    </div>
  );
}

function MemorySession2Content() {
  const searchParams = useSearchParams();
  const childId = searchParams.get("childId");

  const [currentActivity, setCurrentActivity] = useState<1 | 2 | 3>(1);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
  );

  // --- Activity 1 State ---
  const [act1Step, setAct1Step] = useState(0);
  const [act1Feedback, setAct1Feedback] = useState<"correct" | "wrong" | null>(null);
  const [shuffledAct1Options, setShuffledAct1Options] = useState<string[]>([]);

  // Shuffle Activity 1 options once whenever the round (act1Step) changes
  useEffect(() => {
    if (currentActivity === 1 && act1Data[act1Step]) {
      setShuffledAct1Options(shuffleArray(act1Data[act1Step].options));
    }
  }, [currentActivity, act1Step]);

  // --- Activity 2 State (DnD) ---
  const [act2Pool, setAct2Pool] = useState<string[]>([]);
  const [act2Slots, setAct2Slots] = useState<(string | null)[]>([null, null, null, null, null]);
  const [act2WrongSlots, setAct2WrongSlots] = useState<number[]>([]);
  const [act2Success, setAct2Success] = useState(false);

  // Initialize Act 2 drag pool with guaranteed randomized order when entering Activity 2
  useEffect(() => {
    if (currentActivity === 2 && act2Pool.length === 0 && act2Slots.every((s) => s === null)) {
      let shuffled = shuffleArray(act2CorrectSequence);
      // Guarantee it's not by chance identical to the correct target sequence
      if (shuffled.every((val, idx) => val === act2CorrectSequence[idx])) {
        shuffled = [shuffled[1], shuffled[0], ...shuffled.slice(2)];
      }
      setAct2Pool(shuffled);
    }
  }, [currentActivity, act2Pool.length, act2Slots]);

  // --- Global Reset ---
  const handleResetSession = () => {
    setCurrentActivity(1);
    setAct1Step(0);
    setAct1Feedback(null);
    setShuffledAct1Options(shuffleArray(act1Data[0].options));
    setAct2Pool([]);
    setAct2Slots([null, null, null, null, null]);
    setAct2WrongSlots([]);
    setAct2Success(false);
  };

  // --- Handlers for Activity 1 ---
  const handleAct1OptionClick = (option: string) => {
    if (act1Feedback) return;

    if (option === act1Data[act1Step].correct) {
      setAct1Feedback("correct");
      setTimeout(() => {
        setAct1Feedback(null);
        if (act1Step < act1Data.length - 1) {
          setAct1Step(act1Step + 1);
        } else {
          setCurrentActivity(2);
        }
      }, 800);
    } else {
      setAct1Feedback("wrong");
      setTimeout(() => setAct1Feedback(null), 800);
    }
  };

  // --- Handlers for Activity 2 ---
  const handleDragEndAct2 = (event: DragEndEvent) => {
    const { active, over } = event;
    setAct2WrongSlots([]);
    if (!over) return;

    const activeItem = active.id as string;
    if (!activeItem) return;

    const overId = over.id as string;
    const sourceIsPool = act2Pool.includes(activeItem);
    const sourceSlotIndex = act2Slots.indexOf(activeItem);

    if (overId.startsWith("slot-")) {
      const targetSlotIndex = parseInt(overId.split("-")[1]);
      const newPool = [...act2Pool];
      const newSlots = [...act2Slots];

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

      setAct1Pool(newPool);
      setAct2Slots(newSlots);
    } else if (overId === "pool") {
      if (!sourceIsPool) {
        const newPool = [...act2Pool, activeItem];
        const newSlots = [...act2Slots];
        newSlots[sourceSlotIndex] = null;
        setAct2Pool(newPool);
        setAct2Slots(newSlots);
      }
    }
  };

  const setAct1Pool = (newPool: string[]) => setAct2Pool(newPool);

  const checkAnswerAct2 = () => {
    const wrongs: number[] = [];
    act2Slots.forEach((slot, index) => {
      if (slot !== act2CorrectSequence[index]) wrongs.push(index);
    });

    if (wrongs.length === 0 && act2Slots.every((s) => s !== null)) {
      setAct2Success(true);
      setTimeout(() => setCurrentActivity(3), 1800);
    } else {
      setAct2WrongSlots(wrongs);
    }
  };

  // --- Renders ---
  const renderActivity1 = () => {
    const currentData = act1Data[act1Step];
    const optionsToRender = shuffledAct1Options.length > 0 ? shuffledAct1Options : currentData.options;

    return (
      <div className="flex flex-col items-center w-full max-w-3xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <p className="text-lg md:text-xl text-gray-600 font-bold">اختر الكلمة التي لا تنتمي للمجموعة</p>
        </div>

        <div className="flex gap-2 justify-center w-full" dir="rtl">
          {act1Data.map((_, idx) => (
            <div key={idx} className={`h-2 w-10 rounded-full transition-colors ${idx <= act1Step ? "bg-sky-500" : "bg-gray-200"}`} />
          ))}
        </div>

        <div className="bg-white p-10 md:p-14 rounded-3xl shadow-md border-2 border-sky-100 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" dir="rtl">
            {optionsToRender.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAct1OptionClick(opt)}
                className={`
                  text-3xl font-bold p-8 rounded-2xl bg-gray-50 border-4 border-gray-100 hover:border-sky-300 hover:bg-sky-50 hover:-translate-y-2 transition-all active:scale-95 outline-none shadow-sm text-gray-800 cursor-pointer
                  ${act1Feedback === "correct" && opt === currentData.correct ? "border-green-400 bg-green-100 text-green-800 scale-105" : ""}
                `}
              >
                {opt}
              </button>
            ))}
          </div>
          {act1Feedback === "wrong" && <div className="mt-8 text-red-500 font-bold text-xl md:text-2xl text-center animate-pulse">حاول مرة أخرى!</div>}
        </div>
      </div>
    );
  };

  const renderActivity2 = () => {
    return (
      <DndContext sensors={sensors} onDragEnd={handleDragEndAct2}>
        <div className="flex flex-col items-center w-full max-w-5xl mx-auto space-y-8" dir="rtl">
          <div className="text-center space-y-3">
            <p className="text-lg md:text-xl text-gray-700 font-bold">
              اسحب الصور إلى الصناديق لترتيبها بالتسلسل الصحيح من اليمين إلى اليسار 🧠
            </p>
          </div>

          <DroppablePool id="pool" items={act2Pool} isEmoji emojiMap={act2EmojiMap} />

          <div className="flex flex-row flex-wrap justify-center gap-3 sm:gap-5 mt-8 w-full" dir="rtl">
            {act2Slots.map((item, index) => (
              <DroppableSlot key={index} id={`slot-${index}`} index={index} itemKey={item} isWrong={act2WrongSlots.includes(index)} isSuccess={act2Success} isEmoji emojiMap={act2EmojiMap} />
            ))}
          </div>

          {act2Slots.every((s) => s !== null) && !act2Success && (
            <button
              onClick={checkAnswerAct2}
              className="mt-8 px-10 py-4 bg-sky-600 hover:bg-sky-700 text-white text-xl md:text-2xl font-bold rounded-full shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              تحقق من الإجابة ✅
            </button>
          )}

          {act2Success && (
            <div className="mt-8 px-8 py-4 bg-green-100 text-green-700 border-2 border-green-400 rounded-2xl text-xl md:text-2xl font-bold shadow-lg flex gap-3 items-center">
              <span>🎉</span> عمل رائع! لقد تذكرت التسلسل
            </div>
          )}
        </div>
      </DndContext>
    );
  };

  const getActivityTitle = () => {
    if (currentActivity === 1) return "النشاط 1: أين الكلمة المختلفة؟";
    if (currentActivity === 2) return "النشاط 2: تذكر الصور بالتسلسل";
    return "";
  };

  return (
    <SessionContainer
      title="الحصة 2: أين الصورة المختلفة"
      activityTitle={getActivityTitle()}
      isCompleted={currentActivity === 3}
      onRestart={handleResetSession}
      nextSessionPath={`/therapy/memory/session-3${childId ? `?childId=${childId}` : ""}`}
      childId={childId}
      programType="memory"
      currentSessionNumber={2}
    >
      <div className="w-full">
        {currentActivity === 1 && renderActivity1()}
        {currentActivity === 2 && renderActivity2()}
      </div>
    </SessionContainer>
  );
}

export default function MemorySession2() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans" dir="rtl">
          <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
        </div>
      }
    >
      <MemorySession2Content />
    </Suspense>
  );
}
