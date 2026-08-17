"use client";

import { useState, useEffect, useRef } from "react";

interface BreathingExerciseProps {
  onFinish: () => void;
  title?: string;
  buttonText?: string;
}

export default function BreathingExercise({
  onFinish,
  title = "تمرين التنفس 😮‍💨",
  buttonText = "أوقف التمرين 🛑",
}: BreathingExerciseProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [secInLoop, setSecInLoop] = useState(1);

  // Synchronized 10-second timer loop (1..10)
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setSecInLoop((prev) => (prev >= 10 ? 1 : prev + 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Component unmount cleanup: pause video if navigating away
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch((err) => console.log("Video play error:", err));
        setIsPlaying(true);
      }
    }
  };

  const handleFinish = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    onFinish();
  };

  // Derive phase text, hint, text color, and 1-based number for current 10s loop:
  // Secs 1..4: Inhale (1..4)
  // Secs 5..6: Hold (1..2)
  // Secs 7..10: Exhale (1..4)
  let phaseText = "شهيق 🌬️";
  let phaseHint = "خذ نفساً عميقاً من أنفك";
  let textColor = "text-sky-600";
  let countNumber = secInLoop;

  if (secInLoop >= 1 && secInLoop <= 4) {
    phaseText = "شهيق 🌬️";
    phaseHint = "خذ نفساً عميقاً من أنفك";
    textColor = "text-sky-600";
    countNumber = secInLoop;
  } else if (secInLoop === 5 || secInLoop === 6) {
    phaseText = "احبس أنفاسك ✋";
    phaseHint = "اقبض الهواء داخل صدرك";
    textColor = "text-amber-600";
    countNumber = secInLoop - 4; // 1 or 2
  } else {
    phaseText = "زفير 💨";
    phaseHint = "أخرج الهواء ببطء من فمك";
    textColor = "text-indigo-600";
    countNumber = secInLoop - 6; // 1..4
  }

  return (
    <div className="flex flex-col items-center gap-5 bg-sky-50/70 p-6 sm:p-8 rounded-3xl border-4 border-sky-200 shadow-lg w-full max-w-md animate-in zoom-in select-none" dir="rtl">
      <h4 className="text-2xl font-black text-sky-800 text-center">{title}</h4>

      {/* 1. Fully Visible Video (NO Overlay) */}
      <div className="w-full max-w-sm mx-auto rounded-2xl overflow-hidden border-4 border-sky-300 shadow-md bg-slate-900">
        <video
          ref={videoRef}
          src="/videos/breathing.mp4"
          autoPlay
          loop
          playsInline
          muted={false}
          className="w-full h-auto block rounded-xl"
        >
          متصفحك لا يدعم تشغيل الفيديو.
        </video>
      </div>

      {/* 2. Dynamic Phase & Playful Counter (Clean Below Video) */}
      <div className="flex flex-col items-center text-center my-1">
        <span className={`text-3xl font-black ${textColor} transition-colors duration-300`}>
          {phaseText}
        </span>

        {/* Playful Prominent Timer Number */}
        <div className="text-6xl font-black text-orange-500 my-2 animate-pulse drop-shadow-sm font-mono">
          {countNumber}
        </div>

        <p className="text-slate-500 text-xs sm:text-sm font-bold">
          {phaseHint}
        </p>
      </div>

      {/* 3. Control Buttons */}
      <div className="w-full flex flex-col gap-3">
        <button
          onClick={togglePlay}
          className="w-full py-3.5 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 font-bold text-lg rounded-2xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>{isPlaying ? "إيقاف مؤقت ⏸️" : "تشغيل التمرين ▶️"}</span>
        </button>

        <button
          onClick={handleFinish}
          className="w-full py-4 bg-sky-500 hover:bg-sky-600 text-white font-black text-xl rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
