"use client";

import { useState } from "react";
import Link from "next/link";
import { useBustanSounds } from "@/hooks/useBustanSounds";
import { playSound } from "@/utils/playSound";
import { ArrowLeft, Sparkles, CheckCircle2, RotateCcw, ArrowRight } from "lucide-react";

interface LogicPuzzle {
  id: number;
  question: string;
  emoji: string;
  options: { id: number; count: number; items: string }[];
  correctId: number;
}

const logicPuzzles: LogicPuzzle[] = [
  {
    id: 1,
    question: "اضغط على الرف الذي يحتوي على أقل عدد من الكتب 📚",
    emoji: "📚",
    options: [
      { id: 1, count: 5, items: "📚📚📚📚📚" },
      { id: 2, count: 2, items: "📚📚" },
      { id: 3, count: 4, items: "📚📚📚📚" },
      { id: 4, count: 3, items: "📚📚📚" },
    ],
    correctId: 2,
  },
  {
    id: 2,
    question: "أي الأوعية يحتوي على حلوى أكثر؟ 🍭",
    emoji: "🍭",
    options: [
      { id: 1, count: 3, items: "🍭🍭🍭" },
      { id: 2, count: 6, items: "🍭🍭🍭🍭🍭🍭" },
      { id: 3, count: 2, items: "🍭🍭" },
      { id: 4, count: 4, items: "🍭🍭🍭🍭" },
    ],
    correctId: 2,
  },
  {
    id: 3,
    question: "اختر الحقل الذي يتواجد فيه 3 أرانب بالضبط 🐰",
    emoji: "🐰",
    options: [
      { id: 1, count: 1, items: "🐰" },
      { id: 2, count: 5, items: "🐰🐰🐰🐰🐰" },
      { id: 3, count: 3, items: "🐰🐰🐰" },
      { id: 4, count: 4, items: "🐰🐰🐰🐰" },
    ],
    correctId: 3,
  },
];

export default function LogicGames() {
  const { playClick, playSuccess, playError } = useBustanSounds();

  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [isSolved, setIsSolved] = useState(false);

  const puzzle = logicPuzzles[currentPuzzleIndex];

  const handleOptionClick = (optionId: number) => {
    if (isSolved) return;
    playSound("pop");
    setSelectedOptionId(optionId);

    if (optionId === puzzle.correctId) {
      playSound("sparkle");
      setIsSolved(true);
    } else {
      playSound("boop");
      setTimeout(() => setSelectedOptionId(null), 800);
    }
  };

  const handleNextPuzzle = () => {
    try { playClick(); } catch {}
    setSelectedOptionId(null);
    setIsSolved(false);
    setCurrentPuzzleIndex((prev) => (prev + 1) % logicPuzzles.length);
  };

  return (
    <div className="min-h-screen bg-teal-50/40 font-sans flex flex-col justify-between" dir="rtl">
      
      {/* Top Bar */}
      <header className="bg-white border-b border-teal-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/kindergarten"
            onClick={() => { try { playClick(); } catch {} }}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={22} className="rotate-180" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <h1 className="text-xl font-black text-slate-800">العب وتعلم — رياضيات ومنطق</h1>
          </div>
        </div>

        <Link
          href="/kindergarten"
          onClick={() => { try { playClick(); } catch {} }}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl transition-colors text-sm shadow-sm"
        >
          العودة لـ نتعلم مع القصص 📖
        </Link>
      </header>

      {/* Main Puzzle Card */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 flex flex-col justify-center">
        <div className="bg-white border border-teal-100 rounded-3xl p-8 sm:p-10 shadow-xl space-y-8 text-center">
          
          {/* Header Badge */}
          <div>
            <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-teal-100 text-teal-800 text-xs font-black border border-teal-200 mb-3">
              <Sparkles size={14} />
              التحدي {currentPuzzleIndex + 1} من {logicPuzzles.length}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 leading-relaxed">
              {puzzle.question}
            </h2>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {puzzle.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              const isCorrect = opt.id === puzzle.correctId;

              let style = "bg-slate-50 border-2 border-slate-200 hover:border-teal-400 hover:bg-teal-50/50";
              if (isSelected && isCorrect) {
                style = "bg-emerald-100 border-4 border-emerald-500 ring-4 ring-emerald-200 scale-102";
              } else if (isSelected && !isCorrect) {
                style = "bg-red-100 border-4 border-red-400 animate-shake";
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleOptionClick(opt.id)}
                  disabled={isSolved}
                  className={`p-6 rounded-3xl transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${style}`}
                >
                  <span className="text-3xl sm:text-4xl tracking-widest">{opt.items}</span>
                  <span className="text-sm font-black text-slate-600">
                    العدد: {opt.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Success Banner & Next Button */}
          {isSolved && (
            <div className="bg-emerald-50 border-2 border-emerald-300 p-6 rounded-2xl text-center space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="flex items-center justify-center gap-2 text-emerald-800 text-xl font-black">
                <CheckCircle2 size={24} />
                <span>إجابة صحيحة تماماً! بطل الحساب! 🎉</span>
              </div>
              <button
                onClick={handleNextPuzzle}
                className="px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-black text-lg rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 mx-auto"
              >
                <span>التحدي التالي</span>
                <ArrowRight size={20} className="rotate-180" />
              </button>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-teal-100 py-3 text-center text-xs font-bold text-slate-400">
        العب وتعلم — رياضيات ومنطق للأطفال
      </footer>

    </div>
  );
}
