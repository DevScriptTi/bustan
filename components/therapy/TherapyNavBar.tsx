"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { Lock, CheckCircle2, Star } from "lucide-react";
import { playSound } from "@/utils/playSound";
import OddStarBoardModal from "@/components/OddStarBoardModal";

interface TherapyNavBarProps {
  childId?: string | null;
  programType?: "memory" | "odd";
  currentSessionNumber?: number;
  currentSession?: number;
}

function TherapyNavBarContent({
  childId,
  programType = "memory",
  currentSessionNumber,
  currentSession,
}: TherapyNavBarProps) {
  const searchParams = useSearchParams();
  const urlChildId = searchParams ? searchParams.get("childId") : null;
  const activeChildId = childId || urlChildId;

  const activeSession = currentSessionNumber ?? currentSession ?? 1;
  const [completedSessions, setCompletedSessions] = useState<number>(0);
  const [isStarBoardOpen, setIsStarBoardOpen] = useState(false);

  const isMemory = programType === "memory";
  const progressField = isMemory ? "completedMemorySessions" : "completedOddSessions";
  const totalSessions = isMemory ? 11 : 7;

  useEffect(() => {
    if (!activeChildId) return;

    const unsubscribe = onSnapshot(
      doc(db, "children", activeChildId),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const count = data[progressField] || 0;
          setCompletedSessions(count);
        }
      },
      (err) => {
        console.error("TherapyNavBar listener error:", err);
      }
    );

    return () => unsubscribe();
  }, [activeChildId, progressField]);

  const maxAccessible = completedSessions + 1;
  const sessions = Array.from({ length: totalSessions }, (_, i) => i + 1);

  return (
    <div className="w-full max-w-5xl mx-auto py-2 mb-4 px-2" dir="rtl">
      
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-base font-black text-slate-800">
            {isMemory ? "مسار برنامج الذاكرة 🧠" : "مسار زيادة المناعة النفسية (ODD) 🌋"}
          </span>
          <span
            className={`text-xs font-black px-3 py-1 rounded-full border ${
              isMemory
                ? "bg-teal-50 text-teal-700 border-teal-200"
                : "bg-indigo-50 text-indigo-700 border-indigo-200"
            }`}
          >
            {completedSessions} / {totalSessions} مكتمل
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!isMemory && (
            <button
              onClick={() => {
                playSound("pop");
                setIsStarBoardOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              <Star size={14} className="fill-amber-500 text-amber-500" />
              <span>جدول تعزيز الأم 🌟</span>
            </button>
          )}
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            الحصة الحالية: {activeSession}
          </span>
        </div>
      </div>

      {/* Star Board Modal */}
      <OddStarBoardModal
        isOpen={isStarBoardOpen}
        onClose={() => setIsStarBoardOpen(false)}
      />

      {/* Swipeable Journey Track (Scrollbar hidden via Tailwind utilities) */}
      <div className="flex items-center gap-1 overflow-x-auto scroll-smooth py-3 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {sessions.map((num, idx) => {
          const isCurrent = num === activeSession;
          const isDone = num <= completedSessions;
          const isUnlocked = num <= maxAccessible;

          const href = `/therapy/${programType}/session-${num}${activeChildId ? `?childId=${activeChildId}` : ""}`;

          let pillStyles = "bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300";

          if (isCurrent) {
            pillStyles = isMemory
              ? "bg-teal-600 border-2 border-teal-600 text-white shadow-md ring-4 ring-teal-100 scale-105 z-10"
              : "bg-indigo-600 border-2 border-indigo-600 text-white shadow-md ring-4 ring-indigo-100 scale-105 z-10";
          } else if (isDone) {
            pillStyles = isMemory
              ? "bg-teal-50 border-2 border-teal-200 text-teal-800 hover:bg-teal-100 hover:border-teal-300"
              : "bg-indigo-50 border-2 border-indigo-200 text-indigo-800 hover:bg-indigo-100 hover:border-indigo-300";
          }

          return (
            <div key={num} className="flex items-center flex-shrink-0">
              {isUnlocked ? (
                <Link
                  href={href}
                  onClick={() => playSound("pop")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer pointer-events-auto select-none ${pillStyles}`}
                >
                  {isDone && !isCurrent ? (
                    <CheckCircle2
                      size={13}
                      className={isMemory ? "text-teal-600 flex-shrink-0" : "text-indigo-600 flex-shrink-0"}
                    />
                  ) : null}
                  <span>حصة {num}</span>
                </Link>
              ) : (
                <div
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold bg-slate-100 border-2 border-slate-200/60 text-slate-400 opacity-50 cursor-not-allowed select-none pointer-events-none"
                  title="أكمل الحصص السابقة لفتح هذه الحصة 🔒"
                >
                  <Lock size={12} className="text-slate-400 flex-shrink-0" />
                  <span>حصة {num}</span>
                </div>
              )}

              {/* Connecting Journey Line */}
              {idx < sessions.length - 1 && (
                <div
                  className={`h-[2px] w-3 sm:w-4 flex-shrink-0 rounded-full transition-colors mx-0.5 ${
                    num <= completedSessions
                      ? isMemory
                        ? "bg-teal-400"
                        : "bg-indigo-400"
                      : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}

export default function TherapyNavBar(props: TherapyNavBarProps) {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-5xl mx-auto py-2 mb-4 px-2" dir="rtl">
          <div className="h-10 bg-slate-100 animate-pulse rounded-2xl"></div>
        </div>
      }
    >
      <TherapyNavBarContent {...props} />
    </Suspense>
  );
}
