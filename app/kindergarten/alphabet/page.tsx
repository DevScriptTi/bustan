"use client";

import { useState } from "react";
import Link from "next/link";
import MainNavbar from "@/components/MainNavbar";
import { playSound } from "@/utils/playSound";
import { ArrowLeft, Sparkles, X, Play } from "lucide-react";

interface LetterData {
  id: number;
  letter: string;
  word: string;
  emoji: string;
  story: string;
  color: string;
  videoUrl: string;
}

const alphabetData: LetterData[] = [
  { id: 1, letter: "أ", word: "أرنب", emoji: "🐰", story: "كان أرنب نشيط يحب قفز المروج وأكل الجزر اللذيذ كل صباح.", color: "bg-red-50 border-red-200 text-red-700", videoUrl: "/videos/alphabet/1.mp4" },
  { id: 2, letter: "ب", word: "بطة", emoji: "🦆", story: "كانت بطة صفراء جميلة تسبح في البحيرة وتغني مغامراتها الممتعة.", color: "bg-amber-50 border-amber-200 text-amber-700", videoUrl: "/videos/alphabet/2.mp4" },
  { id: 3, letter: "ت", word: "تفاح", emoji: "🍎", story: "تفاحة حمراء شهية قطفها أحمد من شجرة البستان وشاركها مع صديقه.", color: "bg-emerald-50 border-emerald-200 text-emerald-700", videoUrl: "/videos/alphabet/3.mp4" },
  { id: 4, letter: "ث", word: "ثعلب", emoji: "🦊", story: "ثعلب ذكي يحب اللعب بين الأشجار الكثيفة ومساعدة حيوانات الغابة.", color: "bg-orange-50 border-orange-200 text-orange-700", videoUrl: "/videos/alphabet/4.mp4" },
  { id: 5, letter: "ج", word: "جمل", emoji: "🐪", story: "جمل صبور يسير في الصحراء الذهبية ويحمل الخير والماء للرحالة.", color: "bg-yellow-50 border-yellow-200 text-yellow-700", videoUrl: "/videos/alphabet/5.mp4" },
  { id: 6, letter: "ح", word: "حصان", emoji: "🐴", story: "حصان سريع يجري في الحقول الخضراء بشجاعة وقوة وجمال.", color: "bg-teal-50 border-teal-200 text-teal-700", videoUrl: "/videos/alphabet/6.mp4" },
  { id: 7, letter: "خ", word: "خروف", emoji: "🐑", story: "خروف لطيف بفرائه الأبيض الناعم يرعى العشب مع أمه بسلام.", color: "bg-sky-50 border-sky-200 text-sky-700", videoUrl: "/videos/alphabet/7.mp4" },
  { id: 8, letter: "د", word: "دب", emoji: "🐻", story: "دب طيب يبحث عن العسل اللذيذ في الأشجار وينام في كهفه الدافئ.", color: "bg-indigo-50 border-indigo-200 text-indigo-700", videoUrl: "/videos/alphabet/8.mp4" },
  { id: 9, letter: "ذ", word: "ذرة", emoji: "🌽", story: "ذرة صفراء حلوة المذاق نضجت في الحقل واستمتع الأطفال بأكلها.", color: "bg-purple-50 border-purple-200 text-purple-700", videoUrl: "/videos/alphabet/9.mp4" },
  { id: 10, letter: "ر", word: "رمان", emoji: "🫐", story: "رمانة مليئة بحبات الجواهر اللامعة والمفيدة لصحة الجميع.", color: "bg-pink-50 border-pink-200 text-pink-700", videoUrl: "/videos/alphabet/10.mp4" },
  { id: 11, letter: "ز", word: "زرافة", emoji: "🦒", story: "زرافة طويلة تصل لأعلى غصون الأشجار وتشارك أوراقها مع زملائها.", color: "bg-rose-50 border-rose-200 text-rose-700", videoUrl: "/videos/alphabet/11.mp4" },
  { id: 12, letter: "س", word: "سمكة", emoji: "🐟", story: "سمكة ملونة تسبح في البحر الواسع بين الأعشاب والشعب المرجانية.", color: "bg-blue-50 border-blue-200 text-blue-700", videoUrl: "/videos/alphabet/12.mp4" },
  { id: 13, letter: "ش", word: "شمس", emoji: "☀️", story: "شمس ساطعة تشرق بالنور والدفء على الأزهار والأطفال كل يوم.", color: "bg-amber-50 border-amber-200 text-amber-800", videoUrl: "/videos/alphabet/13.mp4" },
  { id: 14, letter: "ص", word: "صقر", emoji: "🦅", story: "صقر قوي يطير عالياً في السماء الزرقاء وينظر إلى الجبال الشاهقة.", color: "bg-stone-50 border-stone-200 text-stone-700", videoUrl: "/videos/alphabet/14.mp4" },
  { id: 15, letter: "ض", word: "ضفدع", emoji: "🐸", story: "ضفدع أخضر يقفز بين أوراق البركة ويغني ألحاناً ممتعة للأطفال.", color: "bg-green-50 border-green-200 text-green-700", videoUrl: "/videos/alphabet/15.mp4" },
  { id: 16, letter: "ط", word: "طائرة", emoji: "✈️", story: "طائرة تحلق بالسحاب وتحمل المسافرين لرؤية معالم العالم الجميلة.", color: "bg-cyan-50 border-cyan-200 text-cyan-700", videoUrl: "/videos/alphabet/16.mp4" },
  { id: 17, letter: "ظ", word: "ظبي", emoji: "🦌", story: "ظبي رقيق يجري بسرعة ولطف بين الأزهار الملونة بجمال ورشاقة.", color: "bg-lime-50 border-lime-200 text-lime-700", videoUrl: "/videos/alphabet/17.mp4" },
  { id: 18, letter: "ع", word: "عصفور", emoji: "🐦", story: "عصفور صغير يغرد أحل الألحان فوق الغصن ويرعى صغاره بحب.", color: "bg-sky-50 border-sky-200 text-sky-700", videoUrl: "/videos/alphabet/18.mp4" },
  { id: 19, letter: "غ", word: "غزالة", emoji: "🦌", story: "غزالة جميلة تتمشى في الغابة بأمان وتستمتع بماء النهر العذب.", color: "bg-orange-50 border-orange-200 text-orange-700", videoUrl: "/videos/alphabet/19.mp4" },
  { id: 20, letter: "ف", word: "فيل", emoji: "🐘", story: "فيل ضخم وطيب القلب يلعب بالماء بخرطومه ويرش صديقه الرشيق.", color: "bg-slate-50 border-slate-200 text-slate-700", videoUrl: "/videos/alphabet/20.mp4" },
  { id: 21, letter: "ق", word: "قرد", emoji: "🐒", story: "قرد مريح يقفز بين الأشجار ويحب أكل الموز واللعب مع الجميع.", color: "bg-amber-50 border-amber-200 text-amber-700", videoUrl: "/videos/alphabet/21.mp4" },
  { id: 22, letter: "ك", word: "كتاب", emoji: "📖", story: "كتاب ممتع مليء بالقصص والعلوم يفتح أمامنا عالم المعرفة والسعادة.", color: "bg-indigo-50 border-indigo-200 text-indigo-700", videoUrl: "/videos/alphabet/22.mp4" },
  { id: 23, letter: "ل", word: "ليمون", emoji: "🍋", story: "ليمونة منعشة يصنع منها الأطفال عصير ليمون بارد في أيام الصيف.", color: "bg-yellow-50 border-yellow-200 text-yellow-700", videoUrl: "/videos/alphabet/23.mp4" },
  { id: 24, letter: "م", word: "موز", emoji: "🍌", story: "موزة صفراء مغذية تعطين الطاقة والقوة لنلعب ونركض بفرح.", color: "bg-amber-50 border-amber-200 text-amber-800", videoUrl: "/videos/alphabet/24.mp4" },
  { id: 25, letter: "ن", word: "نجمة", emoji: "⭐", story: "نجمة برّاقة تضيء السماء في الليل وتزين أرق الأحلام للأطفال.", color: "bg-purple-50 border-purple-200 text-purple-700", videoUrl: "/videos/alphabet/25.mp4" },
  { id: 26, letter: "هـ", word: "هدية", emoji: "🎁", story: "هدية مبهجة مغلفة بشريط زاهي قدمها الصديق في عيد الميلاد.", color: "bg-pink-50 border-pink-200 text-pink-700", videoUrl: "/videos/alphabet/26.mp4" },
  { id: 27, letter: "و", word: "وردة", emoji: "🌹", story: "وردة حمراء تفوح برائحة زكية وتجذب الفراشات الجميلة حولها.", color: "bg-rose-50 border-rose-200 text-rose-700", videoUrl: "/videos/alphabet/27.mp4" },
  { id: 28, letter: "ي", word: "يمامة", emoji: "🕊️", story: "يمامة بيضاء تحمل السلام وتحلق برفوق في سماء الروضة المشرقة.", color: "bg-blue-50 border-blue-200 text-blue-700", videoUrl: "/videos/alphabet/28.mp4" },
];

export default function AlphabetStories() {
  const [selectedLetter, setSelectedLetter] = useState<LetterData | null>(null);

  const handleSelect = (item: LetterData) => {
    playSound("pop");
    setSelectedLetter(item);
  };

  return (
    <div className="min-h-screen bg-amber-50/40 font-sans flex flex-col justify-between" dir="rtl">
      
      {/* Global Main Navbar */}
      <MainNavbar />

      {/* Top Header */}
      <header className="bg-white border-b border-amber-100 px-6 py-4 flex items-center justify-between sticky top-16 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/kindergarten"
            onClick={() => playSound("pop")}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={22} className="rotate-180" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔤</span>
            <h1 className="text-xl font-black text-slate-800">قصص وفيديوهات الحروف العربية</h1>
          </div>
        </div>

        <Link
          href="/kindergarten"
          onClick={() => playSound("pop")}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl transition-colors text-sm shadow-sm"
        >
          العودة لـ نتعلم مع القصص 📖
        </Link>
      </header>

      {/* Main Alphabet Grid */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-black border border-amber-200 shadow-sm">
            <Sparkles size={14} />
            اضغط على أي حرف لمشاهدة فيديو القصة التفاعلي! 🎬
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800">حروف الهجاء (أ - ي)</h2>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-4">
          {alphabetData.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item)}
              className={`p-5 rounded-3xl border-2 ${item.color} shadow-sm hover:shadow-md transition-all active:scale-95 flex flex-col items-center justify-center gap-1 cursor-pointer group relative overflow-hidden`}
            >
              <span className="text-4xl font-black group-hover:scale-110 transition-transform">{item.letter}</span>
              <span className="text-2xl">{item.emoji}</span>
              <span className="text-xs font-bold opacity-80">{item.word}</span>

              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-amber-500 text-white p-1 rounded-full text-[10px]">
                <Play size={10} fill="currentColor" />
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* Video Modal */}
      {selectedLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border-2 border-amber-200 space-y-5 text-center relative animate-in zoom-in-95 duration-200">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedLetter(null)}
              className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer z-10"
            >
              <X size={22} />
            </button>

            {/* Letter Header */}
            <div className="flex items-center justify-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-md">
                {selectedLetter.letter}
              </div>
              <div className="text-right">
                <h3 className="text-2xl font-black text-slate-800">
                  حرف {selectedLetter.letter} — {selectedLetter.word} {selectedLetter.emoji}
                </h3>
                <p className="text-xs font-bold text-slate-500">فيديو تعليمي ممتع</p>
              </div>
            </div>

            {/* Native HTML5 Video Player */}
            <div className="relative rounded-2xl overflow-hidden shadow-md border-2 border-amber-200 bg-black aspect-video flex items-center justify-center">
              <video
                key={selectedLetter.id}
                src={selectedLetter.videoUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain rounded-xl"
              >
                متصفحك لا يدعم تشغيل الفيديو.
              </video>
            </div>

            <button
              onClick={() => setSelectedLetter(null)}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-base sm:text-lg rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              ممتاز! اختر حرفاً آخر 🚀
            </button>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-amber-100 py-3 text-center text-xs font-bold text-slate-400">
        قصص وفيديوهات الحروف العربية — روضة بستان
      </footer>

    </div>
  );
}
