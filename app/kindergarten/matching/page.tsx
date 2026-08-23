"use client";

import { useState } from "react";
import Link from "next/link";
import MainNavbar from "@/components/MainNavbar";
import { playSound } from "@/utils/playSound";
import { ArrowLeft, CheckCircle2, RefreshCw, Star, Sparkles, Trophy } from "lucide-react";

interface MatchingPair {
  id: string;
  leftContent: string;
  leftType: "text" | "domino" | "shape";
  rightContent: string;
  rightType: "text" | "domino" | "shape";
  matchKey: string;
}

// Domino SVG Piece renderer
function DominoPiece({ dots }: { dots: number }) {
  const dotPositions: Record<number, { cx: number; cy: number }[]> = {
    1: [{ cx: 30, cy: 30 }],
    2: [{ cx: 15, cy: 15 }, { cx: 45, cy: 45 }],
    3: [{ cx: 15, cy: 15 }, { cx: 30, cy: 30 }, { cx: 45, cy: 45 }],
    4: [{ cx: 15, cy: 15 }, { cx: 45, cy: 15 }, { cx: 15, cy: 45 }, { cx: 45, cy: 45 }],
  };

  return (
    <div className="w-16 h-16 bg-amber-50 border-3 border-amber-800 rounded-2xl shadow-sm flex items-center justify-center p-1">
      <svg viewBox="0 0 60 60" className="w-full h-full">
        <rect x="2" y="2" width="56" height="56" rx="8" fill="#FFFBEB" stroke="#92400E" strokeWidth="3" />
        {dotPositions[dots]?.map((pos, idx) => (
          <circle key={idx} cx={pos.cx} cy={pos.cy} r="5" fill="#78350F" />
        ))}
      </svg>
    </div>
  );
}

const levelData = [
  {
    level: 1,
    title: "التحدي الأول: مطابقة قطع الدومينو بالأرقام 🀄",
    pairs: [
      { id: "L1-1", leftContent: "1", leftType: "text", rightContent: "domino-3", rightType: "domino", matchKey: "1" },
      { id: "L1-2", leftContent: "2", leftType: "text", rightContent: "domino-1", rightType: "domino", matchKey: "2" },
      { id: "L1-3", leftContent: "3", leftType: "text", rightContent: "domino-4", rightType: "domino", matchKey: "3" },
      { id: "L1-4", leftContent: "4", leftType: "text", rightContent: "domino-2", rightType: "domino", matchKey: "4" },
    ] as MatchingPair[],
  },
  {
    level: 2,
    title: "التحدي الثاني: مطابقة أسماء الأشكال بالأشكال البصرية 📐",
    pairs: [
      { id: "L2-1", leftContent: "دائرة", leftType: "text", rightContent: "🟦", rightType: "shape", matchKey: "دائرة" },
      { id: "L2-2", leftContent: "مربع", leftType: "text", rightContent: "🔴", rightType: "shape", matchKey: "مربع" },
      { id: "L2-3", leftContent: "مثلث", leftType: "text", rightContent: "⭐️", rightType: "shape", matchKey: "مثلث" },
      { id: "L2-4", leftContent: "نجمة", leftType: "text", rightContent: "🔺", rightType: "shape", matchKey: "نجمة" },
    ] as MatchingPair[],
  },
  {
    level: 3,
    title: "التحدي الثالث: مطابقة الحيوانات والمتطابقات 🐾",
    pairs: [
      { id: "L3-1", leftContent: "🐒 قرد", leftType: "text", rightContent: "🦋 فراشة", rightType: "text", matchKey: "قرد" },
      { id: "L3-2", leftContent: "🐝 نحلة", leftType: "text", rightContent: "🐒 قرد", rightType: "text", matchKey: "نحلة" },
      { id: "L3-3", leftContent: "🐜 نملة", leftType: "text", rightContent: "🐜 نملة", rightType: "text", matchKey: "نملة" },
      { id: "L3-4", leftContent: "🦋 فراشة", leftType: "text", rightContent: "🐝 نحلة", rightType: "text", matchKey: "فراشة" },
    ] as MatchingPair[],
  },
];

const matchRules: Record<string, string> = {
  "1": "domino-1",
  "2": "domino-2",
  "3": "domino-3",
  "4": "domino-4",
  "دائرة": "🔴",
  "مربع": "🟦",
  "مثلث": "🔺",
  "نجمة": "⭐️",
  "🐒 قرد": "🐒 قرد",
  "🐝 نحلة": "🐝 نحلة",
  "🐜 نملة": "🐜 نملة",
  "🦋 فراشة": "🦋 فراشة",
};

export default function UpgradedMatchingGame() {
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [connections, setConnections] = useState<Record<string, string>>({});
  const [stars, setStars] = useState(0);
  const [isLevelComplete, setIsLevelComplete] = useState(false);

  const currentLevel = levelData[currentLevelIdx];

  const handleLeftClick = (content: string) => {
    playSound("pop");
    setSelectedLeft(content);
  };

  const handleRightClick = (rightContent: string) => {
    if (!selectedLeft) return;

    if (matchRules[selectedLeft] === rightContent) {
      playSound("sparkle");
      const updated = { ...connections, [selectedLeft]: rightContent };
      setConnections(updated);
      setSelectedLeft(null);

      if (Object.keys(updated).length === currentLevel.pairs.length) {
        playSound("cheer");
        setStars((prev) => prev + 1);
        setIsLevelComplete(true);
      }
    } else {
      playSound("boop");
      setSelectedLeft(null);
    }
  };

  const resetLevel = () => {
    playSound("pop");
    setConnections({});
    setSelectedLeft(null);
    setIsLevelComplete(false);
  };

  const nextLevel = () => {
    playSound("pop");
    if (currentLevelIdx < levelData.length - 1) {
      setCurrentLevelIdx((prev) => prev + 1);
      resetLevel();
    } else {
      setIsLevelComplete(true);
    }
  };

  const renderContent = (content: string) => {
    if (content.startsWith("domino-")) {
      const dots = parseInt(content.split("-")[1], 10);
      return <DominoPiece dots={dots} />;
    }
    return <span>{content}</span>;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col justify-between" dir="rtl">
      <MainNavbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 pt-20 sm:pt-24 pb-8 space-y-6">
        {/* Header */}
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
              <h2 className="text-xl sm:text-2xl font-black text-slate-800">تحديات المطابقة والدومينو 🀄🔗</h2>
              <p className="text-xs sm:text-sm text-amber-700 font-bold">{currentLevel.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-200">
            <Star className="text-amber-500 fill-amber-400" size={20} />
            <span className="font-black text-amber-900 text-base">{stars} نجوم</span>
          </div>
        </div>

        {/* Game Workspace */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xl space-y-8 relative overflow-hidden">
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-teal-50 text-teal-700 text-xs font-black border border-teal-200">
              <Sparkles size={14} />
              انقر على العنصر في العمود الأيمن ثم اختر الإجابة المناسبة في اليسار
            </span>
          </div>

          {/* Dual Columns */}
          <div className="grid grid-cols-2 gap-6 sm:gap-12 relative max-w-2xl mx-auto">
            {/* Right Column */}
            <div className="space-y-4">
              <h4 className="text-center text-sm font-black text-slate-500">القائمة الأساسية</h4>
              {currentLevel.pairs.map((pair) => {
                const isSelected = selectedLeft === pair.leftContent;
                const isMatched = !!connections[pair.leftContent];

                return (
                  <button
                    key={pair.id}
                    onClick={() => !isMatched && handleLeftClick(pair.leftContent)}
                    disabled={isMatched}
                    className={`w-full py-4 px-6 rounded-2xl border-4 font-black text-2xl sm:text-3xl transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer shadow-sm ${
                      isMatched
                        ? "bg-emerald-100 border-emerald-400 text-emerald-700 cursor-not-allowed opacity-75"
                        : isSelected
                        ? "bg-amber-100 border-amber-400 text-amber-900 scale-105 shadow-md ring-4 ring-amber-200"
                        : "bg-teal-50/60 border-teal-200 text-teal-900 hover:border-teal-400 hover:scale-102"
                    }`}
                  >
                    {renderContent(pair.leftContent)}
                    {isMatched && <CheckCircle2 size={24} className="text-emerald-600" />}
                  </button>
                );
              })}
            </div>

            {/* Left Column Target */}
            <div className="space-y-4">
              <h4 className="text-center text-sm font-black text-slate-500">خيارات المطابقة</h4>
              {currentLevel.pairs.map((pair) => {
                const isConnected = Object.values(connections).includes(pair.rightContent);

                return (
                  <button
                    key={`R-${pair.id}`}
                    onClick={() => !isConnected && handleRightClick(pair.rightContent)}
                    disabled={isConnected}
                    className={`w-full py-4 px-6 rounded-2xl border-4 font-black text-2xl sm:text-3xl transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer shadow-sm ${
                      isConnected
                        ? "bg-emerald-100 border-emerald-400 text-emerald-700 cursor-not-allowed opacity-75"
                        : selectedLeft
                        ? "bg-sky-50 border-sky-300 text-sky-900 hover:bg-sky-100 hover:border-sky-400 animate-pulse"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {renderContent(pair.rightContent)}
                    {isConnected && <CheckCircle2 size={24} className="text-emerald-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <button
              onClick={resetLevel}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl transition-colors flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw size={16} />
              إعادة التحدي
            </button>
          </div>
        </div>

        {/* Modal */}
        {isLevelComplete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in" dir="rtl">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl border-4 border-amber-300">
              <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-3xl flex items-center justify-center text-4xl mx-auto shadow-inner">
                <Trophy size={40} />
              </div>

              <div className="space-y-2">
                <h3 className="text-3xl font-black text-slate-800">أحسنت! إجابات متطابقة 🎉</h3>
                <p className="text-slate-500 font-bold text-sm">لقد أكملت تحدي المطابقة بنجاح وكسبت نجمة 🌟</p>
              </div>

              <div className="flex flex-col gap-3">
                {currentLevelIdx < levelData.length - 1 ? (
                  <button
                    onClick={nextLevel}
                    className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-black text-lg rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer"
                  >
                    التحدي التالي ➡️
                  </button>
                ) : (
                  <Link
                    href="/kindergarten"
                    onClick={() => playSound("pop")}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    العودة لروضة بستان 🏠
                  </Link>
                )}

                <button
                  onClick={resetLevel}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl transition-colors cursor-pointer"
                >
                  إعادة المستوى 🔄
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
