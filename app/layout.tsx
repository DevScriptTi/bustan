import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "منصة بستان - لعلاج وتنمية مهارات الأطفال",
  description: "منصة متخصصة في علاج وتقييم الصحة النفسية للأطفال، التركيز على الذاكرة واضطراب التحدي المعارض (ODD).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-sky-50/40 text-gray-800">
        {children}
      </body>
    </html>
  );
}

