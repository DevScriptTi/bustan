"use client";

import React, { useState } from "react";
import SessionContainer from "@/components/therapy/SessionContainer";
import { ArrowLeft } from "lucide-react";

// --- Data ---
const rounds = [
  { targetLetter: "م", audioSrc: "/audio/24.wav", options: ["م", "ن", "ح", "ب"] }, // Meem
  { targetLetter: "س", audioSrc: "/audio/12.wav", options: ["ش", "س", "ص", "ق"] }, // Seen
  { targetLetter: "ج", audioSrc: "/audio/5.wav", options: ["خ", "ح", "ج", "ع"] },  // Jeem
  { targetLetter: "ل", audioSrc: "/audio/23.wav", options: ["ك", "ل", "ا", "م"] }, // Laam
  { targetLetter: "ف", audioSrc: "/audio/20.wav", options: ["ق", "ف", "غ", "و"] }  // Faa
];

export default function MemorySession9() {
  const [currentRound, setCurrentRound] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  // Sound play handler
  const playSound = (src: string) => {
    const audio = new Audio(src);
    audio.play().catch((err) => console.log("Audio play error:", err));
  };

  const handleResetSession = () => {
    setCurrentRound(0);
    setSelectedOption(null);
    setFeedback(null);
    setIsFinished(false);
  };

  const handleOptionClick = (option: string) => {
    if (feedback === "correct") return; // prevent double clicks while transitioning

    const currentRoundData = rounds[currentRound];
    setSelectedOption(option);

    if (option === currentRoundData.targetLetter) {
      setFeedback("correct");
      playSound("/audio/correct.wav"); // optional fallback if file exists
      setTimeout(() => {
        setFeedback(null);
        setSelectedOption(null);
        if (currentRound < rounds.length - 1) {
          setCurrentRound((prev) => prev + 1);
        } else {
          setIsFinished(true);
        }
      }, 1200);
    } else {
      setFeedback("wrong");
      playSound("/audio/wrong.wav"); // optional fallback if file exists
      setTimeout(() => {
        setFeedback(null);
        setSelectedOption(null);
      }, 800);
    }
  };

  const renderActivity = () => {
    const currentRoundData = rounds[currentRound];
    return (
      <div className="flex flex-col items-center w-full max-w-4xl mx-auto space-y-12 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-6">
          <p className="text-lg md:text-xl text-gray-600">استمع إلى الصوت واختر الحرف المناسب</p>
          <button 
            onClick={() => playSound(currentRoundData.audioSrc)}
            className="px-10 py-6 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white rounded-full font-bold text-3xl shadow-lg transform hover:scale-105 active:scale-95 transition-all"
          >
            🔊 استمع للصوت
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-6 w-full max-w-lg mt-8">
          {currentRoundData.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleOptionClick(opt)}
              className={`p-10 text-6xl font-bold rounded-3xl transition-all border-4 shadow-md flex items-center justify-center ${
                selectedOption === opt 
                  ? feedback === "correct" 
                    ? "bg-green-100 border-green-500 text-green-700 animate-pulse" 
                    : feedback === "wrong" 
                      ? "bg-red-100 border-red-500 text-red-700 animate-shake"
                      : "bg-indigo-100 border-indigo-500 text-indigo-700"
                  : "bg-white border-indigo-100 hover:border-indigo-400 hover:bg-indigo-50 text-slate-800"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <SessionContainer
      title="الحصة 9: تجهيز المعلومات ومعالجتها"
      activityTitle="النشاط 1: ربط الحروف بالأصوات"
      isCompleted={isFinished}
      onRestart={handleResetSession}
      nextSessionPath="/therapy/memory/session-10"
    >
      {!isFinished && renderActivity()}
    </SessionContainer>
  );
}

