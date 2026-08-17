"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playSound } from "@/utils/playSound";
import { X, Star, Sparkles, Award } from "lucide-react";

interface OddStarBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OddStarBoardModal({ isOpen, onClose }: OddStarBoardModalProps) {
  const [stars, setStars] = useState<Record<string, number>>({});
  const [activeMonth, setActiveMonth] = useState(0);
  const [feedback, setFeedback] = useState("");

  if (!isOpen) return null;

  const addStar = (weekIndex: number) => {
    playSound("pop");
    const key = `${activeMonth}_${weekIndex}`;
    const currentStars = stars[key] || 0;
    if (currentStars < 7) {
      const nextStars = currentStars + 1;
      setStars((prev) => ({ ...prev, [key]: nextStars }));

      if (nextStars === 7) {
        playSound("sparkle");
      }

      const phrases = ["أحسنت! 👏", "أنت بطل! 🏆", "رائع اليوم! ⭐", "طفل محبوب! ❤️"];
      setFeedback(phrases[Math.floor(Math.random() * phrases.length)]);
      setTimeout(() => setFeedback(""), 2000);
    }
  };

  const resetBoard = () => {
    playSound("pop");
    setStars({});
    setActiveMonth(0);
    setFeedback("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative shadow-2xl border-2 border-indigo-100 space-y-6 animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={() => {
            playSound("pop");
            onClose();
          }}
          className="absolute top-5 left-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer z-10"
        >
          <X size={24} />
        </button>

        {/* Floating Feedback Toast */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-amber-400 text-slate-900 font-black text-xl py-2.5 px-6 rounded-full shadow-2xl border-4 border-white flex items-center gap-2"
            >
              <span>{feedback}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Header */}
        <div className="text-center space-y-2 pt-2">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-black border border-amber-200 shadow-sm">
            <Sparkles size={14} />
            أداة تتبع ومكافأة السلوك المستمر
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
            جدول التعزيز الإيجابي للأم 🌟
          </h2>
          <p className="text-slate-600 font-medium text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            اختر الشهر، ثم اضغط على زر إضافة نجمة عند التزام الطفل بالسلوك الجيد في كل أسبوع!
          </p>
        </div>

        {/* Months Navigation Grid */}
        <div className="bg-indigo-50/60 p-4 sm:p-5 rounded-3xl border-2 border-indigo-100 space-y-3">
          <div className="text-center font-bold text-indigo-900 text-sm">
            الأشهر (اختر الشهر للتحكم بالجدول):
          </div>
          <div className="flex items-center justify-center flex-wrap gap-2">
            {Array.from({ length: 10 }).map((_, idx) => {
              const isActive = activeMonth === idx;
              const monthHasStars = [0, 1, 2, 3].some((w) => (stars[`${idx}_${w}`] || 0) > 0);

              return (
                <button
                  key={idx}
                  onClick={() => {
                    playSound("pop");
                    setActiveMonth(idx);
                  }}
                  className={`px-3.5 py-2 rounded-2xl font-black text-xs sm:text-sm border-2 transition-all duration-200 cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                    isActive
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-md scale-105"
                      : "bg-white border-indigo-200 text-indigo-800 hover:bg-indigo-100/70"
                  }`}
                >
                  <span>الشهر {idx + 1}</span>
                  {monthHasStars && <span className="text-xs">⭐</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Month Banner */}
        <div className="flex items-center justify-between bg-amber-50 border-2 border-amber-200 px-5 py-3 rounded-2xl text-amber-900 font-bold text-sm">
          <div className="flex items-center gap-2">
            <span>📅</span>
            <span>
              عرض جدول: <strong className="text-amber-800 font-black">الشهر {activeMonth + 1}</strong>
            </span>
          </div>
          <button
            onClick={resetBoard}
            className="text-xs text-amber-700 underline font-bold hover:text-amber-900 cursor-pointer"
          >
            إعادة تعيين النجوم 🔄
          </button>
        </div>

        {/* 4 Weeks Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((weekIdx) => {
            const starCount = stars[`${activeMonth}_${weekIdx}`] || 0;
            const isFull = starCount >= 7;
            const rewardIcon = weekIdx % 2 === 0 ? "🏅" : "⚽";

            return (
              <div
                key={weekIdx}
                className="bg-white border-2 border-slate-200 rounded-3xl p-4 flex flex-col items-center justify-between space-y-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              >
                {/* Column Header */}
                <div className="text-center w-full pb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-800 text-base block">الأسبوع {weekIdx + 1}</span>
                  <span className="text-xs text-slate-400 font-semibold">{starCount} / 7 نجوم</span>
                </div>

                {/* Reward Badge */}
                <div className="h-14 flex items-center justify-center w-full">
                  {isFull ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="flex flex-col items-center justify-center bg-amber-100 border border-amber-300 rounded-2xl p-1.5 w-full shadow-sm"
                    >
                      <span className="text-3xl drop-shadow-sm">{rewardIcon}</span>
                      <span className="text-[11px] font-black text-amber-800">مكافأة مكتملة! 🎉</span>
                    </motion.div>
                  ) : (
                    <div className="text-[11px] text-slate-400 font-bold border border-dashed border-slate-200 rounded-xl px-2 py-1.5 w-full text-center">
                      مكافأة ({rewardIcon}) عند 7 نجوم
                    </div>
                  )}
                </div>

                {/* Vertical Star Track (7 slots) */}
                <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2 flex flex-col-reverse gap-1.5 items-center min-h-[240px] justify-start shadow-inner">
                  {Array.from({ length: 7 }).map((_, slotIdx) => {
                    const hasStar = slotIdx < starCount;

                    return (
                      <div
                        key={slotIdx}
                        className={`w-full h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          hasStar
                            ? "bg-amber-300 border border-amber-400 shadow-sm"
                            : "bg-white/70 border border-slate-200/80"
                        }`}
                      >
                        {hasStar ? (
                          <motion.span
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="text-xl drop-shadow-sm"
                          >
                            ⭐
                          </motion.span>
                        ) : (
                          <span className="text-slate-300 text-[11px] font-bold">{slotIdx + 1}</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Add Star Button */}
                <button
                  onClick={() => addStar(weekIdx)}
                  disabled={isFull}
                  className={`w-full py-2.5 px-3 rounded-2xl font-black text-sm flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-95 shadow-md ${
                    isFull
                      ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
                      : "bg-amber-400 hover:bg-amber-500 text-slate-900 border border-amber-500"
                  }`}
                >
                  <span>➕</span>
                  <span>إضافة نجمة</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="pt-2 text-center">
          <button
            onClick={() => {
              playSound("pop");
              onClose();
            }}
            className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl border border-slate-200 transition-all cursor-pointer"
          >
            إغلاق الجدول
          </button>
        </div>

      </div>
    </div>
  );
}
