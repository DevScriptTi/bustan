"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import MainNavbar from "@/components/MainNavbar";
import { playSound } from "@/utils/playSound";
import { ArrowLeft, RefreshCw, Star, Sparkles, Trophy, AlertTriangle } from "lucide-react";

interface PathLevel {
  id: number;
  title: string;
  startSprite: string;
  targetSprite: string;
  svgPath: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export default function SmoothTracingGame() {
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [stars, setStars] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const levels: PathLevel[] = [
    {
      id: 1,
      title: "المستوى 1: اسحب النحلة عبر المسار المنحني إلى الزهرة 🐝🌸",
      startSprite: "🐝",
      targetSprite: "🌸",
      svgPath: "M 40 150 Q 150 40 260 150 T 460 150",
      startX: 40,
      startY: 150,
      endX: 460,
      endY: 150,
    },
    {
      id: 2,
      title: "المستوى 2: اسحب الفراشة عبر المسار المتعرج (Zigzag) 🦋🌺",
      startSprite: "🦋",
      targetSprite: "🌺",
      svgPath: "M 40 220 L 120 70 L 200 220 L 280 70 L 360 220 L 440 70",
      startX: 40,
      startY: 220,
      endX: 440,
      endY: 70,
    },
    {
      id: 3,
      title: "المستوى 3: اسحب الدعسوقة عبر المسار الدائري 🐞🌻",
      startSprite: "🐞",
      targetSprite: "🌻",
      svgPath: "M 40 150 C 120 20, 200 280, 280 150 C 360 20, 400 280, 460 150",
      startX: 40,
      startY: 150,
      endX: 460,
      endY: 150,
    },
  ];

  const currentLevel = levels[currentLevelIdx];
  const MAX_DEVIATION_RADIUS = 75; // Kid-friendly deviation radius in pixels

  const [spritePos, setSpritePos] = useState({ x: currentLevel.startX, y: currentLevel.startY });
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const dragStartTime = useRef(0);
  const moveCount = useRef(0);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isCompleted || !svgRef.current) return;

    isDragging.current = true;
    dragStartTime.current = Date.now();
    moveCount.current = 0;
    setErrorMessage(null);

    const rect = svgRef.current.getBoundingClientRect();
    const pX = ((e.clientX - rect.left) / rect.width) * 500;
    const pY = ((e.clientY - rect.top) / rect.height) * 300;

    // Save offset between click position and sprite center to prevent instant snapping jump
    dragOffset.current = {
      x: pX - spritePos.x,
      y: pY - spritePos.y,
    };

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}

    playSound("pop");
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || isCompleted || !svgRef.current || !pathRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const pX = ((e.clientX - rect.left) / rect.width) * 500;
    const pY = ((e.clientY - rect.top) / rect.height) * 300;

    // Apply offset calculation so sprite stays attached smoothly under finger/mouse
    const newX = pX - dragOffset.current.x;
    const newY = pY - dragOffset.current.y;

    const clampedX = Math.max(20, Math.min(480, newX));
    const clampedY = Math.max(20, Math.min(280, newY));

    moveCount.current += 1;
    const elapsedTime = Date.now() - dragStartTime.current;

    // Perform deviation check after grace period (first 3 moves or 120ms)
    if (moveCount.current > 3 && elapsedTime > 120) {
      const pathEl = pathRef.current;
      const totalLen = pathEl.getTotalLength();
      let minDistance = Infinity;

      // Sample path points for shortest distance from sprite center to path
      for (let i = 0; i <= totalLen; i += 10) {
        const pt = pathEl.getPointAtLength(i);
        const dist = Math.hypot(clampedX - pt.x, clampedY - pt.y);
        if (dist < minDistance) {
          minDistance = dist;
        }
      }

      // Penalty trigger: Off-path deviation
      if (minDistance > MAX_DEVIATION_RADIUS) {
        isDragging.current = false;
        try {
          (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {}

        playSound("boop");
        setIsShaking(true);
        setErrorMessage("انتبه! خرجت عن الخط المنقط، اتبع المسار مجدداً من البداية 🚨");

        // Reset sprite position to start coordinates
        setSpritePos({ x: currentLevel.startX, y: currentLevel.startY });

        setTimeout(() => {
          setIsShaking(false);
        }, 600);

        return;
      }
    }

    setSpritePos({ x: clampedX, y: clampedY });

    // Check distance to target flower
    const distToEnd = Math.hypot(clampedX - currentLevel.endX, clampedY - currentLevel.endY);

    if (distToEnd < 50) {
      playSound("cheer");
      setStars((prev) => prev + 1);
      setSpritePos({ x: currentLevel.endX, y: currentLevel.endY });
      setIsCompleted(true);
      isDragging.current = false;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const resetLevel = () => {
    playSound("pop");
    setSpritePos({ x: currentLevel.startX, y: currentLevel.startY });
    setIsCompleted(false);
    setErrorMessage(null);
  };

  const nextLevel = () => {
    playSound("pop");
    if (currentLevelIdx < levels.length - 1) {
      const nextIdx = currentLevelIdx + 1;
      setCurrentLevelIdx(nextIdx);
      setSpritePos({ x: levels[nextIdx].startX, y: levels[nextIdx].startY });
      setIsCompleted(false);
      setErrorMessage(null);
    }
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
              <h2 className="text-xl sm:text-2xl font-black text-slate-800">تتبع الخطوط بالمسار المحدد ✍️🐝</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-bold">{currentLevel.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-200">
            <Star className="text-amber-500 fill-amber-400" size={20} />
            <span className="font-black text-amber-900 text-base">{stars} نجوم</span>
          </div>
        </div>

        {/* Workspace */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6 text-center select-none">
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-black px-4 py-2 bg-rose-50 text-rose-700 rounded-full border border-rose-200 max-w-lg mx-auto">
            <Sparkles size={16} />
            اضغط واسحب الكائن بسلاسة فوق الخط المنقط للوصول للزهرة!
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 text-red-700 font-black text-xs sm:text-sm rounded-2xl border border-red-200 flex items-center justify-center gap-2 animate-bounce">
              <AlertTriangle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="relative mx-auto w-full max-w-[500px] aspect-[5/3] bg-sky-50/50 rounded-3xl border-4 border-dashed border-sky-200 shadow-inner overflow-hidden">
            <svg
              ref={svgRef}
              viewBox="0 0 500 300"
              className="w-full h-full block touch-none"
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              {/* Dotted Guide Path */}
              <path
                ref={pathRef}
                d={currentLevel.svgPath}
                fill="none"
                stroke="#94A3B8"
                strokeWidth="16"
                strokeDasharray="14 14"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* End Target Flower Sprite */}
              <text
                x={currentLevel.endX}
                y={currentLevel.endY + 12}
                textAnchor="middle"
                className="text-4xl select-none animate-bounce"
              >
                {currentLevel.targetSprite}
              </text>

              {/* Draggable Sprite with Pointer Offset & Smooth GPU Transform */}
              <g
                transform={`translate(${spritePos.x}, ${spritePos.y})`}
                onPointerDown={handlePointerDown}
                className={`cursor-grab active:cursor-grabbing transition-transform duration-75 ${
                  isShaking ? "animate-ping stroke-red-500" : "hover:scale-110"
                }`}
              >
                <circle r="26" fill={isShaking ? "#EF4444" : "#0284C7"} opacity={isShaking ? "0.4" : "0.2"} />
                <text textAnchor="middle" y="10" className="text-4xl select-none pointer-events-none">
                  {currentLevel.startSprite}
                </text>
              </g>
            </svg>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={resetLevel}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl transition-colors flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw size={16} />
              إعادة المسار
            </button>
          </div>
        </div>

        {/* Modal */}
        {isCompleted && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in" dir="rtl">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl border-4 border-emerald-300">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center text-4xl mx-auto shadow-inner">
                <Trophy size={40} />
              </div>

              <div className="space-y-2">
                <h3 className="text-3xl font-black text-slate-800">وصل الكائن ببراعة! 🎉</h3>
                <p className="text-slate-500 font-bold text-sm">التزمت بالمسار بنجاح وكسبت نجمة جديدة 🌟</p>
              </div>

              <div className="flex flex-col gap-3">
                {currentLevelIdx < levels.length - 1 ? (
                  <button
                    onClick={nextLevel}
                    className="w-full py-4 bg-sky-600 hover:bg-sky-700 text-white font-black text-lg rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer"
                  >
                    المسار التالي ➡️
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
                  إعادة المسار 🔄
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
