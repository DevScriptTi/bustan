"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Mail, Lock, LogIn, ArrowRight, Loader2 } from "lucide-react";

export default function ParentLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password.trim()) {
      setErrorMessage("يرجى إدخال البريد الإلكتروني وكلمة المرور.");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.push("/dashboard");
    } catch (error: any) {
      // Handle Firebase auth errors gracefully without triggering overlay issues
      const errorCode = error?.code || "";
      if (
        errorCode === "auth/invalid-credential" ||
        errorCode === "auth/user-not-found" ||
        errorCode === "auth/wrong-password" ||
        errorCode === "auth/invalid-password"
      ) {
        setErrorMessage("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
      } else if (errorCode === "auth/invalid-email") {
        setErrorMessage("صيغة البريد الإلكتروني غير صحيحة.");
      } else if (errorCode === "auth/too-many-requests") {
        setErrorMessage("تم محاولة الدخول بشكل مكثف، يرجى المحاولة بعد قليل.");
      } else {
        setErrorMessage("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans relative" dir="rtl">
      
      {/* Back to Home Link */}
      <Link
        href="/"
        className="absolute top-6 right-6 text-sm font-bold text-slate-500 hover:text-teal-600 transition-colors flex items-center gap-1.5 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm"
      >
        <ArrowRight size={16} />
        <span>العودة للرئيسية</span>
      </Link>

      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-100 flex flex-col items-center space-y-6">
        
        {/* Header Logo & Title */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="w-16 h-16 bg-teal-100 text-teal-700 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
            🌿
          </div>
          <h1 className="text-3xl font-black text-slate-800">تسجيل الدخول</h1>
          <p className="text-slate-500 font-medium text-sm">
            مرحباً بعودتك إلى منصة بستان العلاجية
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="w-full bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-2xl text-sm font-bold text-center animate-in fade-in zoom-in duration-300">
            {errorMessage}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Mail size={16} className="text-teal-600" />
              <span>البريد الإلكتروني</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-teal-500 focus:outline-none transition-colors font-medium text-slate-800 bg-slate-50/50"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Lock size={16} className="text-teal-600" />
              <span>كلمة المرور</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-teal-500 focus:outline-none transition-colors font-medium text-slate-800 bg-slate-50/50"
              dir="ltr"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-black text-lg rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer mt-4 flex items-center justify-center gap-2 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>جاري تسجيل الدخول...</span>
              </>
            ) : (
              <>
                <LogIn size={20} />
                <span>تسجيل الدخول</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Register Link */}
        <div className="pt-2 text-center text-sm font-semibold text-slate-500">
          ليس لديك حساب؟{" "}
          <Link href="/register" className="text-teal-600 font-bold hover:underline">
            سجل الآن وفعّل اشتراكك
          </Link>
        </div>

      </div>
    </div>
  );
}
