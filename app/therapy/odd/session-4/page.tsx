"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import SessionContainer from "@/components/therapy/SessionContainer";

const situations = [
  {
    title: "حان وقت الدراسة",
    imageEmoji: "📚",
    options: [
      { id: 1, text: "الاستمرار في النوم", isCorrect: false, emoji: "😴" },
      { id: 2, text: "اللعب", isCorrect: false, emoji: "🎮" },
      { id: 3, text: "أحمل محفظتي وأذهب للدراسة", isCorrect: true, emoji: "🎒" }
    ]
  },
  {
    title: "حان وقت النوم",
    imageEmoji: "🌙",
    options: [
      { id: 1, text: "إشعال التلفاز", isCorrect: false, emoji: "📺" },
      { id: 2, text: "لعب الكرة", isCorrect: false, emoji: "⚽" },
      { id: 3, text: "قراءة قصة فوق السرير", isCorrect: true, emoji: "📖" }
    ]
  },
  {
    title: "حان وقت الغداء",
    imageEmoji: "🍽️",
    options: [
      { id: 1, text: "أصرخ وأرفض", isCorrect: false, emoji: "😠" },
      { id: 2, text: "أجلس", isCorrect: false, emoji: "🪑" },
      { id: 3, text: "أغسل يدي", isCorrect: true, emoji: "🧼" } 
    ]
  }
];

const smartToys = [
  { id: 'basketball', icon: "🏀", label: "كرة سلة", color: "bg-orange-100 border-orange-300 text-orange-700 hover:bg-orange-200" },
  { id: 'soccer', icon: "⚽", label: "كرة قدم", color: "bg-emerald-100 border-emerald-300 text-emerald-700 hover:bg-emerald-200" },
  { id: 'doll', icon: "🧸", label: "دمية", color: "bg-pink-100 border-pink-300 text-pink-700 hover:bg-pink-200" }
];

export default function OddSession4() {
  const [phase, setPhase] = useState<'smart_choices' | 'small_decisions'>('smart_choices');
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Phase 1 states
  const [toyChosen, setToyChosen] = useState<string | null>(null);

  // Phase 2 states
  const [currentSituation, setCurrentSituation] = useState(0);
  const [wrongAttemptId, setWrongAttemptId] = useState<number | null>(null);
  const [successId, setSuccessId] = useState<number | null>(null);

  const resetSession = () => {
    setPhase('smart_choices');
    setIsCompleted(false);
    setToyChosen(null);
    setCurrentSituation(0);
    setWrongAttemptId(null);
    setSuccessId(null);
  };

  const handleOptionClick = (isCorrect: boolean, id: number) => {
    if (isCorrect) {
      setSuccessId(id);
      setWrongAttemptId(null);
      setTimeout(() => {
        setSuccessId(null);
        if (currentSituation < situations.length - 1) {
          setCurrentSituation(prev => prev + 1);
        } else {
          setIsCompleted(true);
        }
      }, 1000);
    } else {
      setWrongAttemptId(id);
      setTimeout(() => setWrongAttemptId(null), 500);
    }
  };

  const renderSmartChoices = () => (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto space-y-12 animate-in fade-in zoom-in duration-500 select-none">
      <h3 className="text-3xl md:text-4xl font-bold text-slate-800 text-center mb-4">لعبة أنا أختار</h3>
      <p className="text-xl text-slate-600 text-center font-medium">أي لعبة تفضل أن نلعب بها الآن؟</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl">
        {smartToys.map((toy) => (
          <button
            key={toy.id}
            onClick={() => setToyChosen(toy.id)}
            className={`flex flex-col items-center justify-center p-8 rounded-3xl border-4 ${toy.color} transition-all duration-300 cursor-pointer shadow-sm ${toyChosen === toy.id ? "ring-4 ring-indigo-400 scale-105 shadow-lg" : "hover:scale-105 active:scale-95"}`}
          >
            <span className="text-8xl mb-4 drop-shadow-md">{toy.icon}</span>
            <span className="text-2xl font-bold">{toy.label}</span>
          </button>
        ))}
      </div>

      {toyChosen && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-50 border-4 border-indigo-200 p-8 rounded-3xl text-center space-y-6 shadow-xl w-full max-w-lg mt-8"
        >
          <span className="text-6xl block animate-bounce">👏</span>
          <h4 className="text-3xl font-black text-indigo-700">أنت من قرّرت اليوم!</h4>
          <button
            onClick={() => setPhase('small_decisions')}
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-2xl rounded-2xl shadow-lg transition-transform hover:-translate-y-1 active:scale-95 cursor-pointer flex items-center justify-center gap-3"
          >
            <span>المرحلة التالية</span>
            <span>➡️</span>
          </button>
        </motion.div>
      )}
    </div>
  );

  const renderSmallDecisions = () => {
    const sit = situations[currentSituation];
    
    return (
      <div className="flex flex-col items-center w-full max-w-3xl mx-auto space-y-10 animate-in fade-in duration-500 select-none">
        <div className="bg-sky-50 border-4 border-sky-200 p-8 rounded-3xl text-center w-full shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-200 rounded-full blur-3xl opacity-50"></div>
          <span className="text-8xl block mb-6 drop-shadow-lg relative z-10">{sit.imageEmoji}</span>
          <h3 className="text-3xl md:text-4xl font-bold text-slate-800 relative z-10">{sit.title}</h3>
          <div className="mt-4 inline-block px-4 py-1 bg-sky-200 text-sky-800 rounded-full font-bold">
            الموقف {currentSituation + 1} من {situations.length}
          </div>
        </div>

        <div className="w-full grid grid-cols-1 gap-5 mt-6">
          {sit.options.map((opt) => {
            const isWrong = wrongAttemptId === opt.id;
            const isSuccess = successId === opt.id;
            
            return (
              <motion.button
                key={opt.id}
                onClick={() => handleOptionClick(opt.isCorrect, opt.id)}
                animate={isWrong ? { x: [-10, 10, -10, 10, 0] } : isSuccess ? { scale: [1, 1.05, 1], backgroundColor: "#dcfce7", borderColor: "#86efac" } : {}}
                transition={{ duration: isWrong ? 0.4 : 0.5 }}
                className={`w-full flex items-center p-6 rounded-2xl border-4 shadow-sm transition-colors text-right cursor-pointer 
                  ${isSuccess 
                    ? "bg-green-100 border-green-300 text-green-800" 
                    : isWrong 
                      ? "bg-red-50 border-red-300 text-red-800"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                  }`}
              >
                <span className="text-5xl ml-6 drop-shadow-sm">{opt.emoji}</span>
                <span className="text-2xl font-bold flex-1 text-right">{opt.text}</span>
                {isWrong && <span className="text-red-500 font-bold ml-4 text-lg">حاول مرة أخرى ❌</span>}
                {isSuccess && <span className="text-green-600 font-bold ml-4 text-3xl">✅</span>}
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <SessionContainer 
      title="برنامج تعديل السلوك (ODD) - الحصة 4"
      activityTitle="النشاط 4: تقوية الشعور بالسيطرة" 
      isCompleted={isCompleted} 
      nextSessionPath="/therapy/odd/session-5" 
      onRestart={resetSession} 
      programType="odd"
      currentSession={4}
    >
      <div className="w-full flex flex-col items-center justify-center py-4 sm:py-8" dir="rtl">
        {phase === 'smart_choices' && renderSmartChoices()}
        {phase === 'small_decisions' && renderSmallDecisions()}
      </div>
    </SessionContainer>
  );
}
