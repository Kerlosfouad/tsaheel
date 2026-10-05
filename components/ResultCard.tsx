import React, { useState } from "react";
import { CalculationResult } from "../lib/types";
import { formatCurrency, formatPercent } from "../lib/format";
import { exportSchedulePDF } from "../lib/pdfExport";
import {
  RotateCcw,
  FileDown,
  Calendar,
  Sparkles,
  TrendingUp,
  Percent,
  Coins,
  ShieldCheck,
  Info,
  CalendarDays,
} from "lucide-react";

interface ResultCardProps {
  result: CalculationResult | null;
  isValid: boolean;
  onReset: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  isValid,
  onReset,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadPDF = async () => {
    if (!result) return;
    try {
      setIsExporting(true);
      await exportSchedulePDF(result);
    } catch (err) {
      console.error("Failed to generate PDF", err);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isValid || !result) {
    return (
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-card border border-surface-200 flex flex-col items-center justify-center text-center min-h-[320px] transition-all">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-3">
          <Info className="w-7 h-7" />
        </div>
        <h3 className="text-base sm:text-lg font-black text-brand-900 mb-1.5">
          في انتظار إدخال الفائدة السنوية
        </h3>
        <p className="text-xs sm:text-sm text-text-muted font-medium max-w-xs mb-4 leading-relaxed">
          أدخل نسبة الفائدة السنوية % بالأعلى لحساب قيمة القسط وجدول السداد فوراً.
        </p>
        <div className="flex flex-wrap gap-1.5 justify-center">
          <div className="text-[11px] px-2.5 py-1 rounded-full bg-surface-100 text-brand-800 font-bold border border-surface-200">
            ✓ حساب فوري
          </div>
          <div className="text-[11px] px-2.5 py-1 rounded-full bg-surface-100 text-brand-800 font-bold border border-surface-200">
            ✓ جدول سداد مفصل
          </div>
        </div>
      </div>
    );
  }

  const installmentTypeLabel =
    result.installmentType === "monthly" ? "شهري" : "موسمي";
  const methodLabel =
    result.interestMethod === "flat" ? "فائدة ثابتة" : "رصيد متناقص";

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-card border border-surface-200 overflow-hidden transition-all print-card">
      
      {/* Top Highlight Banner */}
      <div className="bg-gradient-to-br from-brand-700 via-brand to-brand-800 text-white p-5 sm:p-7 relative overflow-hidden">
        {/* Badges row */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 mb-3 relative z-10">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold text-white border border-white/20 flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              <span>أول قسط: {result.firstInstallmentDate}</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold text-white border border-white/20">
              نظام {installmentTypeLabel}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-accent-500 text-[11px] font-bold text-white shadow-xs">
              {methodLabel}
            </span>
          </div>
          <div className="text-[11px] font-semibold text-brand-100 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-accent-400" />
            <span>تقديري</span>
          </div>
        </div>

        {/* Big Installment Amount */}
        <div className="relative z-10">
          <div className="text-xs text-brand-100 font-semibold mb-1">
            قيمة القسط التقديري ({result.paymentFrequencyText})
          </div>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white font-sans break-all" dir="ltr">
              {formatCurrency(result.installmentAmount, { showCurrency: false })}
            </span>
            <span className="text-base sm:text-xl font-bold text-accent-300">
              جنيه
            </span>
            <span className="text-xs text-brand-100 font-medium mr-1">
              / {result.paymentFrequencyText}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Breakdown */}
      <div className="p-4 sm:p-6 space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
          
          {/* Principal Amount */}
          <div className="p-3 rounded-xl bg-surface-50 border border-surface-200">
            <div className="flex items-center gap-1 text-[11px] text-text-muted font-bold mb-0.5">
              <Coins className="w-3.5 h-3.5 text-brand shrink-0" />
              <span>أصل التمويل</span>
            </div>
            <div className="text-sm sm:text-base font-black text-brand-900 font-sans" dir="ltr">
              {formatCurrency(result.loanAmount)}
            </div>
          </div>

          {/* Total Interest */}
          <div className="p-3 rounded-xl bg-accent-50/50 border border-accent-200">
            <div className="flex items-center gap-1 text-[11px] text-accent-700 font-bold mb-0.5">
              <TrendingUp className="w-3.5 h-3.5 text-accent-600 shrink-0" />
              <span>إجمالي الفائدة</span>
            </div>
            <div className="text-sm sm:text-base font-black text-accent-600 font-sans" dir="ltr">
              {formatCurrency(result.totalInterest)}
            </div>
          </div>

          {/* Total Payable */}
          <div className="p-3 rounded-xl bg-brand-50/60 border border-brand-200">
            <div className="flex items-center gap-1 text-[11px] text-brand-800 font-bold mb-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-brand shrink-0" />
              <span>إجمالي المسدد</span>
            </div>
            <div className="text-sm sm:text-base font-black text-brand-800 font-sans" dir="ltr">
              {formatCurrency(result.totalPayable)}
            </div>
          </div>

        </div>

        {/* Additional Details row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-text-muted bg-surface-100/70 p-3 rounded-xl border border-surface-200">
          <div className="flex items-center justify-between sm:justify-start gap-1.5">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-brand" />
              <span>عدد الأقساط:</span>
            </span>
            <strong className="text-brand-900 font-bold">
              {result.numberOfInstallments} {result.installmentType === "monthly" ? "أقساط" : "دفعات"}
            </strong>
          </div>
          <div className="flex items-center justify-between sm:justify-start gap-1.5">
            <span className="flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-accent-600" />
              <span>الفائدة السنوية:</span>
            </span>
            <strong className="text-brand-900 font-bold">
              {formatPercent(result.annualRate)}
            </strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-surface-200 grid grid-cols-1 sm:grid-cols-2 gap-2.5 no-print">
          
          {/* Download PDF Button */}
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="h-11 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50"
            aria-label="تنزيل جدول السداد بصيغة PDF"
          >
            <FileDown className="w-4 h-4 shrink-0" />
            <span>{isExporting ? "جاري تجهيز الـ PDF..." : "تحميل جدول السداد (PDF)"}</span>
          </button>

          {/* Reset Button */}
          <button
            type="button"
            onClick={onReset}
            className="h-11 px-4 rounded-xl bg-surface-100 hover:bg-red-50 hover:text-red-700 text-text-muted border border-surface-200 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all"
            aria-label="إعادة ضبط الحاسبة"
          >
            <RotateCcw className="w-4 h-4 shrink-0" />
            <span>إعادة ضبط</span>
          </button>

        </div>
      </div>
    </div>
  );
};

