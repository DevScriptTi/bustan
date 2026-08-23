"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
  subscribePsychologistChildren,
  SpecialistChildData,
} from "@/lib/firebase/psychologist";
import {
  Users,
  Search,
  AlertTriangle,
  Brain,
  CheckCircle,
  FileText,
  Clock,
  Sparkles,
  Loader2,
  RefreshCw,
  Eye,
  MessageSquare,
  Check,
  XCircle,
  Stethoscope,
  X,
  BrainCircuit,
  Lock,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import DirectChatModal from "@/components/DirectChatModal";

export default function PsychologistDashboard() {
  const { user } = useAuth();
  const [children, setChildren] = useState<SpecialistChildData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"MY_PATIENTS" | "PENDING_REQUESTS">("MY_PATIENTS");

  // Clinical File Modal State
  const [selectedChild, setSelectedChild] = useState<SpecialistChildData | null>(null);
  const [isClinicalModalOpen, setIsClinicalModalOpen] = useState(false);
  const [psychologistNote, setPsychologistNote] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);

  // AI Context Override Directives
  const [aiDirectivesText, setAiDirectivesText] = useState("");
  const [isSavingDirectives, setIsSavingDirectives] = useState(false);
  const [directivesSavedToast, setDirectivesSavedToast] = useState(false);

  // Direct Chat Modal State
  const [isDirectChatOpen, setIsDirectChatOpen] = useState(false);
  const [processingReviewId, setProcessingReviewId] = useState<string | null>(null);

  /* ── Privacy-Scoped Real-Time Firestore Listener ── */
  useEffect(() => {
    if (!user?.uid) return;

    setLoading(true);
    const unsubscribe = subscribePsychologistChildren(user.uid, (data) => {
      setChildren(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  useEffect(() => {
    if (selectedChild) {
      setAiDirectivesText(selectedChild.psychologistDirectives || "");
    }
  }, [selectedChild]);

  /* ── Accept Review Request ── */
  const handleAcceptReview = async (child: SpecialistChildData) => {
    setProcessingReviewId(child.id);
    try {
      const childRef = doc(db, "children", child.id);
      await updateDoc(childRef, {
        reviewStatus: "accepted",
        assignedPsychologistId: user?.uid || "",
        pendingReviewWith: "",
      });

      if (selectedChild?.id === child.id) {
        setSelectedChild((prev) =>
          prev
            ? {
                ...prev,
                reviewStatus: "accepted",
                assignedPsychologistId: user?.uid || "",
                pendingReviewWith: "",
              }
            : null
        );
      }
    } catch (err) {
      console.error("Error accepting review request:", err);
    } finally {
      setProcessingReviewId(null);
    }
  };

  /* ── Reject Review Request ── */
  const handleRejectReview = async (child: SpecialistChildData) => {
    setProcessingReviewId(child.id);
    try {
      const childRef = doc(db, "children", child.id);
      await updateDoc(childRef, {
        reviewStatus: "rejected",
        pendingReviewWith: "",
      });

      if (selectedChild?.id === child.id) {
        setSelectedChild((prev) =>
          prev ? { ...prev, reviewStatus: "rejected", pendingReviewWith: "" } : null
        );
      }
    } catch (err) {
      console.error("Error rejecting review request:", err);
    } finally {
      setProcessingReviewId(null);
    }
  };

  /* ── Save AI Directives Context Override ── */
  const handleSaveAIDirectives = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild) return;

    setIsSavingDirectives(true);
    try {
      const childRef = doc(db, "children", selectedChild.id);
      await updateDoc(childRef, {
        psychologistDirectives: aiDirectivesText.trim(),
      });

      setSelectedChild({
        ...selectedChild,
        psychologistDirectives: aiDirectivesText.trim(),
      });

      setDirectivesSavedToast(true);
      setTimeout(() => setDirectivesSavedToast(false), 4000);
    } catch (err) {
      console.error("Error saving AI directives:", err);
    } finally {
      setIsSavingDirectives(false);
    }
  };

  const handleSavePsychologistNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild || !psychologistNote.trim()) return;

    setIsSavingNote(true);
    try {
      const newEntry = {
        date: new Date().toISOString(),
        note: `[توصية سريرية]: ${psychologistNote.trim()}`,
        author: "ai_agent" as const,
      };

      const childRef = doc(db, "children", selectedChild.id);
      await updateDoc(childRef, {
        behavioralNotes: arrayUnion(newEntry),
      });

      const updatedNotes = [...selectedChild.behavioralNotes, newEntry];
      setSelectedChild({
        ...selectedChild,
        behavioralNotes: updatedNotes,
        latestNote: newEntry,
      });

      setPsychologistNote("");
    } catch (err) {
      console.error("Error saving psychologist note:", err);
    } finally {
      setIsSavingNote(false);
    }
  };

  /* ── Privacy-Scoped Filter Lists ── */
  const myPatients = children.filter(
    (c) => c.assignedPsychologistId === user?.uid && c.reviewStatus === "accepted"
  );
  const pendingRequests = children.filter(
    (c) => c.pendingReviewWith === user?.uid || (c.reviewStatus === "pending" && c.assignedPsychologistId === user?.uid)
  );

  const displayList = children.filter((child) => {
    const matchesSearch =
      child.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      child.parentName.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "MY_PATIENTS") {
      return (
        matchesSearch &&
        child.assignedPsychologistId === user?.uid &&
        child.reviewStatus === "accepted"
      );
    }
    if (activeTab === "PENDING_REQUESTS") {
      return (
        matchesSearch &&
        (child.pendingReviewWith === user?.uid ||
          (child.reviewStatus === "pending" && child.assignedPsychologistId === user?.uid))
      );
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6 dir-rtl" dir="rtl">

      {/* Streamlined Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
            <Stethoscope size={16} />
            <span>لوحة المتابعة السريرية — حماية خصوصية البيانات 🔒</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">إدارة المرضى والطلبات المباشرة 🩺</h1>
        </div>
      </div>

      {/* Scoped Tabs & Search */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        
        {/* Navigation Tabs (Scoped only to My Patients & Pending Requests for ME) */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("MY_PATIENTS")}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "MY_PATIENTS"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <Users size={16} />
            <span>مرضاي المكلفون ({myPatients.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("PENDING_REQUESTS")}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "PENDING_REQUESTS"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                : "bg-slate-950 text-slate-400 hover:text-amber-400 border border-slate-800"
            }`}
          >
            <Clock size={16} />
            <span>طلبات المراجعة الموجهة لي ({pendingRequests.length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute right-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم الطفل أو الولي..."
            className="w-full pl-4 pr-10 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-2xl text-xs font-bold text-slate-200"
          />
        </div>

      </div>

      {/* Streamlined Comprehensive Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 size={32} className="animate-spin text-indigo-500" />
            <p className="text-sm font-bold">جاري تحميل سجلات المرضى والطلبات...</p>
          </div>
        ) : displayList.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <div className="w-14 h-14 bg-slate-800 text-slate-500 rounded-full flex items-center justify-center mx-auto text-2xl">
              📂
            </div>
            <p className="font-bold text-sm text-slate-300">لا توجد سجلات في هذا القسم حالياً</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {activeTab === "MY_PATIENTS"
                ? "سيظهر هنا الأطفال الذين قبلت طلبات مراجعتهم سريرياً."
                : "تظهر هنا فقط طلبات المراجعة الموجهة إليك مباشرة من الأولياء."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-4 px-6">اسم الطفل</th>
                  <th className="py-4 px-6">بيانات الولي</th>
                  <th className="py-4 px-6">الحالة وقبول الطلب</th>
                  <th className="py-4 px-6">مؤشر ODD والذاكرة</th>
                  <th className="py-4 px-6">آخر تحديث سلوكي</th>
                  <th className="py-4 px-6 text-center">الإجراءات السريرية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {displayList.map((child) => (
                  <tr key={child.id} className="hover:bg-slate-850/50 transition-colors">
                    
                    {/* Child Name */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-800 rounded-2xl flex items-center justify-center text-xl border border-slate-700">
                          👦
                        </div>
                        <div>
                          <p className="font-black text-slate-100 text-sm">{child.name}</p>
                          <span className="text-[10px] text-amber-400 font-bold">⭐ {child.stars} نجمة</span>
                        </div>
                      </div>
                    </td>

                    {/* Parent Name & Details */}
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-bold text-slate-200">{child.parentName}</p>
                        {child.parentEmail && (
                          <p className="text-[11px] text-slate-400 dir-ltr text-right">{child.parentEmail}</p>
                        )}
                      </div>
                    </td>

                    {/* Review Status & Quick Actions */}
                    <td className="py-4 px-6">
                      {child.reviewStatus === "pending" || child.pendingReviewWith === user?.uid ? (
                        <div className="space-y-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full font-bold text-[11px] animate-pulse">
                            ⏳ طلب معلق موجه إليك
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleAcceptReview(child)}
                              disabled={processingReviewId === child.id}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow"
                            >
                              <Check size={14} /> قبول
                            </button>
                            <button
                              onClick={() => handleRejectReview(child)}
                              disabled={processingReviewId === child.id}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-rose-950/60 text-rose-400 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer border border-slate-700 transition-all"
                            >
                              <XCircle size={14} /> رفض
                            </button>
                          </div>
                        </div>
                      ) : child.reviewStatus === "accepted" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full font-bold text-[11px]">
                          <CheckCircle size={12} /> مريض مكلف
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500 font-medium">—</span>
                      )}
                    </td>

                    {/* Progress indicators */}
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-rose-400">
                          ODD: {child.completedOddSessions}/7 جلسات
                        </p>
                        <p className="text-xs font-bold text-emerald-400">
                          الذاكرة: {child.completedMemorySessions}/11 جلسة
                        </p>
                      </div>
                    </td>

                    {/* Latest Behavioral Note */}
                    <td className="py-4 px-6 max-w-xs">
                      {child.latestNote ? (
                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          "{child.latestNote.note}"
                        </p>
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedChild(child);
                            setIsClinicalModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center gap-1"
                          title="فتح الملف السريري"
                        >
                          <Eye size={14} />
                          <span>الملف</span>
                        </button>

                        {child.parentId && (
                          <Link
                            href={`/psychologist/chat/${child.parentId}?childId=${child.id}`}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-1"
                            title="فتح المحادثة المباشرة"
                          >
                            <MessageSquare size={14} />
                            <span>محادثة</span>
                          </Link>
                        )}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Clinical File Modal */}
      {isClinicalModalOpen && selectedChild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in dir-rtl" dir="rtl">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-3xl w-full space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-900/40 text-indigo-300 rounded-2xl flex items-center justify-center text-2xl border border-indigo-700/40">
                  📋
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">الملف السريري: {selectedChild.name}</h3>
                  <p className="text-xs text-slate-400 font-medium">الولي: {selectedChild.parentName}</p>
                </div>
              </div>

              <button
                onClick={() => setIsClinicalModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* AI Context Override */}
            <form onSubmit={handleSaveAIDirectives} className="space-y-3 bg-indigo-950/30 border border-indigo-900/50 p-4 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-400">
                  <BrainCircuit size={18} />
                  <h4 className="font-black text-sm text-slate-200">توجيهات للمستشار الذكي (AI Context Override)</h4>
                </div>
                {directivesSavedToast && (
                  <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    ✓ تم الحفظ
                  </span>
                )}
              </div>

              <textarea
                rows={3}
                value={aiDirectivesText}
                onChange={(e) => setAiDirectivesText(e.target.value)}
                placeholder="اكتب تعليمات خاصة للمستشار الذكي ليتبعها عند إجابة هذا الطفل ووالديه..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-2xl text-xs font-bold text-slate-200 resize-none"
              />

              <button
                type="submit"
                disabled={isSavingDirectives}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSavingDirectives ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                <span>حفظ التوجيهات السريرية</span>
              </button>
            </form>

            {/* Behavioral Notes */}
            <div className="space-y-3">
              <h4 className="font-black text-sm text-slate-200 flex items-center gap-2">
                <FileText size={16} className="text-indigo-400" />
                <span>سجل الملاحظات السلوكية</span>
              </h4>

              {selectedChild.behavioralNotes && selectedChild.behavioralNotes.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedChild.behavioralNotes.map((note, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded-2xl text-right">
                      <p className="text-xs text-slate-300 font-medium leading-relaxed">"{note.note}"</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-medium p-4 bg-slate-950 rounded-2xl text-center">
                  لا توجد ملاحظات سلوكية مسجلة بعد.
                </p>
              )}
            </div>

            {/* Add Clinical Recommendation */}
            <form onSubmit={handleSavePsychologistNote} className="space-y-3 pt-2 border-t border-slate-800">
              <label className="block text-xs font-bold text-slate-300">إضافة توصية سريرية للملف</label>
              <textarea
                rows={3}
                required
                value={psychologistNote}
                onChange={(e) => setPsychologistNote(e.target.value)}
                placeholder="اكتب التوصيات الطبية والنفسية..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-2xl text-xs font-bold text-slate-200 resize-none"
              />

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSavingNote || !psychologistNote.trim()}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-2xl shadow transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSavingNote ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  <span>حفظ التوصية</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsClinicalModalOpen(false)}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-2xl transition-colors cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Direct Chat Modal */}
      {user && selectedChild && (
        <DirectChatModal
          isOpen={isDirectChatOpen}
          onClose={() => setIsDirectChatOpen(false)}
          childId={selectedChild.id}
          childName={selectedChild.name}
          currentUserId={user.uid}
          currentUserRole="psychologist"
          currentUserName={user.displayName || "د. الأخصائي النفسي"}
        />
      )}

    </div>
  );
}
