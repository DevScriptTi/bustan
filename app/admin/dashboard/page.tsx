"use client";

import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  doc,
  deleteDoc,
  getDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import {
  Trash2,
  Key,
  Plus,
  RefreshCw,
  User,
  Copy,
  Check,
  Stethoscope,
  ShieldCheck,
  X,
  Sparkles,
  Loader2,
} from "lucide-react";

interface UserInfo {
  fullName: string;
  email: string;
}

interface ActivationKey {
  id: string;
  key: string;
  isUsed: boolean;
  role?: "parent" | "psychologist";
  createdAt: any;
  usedBy?: string;
  userInfo?: UserInfo | null;
}

export default function AdminDashboard() {
  const [keys, setKeys] = useState<ActivationKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"parent" | "psychologist">("parent");
  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<{ key: string; role: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /* ── Helpers ── */
  const generateRandomKeyString = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const seg = (n: number) =>
      Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    return `BUSTAN-${seg(4)}-${seg(4)}`;
  };

  const formatDate = (ts: any) => {
    if (!ts) return "الآن";
    const d = ts instanceof Timestamp ? ts.toDate() : ts.seconds ? new Date(ts.seconds * 1000) : null;
    if (!d) return "—";
    return d.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* ── Fetch keys (+ user info for used keys) ── */
  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "activation_keys"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);

      const raw: ActivationKey[] = snap.docs.map((d) => ({
        id: d.id,
        key: d.data().key,
        isUsed: d.data().isUsed ?? false,
        role: d.data().role || "parent",
        createdAt: d.data().createdAt,
        usedBy: d.data().usedBy,
      }));

      // Resolve user info for used keys in parallel
      const enriched = await Promise.all(
        raw.map(async (k) => {
          if (k.isUsed && k.usedBy) {
            try {
              const userSnap = await getDoc(doc(db, "users", k.usedBy));
              if (userSnap.exists()) {
                const data = userSnap.data();
                return { ...k, userInfo: { fullName: data.fullName, email: data.email } };
              }
            } catch {
              /* ignore */
            }
          }
          return { ...k, userInfo: null };
        })
      );

      setKeys(enriched);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  /* ── Generate key with selected role ── */
  const handleGenerateKey = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setGenerating(true);
    try {
      const keyString = generateRandomKeyString();
      await addDoc(collection(db, "activation_keys"), {
        key: keyString,
        isUsed: false,
        role: selectedRole,
        createdAt: serverTimestamp(),
      });

      setNewlyGeneratedKey({ key: keyString, role: selectedRole });
      setIsModalOpen(false);
      await fetchKeys();
    } catch (error) {
      console.error("Error creating key:", error);
      alert("حدث خطأ أثناء إنشاء المفتاح. تأكد من قواعد أمان Firebase (Security Rules).");
    } finally {
      setGenerating(false);
    }
  };

  /* ── Copy ── */
  const copyKey = (keyText: string, id: string) => {
    navigator.clipboard.writeText(keyText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  /* ── Delete ── */
  const handleDelete = async (keyItem: ActivationKey) => {
    const confirmed = window.confirm(
      `هل أنت متأكد من حذف المفتاح:\n${keyItem.key}؟\nهذا الإجراء لا يمكن التراجع عنه.`
    );
    if (!confirmed) return;
    setDeletingId(keyItem.id);
    try {
      await deleteDoc(doc(db, "activation_keys", keyItem.id));
      setKeys((prev) => prev.filter((k) => k.id !== keyItem.id));
      if (newlyGeneratedKey?.key === keyItem.key) setNewlyGeneratedKey(null);
    } catch (error) {
      console.error("Error deleting key:", error);
      alert("حدث خطأ أثناء حذف المفتاح. تأكد من قواعد أمان Firebase (Security Rules).");
    } finally {
      setDeletingId(null);
    }
  };

  const available = keys.filter((k) => !k.isUsed).length;
  const used = keys.filter((k) => k.isUsed).length;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 dir-rtl" dir="rtl">
      
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <Key className="text-indigo-500" size={28} />
            لوحة التحكم — مفاتيح التفعيل
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            إنشاء وإدارة وحذف مفاتيح التفعيل المخصصة لأولياء الأمور والأخصائيين النفسيين
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg transition-all cursor-pointer active:scale-95 text-base sm:text-lg"
        >
          <Plus size={20} />
          <span>إنشاء مفتاح جديد</span>
        </button>
      </div>

      {/* ─── New Key Banner ─── */}
      {newlyGeneratedKey && (
        <div className="bg-emerald-50 border-2 border-emerald-300 p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in zoom-in duration-300">
          <div className="flex items-center gap-4">
            <span className="text-4xl">🎉</span>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-emerald-900">تم إنشاء المفتاح بنجاح!</p>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-black ${
                  newlyGeneratedKey.role === "psychologist" 
                    ? "bg-indigo-200 text-indigo-900 border border-indigo-300"
                    : "bg-emerald-200 text-emerald-900 border border-emerald-300"
                }`}>
                  {newlyGeneratedKey.role === "psychologist" ? "🩺 أخصائي نفسي" : "👤 ولي أمر"}
                </span>
              </div>
              <p className="text-2xl font-black text-emerald-700 font-mono tracking-wider mt-0.5" dir="ltr">
                {newlyGeneratedKey.key}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(newlyGeneratedKey.key);
            }}
            className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow cursor-pointer transition-all"
          >
            <Copy size={16} />
            <span>نسخ المفتاح</span>
          </button>
        </div>
      )}

      {/* ─── Stats ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { label: "إجمالي المفاتيح", value: keys.length, emoji: "🗝️", bg: "bg-slate-50" },
          { label: "المفاتيح المتاحة", value: available, emoji: "✅", bg: "bg-emerald-50" },
          { label: "المفاتيح المستعملة", value: used, emoji: "🔒", bg: "bg-amber-50" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between`}>
            <div>
              <p className="text-slate-500 font-bold text-sm">{s.label}</p>
              <h4 className="text-3xl font-black text-slate-800 mt-1">{s.value}</h4>
            </div>
            <span className="text-4xl">{s.emoji}</span>
          </div>
        ))}
      </div>

      {/* ─── Keys Table ─── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800">قائمة مفاتيح التفعيل</h3>
          <button
            onClick={fetchKeys}
            className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-xl transition-colors border border-indigo-100"
          >
            <RefreshCw size={14} />
            <span>تحديث</span>
          </button>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-400 font-bold text-lg">جاري تحميل المفاتيح...</div>
        ) : keys.length === 0 ? (
          <div className="p-16 text-center text-slate-400 font-bold">
            لا توجد مفاتيح بعد. اضغط "إنشاء مفتاح جديد" للبدء.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-xs">
                  <th className="py-4 px-5">المفتاح</th>
                  <th className="py-4 px-5">الدور المخصص</th>
                  <th className="py-4 px-5">الحالة</th>
                  <th className="py-4 px-5">بيانات المستخدم</th>
                  <th className="py-4 px-5">تاريخ الإنشاء</th>
                  <th className="py-4 px-5 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50/60 transition-colors">
                    
                    {/* Key string */}
                    <td className="py-4 px-5">
                      <span className="font-mono font-bold text-slate-800 text-base tracking-wider" dir="ltr">
                        {k.key}
                      </span>
                    </td>

                    {/* Assigned Role Badge */}
                    <td className="py-4 px-5">
                      {k.role === "psychologist" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-300 shadow-sm">
                          <Stethoscope size={12} /> أخصائي نفسي
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm">
                          <User size={12} /> ولي أمر
                        </span>
                      )}
                    </td>

                    {/* Status badge */}
                    <td className="py-4 px-5">
                      {k.isUsed ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          🔒 مستعمل
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-300">
                          🟢 متاح
                        </span>
                      )}
                    </td>

                    {/* User info */}
                    <td className="py-4 px-5">
                      {k.isUsed && k.userInfo ? (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <User size={14} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 leading-tight">{k.userInfo.fullName}</p>
                            <p className="text-slate-400 text-xs leading-tight dir-ltr text-right" dir="ltr">
                              {k.userInfo.email}
                            </p>
                          </div>
                        </div>
                      ) : k.isUsed ? (
                        <span className="text-slate-400 font-medium text-xs">جاري التحميل...</span>
                      ) : (
                        <span className="text-slate-300 font-medium">—</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-5 text-slate-400 font-medium whitespace-nowrap">
                      {formatDate(k.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-center gap-2">
                        {/* Copy */}
                        <button
                          onClick={() => copyKey(k.key, k.id)}
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
                          title="نسخ المفتاح"
                        >
                          {copiedId === k.id ? (
                            <Check size={14} className="text-emerald-600" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(k)}
                          disabled={deletingId === k.id}
                          className={`p-2 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 rounded-lg transition-colors cursor-pointer ${
                            deletingId === k.id ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          title="حذف المفتاح"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Create Key Role Selector Modal ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in" dir="rtl">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl relative border border-slate-100">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                🗝️
              </div>
              <h3 className="text-2xl font-black text-slate-800">إنشاء مفتاح تفعيل جديد</h3>
              <p className="text-slate-500 font-medium text-xs">
                اختر نوع الحساب والدور المخصص لمفتاح التفعيل قبل توليده
              </p>
            </div>

            <form onSubmit={handleGenerateKey} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  حدد الدور المخصص للحساب:
                </label>

                {/* Role Option 1: Parent */}
                <label
                  onClick={() => setSelectedRole("parent")}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedRole === "parent"
                      ? "border-emerald-500 bg-emerald-50/50 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 bg-slate-50/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="roleOption"
                    checked={selectedRole === "parent"}
                    onChange={() => setSelectedRole("parent")}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex items-center gap-2.5 flex-1">
                    <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold text-base">
                      👤
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">ولي أمر (Parent)</p>
                      <p className="text-slate-400 text-xs font-medium">حساب مخصص للوالدين لمتابعة وتدريب أطفالهم</p>
                    </div>
                  </div>
                </label>

                {/* Role Option 2: Psychologist */}
                <label
                  onClick={() => setSelectedRole("psychologist")}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedRole === "psychologist"
                      ? "border-indigo-500 bg-indigo-50/50 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 bg-slate-50/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="roleOption"
                    checked={selectedRole === "psychologist"}
                    onChange={() => setSelectedRole("psychologist")}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex items-center gap-2.5 flex-1">
                    <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-bold text-base">
                      🩺
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">أخصائي نفسي (Psychologist)</p>
                      <p className="text-slate-400 text-xs font-medium">حساب سريري لمتابعة سجلات جميع المرضى وتوجيههم</p>
                    </div>
                  </div>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  disabled={generating}
                  className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {generating ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>جاري التوليد...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      <span>توليد المفتاح الآن</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all cursor-pointer text-sm"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
