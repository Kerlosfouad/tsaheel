import React, { useState } from "react";
import { CalculationResult } from "../lib/types";
import { formatCurrency, formatPercent, generateShareableSummary } from "../lib/format";
import {
  RotateCcw,
  Copy,
  Check,
  Printer,
  ArrowUpLeft,
  Calendar,
  Sparkles,
  TrendingUp,
  Percent,
  Coins,
  ShieldCheck,
  Info,
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
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!result) return;
    try {
      const summaryText = generateShareableSummary(result);
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (!isValid || !result) {
    return (
      <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-card border border-surface-200 flex flex-col items-center justify-center text-center min-h-[420px] transition-all">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-4 animate-bounce">
          <Info className="w-8 h-8" />
        </div>
        <h3 className="text-lg sm:text-xl font-black text-brand-900 mb-2">
          في انتظار إدخال الفائدة السنوية
        </h3>
        <p className="text-sm text-text-muted font-medium max-w-sm mb-6 leading-relaxed">
          يرجى إدخال نسبة الفائدة السنوية % بالأعلى لحساب قيمة القسط التقديري وجدول السداد فوراً.
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          <div className="text-xs px-3 py-1.5 rounded-full bg-surface-100 text-brand-800 font-bold border border-surface-200">
            ✓ حساب فوري ودقيق
          </div>
          <div className="text-xs px-3 py-1.5 rounded-full bg-surface-100 text-brand-800 font-bold border border-surface-200">
            ✓ جدول سداد مفصل
          </div>
        </div>
      </div>
    );
  }

  const clientTypeLabel = result.clientType === "new" ? "عميل جديد" : "تجديد";
  const installmentTypeLabel =
    result.installmentType === "monthly" ? "شهري" : "موسمي";
  const methodLabel =
    result.interestMethod === "flat" ? "فائدة ثابتة" : "رصيد متناقص";

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-card border border-surface-200 overflow-hidden transition-all print-card">
      
      {/* Top Highlight Banner: Big Installment Amount */}
      <div className="bg-gradient-to-br from-brand-700 via-brand to-brand-800 text-white p-6 sm:p-8 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-accent-400/20 rounded-full blur-xl pointer-events-none" />

        {/* Badges row */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 relative z-10">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-white border border-white/20">
              {clientTypeLabel}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-white border border-white/20">
              نظام {installmentTypeLabel}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-accent-500 text-xs font-bold text-white shadow-xs">
              {methodLabel}
            </span>
          </div>
          <div className="text-xs font-semibold text-brand-100 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-accent-400" />
            <span>حساب تقديري</span>
          </div>
        </div>

        {/* Big Installment Header */}
        <div className="relative z-10 text-center sm:text-right">
          <div className="text-xs sm:text-sm text-brand-100 font-semibold mb-1">
            قيمة القسط التقديري ({result.paymentFrequencyText})
          </div>
          <div className="flex items-baseline justify-center sm:justify-start gap-2 flex-wrap">
            <span className="text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-sm font-sans" dir="ltr">
              {formatCurrency(result.installmentAmount, { showCurrency: false })}
            </span>
            <span className="text-lg sm:text-xl font-bold text-accent-300">
              جنيه
            </span>
            <span className="text-xs sm:text-sm text-brand-100 font-medium mr-1">
              / {result.paymentFrequencyText}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Breakdown */}
      <div className="p-5 sm:p-7 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          
          {/* Principal Amount */}
          <div className="p-3.5 rounded-2xl bg-surface-50 border border-surface-200">
            <div className="flex items-center gap-1.5 text-xs text-text-muted font-bold mb-1">
              <Coins className="w-3.5 h-3.5 text-brand" />
              <span>أصل التمويل</span>
            </div>
            <div className="text-base sm:text-lg font-black text-brand-900 font-sans" dir="ltr">
              {formatCurrency(result.loanAmount)}
            </div>
          </div>

          {/* Total Interest */}
          <div className="p-3.5 rounded-2xl bg-accent-50/50 border border-accent-200">
            <div className="flex items-center gap-1.5 text-xs text-accent-700 font-bold mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-accent-600" />
              <span>إجمالي الفائدة</span>
            </div>
            <div className="text-base sm:text-lg font-black text-accent-600 font-sans" dir="ltr">
              {formatCurrency(result.totalInterest)}
            </div>
          </div>

          {/* Total Payable */}
          <div className="p-3.5 rounded-2xl bg-brand-50/60 border border-brand-200 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 text-xs text-brand-800 font-bold mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-brand" />
              <span>إجمالي المسدد</span>
            </div>
            <div className="text-base sm:text-lg font-black text-brand-800 font-sans" dir="ltr">
              {formatCurrency(result.totalPayable)}
            </div>
          </div>

        </div>

        {/* Additional Details row */}
        <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-text-muted bg-surface-100/70 p-3.5 rounded-xl border border-surface-200">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-brand" />
            <span>عدد الأقساط:</span>
            <strong className="text-brand-900 font-bold">
              {result.numberOfInstallments} {result.installmentType === "monthly" ? "أقساط" : "دفعات"}
            </strong>
          </div>
          <div className="flex items-center gap-1.5">
            <Percent className="w-4 h-4 text-accent-600" />
            <span>الفائدة السنوية:</span>
            <strong className="text-brand-900 font-bold">
              {formatPercent(result.annualRate)}
            </strong>
          </div>
        </div>

        {/* Action Buttons (Print-hidden) */}
        <div className="pt-3 border-t border-surface-200 flex flex-wrap gap-2.5 no-print">
          
          {/* Copy Result Button */}
          <button
            type="button"
            onClick={handleCopy}
            className={`flex-1 min-w-[130px] h-12 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border transition-all ${
              copied
                ? "bg-green-600 text-white border-green-600 shadow-sm"
                : "bg-surface-100 hover:bg-brand-50 hover:text-brand text-brand-900 border-surface-200"
            }`}
            aria-label="نسخ نتيجة الحساب"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>تم النسخ بنجاح!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>نسخ النتيجة</span>
              </>
            )}
          </button>

          {/* Print / Save PDF Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 min-w-[130px] h-12 px-4 rounded-xl bg-surface-100 hover:bg-brand-50 hover:text-brand text-brand-900 border border-surface-200 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all"
            aria-label="طباعة أو حفظ التقرير بصيغة PDF"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة / حفظ PDF</span>
          </button>

          {/* Reset Button */}
          <button
            type="button"
            onClick={onReset}
            className="h-12 px-4 rounded-xl bg-surface-100 hover:bg-red-50 hover:text-red-700 text-text-muted border border-surface-200 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all"
            aria-label="إعادة ضبط الحاسبة"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة ضبط</span>
          </button>

        </div>
      </div>
    </div>
  );
};
