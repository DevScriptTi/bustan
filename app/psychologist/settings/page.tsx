"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { User, Phone, AtSign, Save, Loader2, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";

export default function PsychologistSettingsPage() {
  const { user, userData } = useAuth();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (userData) {
      setFullName(userData.fullName || "");
      setUsername(userData.username || "");
      setPhoneNumber(userData.phoneNumber || "");
    }
  }, [userData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!user) return;

    setLoading(true);
    try {
      const res = await fetch("/api/psychologist/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          fullName: fullName.trim(),
          username: username.trim(),
          phoneNumber: phoneNumber.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "حدث خطأ أثناء حفظ البيانات.");
      } else {
        setSuccessMessage("تم تحديث بيانات الملف الشخصي بنجاح ✨");
      }
    } catch (err) {
      console.error("Error submitting settings form:", err);
      setErrorMessage("حدث خطأ في الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 dir-rtl" dir="rtl">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="flex items-center gap-3 text-indigo-400 font-bold text-xs mb-1">
          <ShieldCheck size={16} />
          <span>إعدادات الحساب والتعريف السريري</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">إعدادات الأخصائي النفسي ⚙️</h1>
        <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
          تعديل اسم المستخدم المعرف ورقم الهاتف لتمكين أولياء الأمور من البحث عنك والوصول لملفك.
        </p>
      </div>

      {/* Main Settings Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        
        {/* Alerts */}
        {successMessage && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Full Name */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
              <User size={16} className="text-indigo-400" />
              <span>الاسم الكامل واللقب المهني</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="د. محمد العمري"
              className="w-full px-4 py-3.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-2xl text-xs sm:text-sm font-bold text-slate-200"
            />
          </div>

          {/* Unique Username */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-300 mb-1 flex items-center gap-2">
              <AtSign size={16} className="text-indigo-400" />
              <span>اسم المستخدم المعرف (Username)</span>
            </label>
            <p className="text-[11px] text-slate-400 mb-2">
              اسم فريد يستطيع أولياء الأمور البحث عنك بواستطه في المنصة (مثال: dr_omari).
            </p>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-xs text-slate-500 font-mono">@</span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="dr_omari"
                className="w-full pl-8 pr-4 py-3.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-2xl text-xs sm:text-sm font-bold text-slate-200 font-mono dir-ltr text-right"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-300 mb-1 flex items-center gap-2">
              <Phone size={16} className="text-indigo-400" />
              <span>رقم الهاتف الخاص بالتواصل السريري</span>
            </label>
            <p className="text-[11px] text-slate-400 mb-2">
              يمكن لأولياء الأمور استخدام هذا الرقم للبحث عن حسابك المعتمد.
            </p>
            <input
              type="tel"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+966500000000"
              className="w-full px-4 py-3.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-2xl text-xs sm:text-sm font-bold text-slate-200 dir-ltr text-right font-mono"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm sm:text-base rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>جاري التحقق والحفظ...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>حفظ التغييرات والتأكيد</span>
              </>
            )}
          </button>

        </form>

      </div>

    </div>
  );
}
