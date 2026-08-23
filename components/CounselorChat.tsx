"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Sparkles, Loader2, Minimize2, Maximize2, CheckCircle2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { playSound } from "@/utils/playSound";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: string;
}

interface CounselorChatProps {
  parentName?: string;
  childrenList?: Array<{
    id?: string;
    name?: string;
    childName?: string;
    stars?: number;
    completedOddSessions?: number;
    oddCompleted?: number;
    completedMemorySessions?: number;
    memoryCompleted?: number;
    behavioralNotes?: any[];
  }>;
  childId?: string;
  childName?: string;
  completedOddSessions?: number;
  completedMemorySessions?: number;
  stars?: number;
}

export default function CounselorChat({
  parentName = "فوزي جعفري",
  childrenList = [],
  childId,
  childName,
  completedOddSessions = 0,
  completedMemorySessions = 0,
  stars = 0,
}: CounselorChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryToast, setSummaryToast] = useState<string | null>(null);

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

  /* ── Load Historical Chat Messages from Firestore ── */
  useEffect(() => {
    const activeTargetName = childName || (childrenList && childrenList[0]?.name) || "طفلك";
    const q = query(
      collection(db, "chat_history"),
      where("targetChildName", "==", activeTargetName),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: Message[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              role: data.role,
              content: data.content,
              timestamp: data.timestamp || new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
            };
          });

          const welcomeMsg: Message = {
            id: "welcome",
            role: "ai",
            content: `أهلاً بك يا ${parentName}! أنا "د. بستان" المستشار التربوي والنفسي 🤖🌿. أنا هنا لمساعدتك في تقديم الاستشارات التربوية وتطبيق التمارين المنزلية لأبنائك. كيف يمكنني مساندتك اليوم؟`,
            timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
          };

          setMessages([welcomeMsg, ...loaded]);
        }
      },
      (err) => {
        console.warn("Firestore chat history load warning:", err);
      }
    );

    return () => unsubscribe();
  }, [childName, childrenList, parentName]);

  /* ── Handle End Chat & Session Summarization ── */
  const handleEndChat = async () => {
    if (isSummarizing || messages.length <= 1) return;

    playSound("pop");
    setIsSummarizing(true);
    setSummaryToast(null);

    const activeTargetName = childName || (childrenList && childrenList[0]?.name) || "طفلك";
    const activeTargetId = childId || (childrenList && childrenList[0]?.id);

    const chatSession = messages.filter((m) => m.id !== "welcome");

    try {
      const res = await fetch("/api/summarize-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId: activeTargetId,
          childName: activeTargetName,
          messages: chatSession.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        playSound("cheer");

        // Clear active chat screen and show completion note
        const resetWelcomeMsg: Message = {
          id: "welcome-" + Date.now(),
          role: "ai",
          content: `تم إنهاء الجلسة وحفظ التطورات السلوكية بنجاح. ✨\n\nأنا جاهز دائماً لبدء جلسة جديدة لمتابعة أبنائك!`,
          timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
        };

        setMessages([resetWelcomeMsg]);
        setSummaryToast("تم إنهاء الجلسة وحفظ التطورات السلوكية بنجاح. ✨");

        setTimeout(() => {
          setSummaryToast(null);
        }, 5000);
      } else {
        throw new Error("Summarization failed");
      }
    } catch (err) {
      console.error("Error ending chat session:", err);
      setSummaryToast("حدث خطأ أثناء حفظ ملخص الجلسة.");
      setTimeout(() => setSummaryToast(null), 4000);
    } finally {
      setIsSummarizing(false);
    }
  };

  const sendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading || isSummarizing) return;

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
          behavioralNotes: c.behavioralNotes || [],
        }))
      : [
          {
            name: childName || "طفلك",
            stars: stars || 0,
            oddCompleted: completedOddSessions || 0,
            memoryCompleted: completedMemorySessions || 0,
            behavioralNotes: [],
          },
        ];

    const activeChildName = childName || formattedChildren[0]?.name || "طفلك";

    // 1. Save User Message to Firestore
    try {
      addDoc(collection(db, "chat_history"), {
        role: "user",
        content: text,
        targetChildName: activeChildName,
        parentName: parentName || "فوزي جعفري",
        timestamp: userMsg.timestamp,
        createdAt: serverTimestamp(),
      });
    } catch (userDbErr) {
      console.error("Error saving user message to Firestore:", userDbErr);
    }

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

        // 2. Save AI Response Message to Firestore
        try {
          addDoc(collection(db, "chat_history"), {
            role: "ai",
            content: data.reply,
            targetChildName: activeChildName,
            parentName: parentName || "فوزي جعفري",
            timestamp: aiMsg.timestamp,
            createdAt: serverTimestamp(),
          });
        } catch (aiDbErr) {
          console.error("Error saving AI message to Firestore:", aiDbErr);
        }
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

  const quickPrompts = [
    "كيف حال أبنائي وحالة تقدمهم في المنصة؟ 📊",
    "كيف أساعد أطفالي لتجاوز الصدمات النفسية؟ ❤️",
    "كيف أتعامل مع العناد والعصبية؟ ⚡",
    "كيف أحفز طفلي باستخدام النجوم؟ ⭐",
  ];

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <div className="fixed bottom-6 left-6 z-40 dir-rtl" dir="rtl">
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { playSound("pop"); setIsOpen(true); }}
            className="flex items-center gap-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white p-4 sm:px-6 sm:py-4 rounded-full shadow-2xl cursor-pointer border-2 border-white/20 group"
          >
            <div className="relative">
              <Bot size={26} className="transform group-hover:rotate-12 transition-transform" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full" />
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs text-teal-100 font-bold">المستشار التربوي</p>
              <p className="text-sm font-black">د. بستان 🤖</p>
            </div>
          </motion.button>
        )}
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className={`fixed inset-0 z-[100] w-full h-full rounded-none border-none flex flex-col overflow-hidden font-sans bg-white shadow-2xl transition-all duration-300 ${
              isFullscreen
                ? "sm:inset-0 sm:w-full sm:h-full sm:max-h-full sm:rounded-none sm:border-none"
                : "sm:inset-auto sm:bottom-6 sm:left-6 sm:w-[420px] sm:h-[600px] sm:max-h-[85vh] sm:rounded-3xl sm:border sm:border-slate-200"
            }`}
            dir="rtl"
          >
            {/* Window Header */}
            <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 text-white p-3.5 px-4 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-lg border border-white/30">
                  🤖
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base flex items-center gap-1.5">
                    د. بستان
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-400 text-emerald-950 font-black rounded-full">متصل</span>
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-teal-100 font-bold">المستشار النفسي الذكي</p>
                </div>
              </div>

              {/* Action Buttons in Header */}
              <div className="flex items-center gap-1 sm:gap-1.5">
                <button
                  type="button"
                  onClick={handleEndChat}
                  disabled={isSummarizing || messages.length <= 1}
                  className="px-2.5 py-1.5 bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1 active:scale-95"
                  title="إنهاء الجلسة وحفظ التطورات السلوكية"
                >
                  {isSummarizing ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      <span>جاري التحليل...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={12} />
                      <span>إنهاء الدردشة</span>
                    </>
                  )}
                </button>

                {/* Expand / Minimize Fullscreen Toggle Button */}
                <button
                  type="button"
                  onClick={() => { playSound("pop"); setIsFullscreen((prev) => !prev); }}
                  className="p-1.5 hover:bg-white/10 rounded-xl transition-colors text-teal-100 hover:text-white cursor-pointer hidden sm:flex items-center justify-center"
                  title={isFullscreen ? "تصغير النافذة" : "تكبير النافذة"}
                >
                  {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-xl transition-colors text-teal-100 hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Post-Execution Notification Toast Banner */}
            {summaryToast && (
              <div className="p-3 bg-emerald-50 text-emerald-800 font-black text-xs rounded-2xl border border-emerald-200 text-center animate-in zoom-in shadow-sm m-2 flex items-center justify-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>{summaryToast}</span>
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-2xl flex items-center justify-center text-sm shadow-sm flex-shrink-0 ${
                      msg.role === "user"
                        ? "bg-amber-500 text-white"
                        : "bg-teal-600 text-white"
                    }`}
                  >
                    {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                  </div>

                  <div
                    className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm font-medium leading-relaxed shadow-sm ${
                      msg.role === "user"
                        ? "bg-teal-600 text-white rounded-tr-none"
                        : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <div className="whitespace-pre-line">{msg.content}</div>
                    ) : (
                      <div className="text-xs sm:text-sm md:text-base leading-relaxed text-slate-700">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            // Style Bold (**)
                            strong: ({ node, ...props }) => (
                              <strong className="text-teal-700 font-bold" {...props} />
                            ),
                            // Style Blockquotes (>)
                            blockquote: ({ node, ...props }) => (
                              <blockquote className="border-r-4 border-l-0 border-amber-400 bg-amber-50 text-slate-800 py-2 px-4 rounded-l-lg my-3 not-italic" {...props} />
                            ),
                            // Style Paragraphs
                            p: ({ node, ...props }) => (
                              <p className="mb-2 last:mb-0" {...props} />
                            ),
                            // Style Unordered Lists (-)
                            ul: ({ node, ...props }) => (
                              <ul className="list-disc list-inside my-2 space-y-1" {...props} />
                            ),
                            // Style Ordered Lists (1.)
                            ol: ({ node, ...props }) => (
                              <ol className="list-decimal list-inside my-2 space-y-1" {...props} />
                            ),
                            // Style List Items
                            li: ({ node, ...props }) => (
                              <li className="marker:text-teal-500 font-medium" {...props} />
                            ),
                            // Style Headings (#, ##, ###)
                            h1: ({ node, ...props }) => (
                              <h1 className="text-teal-900 font-black text-lg sm:text-xl mt-3 mb-1.5" {...props} />
                            ),
                            h2: ({ node, ...props }) => (
                              <h2 className="text-teal-850 font-black text-base sm:text-lg mt-3 mb-1.5" {...props} />
                            ),
                            h3: ({ node, ...props }) => (
                              <h3 className="text-teal-800 font-bold text-sm sm:text-base mt-3 mb-1.5" {...props} />
                            ),
                            // Style Emphasis (*)
                            em: ({ node, ...props }) => (
                              <em className="bg-amber-100 text-amber-800 not-italic px-1 rounded-md font-semibold" {...props} />
                            ),
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                    <span
                      className={`block text-[10px] mt-1.5 font-bold ${
                        msg.role === "user" ? "text-teal-200 text-left" : "text-slate-400 text-right"
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-teal-700 bg-white p-3 px-4 rounded-2xl border border-teal-100 shadow-sm w-fit text-xs font-bold animate-pulse">
                  <Loader2 size={16} className="animate-spin text-teal-600" />
                  <span>د. بستان يفكر ويحلل البيانات...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length <= 2 && !loading && !isSummarizing && (
              <div className="p-3 bg-slate-100/70 border-t border-slate-200 flex gap-2 overflow-x-auto no-scrollbar">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(prompt)}
                    className="px-3 py-1.5 bg-white hover:bg-teal-50 text-teal-900 border border-slate-200 hover:border-teal-300 rounded-full text-xs font-bold whitespace-nowrap transition-colors shadow-sm flex-shrink-0 cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="اكتب استفسارك التربوي هنا..."
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 focus:border-teal-500 focus:outline-none rounded-2xl text-xs sm:text-sm font-bold text-slate-800"
              />
              <button
                type="submit"
                disabled={loading || isSummarizing || !inputMessage.trim()}
                className={`p-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl shadow transition-all active:scale-95 cursor-pointer ${
                  loading || isSummarizing || !inputMessage.trim() ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Send size={18} className="rotate-180" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
