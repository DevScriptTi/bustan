"use client";
import { useState } from "react";
import SessionContainer from "@/components/therapy/SessionContainer";

const cards = [
  { id: 1, icon: "🦁", title: "أسد", question: "هل تشبه الأسد لأنك شجاع؟", color: "bg-orange-100 border-orange-300 text-orange-600 hover:bg-orange-200" },
  { id: 2, icon: "🐢", title: "سلحفاة", question: "هل تشبه السلحفاة لأنك هادئ؟", color: "bg-green-100 border-green-300 text-green-600 hover:bg-green-200" },
  { id: 3, icon: "🐰", title: "أرنب", question: "هل تشبه الأرنب لأنك تخجل؟", color: "bg-pink-100 border-pink-300 text-pink-600 hover:bg-pink-200" },
  { id: 4, icon: "☀️", title: "شمس", question: "هل تشبه الشمس لأنك تحب الفرح؟", color: "bg-yellow-100 border-yellow-300 text-yellow-600 hover:bg-yellow-200" }
];

export default function OddSession2() {
  const [step, setStep] = useState(0);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const resetSession = () => {
    setStep(0);
    setSelectedCard(null);
    setIsCompleted(false);
  };

  const handleCardSelect = (card: any) => {
    setSelectedCard(card);
    setStep(1);
  };

  const handleNextStep = () => {
    setStep(step + 1);
  };

  const handleAnswerClick = () => {
    if (selectedCard?.icon === '☀️') {
      setStep(2); // Go to Context Question
    } else {
      setStep(3); // Skip straight to Reward
    }
  };

  const renderStep0 = () => (
    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
      <h3 className="text-2xl md:text-3xl font-bold text-indigo-800 mb-8 text-center">اختر الصورة التي تشبهك</h3>
      <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardSelect(card)}
            className={`flex flex-col items-center justify-center p-8 rounded-3xl border-4 ${card.color} transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md cursor-pointer`}
          >
            <span className="text-7xl mb-4 drop-shadow-sm">{card.icon}</span>
            <span className="text-xl font-bold">{card.title}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-500 text-center">
      <div className={`w-40 h-40 rounded-full flex items-center justify-center border-8 ${selectedCard.color} bg-white shadow-xl mb-4 animate-bounce`}>
        <span className="text-8xl drop-shadow-md">{selectedCard.icon}</span>
      </div>
      <h3 className="text-3xl font-bold text-slate-800 leading-relaxed max-w-lg">
        {selectedCard.question}
      </h3>
      <div className="flex justify-center gap-6 w-full max-w-md pt-4">
        <button onClick={handleAnswerClick} className="flex-1 py-4 bg-green-500 hover:bg-green-600 text-white font-bold text-2xl rounded-2xl shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer">نعم</button>
        <button onClick={handleAnswerClick} className="flex-1 py-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold text-2xl rounded-2xl shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer">أحياناً</button>
        <button onClick={handleAnswerClick} className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white font-bold text-2xl rounded-2xl shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer">لا</button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto space-y-10 animate-in fade-in zoom-in duration-500 text-center">
      <h3 className="text-3xl md:text-4xl font-bold text-indigo-900 mb-8">متى تكون هكذا؟</h3>
      <div className="flex flex-col gap-4 w-full max-w-md">
        <button onClick={handleNextStep} className="w-full py-6 bg-sky-100 border-2 border-sky-300 hover:bg-sky-200 text-sky-800 font-bold text-2xl rounded-3xl shadow-sm transition-transform hover:-translate-y-1 active:scale-95 cursor-pointer flex items-center justify-center gap-4">
          <span>👦</span> مع أصدقائي
        </button>
        <button onClick={handleNextStep} className="w-full py-6 bg-purple-100 border-2 border-purple-300 hover:bg-purple-200 text-purple-800 font-bold text-2xl rounded-3xl shadow-sm transition-transform hover:-translate-y-1 active:scale-95 cursor-pointer flex items-center justify-center gap-4">
          <span>🏠</span> في البيت
        </button>
        <button onClick={handleNextStep} className="w-full py-6 bg-teal-100 border-2 border-teal-300 hover:bg-teal-200 text-teal-800 font-bold text-2xl rounded-3xl shadow-sm transition-transform hover:-translate-y-1 active:scale-95 cursor-pointer flex items-center justify-center gap-4">
          <span>🏫</span> في المدرسة
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto bg-amber-50 border-4 border-amber-200 p-12 rounded-[3rem] shadow-xl animate-in zoom-in duration-700 text-center relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200 rounded-full blur-3xl opacity-50"></div>
      <span className="text-9xl mb-6 drop-shadow-xl animate-bounce relative z-10">⭐</span>
      <h3 className="text-4xl font-black text-amber-600 mb-10 relative z-10">
        رائع! أنت تعرف نفسك
      </h3>
      <button
        onClick={() => setIsCompleted(true)}
        className="px-12 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-2xl rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer flex items-center gap-3 relative z-10"
      >
        <span>إنهاء النشاط</span>
        <span>➡️</span>
      </button>
    </div>
  );

  return (
    <SessionContainer 
      title="برنامج تعديل السلوك (ODD) - الحصة 2"
      activityTitle="النشاط 2: بطاقات من أنا؟" 
      isCompleted={isCompleted} 
      nextSessionPath="/therapy/odd/session-3" 
      onRestart={resetSession} 
      programType="odd"
      currentSession={2}
    >
      <div className="w-full flex flex-col items-center justify-center py-4 sm:py-8">
        {step === 0 && renderStep0()}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </SessionContainer>
  );
}
