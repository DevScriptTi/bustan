"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MainNavbar from "@/components/MainNavbar";
import { playSound } from "@/utils/playSound";
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Trophy,
  RotateCcw,
  ArrowRight,
  HelpCircle,
  Shapes,
} from "lucide-react";

interface Option {
  id: number;
  label: string;
  emoji: string;
  isCorrect: boolean;
  subText?: string;
}

interface GameChallenge {
  id: number;
  type: "shape" | "pattern" | "shadow";
  title: string;
  instruction: string;
  badge: string;
  targetDisplay: React.ReactNode;
  options: Option[];
}

export default function CognitiveChallenges() {
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [isSolved, setIsSolved] = useState(false);
  const [isAllCompleted, setIsAllCompleted] = useState(false);

  const challenges: GameChallenge[] = [
    {
      id: 1,
      type: "shape",
      title: "التحدي الأول: مطابقة الأشكال 🔴",
      instruction: "أي من الأشياء التالية شكله يشبه الدائرة 🔴؟",
      badge: "مطابقة الأشكال",
      targetDisplay: (
        <div className="flex flex-col items-center gap-2 p-6 bg-purple-50 rounded-3xl border-2 border-purple-200">
          <div className="w-24 h-24 rounded-full bg-red-500 border-4 border-red-300 shadow-lg flex items-center justify-center text-4xl text-white font-black animate-pulse">
            🔴
          </div>
          <span className="text-sm font-black text-purple-900">الشكل المستهدف: دائرة</span>
        </div>
      ),
      options: [
        { id: 1, label: "قطعة بيتزا", emoji: "🍕", isCorrect: false, subText: "مثلث 📐" },
        { id: 2, label: "كرة قدم", emoji: "⚽", isCorrect: true, subText: "دائرة 🔴" },
        { id: 3, label: "باب المنزل", emoji: "🚪", isCorrect: false, subText: "مستطيل 🚪" },
      ],
    },
    {
      id: 2,
      type: "pattern",
      title: "التحدي الثاني: إكمال النمط 🧩",
      instruction: "اختر الفاكهة المناسبة لإكمال النمط الصحيح:",
      badge: "إكمال النمط",
      targetDisplay: (
        <div className="p-6 bg-purple-50 rounded-3xl border-2 border-purple-200 flex items-center justify-center gap-3 flex-wrap">
          <div className="w-16 h-16 bg-white rounded-2xl border-2 border-amber-200 flex items-center justify-center text-3xl shadow-sm">
            🍎
          </div>
          <span className="text-xl font-black text-purple-400">➔</span>
          <div className="w-16 h-16 bg-white rounded-2xl border-2 border-amber-200 flex items-center justify-center text-3xl shadow-sm">
            🍌
          </div>
          <span className="text-xl font-black text-purple-400">➔</span>
          <div className="w-16 h-16 bg-white rounded-2xl border-2 border-amber-200 flex items-center justify-center text-3xl shadow-sm">
            🍎
          </div>
          <span className="text-xl font-black text-purple-400">➔</span>
          <div className="w-16 h-16 bg-amber-100 rounded-2xl border-2 border-dashed border-amber-400 flex items-center justify-center text-3xl shadow-inner font-black text-amber-700 animate-bounce">
            ❓
          </div>
        </div>
      ),
      options: [
        { id: 1, label: "تفاحة", emoji: "🍎", isCorrect: false },
        { id: 2, label: "موزة", emoji: "🍌", isCorrect: true },
        { id: 3, label: "عنب", emoji: "🍇", isCorrect: false },
      ],
    },
    {
      id: 3,
      type: "shadow",
      title: "التحدي الثالث: تطابق الظل 👤",
      instruction: "إلى أي حيوان ينتمي هذا الظل الداكن 👤؟",
      badge: "تطابق الظل",
      targetDisplay: (
        <div className="flex flex-col items-center gap-2 p-6 bg-slate-900 rounded-3xl border-2 border-slate-700 text-white">
          <div className="w-28 h-28 flex items-center justify-center text-7xl brightness-0 filter select-none opacity-90">
            🐘
          </div>
          <span className="text-xs font-bold text-slate-400">ظلم الحيوان المستهدف 👤</span>
        </div>
      ),
      options: [
        { id: 1, label: "أسد", emoji: "🦁", isCorrect: false },
        { id: 2, label: "فيل", emoji: "🐘", isCorrect: true },
        { id: 3, label: "قرد", emoji: "🐒", isCorrect: false },
      ],
    },
  ];

  const currentChallenge = challenges[currentGameIndex];

  useEffect(() => {
    if (isAllCompleted) {
      playSound("cheer");
    }
  }, [isAllCompleted]);

  const handleOptionClick = (option: Option) => {
    if (isSolved) return;
    setSelectedOptionId(option.id);

    if (option.isCorrect) {
      playSound("sparkle");
      setIsSolved(true);
    } else {
      playSound("boop");
      setTimeout(() => setSelectedOptionId(null), 800);
    }
  };

  const handleNextGame = () => {
    playSound("pop");
    setSelectedOptionId(null);
    setIsSolved(false);

    if (currentGameIndex + 1 < challenges.length) {
      setCurrentGameIndex((prev) => prev + 1);
    } else {
      setIsAllCompleted(true);
    }
  };

  const handleRestartAll = () => {
    playSound("pop");
    setCurrentGameIndex(0);
    setSelectedOptionId(null);
    setIsSolved(false);
    setIsAllCompleted(false);
  };

  return (
    <div className="min-h-screen bg-purple-50/60 font-sans flex flex-col justify-between" dir="rtl">
      
      {/* Global Main Navbar */}
      <MainNavbar />

      {/* Top Header */}
      <header className="bg-white border-b border-purple-100 px-6 py-4 flex items-center justify-between sticky top-16 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/kindergarten"
            onClick={() => playSound("pop")}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={22} className="rotate-180" />
          </Link>
          <div className="flex items-center gap-2">
            <Shapes className="text-purple-600" size={24} />
            <h1 className="text-xl font-black text-slate-800">التحديات الإدراكية للأطفال</h1>
          </div>
        </div>

        <Link
          href="/kindergarten"
          onClick={() => playSound("pop")}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl transition-colors text-sm shadow-sm"
        >
          العودة لـ نتعلم مع القصص 📖
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-8">
        
        {isAllCompleted ? (
          /* ── ALL CHALLENGES COMPLETED SCREEN ── */
          <div className="bg-white border-2 border-purple-200 rounded-3xl p-8 sm:p-12 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-300 to-yellow-500 text-white rounded-3xl flex items-center justify-center text-5xl mx-auto shadow-lg animate-bounce">
              🏆
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-purple-100 text-purple-800 text-xs font-black border border-purple-200">
                <Sparkles size={14} />
                أحسنت يا بطل!
              </span>
              <h2 className="text-3xl font-black text-slate-800">لقد أكملت جميع التحديات الإدراكية بنجاح! 🎉</h2>
              <p className="text-slate-600 font-medium text-base max-w-md mx-auto">
                تميزت بدقة الملاحظة والتفكير المنطقي السريع في جميع الألعاب الإدراكية.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button
                onClick={handleRestartAll}
                className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-black text-base rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw size={18} />
                <span>إعادة التحديات من جديد 🔄</span>
              </button>

              <Link
                href="/kindergarten"
                onClick={() => playSound("pop")}
                className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base rounded-2xl border border-slate-200 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>العودة لـ نتعلم مع القصص 📖</span>
              </Link>
            </div>
          </div>
        ) : (
          /* ── ACTIVE GAME CHALLENGE ── */
          <div className="space-y-6">
            
            {/* Progress & Step Banner */}
            <div className="flex items-center justify-between bg-white px-6 py-3.5 rounded-2xl border border-purple-100 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                  {currentChallenge.badge}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  التحدي {currentGameIndex + 1} من {challenges.length}
                </span>
              </div>
              <div className="w-32 bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${((currentGameIndex + 1) / challenges.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Main Game Card */}
            <div className="bg-white border-2 border-purple-100 rounded-3xl p-6 sm:p-10 shadow-md space-y-8">
              
              {/* Question Header */}
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
                  {currentChallenge.title}
                </h2>
                <p className="text-purple-900 font-bold text-base sm:text-lg">
                  {currentChallenge.instruction}
                </p>
              </div>

              {/* Target / Prompt Visual Display */}
              <div className="max-w-md mx-auto">
                {currentChallenge.targetDisplay}
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 max-w-2xl mx-auto">
                {currentChallenge.options.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  const showCorrect = isSolved && opt.isCorrect;
                  const showWrong = isSelected && !opt.isCorrect;

                  let style =
                    "bg-slate-50 border-2 border-slate-200 text-slate-800 hover:bg-purple-50 hover:border-purple-300";

                  if (showCorrect) {
                    style = "bg-emerald-50 border-2 border-emerald-500 text-emerald-950 ring-4 ring-emerald-200 scale-105";
                  } else if (showWrong) {
                    style = "bg-rose-50 border-2 border-rose-500 text-rose-950 animate-shake";
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleOptionClick(opt)}
                      disabled={isSolved}
                      className={`p-6 rounded-2xl border-2 text-center flex flex-col items-center justify-center gap-2 transition-all duration-200 cursor-pointer active:scale-95 select-none ${style}`}
                    >
                      <span className="text-5xl">{opt.emoji}</span>
                      <span className="text-lg font-black">{opt.label}</span>
                      {opt.subText && (
                        <span className="text-xs font-bold opacity-75">{opt.subText}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Success Feedback & Next Button */}
              {isSolved && (
                <div className="bg-emerald-50 border-2 border-emerald-300 p-6 rounded-2xl text-center space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-center gap-2 text-emerald-800 font-black text-xl">
                    <CheckCircle2 size={24} className="text-emerald-600" />
                    <span>إجابة صحيحة وممتازة! 🎉</span>
                  </div>
                  <button
                    onClick={handleNextGame}
                    className="w-full sm:w-auto px-10 py-4 bg-purple-600 hover:bg-purple-700 text-white font-black text-lg rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 mx-auto"
                  >
                    <span>
                      {currentGameIndex + 1 < challenges.length ? "التحدي التالي" : "عرض النتيجة النهائية 🏆"}
                    </span>
                    <ArrowLeft size={20} />
                  </button>
                </div>
              )}

            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs font-bold text-slate-400">
        التحديات الإدراكية — روضة بستان للأطفال
      </footer>

    </div>
  );
}
