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
} from "@dnd-kit/core";

// --- Data ---
const act1Data = [
  { sentence: "أمشي شعري بـ...", options: ["شعري", "المشط"], correct: "المشط" },
  { sentence: "أكتب دروسي بـ...", options: ["بالقلم", "بالكتاب"], correct: "بالقلم" },
  { sentence: "عندما أمرض أتناول...", options: ["الدواء", "الطبيب"], correct: "الدواء" },
  { sentence: "أشاهد برامج على...", options: ["الحاسوب", "التلفاز"], correct: "التلفاز" },
  { sentence: "أشتري الحليب من عند...", options: ["البقال", "الدكان"], correct: "البقال" },
];

const act2CorrectSequence = ["المشط", "بالقلم", "الدواء", "التلفاز", "البقال"];

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
         ${isEmoji ? "w-20 h-24 sm:w-28 sm:h-32" : "px-6 py-4 text-xl sm:text-2xl text-sky-900"}
         ${isDragging ? "opacity-90 ring-4 ring-sky-400 shadow-2xl scale-105" : "hover:-translate-y-1 hover:shadow-md"}
      `}
    >
      <span>{label}</span>
    </div>
  );
}

function DroppableSlot({ id, index, itemKey, isWrong, isSuccess, isEmoji = false }: { id: string; index: number; itemKey: string | null; isWrong: boolean; isSuccess?: boolean; isEmoji?: boolean }) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`relative flex flex-col items-center justify-center p-3 rounded-3xl border-4 min-w-[120px] min-h-[100px] sm:min-w-[160px] sm:min-h-[120px] transition-all 
      ${isOver ? "border-sky-500 bg-sky-50 scale-105" : "border-dashed border-gray-300 bg-white/50"}
      ${isWrong ? "bg-red-50 border-red-300 animate-pulse" : ""}
      ${isSuccess ? "border-green-400 bg-green-50" : ""}
    `}
    >
      <span className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-6 h-6 sm:w-10 sm:h-10 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center text-xs sm:text-base font-bold text-gray-500 shadow-sm z-10">
        {index + 1}
      </span>
      {itemKey ? <DraggableItem id={itemKey} label={itemKey} isEmoji={isEmoji} /> : <span className="text-gray-300 text-3xl sm:text-4xl opacity-50">📥</span>}
    </div>
  );
}

function DroppablePool({ id, items, isEmoji = false }: { id: string; items: string[]; isEmoji?: boolean }) {
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
          return <DraggableItem key={itemKey} id={itemKey} label={itemKey} isEmoji={isEmoji} />;
        })
      )}
    </div>
  );
}

export default function MemorySession6() {
  const [currentActivity, setCurrentActivity] = useState<1 | 2 | 3>(1);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
  );

  // --- Phase 1 State ---
  const [act1Step, setAct1Step] = useState(0);
  const [act1Feedback, setAct1Feedback] = useState<"correct" | "wrong" | null>(null);

  // --- Phase 2 State (DnD) ---
  const [act2Pool, setAct2Pool] = useState<string[]>([]);
  const [act2Slots, setAct2Slots] = useState<(string | null)[]>([null, null, null, null, null]);
  const [act2WrongSlots, setAct2WrongSlots] = useState<number[]>([]);
  const [act2Success, setAct2Success] = useState(false);

  // Initialize Act 2 pool when moving to it
  useEffect(() => {
    if (currentActivity === 2 && act2Pool.length === 0 && act2Slots.every(s => s === null)) {
      setAct2Pool([...act2CorrectSequence].sort(() => Math.random() - 0.5));
    }
  }, [currentActivity]);

  // --- Global Reset ---
  const handleResetSession = () => {
    setCurrentActivity(1);
    setAct1Step(0);
    setAct1Feedback(null);
    setAct2Pool([]);
    setAct2Slots([null, null, null, null, null]);
    setAct2WrongSlots([]);
    setAct2Success(false);
  };

  // --- Handlers for Phase 1 ---
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

  // --- Handlers for Phase 2 ---
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
    const wrongs: number[] = [];
    act2Slots.forEach((slot, index) => {
      if (slot !== act2CorrectSequence[index]) wrongs.push(index);
    });

    if (wrongs.length === 0 && act2Slots.every((s) => s !== null)) {
      setAct2Success(true);
      setTimeout(() => setCurrentActivity(3), 2000);
    } else {
      setAct2WrongSlots(wrongs);
    }
  };

  // --- Renders ---
  const renderActivity1 = () => {
    const currentData = act1Data[act1Step];
    return (
      <div className="flex flex-col items-center w-full max-w-3xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <p className="text-lg md:text-xl text-gray-600">اختر الكلمة المناسبة لتكملة الجملة</p>
        </div>

        <div className="flex gap-2 justify-center w-full" dir="rtl">
          {act1Data.map((_, idx) => (
            <div key={idx} className={`h-2 w-10 rounded-full transition-colors ${idx <= act1Step ? "bg-sky-500" : "bg-gray-200"}`} />
          ))}
        </div>

        <div className="bg-white p-10 md:p-14 rounded-3xl shadow-md border-2 border-sky-100 w-full text-center">
          <h3 className="text-3xl md:text-4xl font-extrabold text-sky-900 mb-10 leading-snug" dir="rtl">{currentData.sentence}</h3>
          <div className="flex justify-center gap-6 flex-wrap" dir="rtl">
            {currentData.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAct1OptionClick(opt)}
                className={`
                  text-2xl font-bold px-10 py-6 rounded-2xl bg-sky-50 text-sky-800 border-4 border-sky-100 hover:border-sky-400 hover:bg-sky-100 hover:-translate-y-1 transition-all active:scale-95 outline-none shadow-sm min-w-[160px]
                  ${act1Feedback === "correct" && opt === currentData.correct ? "border-green-400 bg-green-100 text-green-800 scale-105" : ""}
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
  };

  const renderActivity2 = () => {
    return (
      <DndContext sensors={sensors} onDragEnd={handleDragEndAct2}>
        <div className="flex flex-col items-center w-full max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <p className="text-lg md:text-xl text-gray-600">اسحب الكلمات ورتبها بالترتيب الصحيح لظهورها في الجمل السابقة (من 1 إلى 5).</p>
          </div>

          <DroppablePool id="pool" items={act2Pool} />

          <div className="flex flex-wrap justify-center gap-4 mt-8 w-full" dir="rtl">
            {act2Slots.map((item, index) => (
              <DroppableSlot key={index} id={`slot-${index}`} index={index} itemKey={item} isWrong={act2WrongSlots.includes(index)} isSuccess={act2Success} />
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
              <span>🎉</span> عمل رائع! لقد رتبت الكلمات بالترتيب الصحيح
            </div>
          )}
        </div>
      </DndContext>
    );
  };

  
  
  const getActivityTitle = () => {
    if (currentActivity === 1) return "النشاط 1: تذكرتها";
    if (currentActivity === 2) return "النشاط 2: ترتيب الكلمات";
    return "";
  };

    return (
    <SessionContainer
      title="الحصة 6: الترميز والتنظيم"
      activityTitle={getActivityTitle()}
      isCompleted={currentActivity === 3}
      onRestart={handleResetSession}
      nextSessionPath="/therapy/memory/session-7"
    >
      <div className="w-full">
        {currentActivity === 1 && renderActivity1()}
        {currentActivity === 2 && renderActivity2()}
      </div>
    </SessionContainer>
  );
}

