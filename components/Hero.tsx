import React from "react";
import { Calculator, Sparkles, Clock, CheckCircle2, TrendingUp } from "lucide-react";

export const Hero: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-surface-50 to-surface-50 pt-8 pb-10 sm:pt-12 sm:pb-12 border-b border-surface-200">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-200/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-10 left-10 w-72 h-72 bg-accent-200/25 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-brand-200 text-brand-700 text-xs sm:text-sm font-bold shadow-sm mb-4">
          <Sparkles className="w-4 h-4 text-accent-500 animate-pulse" />
          <span>الحاسبة الذكية لأقساط تمويل المشروعات</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-900 tracking-tight leading-tight sm:leading-tight mb-4">
          احسب قسطك مع <span className="text-brand relative inline-block">تساهيل</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-text-muted font-medium max-w-2xl mx-auto leading-relaxed mb-6">
          تمويل يبدأ من <strong className="text-brand-800 font-bold">5,000 جنيه</strong> حتى{" "}
          <strong className="text-brand-800 font-bold">15 مليون جنيه</strong> بأنظمة سداد سهلة وبسيطة تناسب احتياجات مشروعك وتدفقاتك النقدية.
        </p>

        {/* Quick Features Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm font-bold text-brand-800">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-surface-200 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-brand-500" />
            <span>أقساط شهرية وموسمية</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-surface-200 shadow-xs">
            <Clock className="w-4 h-4 text-accent-500" />
            <span>فترات سداد حتى 36 شهراً</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-surface-200 shadow-xs">
            <TrendingUp className="w-4 h-4 text-brand-500" />
            <span>فائدة ثابتة أو رصيد متناقص</span>
          </div>
        </div>
      </div>
    </div>
  );
};
