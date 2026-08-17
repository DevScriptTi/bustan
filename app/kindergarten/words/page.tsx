"use client";

import { useState } from "react";
import Link from "next/link";
import { useBustanSounds } from "@/hooks/useBustanSounds";
import { playSound } from "@/utils/playSound";
import { ArrowLeft, Sparkles, CheckCircle2, Palette, RefreshCw, Trophy } from "lucide-react";

interface WordChallenge {
  id: number;
  instruction: string;
  targetWords: string[];
  allWords: string[];
}

const wordChallenges: WordChallenge[] = [
  {
    id: 1,
    instruction: "لوّن تحية الإسلام باللون الأخضر 🟢",
    targetWords: ["السلام", "عليكم", "ورحمة", "الله", "وبركاته"],
    allWords: ["السلام", "الحمد", "عليكم", "لله", "ورحمة", "شكراً", "الله", "وبركاته", "جميل"],
  },
  {
    id: 2,
    instruction: "لوّن عبارة (النظافة من الإيمان) باللون الأخضر 🟢",
    targetWords: ["النظافة", "من", "الإيمان"],
    allWords: ["النظافة", "الصدق", "من", "القوة", "الإيمان", "العلم"],
  },
  {
    id: 3,
    instruction: "لوّن أركان الإسلام الأساسية باللون الأخضر 🟢",
    targetWords: ["الصلاة", "الزكاة", "الصوم"],
    allWords: ["الصلاة", "اللعب", "الزكاة", "النوم", "الصوم", "الأكل"],
  },
];

export default function WordColoring() {
  const { playClick, playSuccess, playError } = useBustanSounds();

  const [challengeIndex, setChallengeIndex] = useState(0);
  const [coloredWords, setColoredWords] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const challenge = wordChallenges[challengeIndex];

  const handleWordClick = (word: string) => {
    if (isCompleted) return;

    const isTarget = challenge.targetWords.includes(word);

    if (isTarget) {
      if (!coloredWords.includes(word)) {
        const nextColored = [...coloredWords, word];
        setColoredWords(nextColored);
        playSound("pop");

        // Check if all target words are now colored
        const allTargetColored = challenge.targetWords.every((w) => nextColored.includes(w));
        if (allTargetColored) {
          setIsCompleted(true);
          playSound("sparkle");
        }
      }
    } else {
      playSound("boop");
    }
  };

  const handleNextChallenge = () => {
    try { playClick(); } catch {}
    setColoredWords([]);
    setIsCompleted(false);
    setChallengeIndex((prev) => (prev + 1) % wordChallenges.length);
  };

  return (
    <div className="min-h-screen bg-purple-50/40 font-sans flex flex-col justify-between" dir="rtl">
      
      {/* Top Bar */}
      <header className="bg-white border-b border-purple-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/kindergarten"
            onClick={() => { try { playClick(); } catch {} }}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={22} className="rotate-180" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🖍️</span>
            <h1 className="text-xl font-black text-slate-800">تلوين الكلمات والعبارات</h1>
          </div>
        </div>

        <Link
          href="/kindergarten"
          onClick={() => { try { playClick(); } catch {} }}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl transition-colors text-sm shadow-sm"
        >
          العودة لـ نتعلم مع القصص 📖
        </Link>
      </header>

      {/* Main Board */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 flex flex-col justify-center">
        <div className="bg-white border border-purple-100 rounded-3xl p-8 sm:p-10 shadow-xl space-y-8 text-center">
          
          {/* Instruction */}
          <div>
            <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-purple-100 text-purple-800 text-xs font-black border border-purple-200 mb-3">
              <Palette size={14} />
              التحدي {challengeIndex + 1} من {wordChallenges.length}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
              {challenge.instruction}
            </h2>
            <p className="text-slate-500 text-sm font-medium mt-1">
              اضغط على الكلمات الصحيحة لتلوينها باللون الأخضر
            </p>
          </div>

          {/* Word Pills Area */}
          <div className="flex flex-wrap items-center justify-center gap-4 py-4 min-h-[160px] bg-purple-50/50 p-6 rounded-3xl border-2 border-dashed border-purple-200">
            {challenge.allWords.map((word, idx) => {
              const isColored = coloredWords.includes(word);

              return (
                <button
                  key={idx}
                  onClick={() => handleWordClick(word)}
                  disabled={isCompleted}
                  className={`px-6 py-3.5 rounded-2xl text-xl sm:text-2xl font-black transition-all cursor-pointer shadow-sm active:scale-95 ${
                    isColored
                      ? "bg-emerald-500 text-white border-2 border-emerald-600 shadow-md scale-105"
                      : "bg-white text-slate-800 border-2 border-slate-200 hover:border-purple-300 hover:bg-purple-50"
                  }`}
                >
                  {word}
                </button>
              );
            })}
          </div>

          {/* Target Phrase Progress */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400">الكلمات الملونة حتى الآن:</span>
            <div className="flex items-center justify-center gap-2 flex-wrap min-h-[40px]">
              {challenge.targetWords.map((word, idx) => {
                const isFound = coloredWords.includes(word);
                return (
                  <span
                    key={idx}
                    className={`px-3 py-1 rounded-xl text-sm font-bold border ${
                      isFound ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-slate-100 text-slate-400 border-slate-200"
                    }`}
                  >
                    {isFound ? word : "___"}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Success Banner */}
          {isCompleted && (
            <div className="bg-emerald-50 border-2 border-emerald-300 p-6 rounded-2xl text-center space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="flex items-center justify-center gap-2 text-emerald-800 text-xl font-black">
                <Trophy size={24} className="text-emerald-600" />
                <span>أحسنت! لوّنت العبارة الكاملة بنجاح! 🌟</span>
              </div>
              <button
                onClick={handleNextChallenge}
                className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-black text-lg rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 mx-auto"
              >
                <span>التحدي التالي</span>
                <RefreshCw size={18} />
              </button>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-purple-100 py-3 text-center text-xs font-bold text-slate-400">
        تلوين الكلمات والعبارات — روضة بستان
      </footer>

    </div>
  );
}
