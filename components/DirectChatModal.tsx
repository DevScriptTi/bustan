"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, User, Stethoscope, Loader2, MessageSquare } from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { playSound } from "@/utils/playSound";

interface DirectChatMessage {
  id: string;
  senderId: string;
  senderRole: "parent" | "psychologist";
  senderName: string;
  text: string;
  createdAt: any;
}

interface DirectChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  childId: string;
  childName: string;
  currentUserId: string;
  currentUserRole: "parent" | "psychologist";
  currentUserName: string;
}

export default function DirectChatModal({
  isOpen,
  onClose,
  childId,
  childName,
  currentUserId,
  currentUserRole,
  currentUserName,
}: DirectChatModalProps) {
  const [messages, setMessages] = useState<DirectChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isOpen || !childId) return;

    setLoading(true);
    const messagesRef = collection(db, "direct_chats", childId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded: DirectChatMessage[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<DirectChatMessage, "id">),
        }));
        setMessages(loaded);
        setLoading(false);
      },
      (err) => {
        console.error("Direct chat fetch error:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isOpen, childId]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending || !childId) return;

    const textToSend = inputText.trim();
    setInputText("");
    setSending(true);
    playSound("pop");

    try {
      const messagesRef = collection(db, "direct_chats", childId, "messages");
      await addDoc(messagesRef, {
        senderId: currentUserId,
        senderRole: currentUserRole,
        senderName: currentUserName,
        text: textToSend,
        createdAt: serverTimestamp(),
      });
      playSound("sparkle");
    } catch (err) {
      console.error("Error sending direct message:", err);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  const isPsychologist = currentUserRole === "psychologist";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in dir-rtl" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`w-full max-w-lg h-[620px] max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden font-sans border ${
            isPsychologist
              ? "bg-slate-900 text-slate-100 border-slate-800"
              : "bg-white text-slate-800 border-slate-200"
          }`}
        >
          {/* Modal Header */}
          <div
            className={`p-4 px-5 flex items-center justify-between shadow-md ${
              isPsychologist
                ? "bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 text-white"
                : "bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-xl border border-white/30">
                {isPsychologist ? "💬" : "🩺"}
              </div>
              <div>
                <h3 className="font-black text-sm sm:text-base flex items-center gap-2">
                  <span>الدردشة المباشرة — {childName}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-white/20 text-white font-bold rounded-full border border-white/30">
                    مباشر ⚡
                  </span>
                </h3>
                <p className="text-[11px] text-white/80 font-medium">
                  {isPsychologist
                    ? "التواصل المباشر مع ولي أمر الطفل"
                    : "التواصل المباشر مع الأخصائي النفسي المعتمد"}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/90 hover:text-white cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Feed */}
          <div
            className={`flex-1 p-4 overflow-y-auto space-y-3.5 ${
              isPsychologist ? "bg-slate-950/60" : "bg-slate-50/60"
            }`}
          >
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 size={24} className="animate-spin text-indigo-500" />
                <span className="text-xs font-bold">جاري تحميل رسائل المحادثة المباشرة...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 gap-2">
                <div className="w-12 h-12 bg-slate-800/40 text-slate-500 rounded-full flex items-center justify-center text-2xl">
                  💬
                </div>
                <p className="font-bold text-sm text-slate-300">لا توجد رسائل سابقة في هذه المحادثة</p>
                <p className="text-xs text-slate-500 max-w-xs">
                  يمكنك بدء التواصل المباشر الآن وتبادل التوجيهات والاستفسارات.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === currentUserId;
                const isDoc = msg.senderRole === "psychologist";

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-2xl flex items-center justify-center text-xs font-bold shadow-sm flex-shrink-0 ${
                        isDoc
                          ? "bg-indigo-600 text-white"
                          : "bg-teal-600 text-white"
                      }`}
                    >
                      {isDoc ? <Stethoscope size={14} /> : <User size={14} />}
                    </div>

                    <div
                      className={`max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-sm font-medium leading-relaxed shadow-sm ${
                        isMe
                          ? isPsychologist
                            ? "bg-indigo-600 text-white rounded-tr-none"
                            : "bg-teal-600 text-white rounded-tr-none"
                          : isPsychologist
                          ? "bg-slate-850 text-slate-100 border border-slate-800 rounded-tl-none"
                          : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
                      }`}
                    >
                      <p className="text-[10px] font-black opacity-80 mb-1 flex items-center gap-1">
                        <span>{msg.senderName}</span>
                        <span>({isDoc ? "أخصائي نفسي" : "ولي الأمر"})</span>
                      </p>
                      <p className="whitespace-pre-line">{msg.text}</p>
                      <span className="block text-[9px] opacity-60 mt-1 text-left dir-ltr">
                        {msg.createdAt?.seconds
                          ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString("ar-EG", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "الآن"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Form */}
          <form
            onSubmit={handleSendMessage}
            className={`p-3.5 border-t flex items-center gap-2 ${
              isPsychologist ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            }`}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="اكتب رسالتك المباشرة هنا..."
              className={`flex-1 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold focus:outline-none transition-colors ${
                isPsychologist
                  ? "bg-slate-950 border border-slate-800 text-slate-100 focus:border-indigo-500"
                  : "bg-slate-50 border border-slate-200 text-slate-800 focus:border-teal-500"
              }`}
            />

            <button
              type="submit"
              disabled={sending || !inputText.trim()}
              className={`p-3 text-white rounded-2xl shadow transition-all cursor-pointer active:scale-95 disabled:opacity-50 ${
                isPsychologist
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-teal-600 hover:bg-teal-700"
              }`}
            >
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="rotate-180" />}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
