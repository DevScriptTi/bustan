import Link from "next/link";
import { ReactNode } from "react";

export default function TherapyLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" dir="rtl">
      {/* Global Therapy Header */}
      <header className="w-full bg-white shadow-sm border-b py-4 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 bg-teal-100 text-teal-700 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0 1 18 18.75c1.68 0 3.282.515 4.75 1.408.6.366 1.35-.067 1.35-.77V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103z" />
            </svg>
          </div>
          <div className="text-2xl font-extrabold flex gap-1">
            <span className="text-slate-800">منصة</span>
            <span className="text-teal-600">بستان</span>
          </div>
        </div>
        <Link
          className="px-4 py-2 bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-600 rounded-lg flex items-center gap-2 transition-colors font-medium"
          href="/dashboard"
        >
          <span>🏠 خروج للرئيسية</span>
        </Link>
      </header>

      {/* Module Stepper + Session Content */}
      <div className="flex-grow flex flex-col">
        {children}
      </div>
    </div>
  );
}
