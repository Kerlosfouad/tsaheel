import React from "react";
import { Calculator, Sparkles, Clock, CheckCircle2, TrendingUp } from "lucide-react";

export const Hero: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-surface-50 to-surface-50 pt-6 pb-7 sm:pt-10 sm:pb-10 border-b border-surface-200">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-brand-200/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-10 left-10 w-52 sm:w-72 h-52 sm:h-72 bg-accent-200/25 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-brand-200 text-brand-700 text-xs font-bold shadow-xs mb-3">
          <Sparkles className="w-3.5 h-3.5 text-accent-500 animate-pulse" />
          <span>حاسبة أقساط التمويل الميسر</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-brand-900 tracking-tight leading-snug mb-2.5">
          احسب قسطك مع <span className="text-brand relative inline-block">تساهيل</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-base md:text-lg text-text-muted font-medium max-w-xl mx-auto leading-relaxed mb-4">
          تمويل يبدأ من <strong className="text-brand-800 font-bold">5,000 جنيه</strong> حتى{" "}
          <strong className="text-brand-800 font-bold">15 مليون جنيه</strong> بأنظمة سداد ميسرة.
        </p>

        {/* Quick Features Pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 text-xs font-bold text-brand-800">
          <div className="flex items-center gap-1 px-2.5 py-1 bg-white rounded-full border border-surface-200 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-500 shrink-0" />
            <span>أقساط شهرية وموسمية</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 bg-white rounded-full border border-surface-200 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-accent-500 shrink-0" />
            <span>سداد حتى 36 شهراً</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 bg-white rounded-full border border-surface-200 shadow-xs">
            <TrendingUp className="w-3.5 h-3.5 text-brand-500 shrink-0" />
            <span>فائدة ثابتة أو متناقصة</span>
          </div>
        </div>
      </div>
    </div>
  );
};
