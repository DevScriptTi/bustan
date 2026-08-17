"use client";

import AuthGuard from "@/components/AuthGuard";
import MainNavbar from "@/components/MainNavbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-100 font-sans" dir="rtl">
        {/* Global Main Navbar */}
        <MainNavbar />

        {/* Full-Width Centered Content */}
        <main className="min-h-screen flex flex-col items-center">
          <div className="w-full max-w-5xl px-4 sm:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
