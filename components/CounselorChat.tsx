"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Sparkles, Loader2, Minimize2 } from "lucide-react";
import { playSound } from "@/utils/playSound";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: string;
}

interface CounselorChatProps {
  parentName?: string;
  childrenList?: Array<{
    name?: string;
    childName?: string;
    stars?: number;
    completedOddSessions?: number;
    oddCompleted?: number;
    completedMemorySessions?: number;
    memoryCompleted?: number;
  }>;
  childName?: string;
  completedOddSessions?: number;
  completedMemorySessions?: number;
  stars?: number;
}

export default function CounselorChat({
  parentName = "فوزي جعفري",
  childrenList = [],
  childName,
  completedOddSessions = 0,
  completedMemorySessions = 0,
  stars = 0,
}: CounselorChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      content: `أهلاً بك يا ${parentName}! أنا "د. بستان" المستشار التربوي والنفسي 🤖🌿. أنا هنا لمساعدتك في تقديم الاستشارات التربوية وتطبيق التمارين المنزلية لأبنائك. كيف يمكنني مساندتك اليوم؟`,
      timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const sendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    playSound("pop");
    setInputMessage("");

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const formattedChildren = childrenList && childrenList.length > 0
      ? childrenList.map((c) => ({
          name: c.name || c.childName || "طفل",
          stars: c.stars || 0,
          oddCompleted: c.oddCompleted ?? c.completedOddSessions ?? 0,
          memoryCompleted: c.memoryCompleted ?? c.completedMemorySessions ?? 0,
        }))
      : [
          {
            name: childName || "طفلك",
            stars: stars || 0,
            oddCompleted: completedOddSessions || 0,
            memoryCompleted: completedMemorySessions || 0,
          },
        ];

    const activeChildName = childName || formattedChildren[0]?.name || "طفلك";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages,
          parentName: parentName || "فوزي جعفري",
          activeChildName: activeChildName,
          childrenData: formattedChildren,
          childData: formattedChildren[0],
        }),
      });

      const data = await res.json();

      if (res.ok && data.reply) {
        playSound("sparkle");
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: data.reply,
          timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error("No reply");
      }
    } catch (err) {
      console.error("Chat error:", err);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "عذراً، حدث خطأ مؤقت في الاتصال بالمستشار. يرجى المحاولة بعد قليل.",
        timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickPrompts = [
    "كيف أتعامل مع عصبية طفلي؟",
    "كيف أحفزه على تمارين الذاكرة؟",
    "طريقة تمرين التنفس الصحيحة",
  ];

  return (
    <>
      {/* Floating Chat Launcher Button */}
      <div className="fixed bottom-6 left-6 z-40" dir="rtl">
        <button
          onClick={() => {
            playSound("pop");
            setIsOpen((prev) => !prev);
          }}
          className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white p-4 sm:px-5 sm:py-3.5 rounded-full shadow-2xl border-2 border-white flex items-center gap-2.5 transition-all duration-300 active:scale-95 cursor-pointer hover:scale-105"
        >
          <div className="relative">
            <Bot size={24} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-300 rounded-full border-2 border-teal-600 animate-ping"></span>
          </div>
          <span className="font-black text-sm hidden sm:inline">د. بستان - المستشار التربوي</span>
        </button>
      </div>

      {/* Floating Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 left-4 sm:left-6 z-50 w-[92vw] sm:w-[400px] h-[520px] max-h-[80vh] bg-white rounded-3xl shadow-2xl border-2 border-teal-100 flex flex-col overflow-hidden"
            dir="rtl"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-5 py-4 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30 text-white shadow-inner">
                  <Bot size={22} />
                </div>
                <div>
                  <h3 className="font-black text-base leading-tight">د. بستان - المستشار التربوي</h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-teal-100 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                    <span>مساعد ذكي متصل الآن</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <Minimize2 size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/60">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0 font-bold shadow-sm ${
                      msg.role === "user"
                        ? "bg-slate-700 text-white"
                        : "bg-teal-600 text-white"
                    }`}
                  >
                    {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                  </div>

                  <div
                    className={`max-w-[78%] p-3.5 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed shadow-sm ${
                      msg.role === "user"
                        ? "bg-teal-600 text-white rounded-tr-none"
                        : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-none"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <span
                      className={`block text-[10px] mt-1.5 font-bold ${
                        msg.role === "user" ? "text-teal-100 text-left" : "text-slate-400 text-right"
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2.5 text-slate-400 text-xs font-bold bg-white p-3 rounded-2xl border border-slate-100 max-w-[200px]">
                  <Loader2 size={16} className="animate-spin text-teal-600" />
                  <span>د. بستان يفكر الآن...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Bar */}
            {messages.length < 3 && !loading && (
              <div className="px-3 py-2 bg-slate-100/70 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px] font-bold text-slate-600">
                <Sparkles size={12} className="text-amber-500 flex-shrink-0" />
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(prompt)}
                    className="px-2.5 py-1 bg-white hover:bg-teal-50 hover:text-teal-700 rounded-lg border border-slate-200 flex-shrink-0 transition-colors cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="اكتب استشارتك هنا..."
                className="flex-1 px-4 py-3 text-xs sm:text-sm font-bold bg-slate-100 border border-slate-200 rounded-2xl focus:outline-none focus:border-teal-500 text-slate-800 transition-colors"
                disabled={loading}
              />

              <button
                onClick={() => sendMessage()}
                disabled={!inputMessage.trim() || loading}
                className={`p-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer ${
                  !inputMessage.trim() || loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Send size={18} className="rotate-180" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
