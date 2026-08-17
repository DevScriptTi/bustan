"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const ADMIN_EMAIL = "admin@bustan.com";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else {
        const isAdmin = user.email === ADMIN_EMAIL;
        const isAdminRoute = pathname.startsWith("/admin");

        if (isAdmin && !isAdminRoute) {
          router.replace("/admin/dashboard");
        } else if (!isAdmin && isAdminRoute) {
          router.replace("/dashboard");
        }
      }
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-sans" dir="rtl">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-600 font-bold text-sm">جاري التحقق من الحساب...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isAdmin = user.email === ADMIN_EMAIL;
  const isAdminRoute = pathname.startsWith("/admin");
  if ((isAdmin && !isAdminRoute) || (!isAdmin && isAdminRoute)) {
    return null;
  }

  return <>{children}</>;
}

