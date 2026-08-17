"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useBustanSounds } from "@/hooks/useBustanSounds";
import { BookOpen, LogOut, User, Sparkles } from "lucide-react";

export default function MainNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { playClick } = useBustanSounds();

  const handleLogout = async () => {
    try {
      playClick();
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navLinks = [
    { name: "الأنظمة العلاجية", href: "/dashboard", icon: "🧠" },
    { name: "نتعلم مع القصص", href: "/kindergarten", icon: "📖" },
    { name: "إرشادات الأولياء", href: "/parents-guide", icon: "📖" },
  ];

  const isLinkActive = (href: string) => {
    if (href === "/dashboard") {
      return (
        pathname === "/dashboard" ||
        pathname.startsWith("/therapy") ||
        pathname.startsWith("/assessment")
      );
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm w-full" dir="rtl">
      <div className="flex items-center justify-between w-full max-w-6xl mx-auto px-4 sm:px-8 py-3">
        
        {/* Right Section: Logo */}
        <Link
          href="/dashboard"
          onClick={() => playClick()}
          className="flex items-center gap-2.5 group flex-shrink-0"
        >
          <div className="w-10 h-10 bg-teal-100 text-teal-700 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-teal-200 transition-colors">
            <BookOpen size={20} />
          </div>
          <div className="text-xl sm:text-2xl font-black tracking-tight">
            <span className="text-slate-800">منصة </span>
            <span className="text-teal-600">بستان</span>
          </div>
        </Link>

        {/* Middle Section: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-full border border-slate-200/80">
          {navLinks.map((link) => {
            const active = isLinkActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => playClick()}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all select-none cursor-pointer ${
                  active
                    ? "bg-teal-600 text-white font-black shadow-md scale-102"
                    : "text-slate-600 font-bold hover:text-teal-700 hover:bg-white/80"
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Left Section: User Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="hidden lg:flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-xl text-slate-700 text-xs sm:text-sm font-bold border border-slate-200">
            <User size={15} className="text-teal-600" />
            <span>ولي الأمر</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold px-3.5 py-2 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer border border-red-100 active:scale-95"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">تسجيل الخروج</span>
          </button>
        </div>

      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-100 bg-slate-50 py-2 px-2">
        {navLinks.map((link) => {
          const active = isLinkActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => playClick()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                active
                  ? "bg-teal-600 text-white shadow-sm font-black"
                  : "text-slate-600 hover:bg-slate-200/60"
              }`}
            >
              <span>{link.icon}</span>
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
