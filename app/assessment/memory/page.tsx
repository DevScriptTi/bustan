"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useBustanSounds } from "@/hooks/useBustanSounds";
import { playSound } from "@/utils/playSound";
import {
  Brain,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  RotateCcw,
  Trophy,
  Award,
  PlayCircle,
  Home,
  Sparkles,
} from "lucide-react";

interface Question {
  activityTitle: string;
  question: string;
  options: string[];
  answer: string;
  memorizationPhase?: boolean;
  sequence?: string;
}

const memoryQuestions: Question[] = [
  { activityTitle: "النشاط 1: الكلمة الناقصة 🧩", question: "أمشط شعري...", options: ["بالمشط", "بالشعر"], answer: "بالمشط" },
  { activityTitle: "النشاط 1: الكلمة الناقصة 🧩", question: "غسلت أسناني...", options: ["بالمعجون", "بالفرشاة"], answer: "بالفرشاة" },
  { activityTitle: "النشاط 1: الكلمة الناقصة 🧩", question: "رتبت الأم الصحون...", options: ["في المطبخ", "في الطاولة"], answer: "في المطبخ" },
  { activityTitle: "النشاط 2: ترتيب الكلمات 🍎", question: "اختر الترتيب الصحيح الذي ظهر لك:", options: ["بطاطا / ثوم / بصل / تفاح", "تفاح / بصل / ثوم / بطاطا"], answer: "بطاطا / ثوم / بصل / تفاح", memorizationPhase: true, sequence: "بطاطا ➔ ثوم ➔ بصل ➔ تفاح" },
  { activityTitle: "النشاط 2: ترتيب الكلمات 🍎", question: "اختر الترتيب الصحيح الذي ظهر لك:", options: ["مقلاة / كأس / صحن / ملعقة", "صحن / مقلاة / ملعقة / كأس"], answer: "مقلاة / كأس / صحن / ملعقة", memorizationPhase: true, sequence: "مقلاة ➔ كأس ➔ صحن ➔ ملعقة" },
  { activityTitle: "النشاط 2: ترتيب الكلمات 🍎", question: "اختر الترتيب الصحيح الذي ظهر لك:", options: ["ماء / لبن / عصير / حليب", "حليب / ماء / لبن / عصير"], answer: "ماء / لبن / عصير / حليب", memorizationPhase: true, sequence: "ماء ➔ لبن ➔ عصير ➔ حليب" },
  { activityTitle: "النشاط 3: تذكر الأرقام 🔢", question: "اختر الأرقام بالترتيب الذي ظهر لك:", options: ["8 - 0 - 6 - 1", "1 - 6 - 8 - 0"], answer: "8 - 0 - 6 - 1", memorizationPhase: true, sequence: "8  •  0  •  6  •  1" },
  { activityTitle: "النشاط 3: تذكر الأرقام 🔢", question: "اختر الأرقام بالترتيب الذي ظهر لك:", options: ["7 - 9 - 0 - 5", "9 - 7 - 5 - 0"], answer: "7 - 9 - 0 - 5", memorizationPhase: true, sequence: "7  •  9  •  0  •  5" },
  { activityTitle: "النشاط 3: تذكر الأرقام 🔢", question: "اختر الأرقام بالترتيب الذي ظهر لك:", options: ["4 - 1 - 2 - 5", "5 - 4 - 2 - 1"], answer: "4 - 1 - 2 - 5", memorizationPhase: true, sequence: "4  •  1  •  2  •  5" },
  { activityTitle: "النشاط 4: تذكر الجملة 📝", question: "تذكر الجملة الصحيحة:", options: ["في السنة أربع فصول", "في السنة فصول"], answer: "في السنة أربع فصول" },
  { activityTitle: "النشاط 4: تذكر الجملة 📝", question: "تذكر الجملة الصحيحة:", options: ["في الشهر أربع أسابيع", "في الشهر أسابيع"], answer: "في الشهر أربع أسابيع" },
  { activityTitle: "النشاط 4: تذكر الجملة 📝", question: "تذكر الجملة الصحيحة:", options: ["في السنة 12 شهر", "في السنة شهر"], answer: "في السنة 12 شهر" },
];

function MemoryAssessmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const childId = searchParams.get("childId");

  const { playClick, playSuccess, playError, playCelebrate } = useBustanSounds();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isMemorizing, setIsMemorizing] = useState(false);
  const [timer, setTimer] = useState(8);
  const [saving, setSaving] = useState(false);

  const currentQuestion = memoryQuestions[currentQuestionIndex];
  const totalQuestions = memoryQuestions.length;
  const progressPercent = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);
  const threshold = Math.ceil(totalQuestions * 0.65); // 8 out of 12

  // Check memorization phase
  useEffect(() => {
    if (currentQuestion?.memorizationPhase) {
      setIsMemorizing(true);
      setTimer(8);
    } else {
      setIsMemorizing(false);
    }
  }, [currentQuestionIndex]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMemorizing && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (isMemorizing && timer === 0) {
      setIsMemorizing(false);
    }
    return () => clearInterval(interval);
  }, [isMemorizing, timer]);

  // Missing ChildId Error Screen
  if (!childId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans" dir="rtl">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-3xl mx-auto">
            ⚠️
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-800">لم يتم تحديد الطفل</h2>
            <p className="text-slate-500 font-medium text-sm leading-relaxed">
              يرجى العودة إلى لوحة التحكم واختيار طفل محدد للبدء في تقييم الذاكرة.
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-black text-base rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <Home size={18} />
            <span>العودة للرئيسية</span>
          </button>
        </div>
      </div>
    );
  }

  const handleAnswer = (option: string) => {
    if (selectedOption !== null) return;
    playSound("pop");
    setSelectedOption(option);

    const isCorrect = option === currentQuestion.answer;
    let newScore = score;

    if (isCorrect) {
      newScore = score + 1;
      setScore(newScore);
      playSound("sparkle");
    } else {
      playSound("boop");
    }

    setTimeout(() => {
      const nextIdx = currentQuestionIndex + 1;
      if (nextIdx < totalQuestions) {
        setCurrentQuestionIndex(nextIdx);
        setSelectedOption(null);
      } else {
        finishAssessment(newScore);
      }
    }, 600);
  };

  const finishAssessment = async (finalScore: number) => {
    setIsCompleted(true);
    playSound("cheer");
    const needsMemoryTherapy = finalScore < threshold;

    if (finalScore >= threshold) {
      try { playCelebrate(); } catch {}
    }

    // Save result to Firestore
    setSaving(true);
    try {
      await updateDoc(doc(db, "children", childId), {
        memoryEvalDone: true,
        needsMemoryTherapy: needsMemoryTherapy,
        memoryScore: finalScore,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error updating child memory evaluation:", err);
    } finally {
      setSaving(false);
    }
  };

  const passed = score >= threshold;

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col justify-between" dir="rtl">
      
      {/* ─── Top Bar ─── */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            onClick={() => { try { playClick(); } catch {} }}
          >
            <ArrowLeft size={20} className="rotate-180" />
          </Link>
          <div className="flex items-center gap-2">
            <Brain className="text-teal-600" size={24} />
            <h1 className="text-xl font-black text-slate-800">تقييم الذاكرة</h1>
          </div>
        </div>

        {!isCompleted && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500">
              السؤال {currentQuestionIndex + 1} من {totalQuestions}
            </span>
            <div className="w-32 bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
              <div
                className="bg-teal-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </header>

      {/* ─── Main Section ─── */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 flex flex-col justify-center">
        {isCompleted ? (
          /* ── POST-ASSESSMENT SUCCESS SCREEN ── */
          <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
            
            {/* Header Badge */}
            <div className="w-20 h-20 bg-teal-100 text-teal-700 rounded-3xl flex items-center justify-center text-4xl mx-auto shadow-inner">
              {passed ? "🏆" : "🌟"}
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-teal-50 text-teal-700 text-xs font-black border border-teal-200 mb-2">
                <Sparkles size={14} />
                تقييم جديد
              </span>
              <h2 className="text-3xl font-black text-slate-800">تم إكمال التقييم بنجاح! 🎉</h2>
              <p className="text-slate-500 font-medium text-sm mt-1">
                {saving ? "جاري حفظ النتائج..." : "تم حفظ نتائج التقييم في ملف الطفل بنجاح"}
              </p>
            </div>

            {/* Score Result Card */}
            <div className="inline-flex items-center gap-4 bg-gradient-to-br from-teal-50 to-emerald-50 border-2 border-teal-200 px-8 py-5 rounded-2xl shadow-sm">
              <Trophy size={28} className="text-teal-600" />
              <div className="text-right">
                <p className="text-xs text-teal-600 font-bold">النتيجة الكلية</p>
                <p className="text-2xl font-black text-teal-900">
                  {score} من {totalQuestions} إجابات صحيحة
                </p>
              </div>
            </div>

            {/* Assessment Feedback Notice */}
            {passed ? (
              <div className="bg-emerald-50 border-2 border-emerald-300 p-5 rounded-2xl text-emerald-900 font-bold space-y-1 text-right">
                <div className="flex items-center gap-2 text-emerald-700 text-lg">
                  <CheckCircle2 size={22} />
                  <span>مستوى رائع جداً! 🌟</span>
                </div>
                <p className="text-sm font-medium text-emerald-800">
                  الطفل يتمتع بمهارات ذاكرة ممتازة ولا يحتاج إلى برنامج علاجي حالياً.
                </p>
              </div>
            ) : (
              <div className="bg-indigo-50 border-2 border-indigo-300 p-5 rounded-2xl text-indigo-900 font-bold space-y-1 text-right">
                <div className="flex items-center gap-2 text-indigo-700 text-lg">
                  <AlertCircle size={22} />
                  <span>توصية: البدء في برنامج علاج الذاكرة</span>
                </div>
                <p className="text-sm font-medium text-indigo-800">
                  تم تحديد احتياج الطفل لبرنامج تدريب الذاكرة (11 جلسة تفاعلية).
                </p>
              </div>
            )}

            {/* TWO Clear Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
              {/* Primary Button */}
              <button
                onClick={() => router.push("/therapy/memory/session-1")}
                className="w-full sm:w-auto px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-black text-lg rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <PlayCircle size={22} />
                <span>الانتقال إلى برنامج العلاج</span>
              </button>

              {/* Secondary Button */}
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full sm:w-auto px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base rounded-2xl border border-slate-200 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Home size={20} />
                <span>العودة للرئيسية</span>
              </button>
            </div>

          </div>
        ) : isMemorizing ? (
          /* ── MEMORIZATION PHASE CARD ── */
          <div className="bg-white border-2 border-teal-200 rounded-3xl p-8 shadow-md text-center space-y-6">
            <div className="inline-block bg-teal-100 text-teal-800 font-extrabold px-4 py-1.5 rounded-full text-sm">
              {currentQuestion.activityTitle}
            </div>

            <h2 className="text-2xl font-black text-slate-800">احفظ العناصر التالية جيداً! 🧠</h2>

            <div className="py-8 bg-teal-50 border-2 border-dashed border-teal-300 rounded-2xl flex flex-col items-center gap-3">
              <span className="text-3xl sm:text-4xl font-black text-teal-900 font-mono tracking-wider">
                {currentQuestion.sequence}
              </span>
              <span className="text-xs text-teal-600 font-bold">ركز جيداً قبل اختفاء العناصر</span>
            </div>

            <div className="flex items-center justify-center gap-2 text-slate-500 font-bold">
              <span>سيختفي الشكل خلال:</span>
              <span className="w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center font-mono font-black text-xl animate-pulse">
                {timer}
              </span>
              <span>ثوانٍ</span>
            </div>

            <button
              onClick={() => setIsMemorizing(false)}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow cursor-pointer transition-all"
            >
              أنا جاهز للإجابة 🚀
            </button>
          </div>
        ) : (
          /* ── QUESTION CARD ── */
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-md space-y-6">
            <div className="text-center">
              <span className="inline-block bg-slate-100 text-slate-700 font-bold px-4 py-1.5 rounded-xl text-sm">
                {currentQuestion.activityTitle}
              </span>
            </div>

            <h2 className="text-2xl font-black text-slate-800 text-center leading-relaxed">
              {currentQuestion.question}
            </h2>

            {/* Options */}
            <div className="grid grid-cols-1 gap-4 pt-2">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedOption === option;
                const isCorrect = option === currentQuestion.answer;
                const showFeedback = selectedOption !== null;

                let style = "bg-slate-50 border-2 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300";

                if (showFeedback) {
                  if (isSelected && isCorrect) {
                    style = "bg-emerald-50 border-2 border-emerald-500 text-emerald-900 ring-2 ring-emerald-300";
                  } else if (isSelected && !isCorrect) {
                    style = "bg-red-50 border-2 border-red-400 text-red-900 ring-2 ring-red-200";
                  } else if (!isSelected && isCorrect) {
                    style = "bg-emerald-50 border-2 border-emerald-400 text-emerald-900";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(option)}
                    disabled={selectedOption !== null}
                    className={`p-5 rounded-2xl font-black text-lg sm:text-xl transition-all cursor-pointer active:scale-98 text-center ${style}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </main>

    </div>
  );
}

export default function MemoryAssessment() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans" dir="rtl">
          <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
        </div>
      }
    >
      <MemoryAssessmentContent />
    </Suspense>
  );
}
