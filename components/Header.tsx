import React from "react";
import { Phone } from "lucide-react";

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-surface-200 shadow-sm transition-all">
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2">
        
        {/* Right side (RTL): Logo & Branding */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {/* Tasaheel SVG Icon/Logo */}
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-brand-600 via-brand to-brand-700 flex items-center justify-center shadow-sm shadow-brand/20 shrink-0">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-white"
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

          <div className="flex flex-col min-w-0">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-brand-900 leading-tight">
              تساهيل
            </span>
            <span className="text-[11px] text-text-muted font-medium hidden sm:inline truncate">
              البرنامج التقديري لحساب أقساط تمويل المشروعات
            </span>
          </div>
        </div>

        {/* Left side: Hotline & Phone Call */}
        <div className="flex items-center shrink-0">
          <a
            href="tel:16134"
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-surface-100 hover:bg-brand-50 hover:text-brand text-brand-900 font-bold transition-all border border-surface-200 text-xs sm:text-sm group shadow-2xs"
            aria-label="الاتصال بالخط الساخن 16134"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-brand-50 group-hover:bg-brand text-brand group-hover:text-white flex items-center justify-center transition-colors shrink-0">
              <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[9px] sm:text-[10px] text-text-muted leading-tight font-semibold">
                الخط الساخن
              </span>
              <span className="text-xs sm:text-sm font-black tracking-wider dir-ltr text-brand-900 group-hover:text-brand leading-none mt-0.5">
                16134
              </span>
            </div>
          </a>
        </div>

      </div>
    </header>
  );
};
