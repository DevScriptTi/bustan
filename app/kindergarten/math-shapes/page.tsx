"use client";

import { useState } from "react";
import Link from "next/link";
import MainNavbar from "@/components/MainNavbar";
import { playSound } from "@/utils/playSound";
import { ArrowLeft, CheckCircle2, RefreshCw, Star, Sparkles, Trophy, Palette, Delete, Check } from "lucide-react";

interface TargetTask {
  targetShape: "triangle" | "circle" | "square";
  targetName: string;
  targetCount: number;
}

export default function MathShapesGame() {
  const [activeTab, setActiveTab] = useState<"countInput" | "targetedColor" | "sequence">("countInput");
  const [stars, setStars] = useState(0);

  // 1. COUNT & WRITE WITH NUMPAD INPUT
  const [countIdx, setCountIdx] = useState(0);
  const countQuestions = [
    { items: ["🍎", "🍎", "🍎", "🍎"], correct: "4", label: "عد التفاحات واكتب الرقم المناسب 🍎" },
    { items: ["⭐️", "⭐️", "⭐️"], correct: "3", label: "عد النجوم واكتب الرقم المناسب ⭐️" },
    { items: ["🚗", "🚗"], correct: "2", label: "عد السيارات واكتب الرقم المناسب 🚗" },
    { items: ["🎈", "🎈", "🎈", "🎈", "🎈"], correct: "5", label: "عد البالونات واكتب الرقم المناسب 🎈" },
  ];
  const [typedInput, setTypedInput] = useState("");
  const [inputFeedback, setInputFeedback] = useState<boolean | null>(null);

  const handleNumpadPress = (val: string) => {
    playSound("pop");
    if (typedInput.length < 2) {
      setTypedInput((prev) => prev + val);
    }
  };

  const handleNumpadClear = () => {
    playSound("pop");
    setTypedInput("");
  };

  const handleNumpadSubmit = () => {
    const q = countQuestions[countIdx];
    if (typedInput === q.correct) {
      playSound("cheer");
      setInputFeedback(true);
      setStars((prev) => prev + 1);

      setTimeout(() => {
        setInputFeedback(null);
        setTypedInput("");
        if (countIdx < countQuestions.length - 1) {
          setCountIdx((prev) => prev + 1);
        }
      }, 1200);
    } else {
      playSound("boop");
      setInputFeedback(false);
      setTimeout(() => setInputFeedback(null), 1000);
    }
  };

  // 2. TARGETED COLORING CHALLENGE
  const targetTasks: TargetTask[] = [
    { targetShape: "triangle", targetName: "مثلثات 🔺", targetCount: 3 },
    { targetShape: "circle", targetName: "دوائر 🔴", targetCount: 2 },
    { targetShape: "square", targetName: "مربعات 🟦", targetCount: 2 },
  ];
  const [taskIdx, setTaskIdx] = useState(0);
  const currentTask = targetTasks[taskIdx];

  const initialGridShapes = [
    { id: "s1", type: "triangle", color: "" },
    { id: "s2", type: "circle", color: "" },
    { id: "s3", type: "triangle", color: "" },
    { id: "s4", type: "square", color: "" },
    { id: "s5", type: "triangle", color: "" },
    { id: "s6", type: "circle", color: "" },
    { id: "s7", type: "square", color: "" },
    { id: "s8", type: "triangle", color: "" },
  ];
  const [gridShapes, setGridShapes] = useState(initialGridShapes);
  const [colorFeedback, setColorFeedback] = useState<string | null>(null);

  const handleColorShape = (id: string, type: string) => {
    if (type !== currentTask.targetShape) {
      playSound("boop");
      setColorFeedback("انتبه! هذا ليس الشكل المطلوب ❌");
      setTimeout(() => setColorFeedback(null), 1000);
      return;
    }

    // Check count of target shape currently colored
    const currentlyColored = gridShapes.filter((s) => s.type === currentTask.targetShape && s.color !== "").length;

    if (currentlyColored >= currentTask.targetCount) {
      playSound("boop");
      setColorFeedback("لقد قمت بتلوين العدد المطلوب بالفعل! 🛑");
      setTimeout(() => setColorFeedback(null), 1000);
      return;
    }

    playSound("pop");
    const updated = gridShapes.map((s) => (s.id === id ? { ...s, color: "#3B82F6" } : s));
    setGridShapes(updated);

    const newColoredCount = updated.filter((s) => s.type === currentTask.targetShape && s.color !== "").length;

    if (newColoredCount === currentTask.targetCount) {
      playSound("cheer");
      setStars((prev) => prev + 1);
      setColorFeedback("إنجاز رائع! قمت بتلوين العدد المطلوب بنجاح ⭐🎉");
    }
  };

  const resetTargetedColor = () => {
    playSound("pop");
    setGridShapes(initialGridShapes);
    setColorFeedback(null);
  };

  const nextColorTask = () => {
    playSound("pop");
    if (taskIdx < targetTasks.length - 1) {
      setTaskIdx((prev) => prev + 1);
      resetTargetedColor();
    }
  };

  // 3. SEQUENCE PATTERN
  const [seqIdx, setSeqIdx] = useState(0);
  const sequenceQuestions = [
    { series: ["🔴", "🟦", "🔺", "🔴", "🟦"], correct: "🔺", options: ["🔴", "🟦", "🔺"] },
    { series: ["⭐️", "⭐️", "🎈", "⭐️", "⭐️"], correct: "🎈", options: ["⭐️", "🎈", "🚗"] },
    { series: ["🚗", "🚗", "🍎", "🚗", "🚗"], correct: "🍎", options: ["🍎", "🚗", "⭐️"] },
  ];
  const [seqFeedback, setSeqFeedback] = useState<boolean | null>(null);

  const handleSeqAnswer = (ans: string) => {
    const q = sequenceQuestions[seqIdx];
    if (ans === q.correct) {
      playSound("cheer");
      setSeqFeedback(true);
      setStars((prev) => prev + 1);

      setTimeout(() => {
        setSeqFeedback(null);
        if (seqIdx < sequenceQuestions.length - 1) {
          setSeqIdx((prev) => prev + 1);
        }
      }, 1200);
    } else {
      playSound("boop");
      setSeqFeedback(false);
      setTimeout(() => setSeqFeedback(null), 800);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col justify-between" dir="rtl">
      <MainNavbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 pt-20 sm:pt-24 pb-8 space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <Link
              href="/kindergarten"
              onClick={() => playSound("pop")}
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <ArrowLeft size={20} className="rotate-180" />
            </Link>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800">تحديات الأرقام والتلوين المستهدف 🔢🎨</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-bold">روضة بستان المتقدمة</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-200">
            <Star className="text-amber-500 fill-amber-400" size={20} />
            <span className="font-black text-amber-900 text-base">{stars} نجوم</span>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex items-center justify-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <button
            onClick={() => { playSound("pop"); setActiveTab("countInput"); }}
            className={`px-5 py-3 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === "countInput"
                ? "bg-teal-600 text-white shadow-md"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            1️⃣ العد والكتابة لوحة الأرقام
          </button>
          <button
            onClick={() => { playSound("pop"); setActiveTab("targetedColor"); }}
            className={`px-5 py-3 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === "targetedColor"
                ? "bg-purple-600 text-white shadow-md"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            2️⃣ تحدي التلوين المستهدف
          </button>
          <button
            onClick={() => { playSound("pop"); setActiveTab("sequence"); }}
            className={`px-5 py-3 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === "sequence"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            3️⃣ إكمال السلسلة
          </button>
        </div>

        {/* TAB 1: COUNT & WRITE WITH NUMPAD */}
        {activeTab === "countInput" && (
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xl text-center space-y-8 animate-in fade-in">
            <div className="space-y-2">
              <span className="px-4 py-1.5 bg-teal-50 text-teal-700 text-xs font-black rounded-full border border-teal-200">
                السؤال {countIdx + 1} من {countQuestions.length}
              </span>
              <h3 className="text-2xl font-black text-slate-800">{countQuestions[countIdx].label}</h3>
            </div>

            {/* Responsive Object Display Container */}
            <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-teal-50/50 rounded-3xl border-2 border-dashed border-teal-200 min-h-[120px] max-w-full overflow-hidden">
              {countQuestions[countIdx].items.map((item, idx) => (
                <span key={idx} className="text-4xl sm:text-6xl animate-bounce drop-shadow-md">
                  {item}
                </span>
              ))}
            </div>

            {/* Answer Display Box */}
            <div className="w-40 h-20 mx-auto bg-slate-50 border-4 border-teal-400 rounded-2xl flex items-center justify-center text-4xl font-black text-teal-900 shadow-inner font-mono">
              {typedInput || <span className="text-slate-300">؟</span>}
            </div>

            {/* On-Screen Kid Numpad */}
            <div className="max-w-xs mx-auto space-y-3">
              <div className="grid grid-cols-3 gap-3">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleNumpadPress(num)}
                    className="py-3.5 bg-slate-100 hover:bg-teal-100 text-slate-800 hover:text-teal-900 font-black text-2xl rounded-2xl border-2 border-slate-200 shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={handleNumpadClear}
                  className="py-3.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm rounded-2xl border-2 border-red-200 transition-all flex items-center justify-center cursor-pointer"
                >
                  <Delete size={20} />
                </button>
                <button
                  onClick={() => handleNumpadPress("0")}
                  className="py-3.5 bg-slate-100 hover:bg-teal-100 text-slate-800 font-black text-2xl rounded-2xl border-2 border-slate-200 transition-all cursor-pointer"
                >
                  0
                </button>
                <button
                  onClick={handleNumpadSubmit}
                  disabled={!typedInput}
                  className="py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  <Check size={24} />
                </button>
              </div>
            </div>

            {inputFeedback === true && (
              <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-200 font-black text-lg animate-in zoom-in">
                إجابة صحيحة! أحسنت ⭐🎉
              </div>
            )}

            {inputFeedback === false && (
              <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200 font-black text-lg animate-in zoom-in">
                إجابة خاطئة، حاول مرة أخرى! ❌
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TARGETED COLORING CHALLENGE */}
        {activeTab === "targetedColor" && (
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xl text-center space-y-8 animate-in fade-in">
            <div className="space-y-2">
              <span className="px-4 py-1.5 bg-purple-50 text-purple-700 text-xs font-black rounded-full border border-purple-200">
                المهمة المطلوبة🎯
              </span>
              <h3 className="text-3xl font-black text-purple-900">
                لون <span className="text-blue-600 underline font-extrabold">{currentTask.targetCount}</span> {currentTask.targetName} فقط!
              </h3>
            </div>

            {/* Shapes Grid */}
            <div className="grid grid-cols-4 gap-6 py-4 max-w-xl mx-auto">
              {gridShapes.map((s) => (
                <div
                  key={s.id}
                  onClick={() => handleColorShape(s.id, s.type)}
                  className={`w-20 h-20 sm:w-24 sm:h-24 mx-auto border-4 border-slate-300 transition-all cursor-pointer shadow-md flex items-center justify-center hover:scale-105 active:scale-95 ${
                    s.type === "circle"
                      ? "rounded-full"
                      : s.type === "square"
                      ? "rounded-2xl"
                      : "rounded-xl rotate-45"
                  }`}
                  style={{ backgroundColor: s.color || "#F8FAFC" }}
                >
                  <span className="text-2xl font-black text-slate-400">
                    {s.type === "circle" ? "🔴" : s.type === "square" ? "🟦" : "🔺"}
                  </span>
                </div>
              ))}
            </div>

            {colorFeedback && (
              <div className="p-4 bg-amber-50 text-amber-800 rounded-2xl border border-amber-200 font-black text-base animate-in zoom-in">
                {colorFeedback}
              </div>
            )}

            <div className="flex justify-center gap-3">
              <button
                onClick={resetTargetedColor}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl transition-colors cursor-pointer"
              >
                إعادة التلوين 🔄
              </button>

              {taskIdx < targetTasks.length - 1 && (
                <button
                  onClick={nextColorTask}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-sm rounded-2xl shadow-md cursor-pointer"
                >
                  المهمة التالية ➡️
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SEQUENCE PATTERN */}
        {activeTab === "sequence" && (
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xl text-center space-y-8 animate-in fade-in">
            <div className="space-y-2">
              <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-black rounded-full border border-indigo-200">
                السؤال {seqIdx + 1} من {sequenceQuestions.length}
              </span>
              <h3 className="text-2xl font-black text-slate-800">اختر الشكل المناسب لإكمال السلسلة 🤔</h3>
            </div>

            {/* Series Display */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 py-6 bg-indigo-50/50 rounded-3xl border-2 border-indigo-200 overflow-x-auto">
              {sequenceQuestions[seqIdx].series.map((item, idx) => (
                <div key={idx} className="w-14 h-14 bg-white rounded-2xl border-2 border-indigo-200 flex items-center justify-center text-3xl shadow-sm">
                  {item}
                </div>
              ))}
              <div className="w-14 h-14 bg-amber-100 border-4 border-dashed border-amber-400 rounded-2xl flex items-center justify-center text-3xl font-black text-amber-700 animate-pulse">
                ❓
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-center gap-6">
              {sequenceQuestions[seqIdx].options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSeqAnswer(opt)}
                  className="w-16 h-16 bg-white hover:bg-indigo-50 border-4 border-indigo-300 rounded-2xl text-4xl shadow-md transition-all active:scale-95 hover:scale-110 cursor-pointer flex items-center justify-center"
                >
                  {opt}
                </button>
              ))}
            </div>

            {seqFeedback === true && (
              <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-200 font-black text-lg animate-in zoom-in">
                نمط صحيح! ممتاز ⭐🎉
              </div>
            )}

            {seqFeedback === false && (
              <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200 font-black text-lg animate-in zoom-in">
                حاول مرة أخرى ❌
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
