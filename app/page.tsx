import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col" dir="rtl">
      
      {/* Top Header Navigation */}
      <header className="w-full bg-white border-b border-slate-100 py-4 px-4 sm:px-8 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-teal-100 text-teal-700 rounded-xl flex items-center justify-center text-xl shadow-sm">
              🌿
            </div>
            <div className="text-xl font-black tracking-tight">
              <span className="text-slate-800">منصة </span>
              <span className="text-teal-600">بستان</span>
            </div>
          </Link>

          {/* Nav Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2.5 text-slate-700 hover:text-teal-700 font-bold rounded-xl transition-colors text-sm sm:text-base"
            >
              تسجيل الدخول
            </Link>

            <Link
              href="/register"
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold rounded-xl shadow-md transition-all text-sm sm:text-base flex items-center gap-1.5"
            >
              <span>تفعيل الحساب</span>
              <span>✨</span>
            </Link>
          </div>

        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 space-y-20 py-12 px-4 sm:px-8">

        {/* Hero Section */}
        <section className="max-w-5xl mx-auto text-center space-y-8 pt-8">
          
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-800 px-4 py-2 rounded-full font-bold text-xs sm:text-sm shadow-sm animate-in fade-in zoom-in duration-300">
            <span>🌟</span>
            <span>المنصة الأولى المخصصة للعلاج السلوكي والمعرفي للأطفال</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 leading-tight max-w-4xl mx-auto">
            منصة بستان - نحو تربية واعية وسلوك إيجابي للأطفال
          </h1>

          <p className="text-lg sm:text-2xl text-slate-600 font-medium max-w-3xl mx-auto leading-relaxed">
            منصتك الآمنة لتقييم وعلاج مهارات الذاكرة والسلوك لدى أطفالكم بطريقة تفاعلية وممتعة قائمة على أسس علمية ونفسية مدروسة.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-black text-xl rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <span>تفعيل الحساب والانضمام</span>
              <span>✨</span>
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-100 active:scale-95 text-slate-800 font-bold text-xl rounded-2xl border-2 border-slate-200 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>تسجيل الدخول</span>
              <span>➡️</span>
            </Link>
          </div>

        </section>

        {/* Features / Programs Section */}
        <section className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800">برامجنا التفاعلية والمميزات</h2>
            <p className="text-slate-500 font-bold text-lg max-w-xl mx-auto">
              مصممة بعناية لتوفير بيئة تعليمية وعلاجية آمنة ومحفزة للطفل
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-3xl border-2 border-indigo-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                  🌋
                </div>
                <h3 className="text-xl font-bold text-slate-800">برنامج تعديل السلوك (ODD)</h3>
                <p className="text-slate-600 text-sm font-medium leading-relaxed">
                  8 حصص تفاعلية مدروسة علمياً لمساعدة الطفل على التحكم في الغضب والتعبير عن مشاعره بحكمة.
                </p>
              </div>
              <span className="text-xs font-black text-indigo-600 bg-indigo-50 py-1.5 px-3 rounded-full self-start">
                8 حصص علاجية
              </span>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-3xl border-2 border-teal-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                  🧠
                </div>
                <h3 className="text-xl font-bold text-slate-800">ألعاب الذاكرة والتركيز</h3>
                <p className="text-slate-600 text-sm font-medium leading-relaxed">
                  تمارين إدراكية ممتعة لتنشيط الذاكرة البصرية والسمعية وزيادة معدل الانتباه لدى الطفل.
                </p>
              </div>
              <span className="text-xs font-black text-teal-600 bg-teal-50 py-1.5 px-3 rounded-full self-start">
                11 حصة تدريبية
              </span>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 rounded-3xl border-2 border-amber-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                  ⭐
                </div>
                <h3 className="text-xl font-bold text-slate-800">لوحة النجوم والتعزيز</h3>
                <p className="text-slate-600 text-sm font-medium leading-relaxed">
                  نظام مكافآت متكامل (Token Economy) يتيح للأم تشجيع الطفل على السلوكيات الإيجابية اليومية.
                </p>
              </div>
              <span className="text-xs font-black text-amber-700 bg-amber-50 py-1.5 px-3 rounded-full self-start">
                تفاعل يومي للأم
              </span>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-8 rounded-3xl border-2 border-sky-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                  📊
                </div>
                <h3 className="text-xl font-bold text-slate-800">تقارير ومتابعة للأولياء</h3>
                <p className="text-slate-600 text-sm font-medium leading-relaxed">
                  متابعة مستمرة لتقييمات الذاكرة والسلوك لمساعدة الأهل والمختصين في توجيه الطفل.
                </p>
              </div>
              <span className="text-xs font-black text-sky-600 bg-sky-50 py-1.5 px-3 rounded-full self-start">
                تقارير شاملة
              </span>
            </div>

          </div>

        </section>

        {/* Why Bustan Section */}
        <section className="max-w-5xl mx-auto bg-gradient-to-br from-teal-700 to-teal-900 rounded-[3rem] p-8 sm:p-14 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full blur-3xl opacity-20"></div>

          <div className="relative z-10 space-y-8 text-center sm:text-right">
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-5xl font-black">لماذا تختار منصة بستان؟</h2>
              <p className="text-teal-100 text-lg sm:text-xl font-medium max-w-2xl">
                صممت المنصة لتلبي احتياجات الطفل العربي وفق معايير عالمية في علم النفس السلوكي والإدراكي.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 space-y-2">
                <span className="text-4xl block">🇩🇿</span>
                <h4 className="text-xl font-bold">معايير جزائرية واعدة</h4>
                <p className="text-teal-100 text-xs leading-relaxed">مطورة لتناسب البيئة والثقافة المحلية للأسر والمؤسسات.</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 space-y-2">
                <span className="text-4xl block">🎨</span>
                <h4 className="text-xl font-bold">تصميم جاذب للأطفال</h4>
                <p className="text-teal-100 text-xs leading-relaxed">ألوان مريحة وأصوات تفاعلية تضمن تجربة غير مجهدة للطفل.</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 space-y-2">
                <span className="text-4xl block">🛡️</span>
                <h4 className="text-xl font-bold">أمان وخصوصية كاملة</h4>
                <p className="text-teal-100 text-xs leading-relaxed">تشفير وحماية لكافة بيانات الطفل وتقاريره السلوكية.</p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-8 px-4 sm:px-8 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
          
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <span className="font-bold text-slate-700">منصة بستان العلاجية © 2026 - جميع الحقوق محفوظة</span>
          </div>

          <div className="flex items-center gap-6 text-sm font-semibold text-slate-500">
            <Link href="/register" className="hover:text-teal-600 transition-colors">تفعيل حساب</Link>
            <Link href="/login" className="hover:text-teal-600 transition-colors">تسجيل الدخول</Link>
            <Link href="/admin/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors text-xs">
              دخول الأدمن 🔑
            </Link>
          </div>

        </div>
      </footer>

    </div>
  );
}
