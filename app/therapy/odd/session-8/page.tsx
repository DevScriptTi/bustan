"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OddSession8Redirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/therapy/odd/session-7");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-bold text-slate-600" dir="rtl">
      جاري التوجيه إلى الحصة النهائية... 🚀
    </div>
  );
}
