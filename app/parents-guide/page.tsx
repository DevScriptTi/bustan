"use client";

import { useState } from "react";
import MainNavbar from "@/components/MainNavbar";
import { playSound } from "@/utils/playSound";
import {
  Sparkles,
  ChevronDown,
  CheckCircle2,
  Send,
  HeartHandshake,
  ShieldCheck,
  BookOpen,
} from "lucide-react";

interface GuideItem {
  id: number;
  num: string;
  title: string;
  subtitle: string;
  icon: string;
  content: string;
}

const guideItems: GuideItem[] = [
  {
    id: 1,
    num: "01",
    title: "تهيئة البيئة المنزلية المشجعة",
    subtitle: "توفير ركن هادئ ومنظم للتعلم واللعب",
    icon: "🏠",
    content:
      "تجهيز ركن هادئ وإبعاد الهواتف والمشتتات البصرية أثناء وقت الأنشطة يساعد الطفل على استجابة أفضل ومضاعفة التركيز الانتباهي والذاكرة العاملة.",
  },
  {
    id: 2,
    num: "02",
    title: "مهارات التعامل التربوي الإيجابي",
    subtitle: "من الأمر إلى الخيار",
    icon: "💬",
    content:
      "توجيه طفلك عبر تقديم خيارات إيجابية بدلاً من الأوامر المباشرة الحادة ينقله من الرفض والعناد إلى الشعور بالمسؤولية والاستقلالية (مثال: هل تفضل أداء النشاط الآن أم بعد 5 دقائق؟).",
  },
  {
    id: 3,
    num: "03",
    title: "وقت خاص بطفلك",
    subtitle: "30 دقيقة يومياً بلا هاتف ولا مقاطعة",
    icon: "🕒",
    content:
      "تخصيص نصف ساعة يومياً للاستماع للطفل ومشاركته اللعب المفضل دون أي تشتيت يبني جسور الثقة ويقلل من السلوكيات التنافسية والجلبة بشكل ملحوظ.",
  },
  {
    id: 4,
    num: "04",
    title: "قدوة بدل العتاب",
    subtitle: "حين تغضب الأم، ماذا تفعل بدل الصراخ؟",
    icon: "💨",
    content:
      "أخذ نفس عميق والابتعاد لثوانٍ يعلّم الطفل كيفية إدارة الانفعالات والغضب بالنمذجة الإيجابية بدلاً من ردود الفعل الحادة.",
  },
  {
    id: 5,
    num: "05",
    title: "صعوبات التطبيق في المنزل",
    subtitle: "شاركي ما يصعب عليك مع الأخصائي",
    icon: "📋",
    content:
      "واجهتك صعوبة في تطبيق أحد الأنشطة بالمنزل؟ اكتبيها هنا وسيرجعها الأخصائي لمناقشتها معك:",
  },
];

export default function ParentsGuide() {
  const [expandedId, setExpandedId] = useState<number | null>(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const toggleExpand = (id: number) => {
    playSound("pop");
    setExpandedId(expandedId === id ? null : id);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    playSound("sparkle");
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] font-sans flex flex-col justify-between" dir="rtl">
      
      {/* Global Navigation Header */}
      <MainNavbar />

      {/* Main Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 sm:py-12 space-y-8">
        
        {/* Header Title */}
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-orange-100 text-[#c26d43] text-xs font-black border border-orange-200 shadow-sm">
            <Sparkles size={14} />
            برنامج الإرشاد الوالدي
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
            دليل إرشادات أولياء الأمور 🌿
          </h1>
          <p className="text-slate-600 text-sm sm:text-base font-medium max-w-lg mx-auto leading-relaxed">
            خطوات عملية ومجربة لمساندة طفلك في رحلة زيادة المناعة النفسية وتنمية الذاكرة بالمنزل.
          </p>
        </div>

        {/* Accordion Guidance List */}
        <div className="space-y-4">
          {guideItems.map((item) => {
            const isExpanded = expandedId === item.id;
            const isItem5 = item.id === 5;

            return (
              <div
                key={item.id}
                className="rounded-2xl overflow-hidden transition-all duration-300 shadow-sm border border-stone-200/80"
              >
                {/* Header Card Toggle */}
                <button
                  onClick={() => toggleExpand(item.id)}
                  className={`w-full flex items-center justify-between p-5 text-right transition-colors cursor-pointer select-none ${
                    isExpanded
                      ? "bg-[#c26d43] text-white shadow-md"
                      : "bg-white text-slate-800 hover:bg-amber-50/50"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-inner transition-colors ${
                        isExpanded ? "bg-white/20 text-white" : "bg-orange-50 text-[#c26d43]"
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <h3
                        className={`text-base sm:text-lg font-black leading-snug ${
                          isExpanded ? "text-white" : "text-slate-800"
                        }`}
                      >
                        {item.title}
                      </h3>
                      <p
                        className={`text-xs sm:text-sm font-medium mt-0.5 ${
                          isExpanded ? "text-orange-100" : "text-slate-500"
                        }`}
                      >
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                        isExpanded
                          ? "bg-white/20 text-white"
                          : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {item.num}
                    </span>
                    <ChevronDown
                      size={20}
                      className={`transition-transform duration-300 ${
                        isExpanded ? "rotate-180 text-white" : "text-slate-400"
                      }`}
                    />
                  </div>
                </button>

                {/* Expanded Content Area */}
                {isExpanded && (
                  <div className="bg-white p-6 border-t border-stone-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                    {/* Item Content / Description */}
                    <p className="text-slate-700 font-bold text-sm sm:text-base leading-relaxed">
                      {item.content}
                    </p>

                    {/* Interactive Feedback Form for Item 05 */}
                    {isItem5 && (
                      <div className="pt-2">
                        {!isSubmitted ? (
                          <form onSubmit={handleFormSubmit} className="space-y-4">
                            <textarea
                              value={feedbackText}
                              onChange={(e) => setFeedbackText(e.target.value)}
                              placeholder="اكتبي ملاحظاتك أو الصعوبات السلوكية هنا لمراجعتها من الأخصائي..."
                              rows={4}
                              className="w-full p-4 border-2 border-stone-200 rounded-2xl focus:border-[#c26d43] outline-none text-slate-800 font-medium text-sm transition-colors shadow-inner resize-none"
                              required
                            />
                            <button
                              type="submit"
                              className="w-full sm:w-auto px-8 py-3.5 bg-[#c26d43] hover:bg-[#ad5f39] text-white font-black text-sm sm:text-base rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                            >
                              <Send size={16} className="rotate-180" />
                              <span>إرسال للأخصائي النفسي</span>
                            </button>
                          </form>
                        ) : (
                          <div className="bg-orange-50 border-2 border-orange-200 p-5 rounded-2xl flex items-center justify-between gap-3 text-[#c26d43] font-bold text-sm sm:text-base shadow-sm animate-in fade-in duration-300">
                            <div className="flex items-center gap-2.5">
                              <CheckCircle2 size={22} className="text-[#c26d43] flex-shrink-0" />
                              <span>تم الإرسال - سيتواصل معك الأخصائي لمناقشتها</span>
                            </div>
                            <button
                              onClick={() => {
                                setIsSubmitted(false);
                                setFeedbackText("");
                              }}
                              className="text-xs font-bold underline hover:text-[#ad5f39] cursor-pointer"
                            >
                              إرسال صعوبة أخرى
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Subtle Footer Note */}
        <div className="pt-6 text-center space-y-1">
          <p className="text-xs font-bold text-slate-500">
            جزء من منصة بستان - بالتعاون مع الأخصائيين النفسانيين 🌿
          </p>
          <p className="text-[11px] font-medium text-slate-400">
            جميع الإرشادات مراجعة من قبل استشاريي تعديل السلوك والصحة النفسية للأطفال
          </p>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs font-bold text-slate-400">
        منصة بستان — برنامج الإرشاد الوالدي © {new Date().getFullYear()}
      </footer>

    </div>
  );
}
