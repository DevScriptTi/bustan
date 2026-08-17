"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SessionContainer from "@/components/therapy/SessionContainer";
import BreathingExercise from "@/components/BreathingExercise";

const situations = [
  {
    title: "شخص يحاول استفزازك",
    emoji: "😠",
    options: [
      { id: 1, text: "أقوم بضربه", isCorrect: false },
      { id: 2, text: "أبتعد عنه", isCorrect: true },
      { id: 3, text: "أخبر أمي أو معلمتي", isCorrect: true },
    ],
  },
  {
    title: "الأم ترفض الخروج",
    emoji: "🚫",
    options: [
      { id: 1, text: "أغضب وأصرخ", isCorrect: false },
      { id: 2, text: "أقوم بواجباتي ثم أطلب الإذن ثانية", isCorrect: true },
      { id: 3, text: "أذهب لغرفتي وأرفض التحدث إلى أمي", isCorrect: false },
    ],
  },
  {
    title: "المعلمة تعاقبك لأن زميلك بدأ بإزعاجك",
    emoji: "🏫",
    options: [
      { id: 1, text: "أضرب زميلي", isCorrect: false },
      { id: 2, text: "أبكي ولا أتكلم", isCorrect: false },
      { id: 3, text: "أدافع عن نفسي وأخبر معلمتي الحقيقة بهدوء", isCorrect: true },
    ],
  },
];

export default function OddSession6() {
  const [currentSituation, setCurrentSituation] = useState(0);
  const [phase, setPhase] = useState<"intro" | "counting" | "breathing" | "choosing">("intro");
  const [count, setCount] = useState(1);
  const [wrongAttemptId, setWrongAttemptId] = useState<number | null>(null);
  const [successId, setSuccessId] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const resetSession = () => {
    setCurrentSituation(0);
    setPhase("intro");
    setCount(1);
    setWrongAttemptId(null);
    setSuccessId(null);
    setIsCompleted(false);
  };

  // Counting Phase Effect
  useEffect(() => {
    if (phase === "counting") {
      setCount(1);
      const interval = setInterval(() => {
        setCount((prev) => {
          if (prev >= 5) {
            clearInterval(interval);
            setTimeout(() => {
              setPhase("breathing");
            }, 1000);
            return 5;
          }
          return prev + 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [phase]);



  const handleOptionClick = (option: { id: number; text: string; isCorrect: boolean }) => {
    if (option.isCorrect) {
      setSuccessId(option.id);
      setWrongAttemptId(null);

      setTimeout(() => {
        setSuccessId(null);
        if (currentSituation < situations.length - 1) {
          setCurrentSituation((prev) => prev + 1);
          setPhase("intro");
        } else {
          setIsCompleted(true);
        }
      }, 1200);
    } else {
      setWrongAttemptId(option.id);
      setTimeout(() => setWrongAttemptId(null), 500);
    }
  };

  const sit = situations[currentSituation];

  return (
    <SessionContainer
      title="برنامج زيادة المناعة النفسية (ODD) - الحصة 6"
      activityTitle="النشاط 6: التفكير قبل رد الفعل والإدارة الذاتية"
      isCompleted={isCompleted}
      nextSessionPath="/therapy/odd/session-7"
      onRestart={resetSession}
      programType="odd"
      currentSession={6}
    >
      <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto space-y-6 min-h-[420px] select-none" dir="rtl">
        {/* Situation Progress Bar */}
        <div className="flex items-center gap-2 mb-2">
          {situations.map((_, idx) => (
            <div
              key={idx}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                currentSituation === idx
                  ? "bg-indigo-600 text-white ring-4 ring-indigo-200 scale-110"
                  : currentSituation > idx
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {currentSituation > idx ? "✓" : idx + 1}
            </div>
          ))}
        </div>

        {/* Phase A: Intro */}
        {phase === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex flex-col items-center text-center space-y-8 bg-sky-50 border-4 border-sky-200 p-8 rounded-3xl shadow-sm"
          >
            <span className="text-8xl drop-shadow-md animate-bounce">{sit.emoji}</span>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-slate-800">{sit.title}</h3>
              <p className="text-xl font-bold text-sky-700">خطوة للخلف قبل الرد... 🛑</p>
            </div>
            <button
              onClick={() => setPhase("counting")}
              className="px-10 py-5 bg-sky-500 hover:bg-sky-600 text-white font-black text-2xl rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer hover:scale-105"
            >
              ابدأ التهدئة 🧘‍♂️
            </button>
          </motion.div>
        )}

        {/* Phase B: Counting */}
        {phase === "counting" && (
          <motion.div
            key="counting"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full flex flex-col items-center text-center space-y-8 bg-amber-50 border-4 border-amber-200 p-8 rounded-3xl shadow-sm"
          >
            <h3 className="text-2xl font-bold text-amber-800">احسب من 1 إلى 5... 🖐️</h3>
            <div className="w-40 h-40 rounded-full bg-amber-400 border-8 border-white flex items-center justify-center shadow-xl">
              <motion.span
                key={count}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-7xl font-black text-white drop-shadow-md"
              >
                {count}
              </motion.span>
            </div>
            <p className="text-amber-700 font-semibold">خذ وقتك واهدأ...</p>
          </motion.div>
        )}

        {/* Phase C: Breathing Video Exercise */}
        {phase === "breathing" && (
          <BreathingExercise
            onFinish={() => setPhase("choosing")}
            title="تمرين التنفس للتهدئة 😮‍💨"
            buttonText="الانتقال إلى خيارات التصرف ➡️"
          />
        )}

        {/* Phase D: Choosing */}
        {phase === "choosing" && (
          <motion.div
            key="choosing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex flex-col items-center space-y-6"
          >
            <div className="bg-emerald-50 border-4 border-emerald-200 p-6 rounded-3xl text-center w-full shadow-sm flex items-center gap-4">
              <span className="text-5xl">{sit.emoji}</span>
              <div className="text-right flex-1">
                <h3 className="text-2xl font-bold text-slate-800">{sit.title}</h3>
                <p className="text-emerald-700 font-bold text-base mt-1">الآن، اختر أفضل حل:</p>
              </div>
            </div>

            <div className="w-full space-y-4">
              {sit.options.map((opt) => {
                const isWrong = wrongAttemptId === opt.id;
                const isSuccess = successId === opt.id;

                return (
                  <motion.button
                    key={opt.id}
                    onClick={() => handleOptionClick(opt)}
                    animate={
                      isWrong
                        ? { x: [-10, 10, -10, 10, 0] }
                        : isSuccess
                        ? { scale: [1, 1.03, 1], backgroundColor: "#dcfce7", borderColor: "#86efac" }
                        : {}
                    }
                    transition={{ duration: isWrong ? 0.4 : 0.5 }}
                    className={`w-full p-5 rounded-2xl border-4 text-right transition-colors shadow-sm cursor-pointer flex items-center justify-between ${
                      isSuccess
                        ? "bg-green-100 border-green-300 text-green-800"
                        : isWrong
                        ? "bg-red-50 border-red-300 text-red-800"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xl font-bold flex-1">{opt.text}</span>
                    {isWrong && <span className="text-red-500 font-bold text-base">خيار غير مناسب ❌</span>}
                    {isSuccess && <span className="text-green-600 font-bold text-2xl">تصرف ممتاز! ✅</span>}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </SessionContainer>
  );
}
