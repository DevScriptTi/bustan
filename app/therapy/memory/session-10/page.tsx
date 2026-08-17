"use client";

import React, { useState } from "react";
import SessionContainer from "@/components/therapy/SessionContainer";
import { ArrowLeft } from "lucide-react";

export default function MemorySession10() {
  const [currentActivity, setCurrentActivity] = useState<1 | 2 | 3>(1);
  const [isFinished, setIsFinished] = useState(false);

  // --- Activity 1 States ---
  const [ballPosition, setBallPosition] = useState<"pool" | "under">("pool");
  const [bookPosition, setBookPosition] = useState<"pool" | "above">("pool");
  const [isBriefcaseOpen, setIsBriefcaseOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // --- Activity 2 States ---
  const [selectedEmoji, setSelectedEmoji] = useState<"happy" | "relaxed" | "sad" | null>(null);

  // --- Activity 3 States ---
  const [wisdom1Revealed, setWisdom1Revealed] = useState(false);
  const [wisdom2Revealed, setWisdom2Revealed] = useState(false);

  const handleResetSession = () => {
    setCurrentActivity(1);
    setBallPosition("pool");
    setBookPosition("pool");
    setIsBriefcaseOpen(false);
    setSelectedEmoji(null);
    setWisdom1Revealed(false);
    setWisdom2Revealed(false);
    setIsFinished(false);
    setActiveId(null);
  };

  // --- Activity 1 Handlers ---

  const handleDragStart = (e: React.DragEvent, item: string) => {
    e.dataTransfer.setData('text/plain', item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent, targetZone: string) => {
    e.preventDefault();
    const item = e.dataTransfer.getData('text/plain');
    
    if (item === 'book' && targetZone === 'above') {
      setBookPosition('above');
    } else if (item === 'ball' && targetZone === 'under') {
      setBallPosition('under');
    }
  };

  const handleBriefcaseClick = () => {
    setIsBriefcaseOpen((prev) => !prev);
  };

  // Check if Activity 1 subtasks are complete
  const isAct1Complete = ballPosition === "under" && bookPosition === "above" && isBriefcaseOpen;

  // --- Render Functions ---
  const renderActivity1 = () => {
    return (
      <div className="flex flex-col items-center w-full max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
        <div className="text-center space-y-3">
          <p className="text-slate-600 mb-4 text-center font-medium text-lg">
            اسحب العنصر أو انقر عليه لنقله إلى مكانه الصحيح!
          </p>
        </div>

        {/* Checklist */}
        <div className="bg-indigo-50 border-2 border-indigo-100 rounded-3xl p-6 w-full max-w-xl text-right space-y-3 shadow-sm" dir="rtl">
          <h3 className="text-xl font-black text-indigo-900 mb-4">المطلوب:</h3>
          <div className="flex items-center gap-3 text-lg font-bold">
            <span className={`text-2xl ${ballPosition === "under" ? "text-green-500 scale-110 transition-transform" : "text-gray-300"}`}>
              {ballPosition === "under" ? "✅" : "⭕"}
            </span>
            <span className={ballPosition === "under" ? "line-through text-gray-400" : "text-gray-700"}>ضع الكرة تحت الطاولة</span>
          </div>
          <div className="flex items-center gap-3 text-lg font-bold">
            <span className={`text-2xl ${bookPosition === "above" ? "text-green-500 scale-110 transition-transform" : "text-gray-300"}`}>
              {bookPosition === "above" ? "✅" : "⭕"}
            </span>
            <span className={bookPosition === "above" ? "line-through text-gray-400" : "text-gray-700"}>ضع الكتاب فوق الطاولة</span>
          </div>
          <div className="flex items-center gap-3 text-lg font-bold">
            <span className={`text-2xl ${isBriefcaseOpen ? "text-green-500 scale-110 transition-transform" : "text-gray-300"}`}>
              {isBriefcaseOpen ? "✅" : "⭕"}
            </span>
            <span className={isBriefcaseOpen ? "line-through text-gray-400" : "text-gray-700"}>افتح المحفظة</span>
          </div>
        </div>

        {/* Workspace: Pool and Table */}
        <div className="flex flex-col gap-12 w-full max-w-2xl items-center relative select-none">
          
          {/* Toys Box (Pool) */}
          <div className="w-full min-h-[120px] bg-sky-50/50 border-4 border-dashed border-sky-200 rounded-3xl p-6 flex justify-center items-center gap-8 shadow-inner relative mt-6">
            <div className="absolute -top-4 bg-sky-100 text-sky-800 font-bold px-4 py-1 rounded-full border-2 border-sky-200 text-sm">
              صندوق الألعاب
            </div>
            
            {ballPosition === "pool" && (
              <div 
                draggable 
                onDragStart={(e) => handleDragStart(e, 'ball')} 
                onClick={() => setBallPosition("under")}
                className="text-6xl hover:scale-110 transition-all duration-500 ease-in-out drop-shadow-md cursor-grab active:cursor-grabbing hover:-translate-y-2 pointer-events-auto"
              >
                <span className="pointer-events-none select-none block">🏀</span>
              </div>
            )}
            
            {bookPosition === "pool" && (
              <div 
                draggable 
                onDragStart={(e) => handleDragStart(e, 'book')} 
                onClick={() => setBookPosition("above")}
                className="text-6xl hover:scale-110 transition-all duration-500 ease-in-out drop-shadow-md cursor-grab active:cursor-grabbing hover:-translate-y-2 pointer-events-auto"
              >
                <span className="pointer-events-none select-none block">📓</span>
              </div>
            )}

            {!isBriefcaseOpen ? (
              <img src="/icons/briefcase-closed.png" alt="محفظة مغلقة" className="w-16 h-16 cursor-pointer hover:scale-110 transition-transform drop-shadow-md" onClick={() => setIsBriefcaseOpen(true)} />
            ) : (
              <img src="/icons/briefcase-open.png" alt="محفظة مفتوحة" className="w-16 h-16 cursor-pointer hover:scale-110 transition-transform drop-shadow-md" />
            )}
          </div>

          {/* Real Table Area */}
          <div className="relative flex flex-col items-center w-full max-w-lg mt-8">
            
            {/* Above Zone */}
            <div 
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'above')}
              className="w-64 h-32 border-4 border-dashed border-amber-300/50 bg-amber-50/30 rounded-2xl mb-2 flex items-center justify-center relative transition-all duration-500 z-50 pointer-events-auto"
            >
              {bookPosition !== "above" && <span className="text-amber-700/30 font-bold text-sm pointer-events-none select-none">مكان الكتاب</span>}
              {bookPosition === "above" && (
                <div onClick={() => setBookPosition("pool")} className="text-6xl cursor-pointer hover:scale-110 transition-all duration-500 ease-in-out drop-shadow-xl absolute -top-4 animate-in slide-in-from-top-10 active:scale-95 pointer-events-auto">
                  <span className="pointer-events-none select-none block">📓</span>
                </div>
              )}
            </div>

            {/* Table Top */}
            <div className="w-full h-10 bg-amber-600 rounded-t-xl border-b-8 border-amber-800 shadow-xl z-10 relative">
               {/* Table Highlight */}
               <div className="absolute top-1 left-2 right-2 h-1.5 bg-white/20 rounded-full"></div>
            </div>

            {/* Table Legs & Under Zone */}
            <div className="flex justify-between w-[75%] relative">
              <div className="bg-amber-800 w-8 h-32 rounded-b-lg shadow-inner z-0 border-r-4 border-amber-900/40"></div>
              
              {/* Under Zone */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                <div 
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'under')}
                  className="w-64 h-32 border-4 border-dashed border-gray-300/50 bg-gray-50/30 rounded-2xl flex items-center justify-center transition-all duration-500 mt-4 pointer-events-auto"
                >
                  {ballPosition !== "under" && <span className="text-gray-400 font-bold text-sm pointer-events-none select-none">مكان الكرة</span>}
                  {ballPosition === "under" && (
                    <div onClick={() => setBallPosition("pool")} className="text-6xl cursor-pointer hover:scale-110 transition-all duration-500 ease-in-out drop-shadow-xl animate-in fade-in zoom-in active:scale-95 pointer-events-auto">
                      <span className="pointer-events-none select-none block">🏀</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-amber-800 w-8 h-32 rounded-b-lg shadow-inner z-0 border-l-4 border-amber-900/40"></div>
            </div>

          </div>
        </div>

        {/* Success & Continue */}
        {isAct1Complete && (
          <div className="flex flex-col items-center gap-6 animate-in zoom-in duration-500 bg-green-50 p-10 rounded-3xl border-2 border-green-200 shadow-xl mt-12 w-full max-w-lg text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-200 rounded-full blur-3xl opacity-50"></div>
            <h3 className="text-4xl md:text-5xl font-black text-green-600 animate-bounce relative z-10">
              عمل رائع! 🎉
            </h3>
            <p className="text-xl text-green-800 font-bold relative z-10">
              لقد رتبت جميع الأغراض في مكانها الصحيح.
            </p>
            <button
              onClick={() => setCurrentActivity(2)}
              className="px-12 py-5 text-2xl font-black rounded-full shadow-lg transition-transform active:scale-95 bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer hover:-translate-y-1 mt-4 flex items-center gap-3 relative z-10"
            >
              <span>النشاط التالي</span>
              <span>➡️</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderActivity2 = () => {
    return (
      <div className="flex flex-col items-center w-full max-w-3xl mx-auto space-y-10 animate-in fade-in duration-500">
        <div className="text-center space-y-3">
          <p className="text-lg md:text-xl text-gray-600">اختر وجه التعبير الذي يمثلك حالياً.</p>
        </div>

        {/* Large Emoji Cards */}
        <div className="flex justify-center gap-6 sm:gap-10 mt-6" dir="rtl">
          {(["happy", "relaxed", "sad"] as const).map((mood) => {
            const emojiMap = { happy: "😁", relaxed: "😌", sad: "😭" };
            const isSelected = selectedEmoji === mood;

            return (
              <button
                key={mood}
                onClick={() => setSelectedMood(mood)}
                className={`w-28 h-28 sm:w-36 sm:h-36 rounded-3xl border-4 text-6xl sm:text-7xl flex items-center justify-center bg-sky-50/50 hover:bg-sky-100 transition-all duration-200 cursor-pointer shadow-sm active:scale-95
                   ${isSelected ? "ring-4 ring-indigo-400 border-indigo-500 bg-white scale-110 shadow-md" : "border-sky-100"}
                `}
              >
                {emojiMap[mood]}
              </button>
            );
          })}
        </div>

        {/* Parent Prompts */}
        {selectedEmoji && (
          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-3xl p-8 w-full max-w-2xl text-center space-y-4 animate-in zoom-in duration-300 mt-8">
            <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full font-bold text-xs">
              👨‍👩‍👧 توجيه لولي الأمر
            </div>
            <p className="text-xl font-bold text-indigo-900 leading-relaxed" dir="rtl">
              الرجاء من الولي: اطلب من الطفل أن يشرح سبب اختياره لهذا الشعور.
            </p>
          </div>
        )}

        {/* Continue button */}
        <button
          onClick={() => selectedEmoji && setCurrentActivity(3)}
          disabled={!selectedEmoji}
          className={`mt-10 px-12 py-4 text-xl font-bold rounded-full shadow-lg transition-all active:scale-95 flex items-center gap-2
             ${selectedEmoji ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer hover:-translate-y-0.5" : "bg-gray-200 text-gray-400 cursor-not-allowed"}
          `}
        >
          <span>التالي</span>
          <span>➡️</span>
        </button>
      </div>
    );
  };

  // Helper setter to fix Mood typings
  const setSelectedMood = (mood: "happy" | "relaxed" | "sad") => {
    setSelectedEmoji(mood);
  };

  const renderActivity3 = () => {
    const isAct3Complete = wisdom1Revealed && wisdom2Revealed;

    return (
      <div className="flex flex-col items-center w-full max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
        <div className="text-center space-y-3">
          <p className="text-lg md:text-xl text-gray-600">تأمل الصور، ثم اضغط على الزر لاكتشاف الحكمة المناسبة.</p>
        </div>

        {/* Wisdom Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full mt-6" dir="rtl">
          
          {/* Wisdom Card 1 */}
          <div className="bg-white p-8 rounded-3xl border-2 border-indigo-100 shadow-sm flex flex-col items-center text-center space-y-6">
            <div className="text-7xl flex gap-3 p-4 bg-indigo-50/50 rounded-2xl">
              <span>📓</span>
              <span>✨</span>
            </div>
            {wisdom1Revealed ? (
              <div className="w-full py-4 text-2xl font-black text-indigo-900 bg-green-50 border border-green-200 rounded-2xl animate-in zoom-in duration-300">
                العلم نور
              </div>
            ) : (
              <button
                onClick={() => setWisdom1Revealed(true)}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold rounded-2xl transition-transform active:scale-95 shadow-sm cursor-pointer"
              >
                اكتشف الحكمة 🔍
              </button>
            )}
          </div>

          {/* Wisdom Card 2 */}
          <div className="bg-white p-8 rounded-3xl border-2 border-indigo-100 shadow-sm flex flex-col items-center text-center space-y-6">
            <div className="text-7xl flex gap-3 p-4 bg-indigo-50/50 rounded-2xl">
              <span>🫂</span>
              <span>🎁</span>
            </div>
            {wisdom2Revealed ? (
              <div className="w-full py-4 text-2xl font-black text-indigo-900 bg-green-50 border border-green-200 rounded-2xl animate-in zoom-in duration-300">
                الصداقة كنز لا يفنى
              </div>
            ) : (
              <button
                onClick={() => setWisdom2Revealed(true)}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold rounded-2xl transition-transform active:scale-95 shadow-sm cursor-pointer"
              >
                اكتشف الحكمة 🔍
              </button>
            )}
          </div>
        </div>

        {/* Finish button */}
        <button
          onClick={() => isAct3Complete && setIsFinished(true)}
          disabled={!isAct3Complete}
          className={`mt-10 px-12 py-4 text-xl font-bold rounded-full shadow-lg transition-all active:scale-95 flex items-center gap-2
             ${isAct3Complete ? "bg-green-500 hover:bg-green-600 text-white cursor-pointer hover:-translate-y-0.5" : "bg-gray-200 text-gray-400 cursor-not-allowed"}
          `}
        >
          <span>إنهاء الحصة</span>
          <span>🏁</span>
        </button>
      </div>
    );
  };

  
  
  const getActivityTitle = () => {
    if (currentActivity === 1) return "النشاط 1: تنفيذ الأوامر";
    if (currentActivity === 2) return "النشاط 2: كيف تشعر اليوم؟";
    if (currentActivity === 3) return "النشاط 3: استنتاج المعاني";
    return "";
  };

    return (
    <SessionContainer
      title="الحصة 10: تجهيز المعلومات ومعالجتها"
      activityTitle={getActivityTitle()}
      isCompleted={isFinished}
      onRestart={handleResetSession}
      nextSessionPath="/therapy/memory/session-11"
    >
      <div className="w-full">
        {currentActivity === 1 && renderActivity1()}
        {currentActivity === 2 && renderActivity2()}
        {currentActivity === 3 && renderActivity3()}
      </div>
    </SessionContainer>
  );
}

