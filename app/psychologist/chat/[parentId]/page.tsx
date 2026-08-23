"use client";

import { useState, useEffect, useRef, use, Suspense } from "react";
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
  doc,
  getDoc,
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

function PsychologistParentChatContent({ parentId }: { parentId: string }) {
  const searchParams = useSearchParams();
  const childId = searchParams.get("childId") || parentId;

  const { user } = useAuth();
  const [messages, setMessages] = useState<DirectChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [parentName, setParentName] = useState("والد الطفل");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!parentId) return;

    const fetchParentInfo = async () => {
      try {
        const userSnap = await getDoc(doc(db, "users", parentId));
        if (userSnap.exists()) {
          const data = userSnap.data();
          setParentName(data.fullName || data.name || "والد الطفل");
        }
      } catch (err) {
        console.error("Error fetching parent info:", err);
      }
    };
    fetchParentInfo();

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
        console.error("Chat error:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [parentId, childId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending || !user) return;

    const textToSend = inputText.trim();
    setInputText("");
    setSending(true);
    playSound("pop");

    try {
      const messagesRef = collection(db, "direct_chats", childId, "messages");
      await addDoc(messagesRef, {
        senderId: user.uid,
        senderRole: "psychologist",
        senderName: user.displayName || "د. الأخصائي النفسي",
        text: textToSend,
        createdAt: serverTimestamp(),
      });
      playSound("sparkle");
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 dir-rtl flex flex-col h-[calc(100vh-7rem)]" dir="rtl">
      
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-3xl shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/psychologist/dashboard"
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl border border-slate-700 transition-all flex items-center gap-1 text-xs font-bold"
          >
            <ArrowRight size={16} />
            <span>العودة للوحة التحكم</span>
          </Link>
          <div className="h-6 w-px bg-slate-800" />
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-indigo-600/20 text-indigo-400 rounded-2xl flex items-center justify-center font-bold text-lg border border-indigo-500/30">
              💬
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-white">المحادثة المباشرة مع: {parentName}</h1>
              <p className="text-[11px] text-indigo-400 font-medium">قناة تواصل سريرية مشفرة ومباشرة</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Feed Container */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 overflow-y-auto space-y-4 shadow-xl">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 size={28} className="animate-spin text-indigo-500" />
            <span className="text-xs font-bold">جاري تحميل رسائل المحادثة المباشرة...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 gap-3">
            <div className="w-16 h-16 bg-slate-800/60 text-slate-500 rounded-3xl flex items-center justify-center text-3xl">
              ✉️
            </div>
            <h3 className="font-bold text-slate-200 text-base">لا توجد رسائل سابقة مع الولي</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              يمكنك كتابة أول رسالة سريرية للولي لبدء المتابعة وتوفير التوجيهات النفسية.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderRole === "psychologist";

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold shadow-sm flex-shrink-0 ${
                    isMe ? "bg-indigo-600 text-white" : "bg-teal-600 text-white"
                  }`}
                >
                  {isMe ? <Stethoscope size={16} /> : <User size={16} />}
                </div>

                <div
                  className={`max-w-[75%] rounded-3xl p-4 text-xs sm:text-sm font-medium leading-relaxed shadow-md ${
                    isMe
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-slate-950 text-slate-100 border border-slate-800 rounded-tl-none"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-[10px] font-black opacity-80 mb-1.5 border-b border-white/10 pb-1">
                    <span>{msg.senderName}</span>
                    <span>({isMe ? "أخصائي نفسي" : "ولي الأمر"})</span>
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

      {/* Message Input Bar */}
      <form
        onSubmit={handleSendMessage}
        className="bg-slate-900 border border-slate-800 p-3 rounded-3xl shadow-xl flex items-center gap-3"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="اكتب رسالتك السريرية للولي هنا..."
          className="flex-1 px-5 py-3.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-2xl text-xs sm:text-sm font-bold text-slate-100"
        />

        <button
          type="submit"
          disabled={sending || !inputText.trim()}
          className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2 disabled:opacity-50"
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

export default function PsychologistParentChatPage({
  params,
}: {
  params: Promise<{ parentId: string }>;
}) {
  const resolvedParams = use(params);
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400 font-bold text-sm dir-rtl" dir="rtl">
          <Loader2 size={24} className="animate-spin text-indigo-500 ml-2" />
          <span>جاري التحميل...</span>
        </div>
      }
    >
      <PsychologistParentChatContent parentId={resolvedParams.parentId} />
    </Suspense>
  );
}
