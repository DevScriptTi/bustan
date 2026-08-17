"use client";

import React, { useState } from "react";
import SessionContainer from "@/components/therapy/SessionContainer";
import { ArrowLeft } from "lucide-react";

// --- Data ---
const act1Data = [
  { id: 1, text: "3 - 2 - 1" },
  { id: 2, text: "0 - 6 - 5" },
  { id: 3, text: "4 - 7 - 9" },
  { id: 4, text: "5 - 3 - 8" },
  { id: 5, text: "1 - 0 - 3" },
  { id: 6, text: "19 - 15 - 10" },
  { id: 7, text: "56 - 32 - 23" },
  { id: 8, text: "98 - 41 - 78" },
  { id: 9, text: "144 - 183 - 112" },
  { id: 10, text: "176 - 167 - 198" },
];

export default function MemorySession5() {
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // --- Handlers ---
  const handleScore = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    if (currentStep < act1Data.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleResetSession = () => {
    setCurrentStep(0);
    setScore(0);
    setIsFinished(false);
  };

  // --- Renders ---
  const renderActivity = () => {
    const currentData = act1Data[currentStep];

    return (
      <div className="flex flex-col items-center w-full max-w-4xl mx-auto space-y-12 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-3">
          <div className="inline-block px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full font-bold text-sm mb-4 border border-indigo-200">
            👨‍👩‍👧 وضع تقييم ولي الأمر
          </div>
          <p className="text-lg md:text-xl text-gray-600">
            يقرأ الطفل الأعداد، ثم يغمض عينيه ويحاول تكرارها بنفس الترتيب.
          </p>
        </div>

        <div className="flex gap-2 justify-center w-full" dir="rtl">
          {act1Data.map((_, idx) => (
            <div key={idx} className={`h-2 w-8 sm:w-10 rounded-full transition-colors ${idx <= currentStep ? "bg-indigo-500" : "bg-gray-200"}`} />
          ))}
        </div>

        <div className="bg-white p-12 md:p-16 rounded-3xl shadow-lg border-2 border-indigo-100 w-full text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl pointer-events-none" />

          <h3 className="text-4xl md:text-6xl font-extrabold text-indigo-900 mb-16 relative z-10" dir="ltr">
            {currentData.text}
          </h3>

          <div className="flex justify-center gap-8 relative z-10">
            <button
              onClick={() => handleScore(false)}
              className="flex flex-col items-center justify-center gap-3 w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-red-50 border-4 border-red-200 hover:bg-red-100 hover:border-red-400 hover:scale-105 active:scale-95 transition-all shadow-sm group"
            >
              <span className="text-5xl md:text-6xl group-hover:scale-110 transition-transform">❌</span>
              <span className="text-lg font-bold text-red-700">أخطأ</span>
            </button>
            <button
              onClick={() => handleScore(true)}
              className="flex flex-col items-center justify-center gap-3 w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-green-50 border-4 border-green-200 hover:bg-green-100 hover:border-green-400 hover:scale-105 active:scale-95 transition-all shadow-sm group"
            >
              <span className="text-5xl md:text-6xl group-hover:scale-110 transition-transform">✅</span>
              <span className="text-lg font-bold text-green-700">أصاب</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  
    return (
    <SessionContainer
      title="الحصة 5: التكرار اللفظي والنطق الداخلي"
      activityTitle="النشاط 1: قراءة الأعداد وتخزينها"
      isCompleted={isFinished}
      onRestart={handleResetSession}
      nextSessionPath="/therapy/memory/session-6"
    >
      {!isFinished && renderActivity()}
    </SessionContainer>
  );
}

