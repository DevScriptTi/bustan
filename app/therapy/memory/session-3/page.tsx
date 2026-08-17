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
  { word: "شرطي", emoji: "👮‍♂️" },
  { word: "ممرض", emoji: "👨‍⚕️" },
  { word: "مسجد", emoji: "🕌" },
  { word: "دمية", emoji: "🧸" },
  { word: "ارنب", emoji: "🐰" },
];

const act2Sequence = ["أسد", "دب", "ارنب", "قط", "خروف"];

const act2EmojiMap: Record<string, string> = {
  "أسد": "🦁",
  "دب": "🐻",
  "ارنب": "🐰",
  "قط": "🐱",
  "خروف": "🐑",
};


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

export default function MemorySession3() {
  const [currentActivity, setCurrentActivity] = useState<1 | 2 | 3>(1);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
  );

  // --- Activity 1 State (Visual Match) ---
  const [act1Words, setAct1Words] = useState<string[]>([]);
  const [act1Emojis, setAct1Emojis] = useState<string[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [wrongMatch, setWrongMatch] = useState<string | null>(null);

  useEffect(() => {
    if (currentActivity === 1 && act1Words.length === 0) {
      setAct1Words([...act1Data.map(d => d.word)].sort(() => Math.random() - 0.5));
      setAct1Emojis([...act1Data.map(d => d.emoji)].sort(() => Math.random() - 0.5));
    }
  }, [currentActivity]);

  // --- Activity 2 State ---
  const [act2Phase, setAct2Phase] = useState<1 | 2>(1);
  const [act2Step, setAct2Step] = useState(0); // 0 to 4 for the 5 animals
  const [act2Phase1Feedback, setAct2Phase1Feedback] = useState<"correct" | "wrong" | null>(null);

  // Act 2 DnD State
  const [act2Pool, setAct2Pool] = useState<string[]>([]);
  const [act2Slots, setAct2Slots] = useState<(string | null)[]>([null, null, null, null, null]);
  const [act2WrongSlots, setAct2WrongSlots] = useState<number[]>([]);
  const [act2Success, setAct2Success] = useState(false);

  // Phase 1 emojis array (always shuffled for each step)
  const [phase1Options, setPhase1Options] = useState<string[]>([]);

  useEffect(() => {
    // Only populate initially
    if (currentActivity === 2 && act2Phase === 1 && phase1Options.length === 0 && act2Step === 0) {
      setPhase1Options([...act2Sequence].sort(() => Math.random() - 0.5));
    }
  }, [currentActivity, act2Phase, act2Step]);


  // --- Global Reset ---
  const handleResetSession = () => {
    setCurrentActivity(1);
    
    // Reset Act 1
    setMatchedPairs([]);
    setSelectedWord(null);
    setWrongMatch(null);
    setAct1Words([...act1Data.map(d => d.word)].sort(() => Math.random() - 0.5));
    setAct1Emojis([...act1Data.map(d => d.emoji)].sort(() => Math.random() - 0.5));

    // Reset Act 2
    setAct2Phase(1);
    setAct2Step(0);
    setPhase1Options([]); // Will trigger useEffect to repopulate
    setAct2Phase1Feedback(null);
    setAct2Pool([]);
    setAct2Slots([null, null, null, null, null]);
    setAct2WrongSlots([]);
    setAct2Success(false);
  };

  // --- Handlers for Activity 1 ---
  const handleWordClick = (word: string) => {
    if (matchedPairs.includes(word)) return;
    setSelectedWord(word === selectedWord ? null : word);
    setWrongMatch(null);
  };

  const handleEmojiClick = (emoji: string) => {
    if (!selectedWord) return;

    const correctData = act1Data.find(d => d.word === selectedWord);
    if (correctData && correctData.emoji === emoji) {
      const newMatched = [...matchedPairs, selectedWord];
      setMatchedPairs(newMatched);
      setSelectedWord(null);
      setWrongMatch(null);

      if (newMatched.length === act1Data.length) {
        setTimeout(() => setCurrentActivity(2), 1500);
      }
    } else {
      setWrongMatch(emoji);
      setTimeout(() => setWrongMatch(null), 1000);
    }
  };

  // --- Handlers for Activity 2 Phase 1 ---
  const handleAct2OptionClick = (name: string) => {
    if (act2Phase1Feedback) return;

    const targetAnimal = act2Sequence[act2Step];

    if (name === targetAnimal) {
      setAct2Phase1Feedback("correct");
      setTimeout(() => {
        setAct2Phase1Feedback(null);
        
        // Elimination Logic: Remove the correctly identified animal from the grid options
        setPhase1Options(prev => prev.filter(opt => opt !== targetAnimal));

        if (act2Step < act2Sequence.length - 1) {
          setAct2Step(prev => prev + 1);
        } else {
          // Move to Phase 2
          setAct2Pool([...act2Sequence].sort(() => Math.random() - 0.5));
          setAct2Phase(2);
        }
      }, 1000);
    } else {
      setAct2Phase1Feedback("wrong");
      setTimeout(() => setAct2Phase1Feedback(null), 800);
    }
  };

  // --- Handlers for Activity 2 Phase 2 ---
  const handleDragEndAct2 = (event: DragEndEvent) => {
    const { active, over } = event;
    setAct2WrongSlots([]); // clear errors
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
      if (slot !== act2Sequence[index]) wrongs.push(index);
    });

    if (wrongs.length === 0 && act2Slots.every((s) => s !== null)) {
      setAct2Success(true);
      setTimeout(() => setCurrentActivity(3), 2000);
    } else {
      setAct2WrongSlots(wrongs);
    }
  };

  // --- Renders ---
  const renderActivity1 = () => (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto space-y-10">
      <div className="text-center space-y-3">
        <p className="text-lg md:text-xl text-gray-600">اختر الكلمة ثم اضغط على الصورة المناسبة لها!</p>
      </div>

      <div className="grid grid-cols-2 gap-8 md:gap-16 w-full mt-6" dir="rtl">
        {/* Words Column */}
        <div className="space-y-4">
          <h3 className="text-xl md:text-2xl font-bold text-gray-700 text-center mb-6">الكلمات</h3>
          {act1Words.map((word) => {
            const isMatched = matchedPairs.includes(word);
            const isSelected = selectedWord === word;
            return (
              <button
                key={word}
                onClick={() => handleWordClick(word)}
                disabled={isMatched}
                className={`
                  w-full py-5 text-center rounded-2xl border-2 transition-all duration-200 text-2xl md:text-3xl font-bold outline-none
                  ${isMatched ? "bg-gray-100 border-gray-200 text-gray-400 opacity-50 scale-95" : "bg-white hover:-translate-y-1 hover:shadow-md cursor-pointer text-sky-900"}
                  ${isSelected ? "border-sky-500 ring-4 ring-sky-200 bg-sky-50 shadow-md scale-105 z-10" : "border-gray-200"}
                `}
              >
                {word}
                {isMatched && <span className="absolute left-4 text-green-500">✓</span>}
              </button>
            );
          })}
        </div>

        {/* Emojis Column */}
        <div className="space-y-4">
          <h3 className="text-xl md:text-2xl font-bold text-gray-700 text-center mb-6">الصور</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {act1Emojis.map((emoji, idx) => {
              // check if this emoji's corresponding word is matched
              const correspondingWord = act1Data.find(d => d.emoji === emoji)?.word;
              const isMatched = !!correspondingWord && matchedPairs.includes(correspondingWord);
              const isWrong = wrongMatch === emoji;

              return (
                <button
                  key={idx}
                  onClick={() => handleEmojiClick(emoji)}
                  disabled={!selectedWord || isMatched}
                  className={`
                    w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center text-5xl sm:text-7xl rounded-3xl border-4 transition-all duration-300 outline-none
                    ${isMatched ? "bg-green-50 border-green-300 opacity-50 scale-95" : "bg-white border-gray-200"}
                    ${!isMatched && selectedWord ? "hover:border-sky-300 hover:scale-105 cursor-pointer shadow-sm" : ""}
                    ${isWrong ? "bg-red-50 border-red-400 animate-pulse" : ""}
                  `}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderActivity2 = () => {
    if (act2Phase === 1) {
      const targetAnimal = act2Sequence[act2Step];
      return (
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <p className="text-lg md:text-xl text-gray-600">أين هو <span className="font-extrabold text-2xl md:text-3xl text-sky-900">{targetAnimal}</span>؟</p>
          </div>

          <div className="flex gap-2 justify-center w-full" dir="rtl">
            {act2Sequence.map((_, idx) => (
              <div key={idx} className={`h-2 w-10 sm:w-12 rounded-full transition-colors ${idx <= act2Step ? "bg-sky-500" : "bg-gray-200"}`} />
            ))}
          </div>

          <div className="bg-white p-10 md:p-14 rounded-3xl shadow-md border-2 border-sky-100 w-full text-center min-h-[400px]">
            <h3 className="text-5xl md:text-7xl font-extrabold text-sky-900 mb-12">{targetAnimal}</h3>
            
            <div className="flex flex-wrap justify-center gap-6 transition-all duration-500" dir="rtl">
              {phase1Options.map((opt, idx) => (
                <button
                  key={opt}
                  onClick={() => handleAct2OptionClick(opt)}
                  className={`
                    text-6xl sm:text-7xl md:text-8xl w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center rounded-3xl bg-gray-50 border-4 border-gray-100 hover:border-sky-300 hover:bg-sky-50 hover:-translate-y-2 transition-all active:scale-95 outline-none shadow-sm animate-in zoom-in duration-300
                    ${act2Phase1Feedback === "correct" && opt === targetAnimal ? "border-green-400 bg-green-100 scale-110 opacity-0" : ""}
                  `}
                >
                  {act2EmojiMap[opt]}
                </button>
              ))}
            </div>

            {act2Phase1Feedback === "wrong" && (
              <div className="mt-10 text-red-500 font-bold text-xl md:text-2xl animate-pulse">
                حاول مرة أخرى!
              </div>
            )}
          </div>
        </div>
      );
    } else {
      return (
        <DndContext sensors={sensors} onDragEnd={handleDragEndAct2}>
          <div className="flex flex-col items-center w-full max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <p className="text-lg md:text-xl text-gray-600">اسحب الحيوانات إلى الصناديق لترتيبها بالتسلسل الصحيح (1 إلى 5).</p>
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
                <span>🎉</span> أحسنت! ترتيب الحيوانات صحيح
              </div>
            )}
          </div>
        </DndContext>
      );
    }
  };

  
  
  const getActivityTitle = () => {
    if (currentActivity === 1) return "النشاط 1: الربط البصري";
    if (currentActivity === 2) {
      return act2Phase === 1 ? "النشاط 2: التعرف على الحيوانات" : "النشاط 2: استرجاع الترتيب";
    }
    return "";
  };

    return (
    <SessionContainer
      title="الحصة 3: الربط البصري والتعرف على الحيوانات"
      activityTitle={getActivityTitle()}
      isCompleted={currentActivity === 3}
      onRestart={handleResetSession}
      nextSessionPath="/therapy/memory/session-4"
    >
      <div className="w-full">
        {currentActivity === 1 && renderActivity1()}
        {currentActivity === 2 && renderActivity2()}
      </div>
    </SessionContainer>
  );
}

