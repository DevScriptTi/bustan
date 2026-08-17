"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import MainNavbar from "@/components/MainNavbar";
import { playSound } from "@/utils/playSound";
import { ArrowLeft, Sparkles, Volume2 } from "lucide-react";

interface DayItem {
  id: number;
  day: string;
  number: number;
  image: string;
  audio: string;
  text: string;
  emoji: string;
  color: string;
  headerBg: string;
}

const daysData: DayItem[] = [
  {
    id: 1,
    day: "الأحد",
    number: 1,
    image: "/kindergarten_assets/images/day1.png",
    audio: "/kindergarten_assets/audio/day1.mp3",
    text: "في يوم الأحد، استيقظ أحمد مبكراً، وأكل تفاحة واحدة.",
    emoji: "🍎",
    color: "bg-red-50/80 border-red-200 hover:border-red-400",
    headerBg: "bg-gradient-to-r from-red-500 to-orange-500",
  },
  {
    id: 2,
    day: "الاثنين",
    number: 2,
    image: "/kindergarten_assets/images/day2.png",
    audio: "/kindergarten_assets/audio/day2.mp3",
    text: "في يوم الاثنين، خرج أحمد إلى الحديقة، فرأى عصفورين.",
    emoji: "🐦",
    color: "bg-sky-50/80 border-sky-200 hover:border-sky-400",
    headerBg: "bg-gradient-to-r from-sky-500 to-blue-500",
  },
  {
    id: 3,
    day: "الثلاثاء",
    number: 3,
    image: "/kindergarten_assets/images/day3.png",
    audio: "/kindergarten_assets/audio/day3.mp3",
    text: "في يوم الثلاثاء، قطفت سارة 3 أزهار جميلة.",
    emoji: "🌸",
    color: "bg-pink-50/80 border-pink-200 hover:border-pink-400",
    headerBg: "bg-gradient-to-r from-pink-500 to-rose-500",
  },
  {
    id: 4,
    day: "الأربعاء",
    number: 4,
    image: "/kindergarten_assets/images/day4.png",
    audio: "/kindergarten_assets/audio/day4.mp3",
    text: "في يوم الأربعاء، اشترى أحمد 4 بالونات.",
    emoji: "🎈",
    color: "bg-amber-50/80 border-amber-200 hover:border-amber-400",
    headerBg: "bg-gradient-to-r from-amber-500 to-orange-500",
  },
  {
    id: 5,
    day: "الخميس",
    number: 5,
    image: "/kindergarten_assets/images/day5.png",
    audio: "/kindergarten_assets/audio/day5.mp3",
    text: "في يوم الخميس، ذهب أحمد إلى المزرعة وشاهد 5 أرانب.",
    emoji: "🐰",
    color: "bg-emerald-50/80 border-emerald-200 hover:border-emerald-400",
    headerBg: "bg-gradient-to-r from-emerald-500 to-teal-500",
  },
  {
    id: 6,
    day: "الجمعة",
    number: 6,
    image: "/kindergarten_assets/images/day6.png",
    audio: "/kindergarten_assets/audio/day6.mp3",
    text: "في يوم الجمعة، حضرت الأم 6 قطع من الحلوى، ووزعتها على الأطفال.",
    emoji: "🧁",
    color: "bg-purple-50/80 border-purple-200 hover:border-purple-400",
    headerBg: "bg-gradient-to-r from-purple-500 to-indigo-500",
  },
  {
    id: 7,
    day: "السبت",
    number: 7,
    image: "/kindergarten_assets/images/day7.png",
    audio: "/kindergarten_assets/audio/day7.mp3",
    text: "وفي يوم السبت، جمع أحمد 7 نجوم لأنه كان طفلاً مجتهداً.",
    emoji: "⭐",
    color: "bg-yellow-50/80 border-yellow-200 hover:border-yellow-400",
    headerBg: "bg-gradient-to-r from-yellow-500 to-amber-500",
  },
];

export default function DaysAndNumbers() {
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

  const playAudio = (item: DayItem) => {
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
            const utterance = new SpeechSynthesisUtterance(item.text);
            utterance.lang = "ar-SA";
            utterance.onend = () => setPlayingId(null);
            window.speechSynthesis.speak(utterance);
          } else {
            setTimeout(() => setPlayingId(null), 1500);
          }
        });
      }
    } catch {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(item.text);
        utterance.lang = "ar-SA";
        utterance.onend = () => setPlayingId(null);
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => setPlayingId(null), 1500);
      }
    }
  };

  return (
    <div className="min-h-screen bg-blue-50/50 font-sans flex flex-col justify-between" dir="rtl">
      
      {/* Global Navbar */}
      <MainNavbar />

      {/* Page Header */}
      <header className="bg-white border-b border-blue-100 px-6 py-4 flex items-center justify-between sticky top-16 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/kindergarten"
            onClick={() => playSound("pop")}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={22} className="rotate-180" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🗓️</span>
            <h1 className="text-xl font-black text-slate-800">أيام الأسبوع والأرقام</h1>
          </div>
        </div>

        <Link
          href="/kindergarten"
          onClick={() => playSound("pop")}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-colors text-sm shadow-sm"
        >
          العودة لـ نتعلم مع القصص 📖
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-8">
        
        {/* Intro Banner */}
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-black border border-blue-200 shadow-sm">
            <Sparkles size={14} />
            اضغط على أي يوم للاستماع إلى القصة والعدد 🎧
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
            أيام الأسبوع السبعة والعد الحسابي
          </h2>
        </div>

        {/* 7 Days Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {daysData.map((item) => {
            const isPlaying = playingId === item.id;

            return (
              <div
                key={item.id}
                onClick={() => playAudio(item)}
                className={`rounded-3xl border-2 ${item.color} ${
                  isPlaying ? "ring-4 ring-blue-300 scale-105 shadow-xl" : "hover:scale-105 shadow-md"
                } transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between bg-white group select-none`}
              >
                {/* Header Banner */}
                <div className={`${item.headerBg} p-4 text-white flex items-center justify-between shadow-sm`}>
                  <h3 className="text-xl font-black">{item.day}</h3>
                  <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black border border-white/30">
                    <span>العدد {item.number}</span>
                  </div>
                </div>

                {/* Body Area */}
                <div className="p-6 space-y-4 text-center flex-1 flex flex-col justify-center items-center">
                  
                  {/* Illustration Area */}
                  <div className="w-24 h-24 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center text-5xl shadow-inner transform group-hover:scale-110 transition-transform relative overflow-hidden">
                    <span>{item.emoji}</span>
                  </div>

                  {/* Count Badges */}
                  <div className="flex items-center justify-center gap-1 flex-wrap">
                    {Array.from({ length: item.number }).map((_, idx) => (
                      <span key={idx} className="text-xl">{item.emoji}</span>
                    ))}
                  </div>

                  {/* Story Text */}
                  <p className="text-slate-700 font-bold text-sm leading-relaxed">
                    "{item.text}"
                  </p>
                </div>

                {/* Audio Trigger Footer */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2 text-blue-700 font-bold text-xs">
                  <Volume2 size={16} className={isPlaying ? "animate-bounce text-blue-600" : ""} />
                  <span>{isPlaying ? "جاري التشغيل..." : "اضغط للاستماع للصوت 🔊"}</span>
                </div>
              </div>
            );
          })}
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs font-bold text-slate-400">
        أيام الأسبوع والأرقام — روضة بستان للأطفال
      </footer>

    </div>
  );
}
