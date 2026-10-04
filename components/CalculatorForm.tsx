import React from "react";
import {
  FormState,
  FormErrors,
  ClientType,
  InstallmentType,
  InterestMethod,
} from "../lib/types";
import {
  MIN_LOAN_AMOUNT,
  MAX_LOAN_AMOUNT,
  MIN_DURATION_MONTHS,
  MAX_DURATION_MONTHS,
} from "../lib/validation";
import { formatNumber } from "../lib/format";
import {
  Coins,
  Percent,
  UserCheck,
  Calendar,
  Layers,
  HelpCircle,
  Clock,
  Sparkles,
  ArrowRightLeft,
} from "lucide-react";

interface CalculatorFormProps {
  form: FormState;
  errors: FormErrors;
  onChange: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  onReset: () => void;
}

const POPULAR_AMOUNTS = [
  { label: "25 ألف", value: 25000 },
  { label: "50 ألف", value: 50000 },
  { label: "100 ألف", value: 100000 },
  { label: "250 ألف", value: 250000 },
  { label: "500 ألف", value: 500000 },
  { label: "1 مليون", value: 1000000 },
  { label: "5 مليون", value: 5000000 },
];

const MONTHLY_PRESETS = [6, 12, 18, 24, 30, 36];

export const CalculatorForm: React.FC<CalculatorFormProps> = ({
  form,
  errors,
  onChange,
}) => {
  // Parse numeric amount for slider
  const numericAmount = parseFloat(form.loanAmount.replace(/,/g, "")) || 0;

  // Handle amount text change with auto thousands formatting
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, "");
    if (!rawVal) {
      onChange("loanAmount", "");
      return;
    }
    const num = parseInt(rawVal, 10);
    onChange("loanAmount", num.toLocaleString("en-US"));
  };

  const handleAmountPreset = (val: number) => {
    onChange("loanAmount", val.toLocaleString("en-US"));
  };

  // Seasonal calculation helpers
  const seasonalInterval =
    form.numberOfPayments > 0
      ? (form.repaymentPeriodMonths / form.numberOfPayments)
      : 0;

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-card border border-surface-200 transition-all">
      <div className="flex items-center justify-between pb-5 border-b border-surface-200 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand flex items-center justify-center font-bold">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-brand-900">
              بيانات التمويل المطلوبة
            </h2>
            <p className="text-xs sm:text-sm text-text-muted font-medium">
              حدد المبلغ ونظام السداد المناسب لنشاطك
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 sm:space-y-7">
        {/* ==================================================== */}
        {/* 1. Loan Amount (مبلغ التمويل) */}
        {/* ==================================================== */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="loanAmount"
              className="text-sm font-bold text-brand-900 flex items-center gap-1.5"
            >
              <span>مبلغ التمويل المطلوب</span>
              <span className="text-xs font-semibold text-text-muted">(بالجنيه المصري)</span>
            </label>
            <span className="text-xs text-text-muted font-medium">
              المدى: 5,000 إلى 15,000,000 ج.م
            </span>
          </div>

          <div className="relative">
            <input
              id="loanAmount"
              type="text"
              inputMode="numeric"
              dir="ltr"
              value={form.loanAmount}
              onChange={handleAmountChange}
              placeholder="100,000"
              className={`w-full h-14 pl-20 pr-4 text-right text-lg sm:text-xl font-bold rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                errors.loanAmount
                  ? "border-red-400 bg-red-50/30 text-red-900 focus:ring-red-400"
                  : "border-surface-200 bg-surface-50/50 hover:border-brand-300 focus:border-brand focus:ring-brand-500/20 text-brand-900"
              }`}
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-sm font-bold text-brand-700 px-2.5 py-1 rounded-lg bg-brand-50 border border-brand-200">
              جنيه مصري
            </div>
          </div>

          {errors.loanAmount && (
            <p className="mt-1.5 text-xs sm:text-sm text-red-600 font-semibold flex items-center gap-1">
              <span>⚠️</span> {errors.loanAmount}
            </p>
          )}

          {/* Amount Slider */}
          <div className="mt-3">
            <input
              type="range"
              min={MIN_LOAN_AMOUNT}
              max={MAX_LOAN_AMOUNT}
              step={numericAmount > 1000000 ? 100000 : numericAmount > 100000 ? 10000 : 5000}
              value={Math.min(MAX_LOAN_AMOUNT, Math.max(MIN_LOAN_AMOUNT, numericAmount))}
              onChange={(e) => {
                const num = parseInt(e.target.value, 10);
                onChange("loanAmount", num.toLocaleString("en-US"));
              }}
              className="w-full h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer"
              aria-label="تحديد مبلغ التمويل بالمؤشر"
            />
          </div>

          {/* Quick preset chips */}
          <div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
            <span className="text-xs text-text-muted font-bold self-center ml-1">
              مبالغ شائعة:
            </span>
            {POPULAR_AMOUNTS.map((p) => {
              const isSelected = numericAmount === p.value;
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => handleAmountPreset(p.value)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    isSelected
                      ? "bg-brand text-white shadow-xs"
                      : "bg-surface-100 hover:bg-brand-50 hover:text-brand text-text-muted border border-surface-200"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ==================================================== */}
        {/* 2. Annual Interest Rate % (الفائدة السنوية) */}
        {/* ==================================================== */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="annualInterestRate"
              className="text-sm font-bold text-brand-900 flex items-center gap-1.5"
            >
              <Percent className="w-4 h-4 text-accent-500" />
              <span>الفائدة السنوية %</span>
              <span className="text-xs px-2 py-0.5 rounded bg-accent-50 text-accent-600 border border-accent-200 font-semibold">
                مطلوب إدخالها
              </span>
            </label>
            <span className="text-xs text-text-muted font-medium">
              أدخل النسبة المئوية السنوية
            </span>
          </div>

          <div className="relative">
            <input
              id="annualInterestRate"
              type="number"
              step="0.1"
              min="0.1"
              max="100"
              dir="ltr"
              value={form.annualInterestRate}
              onChange={(e) => onChange("annualInterestRate", e.target.value)}
              placeholder="اكتب الفائدة السنوية % (مثال: 20 أو 24)"
              className={`w-full h-14 pl-12 pr-4 text-right text-base sm:text-lg font-bold rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                errors.annualInterestRate
                  ? "border-amber-400 bg-amber-50/40 text-brand-900 focus:ring-amber-400"
                  : "border-surface-200 bg-surface-50/50 hover:border-brand-300 focus:border-brand focus:ring-brand-500/20 text-brand-900"
              }`}
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-base font-bold text-brand-700 px-2 py-1 rounded-md bg-surface-100">
              %
            </div>
          </div>

          {errors.annualInterestRate ? (
            <p className="mt-1.5 text-xs sm:text-sm text-amber-700 font-semibold flex items-center gap-1">
              <span>💡</span> {errors.annualInterestRate}
            </p>
          ) : (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-text-muted font-medium">نسب شائعة للتجربة:</span>
              <div className="flex gap-1.5">
                {[18, 20, 22, 24].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => onChange("annualInterestRate", r.toString())}
                    className={`px-2 py-0.5 text-xs rounded border transition-colors ${
                      form.annualInterestRate === r.toString()
                        ? "bg-accent-500 text-white border-accent-600 font-bold"
                        : "bg-surface-100 text-text-muted hover:bg-surface-200 border-surface-200 font-medium"
                    }`}
                  >
                    {r}%
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ==================================================== */}
        {/* 3. Client Type & Installment Type (Segmented Toggles) */}
        {/* ==================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Client Type */}
          <div>
            <label className="block text-sm font-bold text-brand-900 mb-2">
              نوع العميل
            </label>
            <div
              className="grid grid-cols-2 p-1.5 bg-surface-100 rounded-xl border border-surface-200 gap-1.5"
              role="radiogroup"
              aria-label="نوع العميل"
            >
              <button
                type="button"
                role="radio"
                aria-checked={form.clientType === "new"}
                onClick={() => onChange("clientType", "new")}
                className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                  form.clientType === "new"
                    ? "bg-brand text-white shadow-sm"
                    : "text-text-muted hover:text-brand-900"
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>عميل جديد</span>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={form.clientType === "renew"}
                onClick={() => onChange("clientType", "renew")}
                className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                  form.clientType === "renew"
                    ? "bg-brand text-white shadow-sm"
                    : "text-text-muted hover:text-brand-900"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>تجديد</span>
              </button>
            </div>
          </div>

          {/* Installment Type */}
          <div>
            <label className="block text-sm font-bold text-brand-900 mb-2">
              نوع القسط
            </label>
            <div
              className="grid grid-cols-2 p-1.5 bg-surface-100 rounded-xl border border-surface-200 gap-1.5"
              role="radiogroup"
              aria-label="نوع القسط"
            >
              <button
                type="button"
                role="radio"
                aria-checked={form.installmentType === "monthly"}
                onClick={() => onChange("installmentType", "monthly")}
                className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                  form.installmentType === "monthly"
                    ? "bg-brand text-white shadow-sm"
                    : "text-text-muted hover:text-brand-900"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>شهري</span>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={form.installmentType === "seasonal"}
                onClick={() => onChange("installmentType", "seasonal")}
                className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                  form.installmentType === "seasonal"
                    ? "bg-brand text-white shadow-sm"
                    : "text-text-muted hover:text-brand-900"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>موسمي</span>
              </button>
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* 4. Duration Controls (Monthly vs Seasonal) */}
        {/* ==================================================== */}
        {form.installmentType === "monthly" ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-brand-50/50 border border-brand-100 transition-all animate-fadeIn">
            <div className="flex items-center justify-between mb-3">
              <label
                htmlFor="monthlyDuration"
                className="text-sm font-bold text-brand-900 flex items-center gap-1.5"
              >
                <Clock className="w-4 h-4 text-brand" />
                <span>مدة التقسيط (بالشهور)</span>
              </label>
              <div className="flex items-center gap-1 text-brand font-black text-base sm:text-lg">
                <span>{form.monthlyDuration}</span>
                <span className="text-xs font-semibold">شهر</span>
                <span className="text-xs font-normal text-text-muted">
                  ({(form.monthlyDuration / 12).toFixed(1)} سنة)
                </span>
              </div>
            </div>

            <input
              id="monthlyDuration"
              type="range"
              min={MIN_DURATION_MONTHS}
              max={MAX_DURATION_MONTHS}
              value={form.monthlyDuration}
              onChange={(e) =>
                onChange("monthlyDuration", parseInt(e.target.value, 10))
              }
              className="w-full h-2.5 bg-brand-200/60 rounded-lg appearance-none cursor-pointer"
              aria-label="مدة التقسيط بالشهور"
            />

            {errors.monthlyDuration && (
              <p className="mt-1 text-xs text-red-600 font-semibold">
                {errors.monthlyDuration}
              </p>
            )}

            {/* Monthly quick chips */}
            <div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
              <span className="text-xs text-text-muted font-bold self-center ml-1">
                خيارات سريعة:
              </span>
              {MONTHLY_PRESETS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => onChange("monthlyDuration", m)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    form.monthlyDuration === m
                      ? "bg-brand text-white shadow-xs"
                      : "bg-white hover:bg-brand-50 hover:text-brand text-brand-900 border border-brand-200"
                  }`}
                >
                  {m} شهر
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Seasonal Duration & Payments */
          <div className="p-4 sm:p-5 rounded-2xl bg-accent-50/40 border border-accent-200 transition-all animate-fadeIn space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-accent-200/60">
              <span className="text-sm font-bold text-brand-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-accent-500" />
                <span>إعدادات النظام الموسمي</span>
              </span>
              <div className="text-xs px-2.5 py-1 rounded-full bg-accent-500 text-white font-bold">
                {seasonalInterval > 0 &&
                  (Number.isInteger(seasonalInterval)
                    ? `دفعة كل ${seasonalInterval} شهور`
                    : `دفعة كل ${seasonalInterval.toFixed(1)} شهر`)}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Repayment Period */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="repaymentPeriodMonths"
                    className="text-xs sm:text-sm font-bold text-brand-900"
                  >
                    فترة السداد الإجمالية (بالشهور)
                  </label>
                  <span className="text-xs font-bold text-accent-600">
                    {form.repaymentPeriodMonths} شهر
                  </span>
                </div>
                <select
                  id="repaymentPeriodMonths"
                  value={form.repaymentPeriodMonths}
                  onChange={(e) => {
                    const period = parseInt(e.target.value, 10);
                    onChange("repaymentPeriodMonths", period);
                    // Ensure payments do not exceed period
                    if (form.numberOfPayments > period) {
                      onChange("numberOfPayments", period);
                    }
                  }}
                  className="w-full h-12 px-3 rounded-xl border border-surface-200 bg-white font-bold text-brand-900 focus:outline-none focus:ring-2 focus:ring-accent-400"
                >
                  {Array.from({ length: 36 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {m} {m === 1 ? "شهر" : m <= 10 ? "شهور" : "شهراً"} ({ (m / 12).toFixed(1) } سنة)
                    </option>
                  ))}
                </select>
                {errors.repaymentPeriodMonths && (
                  <p className="mt-1 text-xs text-red-600 font-semibold">
                    {errors.repaymentPeriodMonths}
                  </p>
                )}
              </div>

              {/* Number of Payments */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="numberOfPayments"
                    className="text-xs sm:text-sm font-bold text-brand-900"
                  >
                    عدد الدفعات
                  </label>
                  <span className="text-xs font-bold text-accent-600">
                    {form.numberOfPayments} {form.numberOfPayments <= 10 ? "دفعات" : "دفعة"}
                  </span>
                </div>
                <select
                  id="numberOfPayments"
                  value={form.numberOfPayments}
                  onChange={(e) =>
                    onChange("numberOfPayments", parseInt(e.target.value, 10))
                  }
                  className="w-full h-12 px-3 rounded-xl border border-surface-200 bg-white font-bold text-brand-900 focus:outline-none focus:ring-2 focus:ring-accent-400"
                >
                  {Array.from(
                    { length: form.repaymentPeriodMonths },
                    (_, i) => i + 1
                  ).map((p) => (
                    <option key={p} value={p}>
                      {p} {p === 1 ? "دفعة واحدة" : p === 2 ? "دفعتين" : `${p} دفعات`}
                    </option>
                  ))}
                </select>
                {errors.numberOfPayments && (
                  <p className="mt-1 text-xs text-red-600 font-semibold">
                    {errors.numberOfPayments}
                  </p>
                )}
              </div>
            </div>

            <p className="text-xs text-text-muted font-medium bg-white/70 p-2.5 rounded-lg border border-accent-100">
              💡 مثال توضيحي: سداد على {form.repaymentPeriodMonths} شهر مقسمة على {form.numberOfPayments} دفعات تعني سداد دفعة متساوية كل {seasonalInterval.toFixed(1)} شهر.
            </p>
          </div>
        )}

        {/* ==================================================== */}
        {/* 5. Interest Calculation Method (طريقة حساب الفائدة) */}
        {/* ==================================================== */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-brand-900 flex items-center gap-1.5">
              <ArrowRightLeft className="w-4 h-4 text-brand" />
              <span>طريقة حساب الفائدة</span>
            </label>
          </div>

          <div
            className="grid grid-cols-2 p-1.5 bg-surface-100 rounded-xl border border-surface-200 gap-1.5"
            role="radiogroup"
            aria-label="طريقة حساب الفائدة"
          >
            <button
              type="button"
              role="radio"
              aria-checked={form.interestMethod === "flat"}
              onClick={() => onChange("interestMethod", "flat")}
              className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                form.interestMethod === "flat"
                  ? "bg-brand text-white shadow-sm"
                  : "text-text-muted hover:text-brand-900"
              }`}
            >
              <span>فائدة ثابتة (افتراضي)</span>
              <span className={`text-[10px] ${form.interestMethod === "flat" ? "text-brand-100" : "text-text-muted"}`}>
                Flat Rate
              </span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={form.interestMethod === "reducing"}
              onClick={() => onChange("interestMethod", "reducing")}
              className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                form.interestMethod === "reducing"
                  ? "bg-brand text-white shadow-sm"
                  : "text-text-muted hover:text-brand-900"
              }`}
            >
              <span>رصيد متناقص</span>
              <span className={`text-[10px] ${form.interestMethod === "reducing" ? "text-brand-100" : "text-text-muted"}`}>
                Amortization PMT
              </span>
            </button>
          </div>
          <p className="mt-1.5 text-[11px] text-text-muted font-medium">
            {form.interestMethod === "flat"
              ? "يتم احتساب الفائدة الإجمالية الثابتة على كامل أصل المبلغ وتقسيمها بالتساوي."
              : "يتم احتساب الفائدة دورياً على الرصيد المتبقي المتناقص من القرض."}
          </p>
        </div>
      </div>
    </div>
  );
};
