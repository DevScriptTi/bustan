"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import SessionContainer from "@/components/therapy/SessionContainer";

const allCards = [
  { id: 1, text: "لأنني أسمع كلام أمي", emoji: "❤️" },
  { id: 2, text: "لأني أساعد إخوتي وأحبهم", emoji: "🤝" },
  { id: 3, text: "لأني أدرس جيداً", emoji: "📚" },
  { id: 4, text: "لأني أطيع معلمتي", emoji: "🏫" },
  { id: 5, text: "لأني أُسعد أبي وأمي", emoji: "😊" },
];

const paletteColors = [
  { name: "ذهبي", hex: "#FFD700" },
  { name: "أحمر", hex: "#EF4444" },
  { name: "أزرق", hex: "#3B82F6" },
  { name: "أخضر", hex: "#10B981" },
  { name: "بنفسجي", hex: "#8B5CF6" },
  { name: "وردي", hex: "#EC4899" },
];

export default function OddSession7() {
  const [phase, setPhase] = useState<"strengths_selection" | "medal_coloring" | "celebration">("strengths_selection");

  // Phase 1 States
  const [selectedStrengths, setSelectedStrengths] = useState<string[]>([]);

  // Phase 2 States
  const [activeColor, setActiveColor] = useState("#FFD700");
  const [medalColors, setMedalColors] = useState<Record<string, string>>({
    ribbonLeft: "#EF4444",
    ribbonRight: "#EF4444",
    outerRing: "#FFD700",
    innerCircle: "#3B82F6",
    starCenter: "#FFD700",
  });

  const [isCompleted, setIsCompleted] = useState(false);

  const toggleCard = (cardText: string) => {
    if (selectedStrengths.includes(cardText)) {
      setSelectedStrengths(selectedStrengths.filter((c) => c !== cardText));
    } else {
      if (selectedStrengths.length < 3) {
        setSelectedStrengths([...selectedStrengths, cardText]);
      }
    }
  };

  const setPartColor = (partKey: string) => {
    setMedalColors((prev) => ({ ...prev, [partKey]: activeColor }));
  };

  const resetSession = () => {
    setPhase("strengths_selection");
    setSelectedStrengths([]);
    setMedalColors({
      ribbonLeft: "#EF4444",
      ribbonRight: "#EF4444",
      outerRing: "#FFD700",
      innerCircle: "#3B82F6",
      starCenter: "#FFD700",
    });
    setIsCompleted(false);
  };

  return (
    <SessionContainer
      title="برنامج زيادة المناعة النفسية (ODD) - الحصة 7"
      activityTitle="النشاط 7: الهوية الإيجابية والاحتفال"
      isCompleted={isCompleted}
      nextSessionPath="/dashboard"
      onRestart={resetSession}
      programType="odd"
      currentSession={7}
    >
      <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto space-y-6 min-h-[450px] select-none" dir="rtl">
        
        {/* Phase 1: Notebook & Cards */}
        {phase === "strengths_selection" && (
          <motion.div
            key="phase1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full flex flex-col items-center space-y-6"
          >
            <div className="text-center space-y-2">
              <h3 className="text-3xl font-black text-slate-800">دفتري: أنا قوي 📓💪</h3>
              <p className="text-lg text-slate-600 font-bold">
                اختر 3 بطاقات تعبر عن قوتك وضعها في دفترك (تم اختيار {selectedStrengths.length} / 3):
              </p>
            </div>

            {/* Notebook Drop Zone */}
            <div className="w-full bg-amber-50 border-4 border-amber-300 rounded-3xl p-6 shadow-inner min-h-[160px] flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute top-2 right-4 text-xs font-bold text-amber-700 bg-amber-200 px-3 py-1 rounded-full">
                📖 دفتر الإيجابيات
              </div>

              {selectedStrengths.length === 0 ? (
                <p className="text-amber-600/70 font-bold text-base border-2 border-dashed border-amber-300 px-6 py-4 rounded-2xl">
                  اضغط على البطاقات بالأسفل لإضافتها إلى دفترك! 🌟
                </p>
              ) : (
                <div className="flex items-center justify-center flex-wrap gap-4 w-full pt-4">
                  {selectedStrengths.map((strText, idx) => {
                    const cardObj = allCards.find((c) => c.text === strText);
                    return (
                      <motion.div
                        key={idx}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-white border-2 border-amber-400 px-4 py-3 rounded-2xl shadow-md flex items-center gap-2"
                      >
                        <span className="text-2xl">{cardObj?.emoji || "⭐"}</span>
                        <span className="font-bold text-slate-800 text-sm sm:text-base">{strText}</span>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Available Strength Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {allCards.map((card) => {
                const isSelected = selectedStrengths.includes(card.text);
                return (
                  <button
                    key={card.id}
                    onClick={() => toggleCard(card.text)}
                    className={`p-4 rounded-2xl border-4 flex items-center gap-3 transition-all active:scale-95 text-right cursor-pointer shadow-sm ${
                      isSelected
                        ? "bg-amber-100 border-amber-400 text-slate-900 ring-2 ring-amber-300"
                        : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span className="text-3xl">{card.emoji}</span>
                    <span className="font-bold text-base flex-1">{card.text}</span>
                    <span className="text-xl font-bold">{isSelected ? "✓" : "➕"}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPhase("medal_coloring")}
              disabled={selectedStrengths.length < 3}
              className={`w-full py-4 rounded-2xl font-black text-xl shadow-lg transition-all cursor-pointer ${
                selectedStrengths.length === 3
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-102 active:scale-95"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
              }`}
            >
              الانتقال إلى تلوين وسام البطل 🏅 (اختر 3 بطاقات)
            </button>
          </motion.div>
        )}

        {/* Phase 2: Medal Coloring */}
        {phase === "medal_coloring" && (
          <motion.div
            key="phase2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full flex flex-col items-center space-y-6"
          >
            <div className="text-center space-y-2">
              <h3 className="text-3xl font-black text-slate-800">صمّم وسام الشجاعة والنجاح 🏅🎨</h3>
              <p className="text-lg text-slate-600 font-bold">
                اختر لوناً من اللوحة ثم اضغط على أجزاء الوسام لتلوينها:
              </p>
            </div>

            {/* Color Palette Selector */}
            <div className="flex items-center justify-center gap-3 bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-sm flex-wrap">
              {paletteColors.map((colorObj) => {
                const isSelected = activeColor === colorObj.hex;
                return (
                  <button
                    key={colorObj.hex}
                    onClick={() => setActiveColor(colorObj.hex)}
                    style={{ backgroundColor: colorObj.hex }}
                    className={`w-10 h-10 rounded-full border-4 transition-transform cursor-pointer ${
                      isSelected ? "scale-125 border-slate-900 shadow-md ring-2 ring-indigo-300" : "border-white hover:scale-110"
                    }`}
                    title={colorObj.name}
                  />
                );
              })}
            </div>

            {/* Interactive SVG Medal */}
            <div className="bg-slate-50 border-4 border-slate-200 p-8 rounded-3xl shadow-inner flex flex-col items-center justify-center">
              <svg width="220" height="260" viewBox="0 0 200 240" className="cursor-pointer drop-shadow-xl">
                {/* Left Ribbon */}
                <polygon
                  points="50,20 80,120 40,120"
                  fill={medalColors.ribbonLeft}
                  stroke="#1E293B"
                  strokeWidth="3"
                  onClick={() => setPartColor("ribbonLeft")}
                  className="hover:opacity-80 transition-opacity"
                />
                {/* Right Ribbon */}
                <polygon
                  points="150,20 120,120 160,120"
                  fill={medalColors.ribbonRight}
                  stroke="#1E293B"
                  strokeWidth="3"
                  onClick={() => setPartColor("ribbonRight")}
                  className="hover:opacity-80 transition-opacity"
                />
                {/* Outer Ring */}
                <circle
                  cx="100"
                  cy="150"
                  r="60"
                  fill={medalColors.outerRing}
                  stroke="#1E293B"
                  strokeWidth="4"
                  onClick={() => setPartColor("outerRing")}
                  className="hover:opacity-80 transition-opacity"
                />
                {/* Inner Circle */}
                <circle
                  cx="100"
                  cy="150"
                  r="42"
                  fill={medalColors.innerCircle}
                  stroke="#1E293B"
                  strokeWidth="3"
                  onClick={() => setPartColor("innerCircle")}
                  className="hover:opacity-80 transition-opacity"
                />
                {/* Center Star */}
                <path
                  d="M100,125 L106,140 L122,141 L109,152 L114,167 L100,157 L86,167 L91,152 L78,141 L94,140 Z"
                  fill={medalColors.starCenter}
                  stroke="#1E293B"
                  strokeWidth="2"
                  onClick={() => setPartColor("starCenter")}
                  className="hover:opacity-80 transition-opacity"
                />
              </svg>
            </div>

            <button
              onClick={() => {
                setPhase("celebration");
                setIsCompleted(true);
              }}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xl rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              استلام الوسام والاحتفال بالنجاح 🏆🎉
            </button>
          </motion.div>
        )}

        {/* Phase 3: Celebration */}
        {phase === "celebration" && (
          <motion.div
            key="phase3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full bg-white border-4 border-amber-300 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center space-y-6"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-8xl drop-shadow-xl"
            >
              🏆
            </motion.div>

            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-800">
                مبارك! لقد أكملت برنامج زيادة المناعة النفسية بنجاح! 🌟
              </h2>
              <p className="text-xl font-bold text-amber-700">
                أصبحت طفلاً شجاعاً وقادراً على إدارة انفعالاتك وحل مشكلاتك بذكاء.
              </p>
            </div>

            {/* Display Completed Medal SVG */}
            <div className="bg-amber-50 p-6 rounded-3xl border-2 border-amber-200 shadow-inner flex flex-col items-center">
              <span className="text-sm font-bold text-amber-800 mb-2">وسام التخرج الملون 🏅</span>
              <svg width="140" height="160" viewBox="0 0 200 240" className="drop-shadow-md">
                <polygon points="50,20 80,120 40,120" fill={medalColors.ribbonLeft} stroke="#1E293B" strokeWidth="3" />
                <polygon points="150,20 120,120 160,120" fill={medalColors.ribbonRight} stroke="#1E293B" strokeWidth="3" />
                <circle cx="100" cy="150" r="60" fill={medalColors.outerRing} stroke="#1E293B" strokeWidth="4" />
                <circle cx="100" cy="150" r="42" fill={medalColors.innerCircle} stroke="#1E293B" strokeWidth="3" />
                <path d="M100,125 L106,140 L122,141 L109,152 L114,167 L100,157 L86,167 L91,152 L78,141 L94,140 Z" fill={medalColors.starCenter} stroke="#1E293B" strokeWidth="2" />
              </svg>
            </div>
          </motion.div>
        )}
      </div>
    </SessionContainer>
  );
}
