"use client";

import React, { useState } from "react";
import SessionContainer from "@/components/therapy/SessionContainer";
import { ArrowLeft } from "lucide-react";

// --- Data ---
const stories = [
  { id: 1, title: "قصة الأرنب والسلحفاة", videoSrc: "/videos/story1.mp4" },
  { id: 2, title: "قصة ذات الرداء الأحمر", videoSrc: "/videos/story2.mp4" },
];

export default function MemorySession11() {
  const [currentStory, setCurrentStory] = useState(0);
  const [isVideoFinished, setIsVideoFinished] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const handleResetSession = () => {
    setCurrentStory(0);
    setIsVideoFinished(false);
    setIsFinished(false);
  };

  const handleNextStory = () => {
    setIsVideoFinished(false);
    if (currentStory < stories.length - 1) {
      setCurrentStory((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const renderActivity = () => {
    const currentData = stories[currentStory];
    return (
      <div className="flex flex-col items-center w-full max-w-4xl mx-auto space-y-12 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-3">
          <p className="text-lg md:text-xl text-gray-600">
            شاهد القصة وتخيل ما سيحدث في النهاية.
          </p>
        </div>
        <div className="bg-white p-6 md:p-10 rounded-3xl shadow-lg border-2 border-indigo-100 w-full text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-8 text-slate-800">{currentData.title}</h3>
          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black mb-8 border-4 border-indigo-50">
            <video 
              src={currentData.videoSrc}
              controls
              className="w-full h-full object-cover"
              onEnded={() => setIsVideoFinished(true)}
            />
          </div>
          {isVideoFinished && (
            <button
              onClick={handleNextStory}
              className="px-10 py-4 bg-mint-500 hover:bg-mint-600 text-white font-bold rounded-full shadow-md text-2xl animate-bounce"
            >
              القصة التالية
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <SessionContainer
      title="الحصة 11: التخيل والتصور"
      activityTitle="النشاط 1: ماذا سيحدث بعد ذلك؟"
      isCompleted={isFinished}
      onRestart={handleResetSession}
      nextSessionPath="/therapy/memory/session-12"
    >
      {!isFinished && renderActivity()}
    </SessionContainer>
  );
}

