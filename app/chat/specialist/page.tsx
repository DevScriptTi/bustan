"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArrowRight, Send, Loader2, Stethoscope, User, MessageSquare } from "lucide-react";
import { playSound } from "@/utils/playSound";

interface DirectChatMessage {
  id: string;
  senderId: string;
  senderRole: "parent" | "psychologist";
  senderName: string;
  text: string;
  createdAt: any;
}

function ParentSpecialistChatContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const childIdFromQuery = searchParams.get("childId");

  const [activeChildId, setActiveChildId] = useState<string>(childIdFromQuery || "");
  const [messages, setMessages] = useState<DirectChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const fetchChild = async () => {
      if (!activeChildId) {
        const cRef = collection(db, "children");
        const q = query(cRef, where("parentId", "==", user.uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setActiveChildId(snap.docs[0].id);
        }
      }
    };
    fetchChild();
  }, [user, activeChildId]);

  useEffect(() => {
    if (!activeChildId) return;

    setLoading(true);
    const messagesRef = collection(db, "direct_chats", activeChildId, "messages");
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
  }, [activeChildId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending || !user || !activeChildId) return;

    const textToSend = inputText.trim();
    setInputText("");
    setSending(true);
    playSound("pop");

    try {
      const messagesRef = collection(db, "direct_chats", activeChildId, "messages");
      await addDoc(messagesRef, {
        senderId: user.uid,
        senderRole: "parent",
        senderName: user.displayName || "فوزي جعفري",
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 dir-rtl flex flex-col h-[calc(100vh-6rem)] p-4 sm:p-6 font-sans" dir="rtl">
      
      {/* Header */}
      <div className="bg-white border border-slate-100 p-4 sm:p-5 rounded-3xl shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl border border-slate-200 transition-all flex items-center gap-1 text-xs font-bold"
          >
            <ArrowRight size={16} />
            <span>العودة للوحة التحكم</span>
          </Link>
          <div className="h-6 w-px bg-slate-200" />
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-teal-100 text-teal-700 rounded-2xl flex items-center justify-center font-bold text-lg">
              🩺
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-800">دردشة الأخصائي النفسي المعتمد</h1>
              <p className="text-[11px] text-slate-500 font-medium">تواصل مباشر واستشارات خاصة ومحمية</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 bg-slate-50/60 border border-slate-200/80 rounded-3xl p-4 sm:p-6 overflow-y-auto space-y-4 shadow-inner">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 size={28} className="animate-spin text-teal-600" />
            <span className="text-xs font-bold">جاري تحميل رسائل المحادثة...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 gap-3">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center text-3xl">
              💬
            </div>
            <h3 className="font-bold text-slate-700 text-base">لا توجد رسائل سابقة مع الأخصائي</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              يمكنك كتابة رسالة مباشرة للأخصائي النفسي المعتمد لطرح التساؤلات والحصول على الإرشادات.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderRole === "parent";

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold shadow-sm flex-shrink-0 ${
                    isMe ? "bg-teal-600 text-white" : "bg-indigo-600 text-white"
                  }`}
                >
                  {isMe ? <User size={16} /> : <Stethoscope size={16} />}
                </div>

                <div
                  className={`max-w-[75%] rounded-3xl p-4 text-xs sm:text-sm font-medium leading-relaxed shadow-sm ${
                    isMe
                      ? "bg-teal-600 text-white rounded-tr-none"
                      : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-[10px] font-black opacity-80 mb-1.5 border-b border-black/10 pb-1">
                    <span>{msg.senderName}</span>
                    <span>({isMe ? "ولي الأمر" : "أخصائي نفسي"})</span>
                  </div>
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span className="block text-[9px] opacity-60 mt-1.5 text-left dir-ltr">
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
        className="bg-white border border-slate-200 p-3 rounded-3xl shadow-sm flex items-center gap-3"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="اكتب استفسارك للأخصائي هنا..."
          className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-200 focus:border-teal-500 focus:outline-none rounded-2xl text-xs sm:text-sm font-bold text-slate-800"
        />

        <button
          type="submit"
          disabled={sending || !inputText.trim()}
          className="px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow transition-all active:scale-95 cursor-pointer flex items-center gap-2 disabled:opacity-50"
        >
          {sending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              <Send size={16} className="rotate-180" />
              <span>إرسال</span>
            </>
          )}
        </button>
      </form>

    </div>
  );
}

export default function ParentSpecialistChatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600 font-bold text-sm dir-rtl" dir="rtl">
          <Loader2 size={24} className="animate-spin text-teal-600 ml-2" />
          <span>جاري التحميل...</span>
        </div>
      }
    >
      <ParentSpecialistChatContent />
    </Suspense>
  );
}
