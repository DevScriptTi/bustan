"use client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { LayoutDashboard, Settings, LogOut, ShieldCheck } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";

const navLinks = [
  { href: "/admin/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/admin/settings",  label: "إعدادات المنصة", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 font-sans" dir="rtl">

        {/* ─── Top App Bar ─── */}
        <header className="fixed top-0 inset-x-0 z-50 bg-white border-b border-slate-200 shadow-sm h-16 flex items-center px-4 sm:px-8">
          <div className="flex items-center justify-between w-full">

            {/* Logo */}
            <Link href="/admin/dashboard" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-indigo-200 transition-colors">
                <ShieldCheck size={18} />
              </div>
              <div className="text-xl font-black tracking-tight">
                <span className="text-slate-800">إدارة </span>
                <span className="text-indigo-600">بستان</span>
              </div>
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold px-4 py-2 rounded-xl text-sm transition-colors cursor-pointer border border-red-100 active:scale-95"
            >
              <LogOut size={15} />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </header>

        {/* ─── Body: Sidebar + Content ─── */}
        <div className="flex pt-16 min-h-screen">

          {/* Sidebar */}
          <aside className="fixed top-16 bottom-0 w-60 bg-white border-l border-slate-200 shadow-sm py-6 px-3 flex flex-col gap-1.5 overflow-y-auto">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-base transition-all group ${
                  isActive(href)
                    ? "bg-indigo-100 text-indigo-900 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon size={20} className={isActive(href) ? "text-indigo-700" : "text-slate-400 group-hover:text-slate-600"} />
                <span>{label}</span>
              </Link>
            ))}
          </aside>

          {/* Page Content */}
          <main className="flex-1 mr-60 p-6 sm:p-10 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}

