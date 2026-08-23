"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  Users,
  FileText,
  BrainCircuit,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Loader2,
  Stethoscope,
  ChevronLeft,
  Activity,
  Sun,
  Moon,
  Settings,
} from "lucide-react";
import { auth } from "@/lib/firebase";

export default function PsychologistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userRole, userData, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (userRole && userRole !== "psychologist" && userRole !== "admin") {
        router.push("/dashboard");
      }
    }
  }, [user, userRole, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-slate-200 dir-rtl" dir="rtl">
        <div className="w-16 h-16 bg-indigo-600/20 text-indigo-400 rounded-3xl flex items-center justify-center mb-4 animate-bounce">
          <Stethoscope size={32} />
        </div>
        <Loader2 size={24} className="animate-spin text-indigo-500 mb-2" />
        <p className="text-sm font-bold">جاري التحقق من صلاحيات الأخصائي النفسي...</p>
      </div>
    );
  }

  if (!user || (userRole && userRole !== "psychologist" && userRole !== "admin")) {
    return null;
  }

  const navItems = [
    {
      name: "لوحة التحكم السريرية",
      href: "/psychologist/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "إعدادات الحساب والمعرف",
      href: "/psychologist/settings",
      icon: Settings,
    },
    {
      name: "توجيهات الذكاء الاصطناعي",
      href: "/psychologist/dashboard#ai-insights",
      icon: BrainCircuit,
    },
  ];

  return (
    <div
      className={`min-h-screen flex flex-col font-sans dir-rtl transition-colors duration-300 ${
        isDarkTheme ? "bg-slate-950 text-slate-100 dark" : "bg-slate-50 text-slate-900 light"
      }`}
      dir="rtl"
    >
      {/* Top Clinical Header */}
      <header
        className={`backdrop-blur-md border-b sticky top-0 z-40 transition-colors ${
          isDarkTheme
            ? "bg-slate-900/80 border-slate-800"
            : "bg-white/80 border-slate-200 shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-indigo-600/30">
              <Stethoscope size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-black text-lg ${isDarkTheme ? "text-white" : "text-slate-800"}`}>
                  منصة بستان السريرية
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                    isDarkTheme
                      ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                      : "bg-indigo-50 text-indigo-700 border-indigo-200"
                  }`}
                >
                  <ShieldCheck size={10} /> بوابة الأخصائي النفسي
                </span>
              </div>
              <p className={`text-[11px] font-medium ${isDarkTheme ? "text-slate-400" : "text-slate-500"}`}>
                متابعة وتقييم المناعة النفسية والسلوك للأطفال
              </p>
            </div>
          </div>

          {/* Controls: Theme Toggle, User Badge & Logout */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Theme Toggle Button */}
            <button
              onClick={() => setIsDarkTheme((prev) => !prev)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer text-xs flex items-center gap-1.5 ${
                isDarkTheme
                  ? "bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-700"
                  : "bg-slate-100 text-indigo-700 border-slate-200 hover:bg-slate-200"
              }`}
              title={isDarkTheme ? "تفعيل المظهر الفاتح" : "تفعيل المظهر الداكن"}
            >
              {isDarkTheme ? <Sun size={16} /> : <Moon size={16} />}
              <span className="hidden sm:inline font-bold">
                {isDarkTheme ? "فاتح" : "داكن"}
              </span>
            </button>

            <div
              className={`hidden sm:flex items-center gap-3 px-3.5 py-1.5 rounded-2xl border ${
                isDarkTheme
                  ? "bg-slate-800/60 border-slate-700/60"
                  : "bg-slate-100 border-slate-200"
              }`}
            >
              <div className="w-8 h-8 bg-indigo-900/60 text-indigo-300 rounded-xl flex items-center justify-center font-bold text-xs">
                🩺
              </div>
              <div className="text-right">
                <p className={`text-xs font-bold ${isDarkTheme ? "text-slate-200" : "text-slate-800"}`}>
                  {userData?.fullName || user.displayName || "د. الأخصائي النفسي"}
                </p>
                <p className="text-[10px] text-indigo-500 font-bold">أخصائي نفسي معتمد</p>
              </div>
            </div>

            <button
              onClick={() => auth.signOut().then(() => router.push("/login"))}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer text-xs flex items-center gap-1.5 ${
                isDarkTheme
                  ? "bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border-slate-700 hover:border-rose-800"
                  : "bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border-slate-200 hover:border-rose-300"
              }`}
              title="تسجيل الخروج"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline font-bold">خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Clinical Sidebar Navigation */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
          <div
            className={`border rounded-3xl p-4 shadow-xl transition-colors ${
              isDarkTheme
                ? "bg-slate-900/90 border-slate-800"
                : "bg-white border-slate-200"
            }`}
          >
            <p className={`text-xs font-bold px-3 mb-3 uppercase tracking-wider ${isDarkTheme ? "text-slate-400" : "text-slate-500"}`}>
              القائمة السريرية
            </p>

            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-black"
                        : isDarkTheme
                        ? "text-slate-400 hover:bg-slate-800/80 hover:text-slate-200"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon size={18} className={isActive ? "text-white" : isDarkTheme ? "text-slate-400" : "text-slate-500"} />
                    <span className="flex-1">{item.name}</span>
                    {isActive && <ChevronLeft size={14} className="text-white/60" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Quick AI Advisor Card */}
          <div
            className={`border p-5 rounded-3xl space-y-3 ${
              isDarkTheme
                ? "bg-gradient-to-br from-slate-900 to-indigo-950/60 border-indigo-900/40"
                : "bg-gradient-to-br from-indigo-50 to-slate-50 border-indigo-200"
            }`}
          >
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <BrainCircuit size={20} />
              <h4 className={`font-black text-sm ${isDarkTheme ? "text-slate-200" : "text-slate-800"}`}>
                تحليلات د. بستان 🤖
              </h4>
            </div>
            <p className={`text-xs leading-relaxed font-medium ${isDarkTheme ? "text-slate-400" : "text-slate-600"}`}>
              تصلك التحديثات والملخصات السريرية تلقائياً بعد كل جلسة ينهيها الوالدان مع المستشار الذكي.
            </p>
            <div className="pt-1 flex items-center gap-2 text-[11px] text-indigo-600 dark:text-indigo-300 font-bold">
              <Activity size={14} className="animate-pulse text-indigo-500" />
              <span>النظام متصل ويعالج البيانات الحية</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
