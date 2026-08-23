"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { playSound } from "@/utils/playSound";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import {
  UserPlus,
  BarChart2,
  Clock,
  Brain,
  Star,
  HeartHandshake,
  ClipboardCheck,
  PlayCircle,
  Activity,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  X,
  Loader2,
  RotateCcw,
  Sparkles,
  Stethoscope,
  Search,
} from "lucide-react";

export interface ChildActivity {
  id: string;
  type: "memory" | "odd" | "star";
  title: string;
  timestamp: string;
}

export interface Child {
  id: string;
  parentId: string;
  name: string;
  stars: number;
  memoryEvalDone: boolean;
  needsMemoryTherapy: boolean;
  oddEvalDone: boolean;
  needsOddTherapy: boolean;
  completedMemorySessions?: number;
  totalMemorySessions?: number;
  completedOddSessions?: number;
  totalOddSessions?: number;
  behavioralNotes?: Array<{ date?: string; note?: string; text?: string; author?: string }>;
  reviewStatus?: "none" | "pending" | "accepted" | "rejected";
  assignedPsychologistId?: string;
  pendingReviewWith?: string;
  pendingReviewWithName?: string;
  psychologistDirectives?: string;
  activities?: ChildActivity[];
  createdAt?: any;
}

const recentActivities = [
  { icon: "🧠", label: "تم إنهاء جلسة الذاكرة رقم 3", time: "منذ يومين", color: "bg-teal-50 border-teal-100" },
  { icon: "🌋", label: "تمرين تهدئة البركان", time: "منذ 4 أيام", color: "bg-indigo-50 border-indigo-100" },
  { icon: "⭐", label: "تم إضافة 5 نجوم في لوحة المكافآت", time: "منذ أسبوع", color: "bg-amber-50 border-amber-100" },
];

import OddStarBoardModal from "@/components/OddStarBoardModal";
import CounselorChat from "@/components/CounselorChat";
import DirectChatModal from "@/components/DirectChatModal";

export default function DashboardHome() {
  const { user } = useAuth();

  const [children, setChildren] = useState<Child[]>([]);
  const [activeChild, setActiveChild] = useState<Child | null>(null);
  const [loadingChildren, setLoadingChildren] = useState(true);

  // Add Child & Star Board Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isStarBoardModalOpen, setIsStarBoardModalOpen] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [newChildBehavioralNote, setNewChildBehavioralNote] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState("");

  /* ── 1. Fetch Children from Firestore ── */
  useEffect(() => {
    if (!user) {
      setChildren([]);
      setActiveChild(null);
      setLoadingChildren(false);
      return;
    }

    setLoadingChildren(true);
    const q = query(
      collection(db, "children"),
      where("parentId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched: Child[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Child, "id">),
        }));

        // Client-side sort by createdAt descending
        fetched.sort((a, b) => {
          const ta = a.createdAt?.seconds || 0;
          const tb = b.createdAt?.seconds || 0;
          return tb - ta;
        });

        setChildren(fetched);
        setLoadingChildren(false);
      },
      (err) => {
        console.error("Error fetching children:", err);
        setLoadingChildren(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  /* ── 2. Keep activeChild synced ── */
  useEffect(() => {
    if (children.length > 0) {
      setActiveChild((prev) => {
        if (!prev) return children[0];
        const match = children.find((c) => c.id === prev.id);
        return match || children[0];
      });
    } else {
      setActiveChild(null);
    }
  }, [children]);

  /* ── 3. Handle Add Child Submission ── */
  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildName.trim() || !newChildBehavioralNote.trim() || !user) return;

    setIsAdding(true);
    setAddError("");

    try {
      const initialNotes = [
        {
          date: new Date().toISOString(),
          note: newChildBehavioralNote.trim(),
        },
      ];

      await addDoc(collection(db, "children"), {
        parentId: user.uid,
        name: newChildName.trim(),
        behavioralNotes: initialNotes,
        stars: 0,
        memoryEvalDone: false,
        needsMemoryTherapy: false,
        oddEvalDone: false,
        needsOddTherapy: false,
        createdAt: serverTimestamp(),
      });

      setNewChildName("");
      setNewChildBehavioralNote("");
      setIsAddModalOpen(false);
    } catch (err: any) {
      console.error("Error adding child:", err);
      setAddError("حدث خطأ أثناء إضافة الطفل، يرجى المحاولة لاحقاً.");
    } finally {
      setIsAdding(false);
    }
  };

  /* ── 4. Handle Update Child State Submission ── */
  const [isUpdateStateModalOpen, setIsUpdateStateModalOpen] = useState(false);
  const [newUpdateNote, setNewUpdateNote] = useState("");
  const [isSavingUpdate, setIsSavingUpdate] = useState(false);

  const handleUpdateChildState = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChild || !newUpdateNote.trim()) return;

    setIsSavingUpdate(true);
    try {
      const res = await fetch("/api/update-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId: activeChild.id,
          childName: activeChild.name,
          rawText: newUpdateNote.trim(),
          parentName: user?.displayName || "فوزي جعفري",
        }),
      });

      if (!res.ok) {
        // Fallback client update if endpoint unavailable
        const newEntry = {
          date: new Date().toISOString(),
          note: newUpdateNote.trim(),
          author: "parent",
        };
        const childRef = doc(db, "children", activeChild.id);
        await updateDoc(childRef, {
          behavioralNotes: arrayUnion(newEntry),
        });
      }

      setNewUpdateNote("");
      setIsUpdateStateModalOpen(false);
    } catch (err) {
      console.error("Error updating child state:", err);
    } finally {
      setIsSavingUpdate(false);
    }
  };

  /* ── 5. Handle Request Specialist Review & Doctor Selection ── */
  interface DoctorUser {
    uid: string;
    fullName?: string;
    username?: string;
    phoneNumber?: string;
  }

  const [isSelectDoctorModalOpen, setIsSelectDoctorModalOpen] = useState(false);
  const [doctorsList, setDoctorsList] = useState<DoctorUser[]>([]);
  const [doctorSearchQuery, setDoctorSearchQuery] = useState("");
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [sendingRequestToId, setSendingRequestToId] = useState<string | null>(null);
  const [isDirectChatOpen, setIsDirectChatOpen] = useState(false);

  const handleOpenSelectDoctorModal = async () => {
    if (!activeChild) return;
    setIsSelectDoctorModalOpen(true);
    setLoadingDoctors(true);
    try {
      const q = query(collection(db, "users"), where("role", "==", "psychologist"));
      const snap = await getDocs(q);
      const list: DoctorUser[] = snap.docs.map((d) => ({
        uid: d.id,
        fullName: d.data().fullName || d.data().name || "أخصائي نفسي معتمد",
        username: d.data().username || "",
        phoneNumber: d.data().phoneNumber || "",
      }));
      setDoctorsList(list);
    } catch (e) {
      console.error("Error fetching doctors list:", e);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleSendRequestToDoctor = async (docUser: DoctorUser) => {
    if (!activeChild) return;
    setSendingRequestToId(docUser.uid);
    try {
      const docName = docUser.fullName || "أخصائي نفسي";
      const childRef = doc(db, "children", activeChild.id);
      await updateDoc(childRef, {
        reviewStatus: "pending",
        pendingReviewWith: docUser.uid,
        pendingReviewWithName: docName,
      });

      setActiveChild((prev) =>
        prev
          ? {
              ...prev,
              reviewStatus: "pending",
              pendingReviewWith: docUser.uid,
              pendingReviewWithName: docName,
            }
          : null
      );

      setIsSelectDoctorModalOpen(false);
      playSound("sparkle");
    } catch (err) {
      console.error("Error sending review request:", err);
    } finally {
      setSendingRequestToId(null);
    }
  };

  const childEmoji = (name: string) => {
    // Simple deterministic emoji picker based on name string
    const charCode = name.charCodeAt(0) || 0;
    return charCode % 2 === 0 ? "👦" : "👧";
  };

  const statusLabel = (child: Child) => {
    if (!child.memoryEvalDone) return { label: "لم يُقيَّم بعد", color: "bg-slate-100 text-slate-500" };
    const bothDone = child.memoryEvalDone && child.oddEvalDone;
    const needsAny = child.needsMemoryTherapy || child.needsOddTherapy;
    if (bothDone && !needsAny) return { label: "ممتاز! ✅", color: "bg-emerald-100 text-emerald-700" };
    if (bothDone && needsAny)  return { label: "برامج نشطة", color: "bg-indigo-100 text-indigo-700" };
    return { label: "التقييم جارٍ", color: "bg-amber-100 text-amber-700" };
  };

  return (
    <div className="w-full space-y-8 pb-10" dir="rtl">

      {/* Welcome Header */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-800 p-8 sm:p-10 rounded-3xl text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-48 h-48 bg-teal-500/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="text-teal-100 font-semibold text-sm">لوحة تحكم الوالدين</p>
            <h1 className="text-3xl sm:text-4xl font-black">مرحباً بك في بستان! 🌿</h1>
            <p className="text-teal-100 font-medium leading-relaxed max-w-xl">
              تابع تقييم وعلاج طفلك في برنامجَي الذاكرة والسلوك أو اكتشف ألعاب الروضة المجانية للأطفال.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap flex-shrink-0">
            <Link
              href="/dashboard/specialists"
              className="inline-flex items-center gap-2 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer border border-indigo-500"
            >
              <Stethoscope size={18} />
              <span>دليل الأخصائيين النفسيين</span>
            </Link>

            <Link
              href="/kindergarten"
              className="inline-flex items-center gap-2 px-5 py-3.5 bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-sm rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer border border-amber-300"
            >
              <span>🏫 روضة بستان للأطفال</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Main 2-Column Panel ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Left: Children List */}
        <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-800">أطفالي 👶</h2>
            <span className="text-xs font-bold text-slate-400">
              ({children.length} {children.length === 1 ? "طفل" : "أطفال"})
            </span>
          </div>

          {loadingChildren ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <Loader2 size={24} className="animate-spin text-teal-600" />
              <span className="text-sm font-bold">جاري تحميل أطفالك...</span>
            </div>
          ) : children.length === 0 ? (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 gap-3">
              <div className="w-14 h-14 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-2xl shadow-inner">
                👶
              </div>
              <div>
                <p className="font-black text-slate-700 text-base">لم تقم بإضافة أي طفل بعد</p>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  أضف طفلك الأول للبدء في التقييم والبرامج العلاجية.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-2 flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow transition-all cursor-pointer"
              >
                <UserPlus size={14} />
                <span>إضافة طفلك الأول</span>
              </button>
            </div>
          ) : (
            <div className="flex-1 space-y-2 max-h-[380px] overflow-y-auto pr-0.5">
              {children.map((child) => {
                const { label, color } = statusLabel(child);
                const isSelected = activeChild?.id === child.id;
                return (
                  <button
                    key={child.id}
                    onClick={() => {
                      playSound("pop");
                      setActiveChild(child);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-base border-2 transition-all cursor-pointer active:scale-95 text-right ${
                      isSelected
                        ? "bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-2xl flex-shrink-0">{childEmoji(child.name)}</span>
                    <div className="flex-1 min-w-0 text-right">
                      <p className="font-black truncate">{child.name}</p>
                      <p className={`text-xs px-2 py-0.5 rounded-full inline-block mt-0.5 font-bold ${color}`}>{label}</p>
                    </div>
                    <span className="flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-full font-black bg-amber-100 text-amber-700 flex-shrink-0">
                      <Star size={10} fill="currentColor" />
                      {child.stars}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-2xl border border-slate-200 transition-all cursor-pointer text-sm active:scale-95"
          >
            <UserPlus size={16} className="text-teal-600" />
            <span>إضافة طفل جديد</span>
          </button>
        </div>

        {/* Right: Active Child — Decoupled Program Sections */}
        <div className="lg:col-span-3 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col gap-6">

          {!activeChild ? (
            /* No Active Child selected (Empty State for Right Panel) */
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center text-4xl">
                👦👧
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-700">يرجى اختيار أو إضافة طفل</h3>
                <p className="text-sm text-slate-400 font-medium mt-1">
                  اختر طفلاً من القائمة على اليمين لعرض التقييمات والبرامج الخاصة به.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow cursor-pointer transition-all text-sm"
              >
                <UserPlus size={16} />
                <span>إضافة طفل جديد</span>
              </button>
            </div>
          ) : (
            <>
              {/* Active Child Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center text-3xl shadow-sm flex-shrink-0">
                    {childEmoji(activeChild.name)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-black text-slate-800">{activeChild.name}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-black bg-amber-100 text-amber-700">
                        <Star size={10} fill="currentColor" />
                        {activeChild.stars} نجمة
                      </span>
                      {(() => {
                        const { label, color } = statusLabel(activeChild);
                        return <span className={`text-xs px-2.5 py-1 rounded-full font-black ${color}`}>{label}</span>;
                      })()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => { playSound("pop"); setIsUpdateStateModalOpen(true); }}
                    className="px-3.5 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Activity size={15} className="text-teal-600" />
                    <span>تحديث حالة الطفل</span>
                  </button>

                  {/* Review Request System & Direct Chat Controls */}
                  {activeChild.reviewStatus === "pending" ? (
                    <span className="px-3.5 py-2 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm animate-pulse">
                      ⏳ طلب المراجعة قيد الانتظار عند: {activeChild.pendingReviewWithName || "الأخصائي"}
                    </span>
                  ) : activeChild.reviewStatus === "accepted" ? (
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-2 bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm">
                        🩺 معتمد من أخصائي
                      </span>
                      <button
                        onClick={() => { playSound("pop"); setIsDirectChatOpen(true); }}
                        className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        💬 دردشة الأخصائي المباشرة
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { playSound("pop"); handleOpenSelectDoctorModal(); }}
                      className="px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Stethoscope size={15} className="text-indigo-600" />
                      <span>طلب مراجعة من أخصائي</span>
                    </button>
                  )}
                </div>
              </div>

              {/* ════ MEMORY PROGRAM SECTION ════ */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Brain size={18} className="text-teal-600" />
                  <h4 className="font-black text-slate-700 text-base">برنامج الذاكرة</h4>
                  <div className="h-px flex-1 bg-slate-100"></div>
                  {activeChild.memoryEvalDone && <CheckCircle size={15} className="text-emerald-500" />}
                </div>

                {/* Assessment button (step style) */}
                {!activeChild.memoryEvalDone && (
                  <Link
                    href={`/assessment/memory?childId=${activeChild.id}`}
                    className="w-full flex items-center gap-3 px-5 py-4 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold rounded-2xl border-2 border-slate-300 hover:border-teal-400 transition-all active:scale-95 cursor-pointer group"
                  >
                    <ClipboardCheck size={22} className="text-slate-500 group-hover:text-teal-600 flex-shrink-0 transition-colors" />
                    <div className="flex-1 text-right">
                      <p className="text-xs text-slate-400 font-bold">الخطوة 1 — مطلوب أولاً</p>
                      <p className="text-base">تقييم الذاكرة</p>
                    </div>
                    <ChevronLeft size={16} className="text-slate-400 group-hover:text-slate-600 flex-shrink-0" />
                  </Link>
                )}

                {/* Memory eval done — show status */}
                {activeChild.memoryEvalDone && (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-bold">
                    <CheckCircle size={15} className="flex-shrink-0" />
                    <span>تقييم الذاكرة مكتمل ✅</span>
                  </div>
                )}

                {/* Therapy button (vibrant gradient) — only if eval done AND needs therapy */}
                {activeChild.memoryEvalDone && activeChild.needsMemoryTherapy && (
                  <Link
                    href={`/therapy/memory/session-1?childId=${activeChild.id}`}
                    className="w-full flex items-center gap-4 px-5 py-5 bg-gradient-to-l from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 cursor-pointer"
                  >
                    <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <PlayCircle size={24} />
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-white/70 text-xs font-bold">11 جلسة علاجية</p>
                      <p>متابعة جلسات علاج الذاكرة</p>
                    </div>
                    <ChevronLeft size={18} className="opacity-70 flex-shrink-0" />
                  </Link>
                )}

                {/* Memory eval done but no therapy needed */}
                {activeChild.memoryEvalDone && !activeChild.needsMemoryTherapy && (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-teal-50 border border-teal-200 rounded-xl text-teal-700 text-sm font-bold">
                    <HeartHandshake size={15} className="flex-shrink-0" />
                    <span>لا يحتاج {activeChild.name} لعلاج ذاكرة حالياً 🌟</span>
                  </div>
                )}

                {/* Secondary Button: Retake Memory Evaluation */}
                {activeChild.memoryEvalDone && (
                  <Link
                    href={`/assessment/memory?childId=${activeChild.id}`}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-xl border border-slate-200 transition-all cursor-pointer text-xs"
                  >
                    <RotateCcw size={14} />
                    <span>إعادة تقييم الذاكرة</span>
                  </Link>
                )}
              </div>

              {/* ════ ODD PROGRAM SECTION ════ */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Activity size={18} className="text-indigo-600" />
                  <h4 className="font-black text-slate-700 text-base">برنامج زيادة المناعة النفسية للأطفال (ODD)</h4>
                  <div className="h-px flex-1 bg-slate-100"></div>
                  {activeChild.oddEvalDone && <CheckCircle size={15} className="text-emerald-500" />}
                </div>

                {/* ODD locked until memory eval is done */}
                {!activeChild.memoryEvalDone && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-bold">
                    <AlertCircle size={15} className="flex-shrink-0" />
                    <span>أكمل تقييم الذاكرة أولاً لفتح هذا القسم 🔒</span>
                  </div>
                )}

                {/* ODD assessment button — step style, shown after memory eval */}
                {activeChild.memoryEvalDone && !activeChild.oddEvalDone && (
                  <Link
                    href={`/assessment/odd?childId=${activeChild.id}`}
                    className="w-full flex items-center gap-3 px-5 py-4 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold rounded-2xl border-2 border-slate-300 hover:border-indigo-400 transition-all active:scale-95 cursor-pointer group"
                  >
                    <ClipboardCheck size={22} className="text-slate-500 group-hover:text-indigo-600 flex-shrink-0 transition-colors" />
                    <div className="flex-1 text-right">
                      <p className="text-xs text-slate-400 font-bold">الخطوة 2 — بعد تقييم الذاكرة</p>
                      <p className="text-base">تقييم المناعة النفسية للأطفال (ODD)</p>
                    </div>
                    <ChevronLeft size={16} className="text-slate-400 group-hover:text-slate-600 flex-shrink-0" />
                  </Link>
                )}

                {/* ODD eval done — show status */}
                {activeChild.oddEvalDone && (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-bold">
                    <CheckCircle size={15} className="flex-shrink-0" />
                    <span>تقييم المناعة النفسية (ODD) مكتمل ✅</span>
                  </div>
                )}

                {/* Therapy button (vibrant indigo/purple gradient) — only if eval done AND needs therapy */}
                {activeChild.oddEvalDone && activeChild.needsOddTherapy && (
                  <div className="space-y-2">
                    <Link
                      href={`/therapy/odd/session-1?childId=${activeChild.id}`}
                      className="w-full flex items-center gap-4 px-5 py-5 bg-gradient-to-l from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white font-black text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 cursor-pointer"
                    >
                      <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Activity size={24} />
                      </div>
                      <div className="flex-1 text-right">
                        <p className="text-white/70 text-xs font-bold">7 حصص علاجية</p>
                        <p>متابعة جلسات زيادة المناعة النفسية (ODD)</p>
                      </div>
                      <ChevronLeft size={18} className="opacity-70 flex-shrink-0" />
                    </Link>

                    <button
                      onClick={() => {
                        playSound("pop");
                        setIsStarBoardModalOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-amber-50 hover:bg-amber-100 text-amber-900 font-black rounded-2xl border-2 border-amber-300 transition-all cursor-pointer text-sm shadow-sm active:scale-95"
                    >
                      <Star size={16} className="fill-amber-500 text-amber-500" />
                      <span>فتح جدول التعزيز الإيجابي للأم (لوحة النجوم) 🌟</span>
                    </button>
                  </div>
                )}

                {/* ODD eval done but no therapy needed */}
                {activeChild.oddEvalDone && !activeChild.needsOddTherapy && (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-700 text-sm font-bold">
                    <HeartHandshake size={15} className="flex-shrink-0" />
                    <span>لا يحتاج {activeChild.name} لبرنامج زيادة المناعة النفسية (ODD) حالياً 🌟</span>
                  </div>
                )}

                {/* Secondary Button: Retake ODD Behavioral Assessment */}
                {activeChild.oddEvalDone && (
                  <Link
                    href={`/assessment/odd?childId=${activeChild.id}`}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-xl border border-slate-200 transition-all cursor-pointer text-xs"
                  >
                    <RotateCcw size={14} />
                    <span>إعادة تقييم المناعة النفسية (ODD)</span>
                  </Link>
                )}
              </div>
            </>
          )}

        </div>
      </div>

      {/* ─── Bottom Info Cards ─── */}
      {activeChild && (() => {
        const completedMemory = activeChild.completedMemorySessions || 0;
        const totalMemory = activeChild.totalMemorySessions || 11;
        const memoryPercent = Math.min(Math.round((completedMemory / totalMemory) * 100), 100);

        const completedOdd = activeChild.completedOddSessions || 0;
        const totalOdd = activeChild.totalOddSessions || 7;
        const oddPercent = Math.min(Math.round((completedOdd / totalOdd) * 100), 100);

        const starsCount = activeChild.stars || 0;

        const rawActivities = activeChild.activities || [];
        const sortedActivities = [...rawActivities].sort((a, b) => {
          const ta = new Date(a.timestamp).getTime() || 0;
          const tb = new Date(b.timestamp).getTime() || 0;
          return tb - ta;
        }).slice(0, 3);

        const getActivityStyle = (type: string) => {
          if (type === "memory") return { icon: "🧠", color: "bg-teal-50 border-teal-100" };
          if (type === "odd") return { icon: "🌋", color: "bg-indigo-50 border-indigo-100" };
          return { icon: "⭐", color: "bg-amber-50 border-amber-100" };
        };

        const formatActivityTime = (isoString: string) => {
          if (!isoString) return "منذ قليل";
          const date = new Date(isoString);
          if (isNaN(date.getTime())) return "منذ قليل";
          return date.toLocaleDateString("ar-EG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
        };

        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Progress Overview */}
            <div className="bg-white border border-slate-100 p-7 rounded-3xl shadow-sm flex flex-col gap-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-800">نظرة عامة — {activeChild.name}</h2>
                <span className="text-2xl">📊</span>
              </div>

              <div className="flex-1 space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>تقييم الذاكرة</span>
                    <span>{activeChild.memoryEvalDone ? "مكتمل ✅" : "لم يبدأ"}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className="bg-teal-500 h-2.5 rounded-full transition-all" style={{ width: activeChild.memoryEvalDone ? "100%" : "0%" }}></div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>علاج الذاكرة ({completedMemory} / {totalMemory} جلسة)</span>
                    <span>{activeChild.needsMemoryTherapy ? `${memoryPercent}%` : activeChild.memoryEvalDone ? "غير مطلوب" : "مقفل"}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className="bg-emerald-500 h-2.5 rounded-full transition-all" style={{ width: `${activeChild.needsMemoryTherapy ? memoryPercent : 0}%` }}></div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>تقييم المناعة النفسية (ODD)</span>
                    <span>{activeChild.oddEvalDone ? "مكتمل ✅" : activeChild.memoryEvalDone ? "بانتظارك" : "مقفل"}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className="bg-indigo-500 h-2.5 rounded-full transition-all" style={{ width: activeChild.oddEvalDone ? "100%" : "0%" }}></div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>برنامج زيادة المناعة النفسية (ODD) ({completedOdd} / {totalOdd} حصص)</span>
                    <span>{activeChild.needsOddTherapy ? `${oddPercent}%` : activeChild.oddEvalDone ? "غير مطلوب" : "مقفل"}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className="bg-violet-500 h-2.5 rounded-full transition-all" style={{ width: `${activeChild.needsOddTherapy ? oddPercent : 0}%` }}></div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>النجوم المكتسبة</span>
                    <span>{starsCount} ⭐</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className="bg-amber-400 h-2.5 rounded-full transition-all" style={{ width: `${Math.min((starsCount / 20) * 100, 100)}%` }}></div>
                  </div>
                </div>
              </div>

              <button className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-2xl transition-all active:scale-95 cursor-pointer border border-indigo-100">
                <BarChart2 size={18} />
                <span>عرض التقارير الكاملة</span>
              </button>
            </div>

            {/* Recent Activities */}
            <div className="bg-white border border-slate-100 p-7 rounded-3xl shadow-sm flex flex-col gap-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-800">آخر الأنشطة</h2>
                <span className="text-2xl">⚡</span>
              </div>

              {sortedActivities.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 gap-2 my-auto">
                  <span className="text-3xl">🌱</span>
                  <p className="text-sm font-bold text-slate-600">لم يقم الطفل بأي نشاط بعد.</p>
                  <p className="text-xs text-slate-400 font-medium">ستظهر الجلسات المكتملة والأنشطة هنا تلقائياً.</p>
                </div>
              ) : (
                <div className="flex-1 space-y-3">
                  {sortedActivities.map((act) => {
                    const { icon, color } = getActivityStyle(act.type);
                    return (
                      <div key={act.id} className={`flex items-center gap-3 p-3 rounded-2xl border ${color}`}>
                        <span className="text-2xl flex-shrink-0">{icon}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-700 truncate">{act.title}</p>
                          <div className="flex items-center gap-1 text-xs text-slate-400 font-medium mt-0.5">
                            <Clock size={10} />
                            <span>{formatActivityTime(act.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <button className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-2xl transition-all active:scale-95 cursor-pointer border border-slate-200">
                <span>عرض كل الأنشطة</span>
              </button>
            </div>

          </div>
        );
      })()}

      {/* ─── ADD CHILD MODAL ─── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 relative animate-in zoom-in-95 duration-200">

            {/* Close Button */}
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                setAddError("");
              }}
              className="absolute top-5 left-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-14 h-14 bg-teal-100 text-teal-700 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                👶
              </div>
              <h3 className="text-2xl font-black text-slate-800">إضافة طفل جديد</h3>
              <p className="text-slate-500 font-medium text-xs">
                أدخل اسم الطفل للبدء في متابعة مهاراته وتقييمه
              </p>
            </div>

            {/* Error Message */}
            {addError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-2xl text-xs font-bold text-center">
                {addError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAddChild} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  اسم الطفل
                </label>
                <input
                  type="text"
                  required
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  placeholder="مثال: يوسف أو مريم"
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-teal-500 focus:outline-none transition-colors font-bold text-slate-800 bg-slate-50/50"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  وصف حالة الطفل وسلوكه (ضروري جداً للمستشار)
                </label>
                <textarea
                  required
                  rows={3}
                  value={newChildBehavioralNote}
                  onChange={(e) => setNewChildBehavioralNote(e.target.value)}
                  placeholder="صف مخاوفه، نقاط قوته، وما يزعجك في سلوكه بصراحة..."
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-teal-500 focus:outline-none transition-colors font-bold text-slate-800 bg-slate-50/50 resize-none text-xs sm:text-sm"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isAdding || !newChildName.trim() || !newChildBehavioralNote.trim()}
                  className={`flex-1 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
                    isAdding || !newChildName.trim() || !newChildBehavioralNote.trim() ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  {isAdding ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>جاري الإضافة...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      <span>إضافة الطفل</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setAddError("");
                  }}
                  className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all cursor-pointer text-sm"
                >
                  إلغاء
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Update Child State Modal */}
      {isUpdateStateModalOpen && activeChild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in" dir="rtl">
          <div className="w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-lg rounded-none sm:rounded-3xl bg-white p-6 sm:p-8 space-y-6 shadow-2xl relative border-none sm:border border-slate-100 overflow-y-auto flex flex-col justify-between sm:justify-start">
            <button
              onClick={() => setIsUpdateStateModalOpen(false)}
              className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors z-10"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center space-y-2 pt-2 sm:pt-0">
              <div className="w-14 h-14 bg-teal-100 text-teal-700 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                📝
              </div>
              <h3 className="text-2xl font-black text-slate-800">تحديث حالة الطفل ({activeChild.name})</h3>
              <p className="text-slate-500 font-medium text-xs">
                أدخل أي ملاحظات أو سلوكيات جديدة للطفل ليأخذها المستشار الذكي في الاعتبار
              </p>
            </div>

            {/* Clinical Disclaimer Banner */}
            <div className="bg-blue-50 text-blue-800 p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed border border-blue-100 flex items-start gap-3 text-right">
              <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center flex-shrink-0 text-base shadow-sm font-bold">
                💡
              </div>
              <div className="flex-1">
                <p className="font-black text-blue-950 mb-0.5 text-xs sm:text-sm">نصيحة للمتابعة:</p>
                <p className="font-medium text-blue-800 text-xs leading-relaxed">
                  يُفضل أن تناقش تطورات طفلك ومشاكله اليومية مع <strong>&quot;د. بستان&quot;</strong> في الدردشة بدلاً من كتابتها هنا؛ ليقوم هو باستنتاجها وتحديثها برؤية خبير بعد إنهاء الجلسة. التحديث اليدوي المباشر يُنصح به فقط إذا كان بناءً على توجيه من طبيب أو مستشار نفسي بشري.
                </p>
              </div>
            </div>

            {/* Latest Existing Behavioral Note Quote */}
            {(() => {
              const notes = activeChild.behavioralNotes || [];
              const latest = notes.length > 0 ? notes[notes.length - 1] : null;
              if (!latest) return null;
              return (
                <div className="bg-slate-50 border-r-4 border-teal-500 p-4 rounded-xl space-y-1 text-right">
                  <p className="text-xs font-bold text-slate-400">
                    آخر ملاحظة مسجلة ({latest.author === "ai_agent" ? "المستشار الذكي 🤖" : "الوالدين 👤"}):
                  </p>
                  <p className="text-sm font-semibold text-slate-700 leading-relaxed">
                    "{latest.note || (latest as any).text}"
                  </p>
                </div>
              );
            })()}

            <form onSubmit={handleUpdateChildState} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  التطورات أو السلوكيات الجديدة اليوم
                </label>
                <textarea
                  required
                  rows={4}
                  value={newUpdateNote}
                  onChange={(e) => setNewUpdateNote(e.target.value)}
                  placeholder="مثال: يرفض أداء الواجبات، أصبح يلتزم بتمرين التنفس عند الغضب..."
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-teal-500 focus:outline-none transition-colors font-bold text-slate-800 bg-slate-50/50 resize-none text-xs sm:text-sm"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSavingUpdate || !newUpdateNote.trim()}
                  className="flex-1 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSavingUpdate ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      <span>حفظ التحديث السلوكي</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsUpdateStateModalOpen(false)}
                  className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all cursor-pointer text-sm"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Star Board Modal */}
      <OddStarBoardModal
        isOpen={isStarBoardModalOpen}
        onClose={() => setIsStarBoardModalOpen(false)}
      />

      {/* Counselor Chat Widget */}
      <CounselorChat
        parentName={user?.displayName || "فوزي جعفري"}
        childrenList={children}
        childId={activeChild?.id}
        childName={activeChild?.name}
        completedOddSessions={activeChild?.completedOddSessions}
        completedMemorySessions={activeChild?.completedMemorySessions}
        stars={activeChild?.stars}
      />

      {/* Direct Chat Modal with Psychologist */}
      {user && activeChild && (
        <DirectChatModal
          isOpen={isDirectChatOpen}
          onClose={() => setIsDirectChatOpen(false)}
          childId={activeChild.id}
          childName={activeChild.name}
          currentUserId={user.uid}
          currentUserRole="parent"
          currentUserName={user?.displayName || "فوزي جعفري"}
        />
      )}

      {/* Psychologist Selection Modal */}
      {isSelectDoctorModalOpen && activeChild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 animate-in fade-in dir-rtl" dir="rtl">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 shadow-2xl relative border border-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center text-2xl font-black shadow-sm">
                  🩺
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800">دليل الأخصائيين النفسيين المعتمدين</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    اختر الأخصائي المناسب لطلب مراجعة سريرية لـ ({activeChild.name})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsSelectDoctorModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Doctor Search Filter */}
            <div className="relative">
              <Search size={18} className="absolute right-4 top-3.5 text-slate-400" />
              <input
                type="text"
                value={doctorSearchQuery}
                onChange={(e) => setDoctorSearchQuery(e.target.value)}
                placeholder="ابحث باسم الأخصائي، اسم المستخدم @username، أو رقم الهاتف..."
                className="w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-2xl text-xs sm:text-sm font-bold text-slate-800"
              />
            </div>

            {/* Doctors List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {loadingDoctors ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Loader2 size={28} className="animate-spin text-indigo-600" />
                  <span className="text-xs font-bold">جاري تحميل قائمة الأخصائيين...</span>
                </div>
              ) : doctorsList.filter((d) => {
                  const q = doctorSearchQuery.trim().toLowerCase();
                  if (!q) return true;
                  return (
                    (d.fullName || "").toLowerCase().includes(q) ||
                    (d.username || "").toLowerCase().includes(q) ||
                    (d.phoneNumber || "").toLowerCase().includes(q)
                  );
                }).length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto text-xl">
                    🩺
                  </div>
                  <p className="font-bold text-sm text-slate-700">لم يتم العثور على أخصائي مطابقة للبحث</p>
                </div>
              ) : (
                doctorsList
                  .filter((d) => {
                    const q = doctorSearchQuery.trim().toLowerCase();
                    if (!q) return true;
                    return (
                      (d.fullName || "").toLowerCase().includes(q) ||
                      (d.username || "").toLowerCase().includes(q) ||
                      (d.phoneNumber || "").toLowerCase().includes(q)
                    );
                  })
                  .map((docUser) => (
                    <div
                      key={docUser.uid}
                      className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center justify-between gap-4 hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-base shadow-sm">
                          🩺
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-sm">{docUser.fullName}</p>
                          {docUser.username && (
                            <p className="text-xs text-indigo-600 font-mono dir-ltr text-right">
                              @{docUser.username}
                            </p>
                          )}
                          {docUser.phoneNumber && (
                            <p className="text-[11px] text-slate-400 font-mono dir-ltr text-right">
                              {docUser.phoneNumber}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleSendRequestToDoctor(docUser)}
                        disabled={sendingRequestToId === docUser.uid}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 disabled:opacity-50 flex-shrink-0"
                      >
                        {sendingRequestToId === docUser.uid ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Sparkles size={14} />
                        )}
                        <span>إرسال الطلب</span>
                      </button>
                    </div>
                  ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsSelectDoctorModalOpen(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
