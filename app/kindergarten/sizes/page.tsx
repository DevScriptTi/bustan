"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import MainNavbar from "@/components/MainNavbar";
import { playSound } from "@/utils/playSound";
import { ArrowLeft, Sparkles, Volume2, HelpCircle } from "lucide-react";

interface SizeItem {
  id: number;
  title: string;
  image: string;
  audio: string;
  text: string;
  question: string;
  bigEmoji: string;
  smallEmoji: string;
  bigName: string;
  smallName: string;
}

const sizeData: SizeItem[] = [
  {
    id: 1,
    title: "الفيل والفأر",
    image: "/kindergarten_assets/images/size1.png",
    audio: "/kindergarten_assets/audio/size1.mp3",
    text: "كان هناك فيل كبير وفأر صغير. الكبير والصغير يمكن أن يساعد كل منهما الآخر.",
    question: "من كان كبيراً؟ ومن كان صغيراً؟",
    bigEmoji: "🐘",
    smallEmoji: "🐭",
    bigName: "فيل كبير 🐘",
    smallName: "فأر صغير 🐭",
  },
  {
    id: 2,
    title: "الشجرة والزهرة",
    image: "/kindergarten_assets/images/size2.png",
    audio: "/kindergarten_assets/audio/size2.mp3",
    text: "الشجرة كبيرة، والزهرة صغيرة. لكل شيء حجمه وفائدته في الطبيعة.",
    question: "أيهما أكبر: الشجرة أم الزهرة؟",
    bigEmoji: "🌳",
    smallEmoji: "🌺",
    bigName: "شجرة كبيرة 🌳",
    smallName: "زهرة صغيرة 🌺",
  },
  {
    id: 3,
    title: "البيت والكوخ",
    image: "/kindergarten_assets/images/size3.png",
    audio: "/kindergarten_assets/audio/size3.mp3",
    text: "البيت كبير والكوخ صغير. الأشياء تختلف في الحجم لكنها كلها مفيدة.",
    question: "أيهما أكبر: البيت أم الكوخ؟",
    bigEmoji: "🏠",
    smallEmoji: "🛖",
    bigName: "بيت كبير 🏠",
    smallName: "كوخ صغير 🛖",
  },
  {
    id: 4,
    title: "القطة والسمكة",
    image: "/kindergarten_assets/images/size4.png",
    audio: "/kindergarten_assets/audio/size4.mp3",
    text: "القطة أكبر من السمكة. نلاحظ الحجم لنفهم العالم من حولنا.",
    question: "من أكبر: القطة أم السمكة؟",
    bigEmoji: "🐱",
    smallEmoji: "🐟",
    bigName: "قطة أكبر 🐱",
    smallName: "سمكة أصغر 🐟",
  },
];

export default function SizeComparison() {
  const [playingId, setPlayingId] = useState<number | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Stop playing audio & speech synthesis on component unmount (route change)
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
        currentAudioRef.current = null;
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const playAudio = (item: SizeItem) => {
    playSound("pop");

    // 1. Stop currently playing audio if it exists
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }

    // 2. Stop any active SpeechSynthesis (Arabic TTS)
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setPlayingId(item.id);

    try {
      const audio = new Audio(item.audio);
      currentAudioRef.current = audio;

      audio.onended = () => {
        setPlayingId(null);
        currentAudioRef.current = null;
      };

      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Fallback to SpeechSynthesis (Arabic TTS) if custom MP3 file is not available
          if (typeof window !== "undefined" && "speechSynthesis" in window) {
            const utteranceText = `${item.text} ${item.question}`;
            const utterance = new SpeechSynthesisUtterance(utteranceText);
            utterance.lang = "ar-SA";
            utterance.onend = () => setPlayingId(null);
            window.speechSynthesis.speak(utterance);
          } else {
            setTimeout(() => setPlayingId(null), 2000);
          }
        });
      }
    } catch {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const utteranceText = `${item.text} ${item.question}`;
        const utterance = new SpeechSynthesisUtterance(utteranceText);
        utterance.lang = "ar-SA";
        utterance.onend = () => setPlayingId(null);
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => setPlayingId(null), 2000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-green-50/50 font-sans flex flex-col justify-between" dir="rtl">
      
      {/* Global Navbar */}
      <MainNavbar />

      {/* Page Header */}
      <header className="bg-white border-b border-green-100 px-6 py-4 flex items-center justify-between sticky top-16 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/kindergarten"
            onClick={() => playSound("pop")}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={22} className="rotate-180" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔍</span>
            <h1 className="text-xl font-black text-slate-800">الكبير والصغير (مقارنة الأحجام)</h1>
          </div>
        </div>

        <Link
          href="/kindergarten"
          onClick={() => playSound("pop")}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-colors text-sm shadow-sm"
        >
          العودة لـ نتعلم مع القصص 📖
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-8">
        
        {/* Intro Banner */}
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-200 shadow-sm">
            <Sparkles size={14} />
            مقارنة الأشياء والحيوانات في الطبيعة 🌿
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
            تعلم الأحجام: الكبير والصغير
          </h2>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sizeData.map((item) => {
            const isPlaying = playingId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border-2 border-emerald-100 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                {/* Header Title */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 text-white text-center shadow-sm">
                  <h3 className="text-xl font-black">{item.title}</h3>
                </div>

                {/* Body Area */}
                <div className="p-6 space-y-5 text-center flex-1 flex flex-col justify-between">
                  
                  {/* Big vs Small Comparison Display */}
                  <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 flex items-center justify-around gap-2 shadow-inner">
                    {/* Big Item */}
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-6xl transform group-hover:scale-110 transition-transform">
                        {item.bigEmoji}
                      </span>
                      <span className="text-xs font-black px-2.5 py-1 bg-emerald-600 text-white rounded-lg shadow-sm">
                        كبير 🐘
                      </span>
                    </div>

                    <span className="text-slate-300 font-black text-xl">vs</span>

                    {/* Small Item */}
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-3xl transform group-hover:scale-105 transition-transform">
                        {item.smallEmoji}
                      </span>
                      <span className="text-xs font-black px-2.5 py-1 bg-amber-500 text-white rounded-lg shadow-sm">
                        صغير 🐭
                      </span>
                    </div>
                  </div>

                  {/* Educational Story Text */}
                  <p className="text-slate-700 font-bold text-sm leading-relaxed">
                    "{item.text}"
                  </p>

                  {/* Question Box */}
                  <div className="bg-purple-50 border-2 border-purple-200 p-4 rounded-2xl text-purple-900 font-black text-sm space-y-2">
                    <div className="flex items-center justify-center gap-1.5 text-purple-700 text-xs">
                      <HelpCircle size={16} />
                      <span>سؤال التفكير:</span>
                    </div>
                    <p className="text-purple-950 font-black text-base">{item.question}</p>
                  </div>

                </div>

                {/* Audio Trigger Footer Button */}
                <div className="p-4 bg-slate-50 border-t border-slate-100">
                  <button
                    onClick={() => playAudio(item)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Volume2 size={18} className={isPlaying ? "animate-bounce" : ""} />
                    <span>{isPlaying ? "جاري تشغيل القصة والسؤال..." : "استمع للقصة والسؤال 🎧"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs font-bold text-slate-400">
        الكبير والصغير — روضة بستان للأطفال
      </footer>

    </div>
  );
}
