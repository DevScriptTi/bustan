"use client";

import { ReactNode, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useBustanSounds } from "@/hooks/useBustanSounds";
import TherapyNavBar from "@/components/therapy/TherapyNavBar";
import { recordSessionCompletion } from "@/hooks/useProgressTracker";
import { LogOut } from "lucide-react";

interface SessionContainerProps {
  title: string;
  activityTitle: string;
  isCompleted: boolean;
  onRestart: () => void;
  nextSessionPath: string;
  childId?: string | null;
  programType?: "memory" | "odd";
  currentSessionNumber?: number;
  currentSession?: number;
  children: ReactNode;
}

function SessionContainerContent({
  title,
  activityTitle,
  isCompleted,
  onRestart,
  nextSessionPath,
  childId,
  programType = "memory",
  currentSessionNumber,
  currentSession,
  children,
}: SessionContainerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { playCelebrate, playClick } = useBustanSounds();

  const urlChildId = searchParams ? searchParams.get("childId") : null;
  const activeChildId = childId || urlChildId;

  const pathMatch = pathname ? pathname.match(/session-(\d+)/) : null;
  const detectedSessionNum = pathMatch ? parseInt(pathMatch[1], 10) : 1;
  const activeSession = currentSessionNumber ?? currentSession ?? detectedSessionNum;

  const detectedProgramType: "memory" | "odd" = pathname && pathname.includes("/therapy/odd") ? "odd" : "memory";
  const activeProgramType = programType || detectedProgramType;

  const [hasRecordedProgress, setHasRecordedProgress] = useState(false);

  // Play celebration sound & record progress in Firestore on completion
  useEffect(() => {
    if (isCompleted) {
      playCelebrate();

      if (activeChildId && !hasRecordedProgress) {
        setHasRecordedProgress(true);
        const sessionTitle = title || `الحصة ${activeSession}`;
        recordSessionCompletion(
          activeChildId,
          activeProgramType,
          sessionTitle,
          5,
          activeSession
        ).catch((err) => {
          console.error("SessionContainer error recording progress:", err);
        });
      }
    }
  }, [isCompleted, activeChildId, activeProgramType, title, activeSession, hasRecordedProgress, playCelebrate]);

  const handleRestartSession = () => {
    playClick();
    setHasRecordedProgress(false);
    onRestart();
  };

  const handleNextClick = () => {
    playClick();
    if (activeChildId && !nextSessionPath.includes("childId=")) {
      const separator = nextSessionPath.includes("?") ? "&" : "?";
      router.push(`${nextSessionPath}${separator}childId=${activeChildId}`);
    } else {
      router.push(nextSessionPath);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center px-4 py-6" dir="rtl">
      
      {/* Header: Dynamic TherapyNavBar for memory and odd sessions */}
      <TherapyNavBar
        childId={activeChildId}
        programType={activeProgramType}
        currentSessionNumber={activeSession}
      />

      {/* Centralized Titles */}
      <h1 className="text-3xl font-black mb-2 text-slate-800 text-center">{title}</h1>
      <h2 className="text-xl font-bold mb-6 text-teal-600 text-center">{activityTitle}</h2>

      {/* The Actual Game Content */}
      <div className="w-full bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center min-h-[400px] justify-center">
        {!isCompleted ? (
          children
        ) : (
          /* Centralized Success Screen */
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500 py-8 text-center space-y-4">
            <div className="text-8xl animate-bounce select-none">🎉</div>
            <h3 className="text-3xl font-black text-teal-600">
              رائع! لقد أكملت النشاط بنجاح
            </h3>

            {/* Star Reward Badge */}
            <div className="inline-flex items-center gap-2 bg-amber-50 border-2 border-amber-300 px-6 py-3 rounded-2xl shadow-sm text-amber-900 font-extrabold text-xl">
              <span>أحسنت! لقد حصلت على 5 نجوم 🌟</span>
            </div>

            <p className="text-slate-500 font-medium text-lg pb-4">استمر هكذا، أنت بطل حقيقي! 🚀</p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
              <button
                onClick={handleRestartSession}
                className="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-lg cursor-pointer"
              >
                <span>🔄 إعادة الحصة</span>
              </button>

              <button
                onClick={handleNextClick}
                className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-lg cursor-pointer"
              >
                <span>التالي ⬅️</span>
              </button>

              <Link
                href="/dashboard"
                onClick={() => playClick()}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl border border-slate-200 transition-all flex items-center justify-center gap-2 text-lg cursor-pointer"
              >
                <span>🏠 العودة للرئيسية</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SessionContainer(props: SessionContainerProps) {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-5xl mx-auto flex items-center justify-center p-12 font-sans" dir="rtl">
          <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
        </div>
      }
    >
      <SessionContainerContent {...props} />
    </Suspense>
  );
}
