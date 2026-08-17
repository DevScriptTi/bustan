"use client";

import React, { useState } from "react";
import SessionContainer from "@/components/therapy/SessionContainer";

// --- Data Structure ---
const questions = [
  {
    id: 1,
    title: "شيء يزعجك؟",
    options: [
      { text: "صديق أخذ لعبتي", icon: "🧸" },
      { text: "معلم يقول لا", icon: "👨‍🏫" },
      { text: "أحد يزعجني", icon: "😠" },
      { text: "أحد يصرخ علي", icon: "🗣️" }
    ]
  },
  {
    id: 2,
    title: "لونك المفضل؟",
    options: [
      { text: "أزرق", icon: "🟦" },
      { text: "أحمر", icon: "🟥" },
      { text: "أصفر", icon: "🟨" },
      { text: "أخضر", icon: "🟩" }
    ]
  },
  {
    id: 3,
    title: "شيء تحبه؟",
    options: [
      { text: "كرة", icon: "⚽" },
      { text: "شوكولا", icon: "🍫" },
      { text: "لعبة", icon: "🎮" }
    ]
  }
];

export default function OddSession1() {
  // State Management
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<typeof questions[0] | null>(null);

  // Spin Ball Handler
  const handleSpinBall = () => {
    setIsSpinning(true);
    setTimeout(() => {
      setIsSpinning(false);
      setStep(1);
    }, 2000);
  };

  // Reset Session Handler
  const handleResetSession = () => {
    setStep(0);
    setIsSpinning(false);
    setSelectedQuestion(null);
  };

  // Pastel colors for step 2 option cards
  const optionColors = [
    "bg-sky-50 border-sky-200 hover:bg-sky-100/80 text-sky-900 hover:border-sky-300",
    "bg-mint-50 border-mint-200 hover:bg-mint-100/80 text-mint-900 hover:border-mint-300",
    "bg-peach-50 border-peach-200 hover:bg-peach-100/80 text-peach-900 hover:border-peach-300",
    "bg-cream-50 border-cream-200 hover:bg-cream-100/80 text-cream-900 hover:border-cream-300",
  ];

  return (
    <SessionContainer
      title="برنامج تعديل السلوك (ODD) - الحصة 1"
      activityTitle="النشاط 1: الكرة المتحدثة 🏐"
      isCompleted={step === 3}
      onRestart={handleResetSession}
      nextSessionPath="/therapy/odd/session-2"
      programType="odd"
      currentSession={1}
    >
      {/* Progress indicator */}
      <div className="flex gap-2 justify-center w-full mb-8 max-w-md mx-auto">
        {[0, 1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2.5 flex-1 rounded-full transition-all duration-300 ${
              s <= step ? "bg-indigo-600 shadow-sm" : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* Interactive Main Area */}
      <div className="relative min-h-[45vh] flex items-center justify-center w-full">
        
        {/* STEP 0: The Spinning Ball */}
        {step === 0 && (
          <div className="flex flex-col items-center justify-center p-8 bg-white border-2 border-indigo-50 rounded-3xl shadow-lg max-w-lg w-full space-y-8 animate-fadeIn text-center">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <span
                className={`text-9xl select-none block transition-all duration-200 ${
                  isSpinning ? "animate-spin scale-110" : "hover:scale-105"
                }`}
              >
                🏐
              </span>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-700">هل أنت مستعد لبدء اللعبة يا بطل؟</h3>
              <p className="text-sm text-gray-500">اضغط على زر التدوير لتدور الكرة وتختار لك سؤالاً رائعاً!</p>
            </div>

            <button
              onClick={handleSpinBall}
              disabled={isSpinning}
              className="w-full py-4 sm:py-5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 text-white text-xl font-extrabold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSpinning ? (
                <>
                  <span className="animate-spin inline-block">🌀</span>
                  <span>الكرة تدور...</span>
                </>
              ) : (
                <>
                  <span>دوّر الكرة!</span>
                  <span>🏐</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* STEP 1: Select a Question */}
        {step === 1 && (
          <div className="flex flex-col items-center justify-center p-8 bg-white border-2 border-indigo-50 rounded-3xl shadow-lg max-w-xl w-full space-y-8 animate-fadeIn text-center">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <span className="text-7xl select-none block hover:animate-bounce">
                🏐
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-2xl font-extrabold text-gray-800">
                الكرة توقفت! اختر سؤالاً لتجيب عليه:
              </p>
              <p className="text-sm text-gray-500 font-medium">اضغط على بطاقة السؤال الذي ترغب في الإجابة عليه اليوم</p>
            </div>

            <div className="grid grid-cols-1 gap-4 w-full">
              {questions.map((q) => (
                <button
                  key={q.id}
                  onClick={() => {
                    setSelectedQuestion(q);
                    setStep(2);
                  }}
                  className="w-full py-5 px-6 bg-indigo-50/50 hover:bg-indigo-100/70 border-2 border-indigo-100/50 hover:border-indigo-300 text-indigo-950 text-right text-lg md:text-xl font-extrabold rounded-2xl transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-sm flex items-center justify-between"
                >
                  <span>{q.title}</span>
                  <span className="text-2xl">✨</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Answer the Question */}
        {step === 2 && selectedQuestion && (
          <div className="flex flex-col items-center justify-center p-8 bg-white border-2 border-indigo-50 rounded-3xl shadow-lg max-w-2xl w-full space-y-8 animate-fadeIn text-center">
            <div className="space-y-3">
              <span className="inline-block text-4xl animate-bounce">💬</span>
              <h3 className="text-3xl font-black text-indigo-900">
                {selectedQuestion.title}
              </h3>
              <p className="text-sm text-gray-500 font-bold">
                اختر الخيار الذي يعبر عنك يا بطل! (لا توجد إجابة خاطئة)
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {selectedQuestion.options.map((opt, index) => {
                const colorClass = optionColors[index % optionColors.length];
                return (
                  <button
                    key={index}
                    onClick={() => {
                      // Smooth transition to end screen
                      setTimeout(() => {
                        setStep(3);
                      }, 200);
                    }}
                    className={`flex flex-col items-center justify-center p-6 rounded-2xl border-4 transition-all duration-200 active:scale-95 cursor-pointer shadow-sm ${colorClass}`}
                  >
                    <span className="text-5xl mb-3 select-none transform transition-transform duration-200 hover:scale-115">
                      {opt.icon}
                    </span>
                    <span className="text-lg sm:text-xl font-black">
                      {opt.text}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setStep(1)}
              className="text-sm font-extrabold text-indigo-600 hover:text-indigo-800 transition-colors mt-2"
            >
              ← العودة واختيار سؤال آخر
            </button>
          </div>
        )}
      </div>

      {/* Embedded slide transitions styling */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .animate-scaleUp {
          animation: scaleUp 0.5s ease-out forwards;
        }
      ` }} />
    </SessionContainer>
  );
}
