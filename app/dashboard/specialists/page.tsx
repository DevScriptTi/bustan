"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  Search,
  Stethoscope,
  Phone,
  AtSign,
  UserCheck,
  CheckCircle,
  Loader2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { playSound } from "@/utils/playSound";

interface SpecialistUser {
  uid: string;
  fullName?: string;
  email?: string;
  username?: string;
  phoneNumber?: string;
}

interface Child {
  id: string;
  name: string;
  reviewStatus?: string;
}

export default function ParentSpecialistsSearchPage() {
  const { user } = useAuth();
  const [specialists, setSpecialists] = useState<SpecialistUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [requestSuccessToast, setRequestSuccessToast] = useState(false);

  // Fetch all Psychologists & Parent's Children
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Query users where role === 'psychologist'
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("role", "==", "psychologist"));
        const snap = await getDocs(q);

        const list: SpecialistUser[] = snap.docs.map((d) => ({
          uid: d.id,
          fullName: d.data().fullName || d.data().name || "أخصائي نفسي",
          email: d.data().email || "",
          username: d.data().username || "",
          phoneNumber: d.data().phoneNumber || "",
        }));

        setSpecialists(list);

        // Fetch parent children
        if (user) {
          const childrenRef = collection(db, "children");
          const cq = query(childrenRef, where("parentId", "==", user.uid));
          const cSnap = await getDocs(cq);
          const cList: Child[] = cSnap.docs.map((d) => ({
            id: d.id,
            name: d.data().name,
            reviewStatus: d.data().reviewStatus || "none",
          }));
          setChildren(cList);
          if (cList.length > 0) {
            setSelectedChildId(cList[0].id);
          }
        }
      } catch (err) {
        console.error("Error fetching specialists:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  /* ── Filter Specialists by Search Query (username, phone, or name) ── */
  const filteredSpecialists = specialists.filter((s) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;

    return (
      (s.fullName || "").toLowerCase().includes(query) ||
      (s.username || "").toLowerCase().includes(query) ||
      (s.phoneNumber || "").toLowerCase().includes(query)
    );
  });

  /* ── Submit Review Request to Specialist ── */
  const handleRequestReview = async (spec: SpecialistUser) => {
    if (!selectedChildId) return;

    setRequestingId(spec.uid);
    playSound("pop");
    try {
      const childRef = doc(db, "children", selectedChildId);
      await updateDoc(childRef, {
        reviewStatus: "pending",
        pendingReviewWith: spec.uid,
      });

      setChildren((prev) =>
        prev.map((c) =>
          c.id === selectedChildId ? { ...c, reviewStatus: "pending" } : c
        )
      );

      setRequestSuccessToast(true);
      setTimeout(() => setRequestSuccessToast(false), 4000);
      playSound("sparkle");
    } catch (err) {
      console.error("Error requesting review:", err);
    } finally {
      setRequestingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 dir-rtl p-4 sm:p-6 font-sans" dir="rtl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="space-y-1">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 hover:underline mb-2"
          >
            <ArrowRight size={14} />
            <span>العودة للوحة التحكم</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-2">
            <Stethoscope className="text-teal-600" size={28} />
            <span>الدليل المعتمد للأخصائيين النفسيين</span>
          </h1>
          <p className="text-slate-500 font-medium text-xs sm:text-sm max-w-xl">
            البحث عن أخصائي نفسي معتمد باسم المستخدم (@username) أو رقم الهاتف لطلب مراجعة سريرية لبستان طفلك.
          </p>
        </div>
      </div>

      {/* Success Toast */}
      {requestSuccessToast && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 text-emerald-800 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-emerald-600" />
            <span>تم إرسال طلب المراجعة السريرية بنجاح إلى الأخصائي 🚀</span>
          </div>
        </div>
      )}

      {/* Search Bar & Child Selector */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search input */}
        <div className="relative w-full sm:w-96">
          <Search size={18} className="absolute right-4 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم المستخدم @username أو رقم الهاتف..."
            className="w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-200 focus:border-teal-500 focus:outline-none rounded-2xl text-xs sm:text-sm font-bold text-slate-800"
          />
        </div>

        {/* Child Selector */}
        {children.length > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-600 whitespace-nowrap">الطفل المستهدف:</span>
            <select
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
            >
              {children.map((c) => (
                <option key={c.id} value={c.id}>
                  👦 {c.name} {c.reviewStatus === "accepted" ? "(معتمد)" : c.reviewStatus === "pending" ? "(معلق)" : ""}
                </option>
              ))}
            </select>
          </div>
        )}

      </div>

      {/* Specialists List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400 font-bold flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin text-teal-600" />
            <span>جاري تحميل قائمة الأخصائيين المعتمدين...</span>
          </div>
        ) : filteredSpecialists.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 space-y-2 bg-white rounded-3xl border border-slate-100">
            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto text-2xl">
              🩺
            </div>
            <p className="font-bold text-slate-700">لم يتم العثور على أخصائي نفسي بهذا الاسم أو الرقم</p>
          </div>
        ) : (
          filteredSpecialists.map((spec) => {
            const activeChild = children.find((c) => c.id === selectedChildId);
            const isPending = activeChild?.reviewStatus === "pending";
            const isAccepted = activeChild?.reviewStatus === "accepted";

            return (
              <div
                key={spec.uid}
                className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-700 rounded-2xl flex items-center justify-center text-2xl font-black shadow-sm border border-indigo-100 flex-shrink-0">
                    🩺
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-slate-800">{spec.fullName}</h3>
                    <p className="text-xs text-indigo-600 font-bold flex items-center gap-1">
                      <Sparkles size={12} /> أخصائي نفسي معتمد
                    </p>

                    {spec.username && (
                      <p className="text-xs text-slate-500 font-mono flex items-center gap-1 dir-ltr text-right">
                        <AtSign size={12} className="text-slate-400" />
                        <span>{spec.username}</span>
                      </p>
                    )}

                    {spec.phoneNumber && (
                      <p className="text-xs text-slate-500 font-mono flex items-center gap-1 dir-ltr text-right">
                        <Phone size={12} className="text-slate-400" />
                        <span>{spec.phoneNumber}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  {isAccepted ? (
                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      ✓ أخصائي معتمد لطفلك
                    </span>
                  ) : isPending ? (
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                      ⏳ طلب المراجعة قيد الانتظار
                    </span>
                  ) : (
                    <button
                      onClick={() => handleRequestReview(spec)}
                      disabled={requestingId === spec.uid || !selectedChildId}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {requestingId === spec.uid ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <UserCheck size={16} />
                      )}
                      <span>طلب مراجعة من هذا الأخصائي</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
