import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto bg-brand-900 text-white pt-10 pb-8 border-t border-brand-800 no-print">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Brand Info */}
        <div className="flex flex-col items-center text-center space-y-2 pb-6 border-b border-brand-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-xl font-black tracking-tight">تساهيل - حاسبة القسط</span>
          </div>
          <p className="text-xs text-brand-200 leading-relaxed font-medium max-w-lg">
            حاسبة مخصصة لموظفي وعملاء شركة تساهيل لحساب أقساط التمويل الشهرية والموسمية وجدول السداد بدقة وفورية.
          </p>
        </div>

        {/* Developer Credit Box */}
        <div className="my-6 p-4 rounded-2xl bg-brand-950/70 border border-brand-800 flex items-center justify-center text-center text-xs text-brand-200 font-medium leading-relaxed shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
            <span className="text-white font-bold">من تطوير:</span>
            <span className="text-accent-300 font-black text-sm">بشمهندس كيرلس فؤاد شفيق</span>
            <span className="hidden sm:inline text-brand-400">•</span>
            <span className="text-brand-200 font-bold">عضو رقابة كوم الفرج</span>
          </div>
        </div>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-300">
          <div>
            تساهيل مصر © 2026 جميع الحقوق محفوظة.
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <span>تم التطوير وفق أعلى المعايير المالية والتصميمية</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

