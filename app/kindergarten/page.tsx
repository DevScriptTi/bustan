"use client";

import Link from "next/link";
import MainNavbar from "@/components/MainNavbar";
import { useBustanSounds } from "@/hooks/useBustanSounds";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function KindergartenHub() {
  const { playClick } = useBustanSounds();

  const categories = [
    {
      id: "alphabet",
      title: "قصص الحروف العربية",
      description: "تعرف على الحروف واستمع إلى قصص ممتعة ومشوقة لكل حرف 📖",
      icon: "🔤",
      badge: "28 حرفاً",
      href: "/kindergarten/alphabet",
      bgGradient: "from-amber-400 to-orange-500",
      cardBg: "bg-amber-50/60 border-amber-200 hover:border-amber-400",
      textColor: "text-amber-900",
      buttonBg: "bg-amber-600 hover:bg-amber-700",
    },
    {
      id: "logic",
      title: "العب وتعلم (رياضيات ومنطق)",
      description: "ألعاب ذكاء تفاعلية، مقارنة الأعداد، والبحث عن الأكثر والأقل 🧩",
      icon: "📚",
      badge: "تحديات تفاعلية",
      href: "/kindergarten/logic",
      bgGradient: "from-teal-400 to-emerald-500",
      cardBg: "bg-teal-50/60 border-teal-200 hover:border-teal-400",
      textColor: "text-teal-900",
      buttonBg: "bg-teal-600 hover:bg-teal-700",
    },
    {
      id: "words",
      title: "تلوين الكلمات والعبارات",
      description: "تلوين الكلمات المناسبة، تشكيل عبارات مفيدة، وتعلم الجمل السليمة 🎨",
      icon: "🖍️",
      badge: "ألوان وجمل",
      href: "/kindergarten/words",
      bgGradient: "from-purple-400 to-indigo-500",
      cardBg: "bg-purple-50/60 border-purple-200 hover:border-purple-400",
      textColor: "text-purple-900",
      buttonBg: "bg-purple-600 hover:bg-purple-700",
    },
    {
      id: "days-numbers",
      title: "أيام الأسبوع والأرقام",
      description: "استكشف أيام الأسبوع السبعة والعد الحسابي مع قصص مشوقة للأرقام 🗓️",
      icon: "📅",
      badge: "7 أيام وأرقام",
      href: "/kindergarten/days-numbers",
      bgGradient: "from-blue-400 to-cyan-500",
      cardBg: "bg-blue-50/60 border-blue-200 hover:border-blue-400",
      textColor: "text-blue-900",
      buttonBg: "bg-blue-600 hover:bg-blue-700",
    },
    {
      id: "sizes",
      title: "الكبير والصغير (مقارنة الأحجام)",
      description: "مقارنة أحجام الأشياء والحيوانات في الطبيعة، وتنمية الملاحظة البصرية 🐘",
      icon: "🔍",
      badge: "مقارنات مصورة",
      href: "/kindergarten/sizes",
      bgGradient: "from-emerald-400 to-green-500",
      cardBg: "bg-emerald-50/60 border-emerald-200 hover:border-emerald-400",
      textColor: "text-emerald-900",
      buttonBg: "bg-emerald-600 hover:bg-emerald-700",
    },
    {
      id: "matching",
      title: "التوصيل والمطابقة 🔗",
      description: "مطابقة الحيوانات المتطابقة، ربط الأرقام بالنقاط، وتوصيل الأشكال بأسمائها 🐾",
      icon: "🔗",
      badge: "3 مستويات",
      href: "/kindergarten/matching",
      bgGradient: "from-cyan-400 to-teal-500",
      cardBg: "bg-cyan-50/60 border-cyan-200 hover:border-cyan-400",
      textColor: "text-cyan-900",
      buttonBg: "bg-cyan-600 hover:bg-cyan-700",
    },
    {
      id: "math-shapes",
      title: "الأرقام والأشكال والأنماط 🎨",
      description: "عد الأشياء، تلوين الأشكال بالفرشاة التفاعلية، وإكمال سلسلة الأنماط 📐",
      icon: "🔢",
      badge: "عد وتلوين وسلاسل",
      href: "/kindergarten/math-shapes",
      bgGradient: "from-indigo-400 to-purple-500",
      cardBg: "bg-indigo-50/60 border-indigo-200 hover:border-indigo-400",
      textColor: "text-indigo-900",
      buttonBg: "bg-indigo-600 hover:bg-indigo-700",
    },
    {
      id: "tracing",
      title: "تتبع الخطوط والمسارات ✍️",
      description: "تنمية المهارات الحركية الدقيقة بتتبع الخطوط المنحنية والمتعرجة والدائرية 🌸",
      icon: "✍️",
      badge: "لوحة تتبع تفاعلية",
      href: "/kindergarten/tracing",
      bgGradient: "from-rose-400 to-pink-500",
      cardBg: "bg-rose-50/60 border-rose-200 hover:border-rose-400",
      textColor: "text-rose-900",
      buttonBg: "bg-rose-600 hover:bg-rose-700",
    },
    {
      id: "challenges",
      title: "التحديات الإدراكية 🎯",
      description: "مطابقة الأشكال، إكمال الأنماط، وتطابق الظلال لتنمية التفكير المنطقي 🧠",
      icon: "🎯",
      badge: "3 ألعاب إدراكية",
      href: "/kindergarten/challenges",
      bgGradient: "from-purple-500 to-pink-500",
      cardBg: "bg-purple-50/60 border-purple-200 hover:border-purple-400",
      textColor: "text-purple-900",
      buttonBg: "bg-purple-600 hover:bg-purple-700",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col justify-between" dir="rtl">
      
      {/* Global Main Navbar */}
      <MainNavbar />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-10 space-y-10">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center sm:text-right z-10">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-black text-white border border-white/30">
              <Sparkles size={14} />
              منطقة نتعلم مع القصص
            </span>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight">
              أهلاً بكم في عالم نتعلم مع القصص! 🎉
            </h2>
            <p className="text-white/90 text-sm sm:text-base font-medium max-w-xl">
              اختر نشاطك المفضل وابدأ اللعب والتعلم بحرية دون الحاجة لتسجيل الدخول أو قيود التقييم!
            </p>
          </div>

          <div className="text-7xl sm:text-8xl animate-bounce flex-shrink-0 select-none z-10">
            🎈
          </div>
        </div>

        {/* Activity Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`rounded-3xl border-2 p-6 ${cat.cardBg} transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between space-y-5 group`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-14 h-14 bg-gradient-to-br ${cat.bgGradient} rounded-2xl flex items-center justify-center text-3xl shadow-md transform group-hover:scale-110 transition-transform`}>
                    {cat.icon}
                  </div>
                  <span className="text-[11px] font-black px-2.5 py-1 bg-white/80 rounded-full border border-slate-200 text-slate-600 shadow-sm">
                    {cat.badge}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className={`text-xl font-black ${cat.textColor}`}>{cat.title}</h3>
                  <p className="text-slate-600 font-medium text-xs sm:text-sm leading-relaxed">{cat.description}</p>
                </div>
              </div>

              <Link
                href={cat.href}
                onClick={() => { try { playClick(); } catch {} }}
                className={`w-full py-3.5 ${cat.buttonBg} text-white font-black text-sm rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer`}
              >
                <span>ابدأ اللعب</span>
                <ArrowLeft size={16} />
              </Link>
            </div>
          ))}
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs font-bold text-slate-400">
        نتعلم مع القصص للأطفال © {new Date().getFullYear()} — تعلم ولعب بحرية
      </footer>

    </div>
  );
}
