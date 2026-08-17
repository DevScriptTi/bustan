"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SessionContainer from "@/components/therapy/SessionContainer";
import { recordSessionCompletion } from "@/hooks/useProgressTracker";
import { playSound } from "@/utils/playSound";
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
  { word: "حلوى", options: ["🍬", "⚽", "🧺"], correct: "🍬", emoji: "🍬" },
  { word: "بيت", options: ["🧸", "🏠", "🪑"], correct: "🏠", emoji: "🏠" },
  { word: "طبيب", options: ["👮‍♂️", "👨‍🏫", "👨‍⚕️"], correct: "👨‍⚕️", emoji: "👨‍⚕️" },
  { word: "خزانة", options: ["🛏️", "🗄️", "🪑"], correct: "🗄️", emoji: "🗄️" },
  { word: "دب", options: ["🐰", "🐻", "🦊"], correct: "🐻", emoji: "🐻" },
];

const act2Data = [
  { sentence: "آكل حلوى لذيذة", options: ["النوم", "الأكل"], correct: "الأكل", emoji: "🍽️" },
  { sentence: "تأرجحت ليلى على الأرجوحة", options: ["اللعب", "الرياضة"], correct: "اللعب", emoji: "🎮" },
  { sentence: "أغسل وجهي", options: ["النظافة", "الدراسة"], correct: "النظافة", emoji: "🧼" },
  { sentence: "أذهب إلى المدرسة", options: ["الدراسة", "اللعب"], correct: "الدراسة", emoji: "📚" },
  { sentence: "أرتب غرفتي", options: ["النظام", "النظافة"], correct: "النظام", emoji: "🗂️" },
  { sentence: "يشرب خالد العصير", options: ["المشروب", "الأكل"], correct: "المشروب", emoji: "🧃" },
  { sentence: "أحب قراءة القصة", options: ["المطالعة", "الدراسة"], correct: "المطالعة", emoji: "📖" },
  { sentence: "ألعب كرة القدم", options: ["الرياضة", "اللعب"], correct: "الرياضة", emoji: "⚽" },
];

const act1EmojiMap = act1Data.reduce((acc, item) => ({ ...acc, [item.word]: item.emoji }), {} as Record<string, string>);
const act2EmojiMap = act2Data.reduce((acc, item) => ({ ...acc, [item.correct]: item.emoji }), {} as Record<string, string>);

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
      <span className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-6 h-6 sm:w-10 sm:h-10 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center text-xs sm:text-base font-bold text-gray-500 shadow-sm z-10">
        {index + 1}
      </span>
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

function MemorySession1Content() {
  const searchParams = useSearchParams();
  const childId = searchParams.get("childId");

  const [currentActivity, setCurrentActivity] = useState<1 | 2 | 3>(1);
  const [hasSavedProgress, setHasSavedProgress] = useState(false);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
  );

  // --- Activity 1 State ---
  const [act1Phase, setAct1Phase] = useState<1 | 2>(1);
  const [act1Step, setAct1Step] = useState(0);
  const [act1Feedback, setAct1Feedback] = useState<"correct" | "wrong" | null>(null);
  const [act1Success, setAct1Success] = useState(false);

  const [act1Pool, setAct1Pool] = useState<string[]>([]);
  const [act1Slots, setAct1Slots] = useState<(string | null)[]>([null, null, null, null, null]);
  const [act1WrongSlots, setAct1WrongSlots] = useState<number[]>([]);

  // --- Activity 2 State ---
  const [act2Phase, setAct2Phase] = useState<1 | 2>(1);
  const [act2Step, setAct2Step] = useState(0);
  const [act2Feedback, setAct2Feedback] = useState<"correct" | "wrong" | null>(null);

  const [act2Pool, setAct2Pool] = useState<string[]>([]);
  const [act2Slots, setAct2Slots] = useState<(string | null)[]>([null, null, null, null, null, null, null, null]);
  const [act2WrongSlots, setAct2WrongSlots] = useState<number[]>([]);
  const [act2Success, setAct2Success] = useState(false);

  // --- Save Progress when Session Finishes ---
  useEffect(() => {
    if (currentActivity === 3 && childId && !hasSavedProgress) {
      setHasSavedProgress(true);
      recordSessionCompletion(childId, "memory", "جلسة الذاكرة 1", 5, 1).catch((error) => {
        console.error("Failed to save progress:", error);
      });
    }
  }, [currentActivity, childId, hasSavedProgress]);

  // --- Global Reset ---
  const handleResetSession = () => {
    setCurrentActivity(1);
    setAct1Phase(1);
    setAct1Step(0);
    setAct1Feedback(null);
    setAct1Success(false);
    setAct1Pool([]);
    setAct1Slots([null, null, null, null, null]);
    setAct1WrongSlots([]);

    setAct2Phase(1);
    setAct2Step(0);
    setAct2Feedback(null);
    setAct2Pool([]);
    setAct2Slots([null, null, null, null, null, null, null, null]);
    setAct2WrongSlots([]);
    setAct2Success(false);
    setHasSavedProgress(false);
  };

  // --- Handlers for Activity 1 ---
  const handleAct1OptionClick = (option: string) => {
    if (act1Feedback) return;
    playSound("pop");

    if (option === act1Data[act1Step].correct) {
      playSound("sparkle");
      setAct1Feedback("correct");
      setTimeout(() => {
        setAct1Feedback(null);
        if (act1Step < act1Data.length - 1) {
          setAct1Step(act1Step + 1);
        } else {
          const targetWords = act1Data.map((item) => item.word);
          const scrambled = [...targetWords].sort(() => Math.random() - 0.5);
          setAct1Pool(scrambled);
          setAct1Phase(2);
        }
      }, 800);
    } else {
      playSound("boop");
      setAct1Feedback("wrong");
      setTimeout(() => setAct1Feedback(null), 800);
    }
  };

  const handleDragEndAct1 = (event: DragEndEvent) => {
    const { active, over } = event;
    setAct1WrongSlots([]);
    if (!over) return;

    const activeItem = active.id as string;
    if (!activeItem) return;

    const overId = over.id as string;
    const sourceIsPool = act1Pool.includes(activeItem);
    const sourceSlotIndex = act1Slots.indexOf(activeItem);

    if (overId.startsWith("slot-")) {
      const targetSlotIndex = parseInt(overId.split("-")[1]);
      const newPool = [...act1Pool];
      const newSlots = [...act1Slots];

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
      setAct1Slots(newSlots);
    } else if (overId === "pool") {
      if (!sourceIsPool) {
        const newPool = [...act1Pool, activeItem];
        const newSlots = [...act2Slots];
        newSlots[sourceSlotIndex] = null;
        setAct1Pool(newPool);
        setAct1Slots(newSlots);
      }
    }
  };

  const checkAnswerAct1 = () => {
    const correctWords = act1Data.map((d) => d.word);
    const wrongs: number[] = [];
    act1Slots.forEach((slot, index) => {
      if (slot !== correctWords[index]) wrongs.push(index);
    });

    if (wrongs.length === 0 && act1Slots.every((s) => s !== null)) {
      playSound("sparkle");
      setAct1Success(true);
      setTimeout(() => setCurrentActivity(2), 2000);
    } else {
      playSound("boop");
      setAct1WrongSlots(wrongs);
    }
  };

  // --- Handlers for Activity 2 ---
  const handleAct2OptionClick = (option: string) => {
    if (act2Feedback) return;
    playSound("pop");

    if (option === act2Data[act2Step].correct) {
      playSound("sparkle");
      setAct2Feedback("correct");
      setTimeout(() => {
        setAct2Feedback(null);
        if (act2Step < act2Data.length - 1) {
          setAct2Step(act2Step + 1);
        } else {
          const targetWords = act2Data.map((item) => item.correct);
          const scrambled = [...targetWords].sort(() => Math.random() - 0.5);
          setAct2Pool(scrambled);
          setAct2Phase(2);
        }
      }, 800);
    } else {
      playSound("boop");
      setAct2Feedback("wrong");
      setTimeout(() => setAct2Feedback(null), 800);
    }
  };

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

      setAct2Pool(newPool);
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

  const checkAnswerAct2 = () => {
    const correctWords = act2Data.map((d) => d.correct);
    const wrongs: number[] = [];
    act2Slots.forEach((slot, index) => {
      if (slot !== correctWords[index]) wrongs.push(index);
    });

    if (wrongs.length === 0 && act2Slots.every((s) => s !== null)) {
      playSound("sparkle");
      setAct2Success(true);
      setTimeout(() => setCurrentActivity(3), 1500);
    } else {
      playSound("boop");
      setAct2WrongSlots(wrongs);
    }
  };

  // --- Renders ---
  const renderActivity1 = () => {
    if (act1Phase === 1) {
      const currentData = act1Data[act1Step];
      return (
        <div className="flex flex-col items-center w-full max-w-3xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <p className="text-lg md:text-xl text-gray-600">اختر الصورة المناسبة للكلمة</p>
          </div>

          <div className="flex gap-2 justify-center w-full" dir="rtl">
            {act1Data.map((_, idx) => (
              <div key={idx} className={`h-2 w-10 rounded-full transition-colors ${idx <= act1Step ? "bg-sky-500" : "bg-gray-200"}`} />
            ))}
          </div>

          <div className="bg-white p-10 md:p-14 rounded-3xl shadow-md border-2 border-sky-100 w-full text-center">
            <h3 className="text-4xl md:text-6xl font-extrabold text-sky-900 mb-10">{currentData.word}</h3>
            <div className="flex justify-center gap-4 sm:gap-8 flex-wrap" dir="rtl">
              {currentData.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAct1OptionClick(opt)}
                  className={`
                    text-6xl sm:text-7xl md:text-8xl aspect-square flex items-center justify-center p-4 rounded-3xl bg-gray-50 border-4 border-gray-100 hover:border-sky-300 hover:bg-sky-50 hover:-translate-y-2 transition-all active:scale-95 outline-none shadow-sm
                    ${act1Feedback === "correct" && opt === currentData.correct ? "border-green-400 bg-green-100 scale-105" : ""}
                  `}
                >
                  {opt}
                </button>
              ))}
            </div>
            {act1Feedback === "wrong" && <div className="mt-8 text-red-500 font-bold text-xl md:text-2xl animate-pulse">حاول مرة أخرى!</div>}
          </div>
        </div>
      );
    } else {
      return (
        <DndContext sensors={sensors} onDragEnd={handleDragEndAct1}>
          <div className="flex flex-col items-center w-full max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <p className="text-lg md:text-xl text-gray-600">اسحب الصور إلى الصناديق بنفس ترتيب ظهورها الأول.</p>
            </div>

            <DroppablePool id="pool" items={act1Pool} isEmoji emojiMap={act1EmojiMap} />

            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-8 w-full" dir="rtl">
              {act1Slots.map((item, index) => (
                <DroppableSlot key={index} id={`slot-${index}`} index={index} itemKey={item} isWrong={act1WrongSlots.includes(index)} isSuccess={act1Success} isEmoji emojiMap={act1EmojiMap} />
              ))}
            </div>

            {act1Slots.every((s) => s !== null) && !act1Success && (
              <button
                onClick={checkAnswerAct1}
                className="mt-8 px-10 py-4 bg-sky-500 hover:bg-sky-600 text-white text-xl md:text-2xl font-bold rounded-full shadow-lg transition-transform active:scale-95"
              >
                تحقق من الإجابة ✅
              </button>
            )}

            {act1Success && (
              <div className="mt-8 px-8 py-4 bg-green-100 text-green-700 border-2 border-green-400 rounded-2xl text-xl md:text-2xl font-bold shadow-lg flex gap-3 items-center">
                <span>🎉</span> أحسنت! الترتيب صحيح تماماً
              </div>
            )}
          </div>
        </DndContext>
      );
    }
  };

  const renderActivity2 = () => {
    if (act2Phase === 1) {
      const currentData = act2Data[act2Step];
      return (
        <div className="flex flex-col items-center w-full max-w-3xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <p className="text-lg md:text-xl text-gray-600">اختر الكلمة المناسبة التي تعبر عن الجملة</p>
          </div>

          <div className="flex gap-2 justify-center w-full" dir="rtl">
            {act2Data.map((_, idx) => (
              <div key={idx} className={`h-2 w-6 sm:w-8 rounded-full transition-colors ${idx <= act2Step ? "bg-sky-500" : "bg-gray-200"}`} />
            ))}
          </div>

          <div className="bg-white p-10 md:p-14 rounded-3xl shadow-md border-2 border-sky-100 w-full text-center">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-sky-900 mb-10 leading-snug">{currentData.sentence}</h3>
            <div className="flex justify-center gap-4 sm:gap-6 flex-wrap" dir="rtl">
              {currentData.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAct2OptionClick(opt)}
                  className={`
                    text-2xl sm:text-3xl font-bold px-8 py-6 rounded-2xl bg-sky-50 text-sky-800 border-4 border-sky-100 hover:border-sky-400 hover:bg-sky-100 hover:-translate-y-1 transition-all active:scale-95 outline-none shadow-sm min-w-[140px]
                    ${act2Feedback === "correct" && opt === currentData.correct ? "border-green-400 bg-green-100 text-green-800 scale-105" : ""}
                  `}
                >
                  {opt}
                </button>
              ))}
            </div>
            {act2Feedback === "wrong" && <div className="mt-8 text-red-500 font-bold text-xl md:text-2xl animate-pulse">حاول مرة أخرى!</div>}
          </div>
        </div>
      );
    } else {
      return (
        <DndContext sensors={sensors} onDragEnd={handleDragEndAct2}>
          <div className="flex flex-col items-center w-full max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <p className="text-lg md:text-xl text-gray-600">اسحب الصور ورتبها بنفس التسلسل الذي ظهرت به مع الجمل.</p>
            </div>

            <DroppablePool id="pool" items={act2Pool} isEmoji emojiMap={act2EmojiMap} />

            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-8 w-full" dir="rtl">
              {act2Slots.map((item, index) => (
                <DroppableSlot key={index} id={`slot-${index}`} index={index} itemKey={item} isWrong={act2WrongSlots.includes(index)} isSuccess={act2Success} isEmoji emojiMap={act2EmojiMap} />
              ))}
            </div>

            {act2Slots.every((s) => s !== null) && !act2Success && (
              <button
                onClick={checkAnswerAct2}
                className="mt-8 px-10 py-4 bg-sky-500 hover:bg-sky-600 text-white text-xl md:text-2xl font-bold rounded-full shadow-lg transition-transform active:scale-95"
              >
                تحقق من الإجابة ✅
              </button>
            )}

            {act2Success && (
              <div className="mt-8 px-8 py-4 bg-green-100 text-green-700 border-2 border-green-400 rounded-2xl text-xl md:text-2xl font-bold shadow-lg flex gap-3 items-center">
                <span>🎉</span> أحسنت! ترتيب الصور صحيح
              </div>
            )}
          </div>
        </DndContext>
      );
    }
  };

  const getActivityTitle = () => {
    if (currentActivity === 1) {
      return act1Phase === 1 ? "النشاط 1: التعرف على الكلمة" : "النشاط 1: استرجاع الترتيب";
    }
    if (currentActivity === 2) {
      return act2Phase === 1 ? "النشاط 2: التعرف على الكلمة الهدف" : "النشاط 2: ترتيب الأهداف";
    }
    return "";
  };

  return (
    <SessionContainer
      title="الحصة 1: تحديد هوية الكلمة"
      activityTitle={getActivityTitle()}
      isCompleted={currentActivity === 3}
      onRestart={handleResetSession}
      nextSessionPath={`/therapy/memory/session-2${childId ? `?childId=${childId}` : ""}`}
      childId={childId}
      programType="memory"
      currentSessionNumber={1}
    >
      <div className="w-full">
        {currentActivity === 1 && renderActivity1()}
        {currentActivity === 2 && renderActivity2()}
      </div>
    </SessionContainer>
  );
}

export default function MemorySession1() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans" dir="rtl">
          <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
        </div>
      }
    >
      <MemorySession1Content />
    </Suspense>
  );
}
