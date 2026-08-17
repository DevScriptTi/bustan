"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SessionContainer from "@/components/therapy/SessionContainer";
import BreathingExercise from "@/components/BreathingExercise";

const thermometerLevels = [
  { level: 5, label: "غاضب جداً", emoji: "😡", color: "bg-red-500", hoverColor: "hover:bg-red-600" },
  { level: 4, label: "منزعج", emoji: "😣", color: "bg-orange-400", hoverColor: "hover:bg-orange-500" },
  { level: 3, label: "محبط", emoji: "😞", color: "bg-yellow-400", hoverColor: "hover:bg-yellow-500" },
  { level: 2, label: "قليل التوتر", emoji: "😊", color: "bg-green-400", hoverColor: "hover:bg-green-500" },
  { level: 1, label: "هادئ", emoji: "🙂", color: "bg-blue-400", hoverColor: "hover:bg-blue-500" },
];

const volcanoActivities = [
  { id: 'breathing', text: "تمرين تنفس 😮‍💨", color: "bg-sky-100 border-sky-300 text-sky-700 hover:bg-sky-200" },
  { id: 'spinner', text: "لعبة سبينر 🌀", color: "bg-purple-100 border-purple-300 text-purple-700 hover:bg-purple-200" },
  { id: 'shoot', text: "تسديد كرة ⚽", color: "bg-green-100 border-green-300 text-green-700 hover:bg-green-200" },
  { id: 'jump', text: "القفز 10 مرات 🦘", color: "bg-orange-100 border-orange-300 text-orange-700 hover:bg-orange-200" },
];

export default function OddSession3() {
  const [phase, setPhase] = useState<'thermometer_1' | 'volcano' | 'thermometer_2'>('thermometer_1');
  const [initialFeeling, setInitialFeeling] = useState<number | null>(null);
  const [volcanoAnger, setVolcanoAnger] = useState(3);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  
  // Mini-game states
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [jumps, setJumps] = useState(0);

  const resetSession = () => {
    setPhase('thermometer_1');
    setInitialFeeling(null);
    setVolcanoAnger(3);
    setIsCompleted(false);
    setShowPrompt(false);
    setActiveGame(null);
    setJumps(0);
  };

  const finishMiniGame = () => {
    setVolcanoAnger((prev) => Math.max(0, prev - 1));
    setActiveGame(null);
    setJumps(0);
  };

  const handleThermometer1Click = (level: number) => {
    setInitialFeeling(level);
    if (level === 1 || level === 2) {
      setIsCompleted(true);
    } else {
      setShowPrompt(true);
    }
  };

  const handleThermometer2Click = (level: number) => {
    setIsCompleted(true);
  };

  const getVolcanoVisual = () => {
    switch (volcanoAnger) {
      case 3: return { emoji: "🌋", size: "text-9xl scale-125", bounce: "animate-bounce" };
      case 2: return { emoji: "🌋", size: "text-8xl scale-110", bounce: "animate-pulse" };
      case 1: return { emoji: "🌋", size: "text-7xl", bounce: "" };
      case 0: return { emoji: "⛰️", size: "text-7xl", bounce: "" };
      default: return { emoji: "⛰️", size: "text-7xl", bounce: "" };
    }
  };

  const renderThermometer1 = () => (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto space-y-10 animate-in fade-in zoom-in duration-500 select-none">
      <h3 className="text-3xl md:text-4xl font-bold text-slate-800 text-center mb-4">أنا أقيس شعوري</h3>
      
      {!showPrompt ? (
        <div className="flex flex-col gap-3 w-full max-w-xs relative bg-slate-50 p-6 rounded-t-[4rem] rounded-b-3xl border-4 border-slate-200 shadow-inner">
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-4 bg-slate-200 rounded-full z-0"></div>
          {thermometerLevels.map((lvl) => (
            <button
              key={lvl.level}
              onClick={() => handleThermometer1Click(lvl.level)}
              className={`relative z-10 w-full py-4 ${lvl.color} ${lvl.hoverColor} text-white font-bold text-2xl rounded-2xl shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-between px-6 border-b-4 border-black/10`}
            >
              <span>{lvl.label}</span>
              <span className="text-4xl drop-shadow-sm">{lvl.emoji}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-orange-50 border-4 border-orange-200 p-10 rounded-3xl text-center space-y-8 animate-in zoom-in duration-500 shadow-xl max-w-lg">
          <span className="text-7xl block animate-bounce">🌋</span>
          <p className="text-2xl font-bold text-slate-800 leading-relaxed">
            يبدو أن غضبك مرتفع. هل تريد أن نهدأ معاً؟
          </p>
          <button
            onClick={() => setPhase('volcano')}
            className="w-full py-5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-2xl rounded-2xl shadow-lg transition-transform hover:-translate-y-1 active:scale-95 cursor-pointer"
          >
            هيا نهدأ البركان ⬅️
          </button>
        </div>
      )}
    </div>
  );

  const renderMiniGame = () => {
    switch (activeGame) {
      case 'breathing':
        return <BreathingExercise onFinish={finishMiniGame} />;
      
      case 'spinner':
        return (
          <div className="flex flex-col items-center gap-12 bg-purple-50 p-10 rounded-3xl border-4 border-purple-200 shadow-lg w-full max-w-md animate-in zoom-in">
            <h4 className="text-2xl font-bold text-purple-800">لعبة سبينر</h4>
            <p className="text-lg text-purple-600 font-medium">انقر بسرعة لتدوير السبينر!</p>
            <motion.div
              className="cursor-pointer"
              whileTap={{ rotate: 1080 }}
              transition={{ duration: 2.5, ease: "easeOut" }}
            >
              <img src="/icons/spinner.svg" alt="سبينر" draggable={false} className="w-48 h-48 drop-shadow-xl select-none" />
            </motion.div>
            <button onClick={finishMiniGame} className="w-full py-4 bg-purple-500 hover:bg-purple-600 text-white font-bold text-xl rounded-2xl shadow-md transition-transform active:scale-95 mt-4">
              عودة للبركان
            </button>
          </div>
        );

      case 'jump':
        return (
          <div className="flex flex-col items-center gap-8 bg-orange-50 p-10 rounded-3xl border-4 border-orange-200 shadow-lg w-full max-w-md animate-in zoom-in relative overflow-hidden">
            <h4 className="text-2xl font-bold text-orange-800">القفز 10 مرات</h4>
            <div className="text-4xl font-black text-orange-500">{jumps} / 10</div>
            
            <motion.div 
              className="text-8xl drop-shadow-xl z-10"
              animate={{ y: 0 }}
              whileTap={{ y: -100 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              🧍
            </motion.div>

            {jumps >= 10 ? (
              <div className="absolute inset-0 bg-orange-100/90 flex flex-col items-center justify-center z-20 space-y-6 animate-in fade-in">
                <span className="text-6xl animate-bounce">🏆</span>
                <span className="text-4xl font-black text-orange-600">بطل!</span>
                <button onClick={finishMiniGame} className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xl rounded-2xl shadow-md transition-transform active:scale-95">
                  أكمل
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setJumps(prev => prev + 1)} 
                className="w-full py-5 bg-orange-500 hover:bg-orange-600 text-white font-black text-3xl rounded-2xl shadow-lg transition-transform active:scale-95 z-10 mt-4"
              >
                اقفز!
              </button>
            )}
          </div>
        );

      case 'shoot':
        return (
          <div className="flex flex-col items-center gap-6 bg-green-50 p-10 rounded-3xl border-4 border-green-200 shadow-lg w-full max-w-md animate-in zoom-in h-[500px] relative overflow-hidden touch-none">
            <h4 className="text-2xl font-bold text-green-800 text-center">تسديد الكرة</h4>
            <p className="text-green-600 font-medium text-center">اسحب الكرة بإصبعك نحو المرمى!</p>
            
            <div className="absolute top-24 z-0">
              <img src="/icons/goal-net.svg" alt="مرمى" draggable={false} className="w-64 sm:w-80 h-auto drop-shadow-md mb-8 select-none" />
            </div>

            <motion.div
              drag
              dragConstraints={{ top: -400, bottom: 50, left: -100, right: 100 }}
              dragElastic={0.2}
              onDragEnd={(e, info) => {
                if (info.offset.y < -150) {
                  finishMiniGame();
                }
              }}
              className="absolute bottom-10 cursor-grab active:cursor-grabbing z-10"
            >
              <img src="/icons/ball.svg" alt="كرة" draggable={false} className="w-16 h-16 drop-shadow-md select-none pointer-events-none" />
            </motion.div>
            
            <button onClick={finishMiniGame} className="absolute bottom-4 left-4 text-green-700 bg-green-200 px-4 py-2 rounded-xl text-sm font-bold z-20 hover:bg-green-300">
              تخطي
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderVolcano = () => {
    const visual = getVolcanoVisual();
    
    return (
      <div className="flex flex-col items-center w-full max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 select-none">
        
        {activeGame ? (
          renderMiniGame()
        ) : (
          <>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-800 text-center">
              بركان الغضب يغلي 🌋 أنا أهدئ غضبي
            </h3>
            
            <div className={`h-48 flex items-center justify-center transition-all duration-700 ${visual.bounce}`}>
              <span className={`${visual.size} drop-shadow-2xl transition-all duration-700 filter saturate-150`}>
                {visual.emoji}
              </span>
            </div>

            {volcanoAnger > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl mt-8">
                {volcanoActivities.map((activity) => (
                  <button
                    key={activity.id}
                    onClick={() => setActiveGame(activity.id)}
                    className={`py-6 px-4 rounded-3xl border-4 ${activity.color} font-bold text-2xl shadow-sm transition-transform hover:-translate-y-1 active:scale-95 cursor-pointer`}
                  >
                    {activity.text}
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-green-50 border-4 border-green-200 p-10 rounded-3xl text-center space-y-6 animate-in zoom-in duration-500 shadow-xl mt-8 w-full max-w-lg">
                <h4 className="text-3xl font-black text-green-600">أحسنت! أصبح البركان هادئاً</h4>
                <button
                  onClick={() => setPhase('thermometer_2')}
                  className="w-full py-5 bg-green-500 hover:bg-green-600 text-white font-bold text-2xl rounded-2xl shadow-lg transition-transform hover:-translate-y-1 active:scale-95 cursor-pointer flex items-center justify-center gap-3"
                >
                  <span>قس شعورك الآن</span>
                  <span>⬅️</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderThermometer2 = () => (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto space-y-10 animate-in fade-in zoom-in duration-500 select-none">
      <h3 className="text-3xl md:text-4xl font-bold text-slate-800 text-center mb-4 leading-relaxed">
        كيف تشعر الآن بعد أن هدأ البركان؟
      </h3>
      
      <div className="flex flex-col gap-3 w-full max-w-xs relative bg-slate-50 p-6 rounded-t-[4rem] rounded-b-3xl border-4 border-slate-200 shadow-inner">
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-4 bg-slate-200 rounded-full z-0"></div>
        {thermometerLevels.map((lvl) => (
          <button
            key={lvl.level}
            onClick={() => handleThermometer2Click(lvl.level)}
            className={`relative z-10 w-full py-4 ${lvl.color} ${lvl.hoverColor} text-white font-bold text-2xl rounded-2xl shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-between px-6 border-b-4 border-black/10`}
          >
            <span>{lvl.label}</span>
            <span className="text-4xl drop-shadow-sm">{lvl.emoji}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <SessionContainer 
      title="برنامج تعديل السلوك (ODD) - الحصة 3"
      activityTitle="النشاط 3: ميزان الحرارة العاطفي" 
      isCompleted={isCompleted} 
      nextSessionPath="/therapy/odd/session-4" 
      onRestart={resetSession} 
      programType="odd"
      currentSession={3}
    >
      <div className="w-full flex flex-col items-center justify-center py-4 sm:py-8" dir="rtl">
        {phase === 'thermometer_1' && renderThermometer1()}
        {phase === 'volcano' && renderVolcano()}
        {phase === 'thermometer_2' && renderThermometer2()}
      </div>
    </SessionContainer>
  );
}
