"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  setDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { Key, User, Mail, Lock, Sparkles, Loader2 } from "lucide-react";

export default function ParentRegister() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activationKey, setActivationKey] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // 1. Basic Field Validation
    if (!fullName.trim() || !email.trim() || !password.trim() || !activationKey.trim()) {
      setErrorMessage("جميع الحقول مطلوبة، يرجى ملء البيانات بالكامل.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("كلمة المرور يجب أن تتكون من 6 أحرف على الأقل.");
      return;
    }

    try {
      setLoading(true);

      // 2. Query activation_keys collection in Firestore for unused matching key
      const formattedKey = activationKey.trim().toUpperCase();
      const keysRef = collection(db, "activation_keys");
      const q = query(keysRef, where("key", "==", formattedKey), where("isUsed", "==", false));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setErrorMessage("مفتاح التفعيل غير صحيح أو تم استخدامه مسبقاً.");
        setLoading(false);
        return;
      }

      const keyDoc = querySnapshot.docs[0];
      const keyDocId = keyDoc.id;
      const keyData = keyDoc.data();
      const assignedRole = keyData.role || "parent";

      // 3a. Create User with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // 3b. Create User document in `users` collection in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName: fullName.trim(),
        email: email.trim(),
        activationKey: formattedKey,
        role: assignedRole,
        createdAt: serverTimestamp(),
      });

      // 3c. Mark activation key as used in Firestore
      await updateDoc(doc(db, "activation_keys", keyDocId), {
        isUsed: true,
        usedBy: user.uid,
        usedAt: serverTimestamp(),
      });

      // 3d. Set cookie and redirect based on assignedRole
      document.cookie = `user_role=${assignedRole}; path=/; max-age=86400; SameSite=Lax`;

      if (assignedRole === "psychologist") {
        router.push("/psychologist/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.code === "auth/email-already-in-use") {
        setErrorMessage("هذا البريد الإلكتروني مسجل بالفعل.");
      } else if (error.code === "auth/invalid-email") {
        setErrorMessage("صيغة البريد الإلكتروني غير صحيحة.");
      } else {
        setErrorMessage("حدث خطأ أثناء إنشاء الحساب، يرجى المحاولة لاحقاً.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-100 flex flex-col items-center space-y-6">
        
        {/* Header Logo & Title */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="w-16 h-16 bg-teal-100 text-teal-700 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
            🌿
          </div>
          <h1 className="text-3xl font-black text-slate-800">إنشاء حساب ولي الأمر</h1>
          <p className="text-slate-500 font-medium text-sm">
            انضم إلى منصة بستان العلاجية وفعّل اشتراك طفلك
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="w-full bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-2xl text-sm font-bold text-center animate-in fade-in zoom-in duration-300">
            {errorMessage}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="w-full space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User size={16} className="text-teal-600" />
              <span>الاسم الكامل</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="مثال: أحمد محمد"
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-teal-500 focus:outline-none transition-colors font-medium text-slate-800 bg-slate-50/50"
            />
          </div>

          {/* Email */}
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

          {/* Password */}
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

          {/* Activation Key */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Key size={16} className="text-teal-600" />
              <span>مفتاح التفعيل (Activation Key)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={activationKey}
                onChange={(e) => setActivationKey(e.target.value)}
                placeholder="BUSTAN-XXXX-XXXX"
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-teal-200 focus:border-teal-500 focus:outline-none transition-colors font-mono font-bold text-teal-800 bg-teal-50/40 tracking-wider uppercase"
                dir="ltr"
              />
            </div>
            <span className="text-xs text-slate-400 font-medium mt-1 block">
              أدخل المفتاح الممنوح لك من قبل الإدارة لتفعيل الاشتراك.
            </span>
          </div>

          {/* Submit Button */}
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
                <span>جاري إنشاء الحساب والتفعيل...</span>
              </>
            ) : (
              <>
                <Sparkles size={20} />
                <span>إنشاء الحساب وتفعيل الاشتراك</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Login Link */}
        <div className="pt-2 text-center text-sm font-semibold text-slate-500">
          هل لديك حساب بالفعل؟{" "}
          <Link href="/login" className="text-teal-600 font-bold hover:underline">
            سجل دخولك
          </Link>
        </div>

      </div>
    </div>
  );
}
