import React from "react";
import { Phone, ShieldAlert, ExternalLink, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto bg-brand-900 text-white pt-12 pb-8 border-t border-brand-800 no-print">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 border-b border-brand-800 items-center justify-between">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-2">
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

          {/* Col 2: Hotline & Support */}
          <div className="flex md:justify-end">
            <a
              href="tel:16134"
              className="inline-flex items-center gap-3 p-3 px-4 rounded-2xl bg-brand-800/80 hover:bg-brand-800 border border-brand-700 text-white transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-accent-500 text-brand-900 flex items-center justify-center font-bold">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-brand-200 font-medium">
                  الخط الساخن لشركة تساهيل
                </div>
                <div className="text-xl font-black font-sans tracking-widest text-accent-300" dir="ltr">
                  16134
                </div>
              </div>
            </a>
          </div>

        </div>

        {/* Legal Disclaimer Box */}
        <div className="my-6 p-4 rounded-2xl bg-brand-950/60 border border-brand-800 flex items-start gap-3 text-xs text-brand-300 font-medium leading-relaxed">
          <ShieldAlert className="w-5 h-5 text-accent-400 shrink-0 mt-0.5" />
          <p>
            <strong className="text-accent-300 font-bold ml-1">إخلاء مسؤولية:</strong>
            الحساب تقديري ولا يمثل عرضًا نهائيًا أو التزامًا من الشركة. القيمة النهائية للأقساط ونسبة الفائدة تُحدد بعد الاستعلام الائتماني والميداني واستيفاء المستندات وموافقة لجنة التمويل بالشركة وفقاً للسياسات الائتمانية المعمول بها.
          </p>
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
