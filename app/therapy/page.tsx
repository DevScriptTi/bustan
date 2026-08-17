"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Card {
  id: number;
  icon: string;
  matched: boolean;
  flipped: boolean;
  type: string;
}

export default function TherapyHub() {
  const [childName, setChildName] = useState("أيها البطل");
  const [activeSession, setActiveSession] = useState<"hub" | "memory" | "odd">("hub");

  // Memory Game States
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [memorySuccess, setMemorySuccess] = useState(false);
  const [moves, setMoves] = useState(0);

  // ODD Adventure States
  const [oddStep, setOddStep] = useState(1);
  const [oddSelectedChoice, setOddSelectedChoice] = useState<number | null>(null);

  useEffect(() => {
    const selected = localStorage.getItem("selected_child");
    if (selected) {
      setTimeout(() => {
        setChildName(selected);
      }, 0);
    }
  }, []);

  // Initialize Memory Game
  const startMemoryGame = () => {
    setActiveSession("memory");
    setMemorySuccess(false);
    setMoves(0);
    setSelectedCards([]);
    
    const icons = ["🍎", "🚗", "🌟", "🎈"];
    const deck: Card[] = [...icons, ...icons]
      .map((icon, index) => ({
        id: index,
        icon,
        matched: false,
        flipped: false,
        type: icon,
      }))
      // Simple random shuffle
      .sort(() => Math.random() - 0.5);
    
    setCards(deck);
  };

  const handleCardClick = (id: number) => {
    if (selectedCards.length === 2 || cards[id].matched || cards[id].flipped) return;

    // Flip card
    const updatedCards = [...cards];
    updatedCards[id].flipped = true;
    setCards(updatedCards);

    const newSelected = [...selectedCards, id];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setMoves(prev => prev + 1);
      const [firstIdx, secondIdx] = newSelected;
      
      if (cards[firstIdx].type === cards[secondIdx].type) {
        // Matched
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[firstIdx].matched = true;
          matchedCards[secondIdx].matched = true;
          setCards(matchedCards);
          setSelectedCards([]);

          // Check if all matched
          if (matchedCards.every(c => c.matched)) {
            setMemorySuccess(true);
          }
        }, 500);
      } else {
        // No match - Flip back
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[firstIdx].flipped = false;
          resetCards[secondIdx].flipped = false;
          setCards(resetCards);
          setSelectedCards([]);
        }, 1000);
      }
    }
  };

  const startODDAdventure = () => {
    setActiveSession("odd");
    setOddStep(1);
    setOddSelectedChoice(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100/50 via-cream-50/50 to-mint-100/30 flex flex-col font-sans relative overflow-hidden">
      {/* Playful Floating Background Shapes */}
      <div className="absolute top-12 left-10 w-20 h-20 bg-sky-200/50 rounded-full blur-lg pointer-events-none" />
      <div className="absolute top-1/2 right-5 w-28 h-28 bg-peach-200/50 rounded-full blur-xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-32 h-32 bg-mint-200/50 rounded-full blur-lg pointer-events-none" />

      {/* Header / Navbar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-sky-100/30 py-4 px-6 sticky top-0 z-40 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 text-gray-500 hover:text-mint-600 rounded-xl hover:bg-slate-50 transition-colors"
            title="العودة للوحة التحكم"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Link>
          <span className="text-lg font-bold text-gray-800">منصة الطفل البطل</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-cream-100 border border-cream-200 text-cream-800 rounded-full text-sm font-extrabold flex items-center gap-2">
            <span>⭐</span>
            <span>250 نقطة</span>
          </div>
        </div>
      </header>

      {/* Therapy Session Switcher / Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 flex flex-col justify-center relative z-10">
        
        {/* VIEW 1: Main Therapy Hub */}
        {activeSession === "hub" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Welcome message */}
            <div className="text-center space-y-3">
              <span className="inline-block text-4xl animate-bounce">🎈</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">
                مرحباً بك يا بطل، <span className="text-sky-600">{childName}</span>!
              </h1>
              <p className="text-gray-600 text-base max-w-md mx-auto font-medium">
                اختر البوابة التي ترغب في دخولها اليوم واللعب مع أصدقائنا الطيبين!
              </p>
            </div>

            {/* Hub Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              
              {/* Memory Training Path */}
              <div className="bg-white border-2 border-sky-100 rounded-3xl p-6 shadow-md hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-sky-100 text-sky-500 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                    🧠
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-extrabold text-sky-800">ألعاب الذاكرة الخارقة</h2>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">
                      ساعد أصدقاءنا في تذكر الأشكال والترتيب لتحصل على قوى الذاكرة البصرية الخارقة وتجمع النجوم اللامعة!
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={startMemoryGame}
                    className="w-full py-4 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-extrabold rounded-2xl text-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <span>دخول عالم الذاكرة</span>
                    <span>✨</span>
                  </button>
                </div>
              </div>

              {/* Behavior ODD Path */}
              <div className="bg-white border-2 border-mint-100 rounded-3xl p-6 shadow-md hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-mint-100 text-mint-500 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                    🛡️
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-extrabold text-mint-800">مغامرات السلوك الذكي</h2>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">
                      ادخل في تحديات سلوكية ممتعة وقصص تفاعلية لتتعلم كيف تكون هادئاً، متعاوناً، وتتخطى العقبات بحكمة البطل!
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={startODDAdventure}
                    className="w-full py-4 bg-mint-500 hover:bg-mint-600 active:bg-mint-700 text-white font-extrabold rounded-2xl text-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <span>بدء مغامرة السلوك</span>
                    <span>🚀</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VIEW 2: Memory Training Game */}
        {activeSession === "memory" && (
          <div className="bg-white border-2 border-sky-100 rounded-3xl p-6 sm:p-8 shadow-xl max-w-md mx-auto w-full animate-zoomIn space-y-6">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
              <div>
                <h2 className="text-xl font-bold text-sky-800">تطابق الذاكرة السريعة</h2>
                <p className="text-xs text-gray-400">اعثر على جميع الأزواج المتطابقة</p>
              </div>
              <button
                onClick={() => setActiveSession("hub")}
                className="px-3.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-500 font-bold rounded-xl text-xs transition-colors"
              >
                خروج
              </button>
            </div>

            {memorySuccess ? (
              <div className="text-center py-8 space-y-4 animate-bounce">
                <span className="text-6xl">🏆</span>
                <h3 className="text-2xl font-extrabold text-mint-600">عمل رائع يا بطل!</h3>
                <p className="text-sm text-gray-500">أنهيت اللعبة في {moves} محاولات وحصلت على +50 نقطة!</p>
                <div className="flex gap-4 justify-center pt-4">
                  <button
                    onClick={startMemoryGame}
                    className="px-6 py-3 bg-sky-500 text-white font-bold rounded-xl text-sm shadow-md"
                  >
                    العب مرة أخرى
                  </button>
                  <button
                    onClick={() => setActiveSession("hub")}
                    className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl text-sm"
                  >
                    العودة للرئيسية
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between text-sm font-bold text-gray-600 px-1">
                  <span>المحاولات: {moves}</span>
                  <span className="text-sky-600">البطل: {childName}</span>
                </div>

                {/* Match Cards Grid */}
                <div className="grid grid-cols-4 gap-3 py-2">
                  {cards.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => handleCardClick(card.id)}
                      className={`h-24 sm:h-28 rounded-2xl text-3xl flex items-center justify-center font-bold border transition-all duration-300 transform active:scale-95 shadow-sm ${
                        card.flipped || card.matched
                          ? "bg-sky-50 border-sky-300 text-sky-600 rotate-0 scale-100"
                          : "bg-gradient-to-tr from-sky-400 to-sky-300 border-sky-400 text-white hover:brightness-105"
                      }`}
                      disabled={card.matched || card.flipped}
                    >
                      {card.flipped || card.matched ? card.icon : "?"}
                    </button>
                  ))}
                </div>
                
                <p className="text-center text-xs text-gray-400">انقر فوق المربعات للكشف عن الفاكهة أو السيارات المخفية وتطابقها!</p>
              </>
            )}
          </div>
        )}

        {/* VIEW 3: ODD Behavior Interactive Adventure */}
        {activeSession === "odd" && (
          <div className="bg-white border-2 border-mint-100 rounded-3xl p-6 sm:p-8 shadow-xl max-w-lg mx-auto w-full animate-zoomIn space-y-6">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
              <div>
                <h2 className="text-xl font-bold text-mint-800">مغامرة السلوك الطيب</h2>
                <p className="text-xs text-gray-400">مساعدة أصدقائنا في اتخاذ القرار السليم</p>
              </div>
              <button
                onClick={() => setActiveSession("hub")}
                className="px-3.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-500 font-bold rounded-xl text-xs transition-colors"
              >
                خروج
              </button>
            </div>

            {/* Step 1: Scenario Presentation */}
            {oddStep === 1 && (
              <div className="space-y-6">
                <div className="bg-mint-50/50 border border-mint-100 rounded-2xl p-5 text-center space-y-3">
                  <span className="text-5xl">🦊</span>
                  <h3 className="text-lg font-bold text-gray-800">قصة فوفو الثعلب الصغير</h3>
                  <p className="text-sm text-gray-600 leading-relaxed font-medium">
                    كان فوفو يلعب بلعبة القطار الكهربائي، وجاء صديقه بندق السنجاب وطلب منه أن يتشارك اللعب معه بالقطار. فوفو لا يزال يريد اللعب بمفرده ويشعر بالغضب. ماذا يجب عليه أن يفعل؟
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      id: 1,
                      text: "😊 يطلب من بندق أن ينتظر 5 دقائق حتى ينهي دوره، ثم يلعبان معاً.",
                      isCorrect: true,
                    },
                    {
                      id: 2,
                      text: "😠 يصرخ بصوت عالٍ ويرفض مشاركة اللعبة ويرمي بندق بالقطار.",
                      isCorrect: false,
                    },
                  ].map((choice) => (
                    <button
                      key={choice.id}
                      onClick={() => setOddSelectedChoice(choice.id)}
                      className={`w-full p-4 text-right rounded-2xl border text-sm sm:text-base transition-all duration-200 ${
                        oddSelectedChoice === choice.id
                          ? "border-mint-400 bg-mint-50/40 font-bold text-mint-900 shadow-sm"
                          : "border-gray-100 hover:border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      {choice.text}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setOddStep(2)}
                  disabled={oddSelectedChoice === null}
                  className="w-full py-4 bg-mint-500 hover:bg-mint-600 active:bg-mint-700 text-white font-extrabold rounded-2xl shadow-md disabled:opacity-50 transition-colors"
                >
                  تأكيد اختياري
                </button>
              </div>
            )}

            {/* Step 2: Feedback Presentation */}
            {oddStep === 2 && (
              <div className="text-center py-6 space-y-6">
                {oddSelectedChoice === 1 ? (
                  <div className="space-y-4 animate-bounce">
                    <span className="text-6xl">🌟🎉</span>
                    <h3 className="text-2xl font-extrabold text-mint-600">اختيار ذكي ورائع!</h3>
                    <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
                      عندما تحدث فوفو بهدوء وطلب من بندق الانتظار، شعر بندق بالسعادة ووافق على الانتظار. لعب الاثنان بسلام دون خلاف! لقد كسبت +50 نقطة سلوك!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <span className="text-6xl">😔</span>
                    <h3 className="text-2xl font-extrabold text-red-500">حاول مرة أخرى يا بطل!</h3>
                    <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
                      إذا صرخ فوفو ورمى اللعبة، سيحزن بندق ويغضب الوالدان، وتنتهي اللعبة بالبكاء. دعنا نساعد فوفو ليقوم بالخيار الهادئ والذكي!
                    </p>
                  </div>
                )}

                <div className="flex gap-4 justify-center pt-2">
                  <button
                    onClick={startODDAdventure}
                    className="px-6 py-3 bg-mint-500 text-white font-bold rounded-xl text-sm shadow-md"
                  >
                    إعادة المحاولة
                  </button>
                  <button
                    onClick={() => setActiveSession("hub")}
                    className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl text-sm"
                  >
                    العودة للرئيسية
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-gray-400 border-t border-sky-100/10 bg-white/40">
        منصة بستان للأطفال - تطور هادئ، مستقبل ذكي 💚
      </footer>
    </div>
  );
}
