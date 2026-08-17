"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import SessionContainer from "@/components/therapy/SessionContainer";

const step1Events = [
  { id: "event_1", text: "طفل يضربه طفل آخر", emoji: "🥊" },
  { id: "event_2", text: "يريد لعبة والأم ترفض", emoji: "🧸❌" },
  { id: "event_3", text: "طفل جائع ويريد الطعام", emoji: "🥪" },
];

const step2Feelings = [
  { id: "feel_1", text: "الحزن", emoji: "😢" },
  { id: "feel_2", text: "الغضب", emoji: "😡" },
  { id: "feel_3", text: "الإحباط", emoji: "😞" },
];

const step3Options = [
  { id: "opt_1", text: "ضرب الأطفال الذين ضربوه / الدفاع عن نفسه", emoji: "⚔️" },
  { id: "opt_2", text: "شراء هدية له / تقديم لعبة", emoji: "🎁" },
  { id: "opt_3", text: "اللعب معه / تقديم الطعام له", emoji: "🍎" },
];

export default function OddSession5() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedFeeling, setSelectedFeeling] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [finalSolution, setFinalSolution] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);

  const resetSession = () => {
    setCurrentStep(1);
    setSelectedEvent("");
    setSelectedFeeling("");
    setSelectedOptions([]);
    setFinalSolution("");
    setIsCompleted(false);
  };

  const toggleOption = (optionText: string) => {
    if (selectedOptions.includes(optionText)) {
      setSelectedOptions(selectedOptions.filter((o) => o !== optionText));
    } else {
      setSelectedOptions([...selectedOptions, optionText]);
    }
  };

  const handleStep1Select = (eventText: string) => {
    setSelectedEvent(eventText);
    setCurrentStep(2);
  };

  const handleStep2Select = (feelingText: string) => {
    setSelectedFeeling(feelingText);
    setCurrentStep(3);
  };

  const handleStep3Submit = () => {
    if (selectedOptions.length >= 2) {
      setCurrentStep(4);
    }
  };

  const handleStep4Select = (solutionText: string) => {
    setFinalSolution(solutionText);
    setIsCompleted(true);
  };

  return (
    <SessionContainer 
      title="برنامج زيادة المناعة النفسية (ODD) - الحصة 5"
      activityTitle="النشاط 5: حل المشكلات بـ 4 خطوات" 
      isCompleted={isCompleted} 
      nextSessionPath="/therapy/odd/session-6" 
      onRestart={resetSession} 
      programType="odd"
      currentSession={5}
    >
      <div className="flex flex-col items-center w-full max-w-2xl mx-auto space-y-6 select-none" dir="rtl">
        {/* Progress Indicator */}
        <div className="flex items-center gap-2 mb-2">
          {[1, 2, 3, 4].map((stepNum) => (
            <div
              key={stepNum}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                currentStep === stepNum
                  ? "bg-indigo-600 text-white ring-4 ring-indigo-200 scale-110"
                  : currentStep > stepNum
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {currentStep > stepNum ? "✓" : stepNum}
            </div>
          ))}
        </div>

        {/* Context Hero Image */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="bg-sky-50 border-4 border-sky-200 rounded-3xl p-6 text-center w-full shadow-sm flex flex-col items-center relative overflow-hidden"
        >
          <span className="text-7xl sm:text-8xl mb-2 drop-shadow-md animate-pulse">😭</span>
          <p className="text-slate-600 font-bold text-base sm:text-lg">هناك طفل يبكي يحتاج مساعدتك لنفهم المشكلة ونجد حلاً لها!</p>
        </motion.div>

        {/* Step 1: What happened */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-4"
          >
            <h3 className="text-2xl sm:text-3xl font-black text-slate-800 text-center mb-6">
              الخطوة 1: ماذا حدث؟ 🧐
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {step1Events.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleStep1Select(item.text)}
                  className="w-full bg-white hover:bg-indigo-50 border-4 border-slate-200 hover:border-indigo-400 p-5 rounded-2xl flex items-center gap-4 transition-all active:scale-95 shadow-sm text-right cursor-pointer group"
                >
                  <span className="text-4xl group-hover:scale-110 transition-transform">{item.emoji}</span>
                  <span className="text-xl font-bold text-slate-800 flex-1">{item.text}</span>
                  <span className="text-2xl opacity-0 group-hover:opacity-100 transition-opacity">⬅️</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: How do I feel */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-4"
          >
            <h3 className="text-2xl sm:text-3xl font-black text-slate-800 text-center mb-6">
              الخطوة 2: ماذا أشعر عما حدث؟ 💭
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {step2Feelings.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleStep2Select(item.text)}
                  className="w-full bg-white hover:bg-pink-50 border-4 border-slate-200 hover:border-pink-300 p-5 rounded-2xl flex items-center gap-4 transition-all active:scale-95 shadow-sm text-right cursor-pointer group"
                >
                  <span className="text-4xl group-hover:scale-110 transition-transform">{item.emoji}</span>
                  <span className="text-xl font-bold text-slate-800 flex-1">{item.text}</span>
                  <span className="text-2xl opacity-0 group-hover:opacity-100 transition-opacity">⬅️</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 3: Multiple Options */}
        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-4"
          >
            <div className="text-center space-y-1 mb-6">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-800">
                الخطوة 3: ما الخيارات المتاحة؟ 💡
              </h3>
              <p className="text-amber-700 font-bold text-base">
                اختر خيارين على الأقل مما يلي (تم اختيار {selectedOptions.length}):
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {step3Options.map((item) => {
                const isSelected = selectedOptions.includes(item.text);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleOption(item.text)}
                    className={`w-full p-5 rounded-2xl border-4 flex items-center gap-4 transition-all active:scale-95 shadow-sm text-right cursor-pointer ${
                      isSelected
                        ? "bg-amber-100 border-amber-400 text-slate-900 ring-2 ring-amber-300"
                        : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span className="text-4xl">{item.emoji}</span>
                    <span className="text-xl font-bold flex-1">{item.text}</span>
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center border-2 font-black ${
                        isSelected
                          ? "bg-amber-500 border-amber-600 text-white"
                          : "border-slate-300 bg-slate-100"
                      }`}
                    >
                      {isSelected ? "✓" : ""}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleStep3Submit}
              disabled={selectedOptions.length < 2}
              className={`w-full py-4 rounded-2xl font-black text-xl shadow-lg transition-all mt-6 cursor-pointer ${
                selectedOptions.length >= 2
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-102 active:scale-95"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
              }`}
            >
              التالي (اختر 2 على الأقل) ➡️
            </button>
          </motion.div>
        )}

        {/* Step 4: Best Solution */}
        {currentStep === 4 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-4"
          >
            <div className="text-center space-y-1 mb-6">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-800">
                الخطوة 4: ما الحل الأفضل؟ ⭐
              </h3>
              <p className="text-emerald-700 font-bold text-base">
                من بين الخيارات التي حددتها، ما هو الحل الأفضل؟
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {selectedOptions.map((optText, idx) => {
                const matchedObj = step3Options.find((o) => o.text === optText);
                return (
                  <button
                    key={idx}
                    onClick={() => handleStep4Select(optText)}
                    className="w-full bg-emerald-50 hover:bg-emerald-100 border-4 border-emerald-300 hover:border-emerald-500 p-5 rounded-2xl flex items-center gap-4 transition-all active:scale-95 shadow-md text-right cursor-pointer group"
                  >
                    <span className="text-4xl group-hover:scale-110 transition-transform">
                      {matchedObj?.emoji || "🌟"}
                    </span>
                    <span className="text-xl font-bold text-slate-900 flex-1">{optText}</span>
                    <span className="text-2xl font-bold text-emerald-600">اختيار 🌟</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </SessionContainer>
  );
}
