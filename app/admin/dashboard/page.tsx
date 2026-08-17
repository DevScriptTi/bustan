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
import { Trash2, Key, Plus, RefreshCw, User, Copy, Check } from "lucide-react";

interface UserInfo {
  fullName: string;
  email: string;
}

interface ActivationKey {
  id: string;
  key: string;
  isUsed: boolean;
  createdAt: any;
  usedBy?: string;
  userInfo?: UserInfo | null;
}

export default function AdminDashboard() {
  const [keys, setKeys]               = useState<ActivationKey[]>([]);
  const [loading, setLoading]         = useState(true);
  const [generating, setGenerating]   = useState(false);
  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<string | null>(null);
  const [copiedId, setCopiedId]       = useState<string | null>(null);
  const [deletingId, setDeletingId]   = useState<string | null>(null);

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
    return d.toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
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
            } catch { /* ignore */ }
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

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  /* ── Generate key ── */
  const handleGenerateKey = async () => {
    setGenerating(true);
    try {
      const keyString = generateRandomKeyString();
      await addDoc(collection(db, "activation_keys"), {
        key: keyString,
        isUsed: false,
        createdAt: serverTimestamp(),
      });
      setNewlyGeneratedKey(keyString);
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
      if (newlyGeneratedKey === keyItem.key) setNewlyGeneratedKey(null);
    } catch (error) {
      console.error("Error deleting key:", error);
      alert("حدث خطأ أثناء حذف المفتاح. تأكد من قواعد أمان Firebase (Security Rules).");
    } finally {
      setDeletingId(null);
    }
  };

  const available = keys.filter((k) => !k.isUsed).length;
  const used      = keys.filter((k) =>  k.isUsed).length;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">

      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <Key className="text-indigo-500" size={28} />
            لوحة التحكم — مفاتيح التفعيل
          </h1>
          <p className="text-slate-500 font-medium mt-1">إنشاء وإدارة وحذف مفاتيح تفعيل منصة بستان</p>
        </div>

        <button
          onClick={handleGenerateKey}
          disabled={generating}
          className={`flex items-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg transition-all cursor-pointer active:scale-95 text-lg ${generating ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          <Plus size={20} />
          <span>{generating ? "جاري الإنشاء..." : "إنشاء مفتاح جديد"}</span>
        </button>
      </div>

      {/* ─── New Key Banner ─── */}
      {newlyGeneratedKey && (
        <div className="bg-emerald-50 border-2 border-emerald-300 p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in zoom-in duration-300">
          <div className="flex items-center gap-4">
            <span className="text-4xl">🎉</span>
            <div>
              <p className="font-bold text-emerald-900">تم إنشاء المفتاح بنجاح!</p>
              <p className="text-2xl font-black text-emerald-700 font-mono tracking-wider mt-0.5" dir="ltr">{newlyGeneratedKey}</p>
            </div>
          </div>
          <button
            onClick={() => { navigator.clipboard.writeText(newlyGeneratedKey); }}
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
          { label: "المفاتيح المتاحة", value: available,  emoji: "✅", bg: "bg-emerald-50" },
          { label: "المفاتيح المستعملة", value: used,     emoji: "🔒", bg: "bg-amber-50" },
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
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <th className="py-4 px-5">المفتاح</th>
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
                      <span className="font-mono font-bold text-slate-800 text-base tracking-wider" dir="ltr">{k.key}</span>
                    </td>

                    {/* Status badge */}
                    <td className="py-4 px-5">
                      {k.isUsed ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          🔒 مستعمل
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
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
                            <p className="text-slate-400 text-xs leading-tight" dir="ltr">{k.userInfo.email}</p>
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
                          {copiedId === k.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(k)}
                          disabled={deletingId === k.id}
                          className={`p-2 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 rounded-lg transition-colors cursor-pointer ${deletingId === k.id ? "opacity-50 cursor-not-allowed" : ""}`}
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

    </div>
  );
}
