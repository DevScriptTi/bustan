"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useBustanSounds } from "@/hooks/useBustanSounds";
import { playSound } from "@/utils/playSound";
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Trophy,
  PlayCircle,
  Home,
  Sparkles,
} from "lucide-react";

const oddQuestions = [
  "يرفض طفلي تنفيذ الطلبات المباشرة (النوم، جمع الألعاب)",
  "يجادل طفلي في القواعد التي أضعها له",
  "يقوم طفلي بفعل عكس ما يطلب منه عمداً",
  "يجد طفلي صعوبة في الانتقال من نشاط يحبه إلى نشاط آخر مطلوب منه",
  "يفقد طفلي أعصابه ويصرخ عند العقاب والرفض",
  "يبدو طفلي سريع الانزعاج من تصرفات الآخرين حوله",
  "يظهر طفلي ملامح الغضب والجلوس لفترة عندما لا يكون الأمر كما يريد هو",
  "يصر طفلي على رأيه بشكل مبالغ فيه",
  "يتعمد طفلي القيام بسلوكيات تثير انزعاج أفراد الأسرة",
  "يلقي طفلي اللوم على الآخرين عند ارتكابه لخطأ ما",
  "يستخدم طفلي البكاء أو الصراخ كوسيلة ضغط للحصول على ما يريد",
];

const ratingOptions = [
  { label: "نادراً", value: 1 },
  { label: "أحياناً", value: 2 },
  { label: "دائماً", value: 3 },
];

function OddAssessmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const childId = searchParams.get("childId");

  const { playClick, playSuccess, playCelebrate } = useBustanSounds();

  const [showIntro, setShowIntro] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const totalQuestions = oddQuestions.length;
  const progressPercent = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);

  // Missing ChildId Screen
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
              يرجى العودة إلى لوحة التحكم وااختيار طفل محدد للبدء في تقييم السلوك.
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <Home size={18} />
            <span>العودة للرئيسية</span>
          </button>
        </div>
      </div>
    );
  }

  const handleRatingSelect = (val: number) => {
    if (selectedRating !== null) return;
    playSound("pop");
    setSelectedRating(val);

    const newScore = score + val;
    setScore(newScore);
    try { playSuccess(); } catch { }

    setTimeout(() => {
      const nextIdx = currentQuestionIndex + 1;
      if (nextIdx < totalQuestions) {
        setCurrentQuestionIndex(nextIdx);
        setSelectedRating(null);
      } else {
        finishAssessment(newScore);
      }
    }, 500);
  };

  const finishAssessment = async (finalScore: number) => {
    setIsCompleted(true);
    playSound("cheer");
    const needsOddTherapy = finalScore > 20;

    if (needsOddTherapy) {
      try { playCelebrate(); } catch { }
    }

    setSaving(true);
    try {
      await updateDoc(doc(db, "children", childId), {
        oddEvalDone: true,
        needsOddTherapy: needsOddTherapy,
        oddScore: finalScore,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error updating ODD assessment result:", err);
    } finally {
      setSaving(false);
    }
  };

  const needsTherapy = score > 20;

  // Introduction Screen
  if (showIntro) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans" dir="rtl">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            onClick={() => { try { playClick(); } catch { } }}
          >
            <ArrowLeft size={20} className="rotate-180" />
          </Link>
          <div className="flex items-center gap-2">
            <Activity className="text-indigo-600" size={24} />
            <span className="text-xl font-black text-slate-800">اضطراب العناد المتحدي ODD</span>
          </div>
        </header>

        <main className="flex-1 w-full max-w-3xl mx-auto p-4 sm:p-8 flex flex-col justify-center">
          <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-100 text-center space-y-8">
            <div>
              <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black border border-indigo-200 mb-3">
                <Sparkles size={14} />
                تقييم سلوكي للأهل
              </span>
              <h1 className="text-3xl font-black text-slate-800">ما هو اضطراب العناد المتحدي (ODD)؟</h1>
            </div>

            {/* ODD Explanation Video Player */}
            <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-md border-2 border-indigo-100 bg-slate-900">
              <video
                src="/videos/odd-explanation.mp4"
                controls
                preload="metadata"
                className="w-full h-full object-cover"
              >
                عذراً، متصفحك لا يدعم تشغيل الفيديو.
              </video>
            </div>

            <p className="text-indigo-950 font-bold text-base max-w-lg mx-auto leading-relaxed">
              يساعد هذا المقياس في فهم نمط سلوكيات الطفل ومستوى التحدي أو الانفعال اليومي لتحديد ما إذا كان بحاجة لبرنامج زيادة المناعة النفسية (ODD).
            </p>

            <p className="text-slate-600 font-medium text-sm leading-relaxed max-w-2xl mx-auto">
              يرجى الإجابة عن الأسئلة المكونة من 11 فقرة بموضوعية بناءً على سلوك طفلك في الفترة الأخيرة.
            </p>

            <button
              onClick={() => {
                try { playClick(); } catch { }
                setShowIntro(false);
              }}
              className="w-full sm:w-auto px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              فهمت، ابدأ المقياس 🚀
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col justify-between" dir="rtl">

      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <button
          onClick={() => {
            try { playClick(); } catch { }
            setShowIntro(true);
          }}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <ArrowLeft size={20} className="rotate-180" />
        </button>
        <div className="flex items-center gap-2">
          <Activity className="text-indigo-600" size={22} />
          <span className="text-lg font-black text-slate-800">اضطراب العناد المتحدي ODD</span>
        </div>
        {!isCompleted && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500">
              {currentQuestionIndex + 1} من {totalQuestions}
            </span>
            <div className="w-28 bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
              <div
                className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 flex flex-col justify-center">
        {isCompleted ? (
          /* ── POST-ASSESSMENT SUCCESS SCREEN ── */
          <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">

            {/* Header Icon */}
            <div className="w-20 h-20 bg-indigo-100 text-indigo-700 rounded-3xl flex items-center justify-center text-4xl mx-auto shadow-inner">
              🌋
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black border border-indigo-200 mb-2">
                <Sparkles size={14} />
                مقياس السلوك مكتمل
              </span>
              <h2 className="text-3xl font-black text-slate-800">تم إكمال تقييم السلوك بنجاح! 🎉</h2>
              <p className="text-slate-500 font-medium text-sm mt-1">
                {saving ? "جاري حفظ النتائج..." : "تم حفظ نتيجة التقييم في سجل الطفل بنجاح"}
              </p>
            </div>

            {/* Score Result Banner */}
            <div className="inline-flex items-center gap-4 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 px-8 py-5 rounded-2xl shadow-sm">
              <Trophy size={28} className="text-indigo-600" />
              <div className="text-right">
                <p className="text-xs text-indigo-600 font-bold">مجموع النقاط السلوكية</p>
                <p className="text-2xl font-black text-indigo-950">
                  {score} من {totalQuestions * 3}
                </p>
              </div>
            </div>

            {/* Diagnostic Recommendation */}
            {needsTherapy ? (
              <div className="bg-indigo-50 border-2 border-indigo-300 p-5 rounded-2xl text-indigo-950 font-bold space-y-1 text-right">
                <div className="flex items-center gap-2 text-indigo-700 text-lg">
                  <AlertCircle size={22} />
                  <span>توصية: البدء في برنامج زيادة المناعة النفسية للأطفال (ODD)</span>
                </div>
                <p className="text-sm font-medium text-indigo-800 leading-relaxed">
                  تظهر النتائج أن الطفل يستفيد بشكل كبير من برنامج زيادة المناعة النفسية (ODD) (8 حصص علاجية تفاعلية).
                </p>
              </div>
            ) : (
              <div className="bg-emerald-50 border-2 border-emerald-300 p-5 rounded-2xl text-emerald-950 font-bold space-y-1 text-right">
                <div className="flex items-center gap-2 text-emerald-700 text-lg">
                  <CheckCircle2 size={22} />
                  <span>مستوى طبيعي ومستقر ✅</span>
                </div>
                <p className="text-sm font-medium text-emerald-800 leading-relaxed">
                  السلوكيات التحدية ضمن النطاق الطبيعي المعتاد للطفل ولا تتطلب برنامج علاج مكثف حالياً.
                </p>
              </div>
            )}

            {/* TWO Clear Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
              {/* Primary Button */}
              <button
                onClick={() => router.push("/therapy/odd/session-1")}
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <PlayCircle size={22} />
                <span>الانتقال إلى برنامج زيادة المناعة النفسية (ODD)</span>
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
        ) : (
          /* ── QUESTION CARD ── */
          <div className="space-y-8">
            {/* Question Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-md space-y-8">
              <span className="inline-block bg-indigo-50 text-indigo-700 font-bold px-4 py-1.5 rounded-xl text-xs">
                السؤال {currentQuestionIndex + 1}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 leading-relaxed text-center">
                {oddQuestions[currentQuestionIndex]}
              </h2>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
                {ratingOptions.map((option) => {
                  const isSelected = selectedRating === option.value;
                  const showFeedback = selectedRating !== null;

                  let style = "bg-slate-50 border-2 border-slate-200 text-slate-800 hover:bg-indigo-50 hover:border-indigo-300";

                  if (showFeedback && isSelected) {
                    style = "bg-indigo-50 border-2 border-indigo-500 text-indigo-950 ring-2 ring-indigo-300";
                  }

                  return (
                    <button
                      key={option.value}
                      onClick={() => handleRatingSelect(option.value)}
                      disabled={selectedRating !== null}
                      className={`flex-1 p-5 border-2 text-center text-xl font-bold rounded-2xl transition-all duration-200 cursor-pointer active:scale-98 ${style}`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function OddAssessment() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans" dir="rtl">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      }
    >
      <OddAssessmentContent />
    </Suspense>
  );
}
