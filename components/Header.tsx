import React from "react";
import { Phone, ArrowUpLeft, ShieldCheck } from "lucide-react";

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-surface-200 shadow-sm transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Right side (RTL): Logo & Branding */}
        <div className="flex items-center gap-3">
          {/* Tasaheel SVG Icon/Logo */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-600 via-brand to-brand-700 flex items-center justify-center shadow-md shadow-brand/20">
            <svg
              className="w-7 h-7 text-white"
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

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black tracking-tight text-brand-900">
                تساهيل
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 font-bold">
                حاسبة القسط
              </span>
            </div>
            <span className="text-xs text-text-muted font-medium hidden sm:inline">
              البرنامج التقديري لحساب أقساط تمويل المشروعات
            </span>
          </div>
        </div>

        {/* Left side: Hotline & Phone Call */}
        <div className="flex items-center gap-3">
          <a
            href="tel:16134"
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-surface-100 hover:bg-brand-50 hover:text-brand text-brand-900 font-bold transition-all border border-surface-200 text-sm sm:text-base group"
            aria-label="الاتصال بالخط الساخن 16134"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-50 group-hover:bg-brand text-brand group-hover:text-white flex items-center justify-center transition-colors">
              <Phone className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-text-muted leading-tight font-medium">
                الخط الساخن
              </span>
              <span className="font-extrabold tracking-wider dir-ltr text-brand-900 group-hover:text-brand">
                16134
              </span>
            </div>
          </a>
        </div>
      </div>
    </header>
  );
};
