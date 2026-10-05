import React from "react";
import {
  FormState,
  FormErrors,
  InstallmentType,
  InterestMethod,
} from "../lib/types";
import {
  MIN_LOAN_AMOUNT,
  MAX_LOAN_AMOUNT,
  MIN_DURATION_MONTHS,
  MAX_DURATION_MONTHS,
} from "../lib/validation";
import {
  Coins,
  Percent,
  Calendar,
  Layers,
  Clock,
  CalendarDays,
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
];

const MONTHLY_PRESETS = [6, 12, 18, 24, 30, 36];

export const CalculatorForm: React.FC<CalculatorFormProps> = ({
  form,
  errors,
  onChange,
}) => {
  const numericAmount = parseFloat(form.loanAmount.replace(/,/g, "")) || 0;

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

  const setDateToday = () => {
    const today = new Date().toISOString().split("T")[0];
    onChange("firstInstallmentDate", today);
  };

  const setDateNextMonth = () => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    const yyyy = nextMonth.getFullYear();
    const mm = String(nextMonth.getMonth() + 1).padStart(2, "0");
    const dd = String(nextMonth.getDate()).padStart(2, "0");
    onChange("firstInstallmentDate", `${yyyy}-${mm}-${dd}`);
  };

  const seasonalInterval =
    form.numberOfPayments > 0
      ? form.repaymentPeriodMonths / form.numberOfPayments
      : 0;

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-card border border-surface-200 transition-all">
      
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-surface-200 mb-5">
        <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand flex items-center justify-center font-bold shrink-0">
          <Coins className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-brand-900 leading-tight">
            بيانات التمويل المطلوبة
          </h2>
          <p className="text-xs text-text-muted font-medium mt-0.5">
            حدد المبلغ وتاريخ القسط ونظام السداد لحساب القسط وجدول السداد
          </p>
        </div>
      </div>

      <div className="space-y-5 sm:space-y-6">
        
        {/* ==================================================== */}
        {/* 1. Loan Amount */}
        {/* ==================================================== */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
            <label
              htmlFor="loanAmount"
              className="text-xs sm:text-sm font-bold text-brand-900 flex items-center gap-1"
            >
              <span>مبلغ التمويل المطلوب</span>
            </label>
            <span className="text-[11px] text-text-muted font-medium">
              5,000 إلى 15,000,000 ج.م
            </span>
          </div>

          {/* Clean Input Group */}
          <div
            className={`flex rounded-xl border transition-all overflow-hidden ${
              errors.loanAmount
                ? "border-red-400 bg-red-50/30"
                : "border-surface-200 bg-surface-50/60 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand-500/20"
            }`}
          >
            <input
              id="loanAmount"
              type="text"
              inputMode="numeric"
              dir="ltr"
              value={form.loanAmount}
              onChange={handleAmountChange}
              placeholder="100,000"
              className="flex-1 min-w-0 h-12 sm:h-13 px-3.5 text-right text-base sm:text-lg font-bold bg-transparent focus:outline-none text-brand-900"
            />
            <div className="bg-brand-50 px-3 flex items-center text-xs sm:text-sm font-bold text-brand-800 border-r border-brand-200 shrink-0">
              جنيه
            </div>
          </div>

          {errors.loanAmount && (
            <p className="mt-1.5 text-xs text-red-600 font-semibold flex items-center gap-1">
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
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-text-muted font-bold ml-1">
              مبالغ سريعة:
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
        {/* 2. Annual Interest Rate % */}
        {/* ==================================================== */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
            <label
              htmlFor="annualInterestRate"
              className="text-xs sm:text-sm font-bold text-brand-900 flex items-center gap-1.5"
            >
              <Percent className="w-3.5 h-3.5 text-accent-500" />
              <span>الفائدة السنوية %</span>
            </label>
            <span className="text-[10px] px-2 py-0.5 rounded bg-accent-50 text-accent-600 border border-accent-200 font-bold">
              مطلوبة للحساب
            </span>
          </div>

          {/* Clean Input Group */}
          <div
            className={`flex rounded-xl border transition-all overflow-hidden ${
              errors.annualInterestRate
                ? "border-amber-400 bg-amber-50/40"
                : "border-surface-200 bg-surface-50/60 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand-500/20"
            }`}
          >
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
              className="flex-1 min-w-0 h-12 sm:h-13 px-3.5 text-right text-base sm:text-lg font-bold bg-transparent focus:outline-none text-brand-900"
            />
            <div className="bg-surface-100 px-3.5 flex items-center text-sm font-bold text-brand-800 border-r border-surface-200 shrink-0">
              %
            </div>
          </div>

          {errors.annualInterestRate ? (
            <p className="mt-1.5 text-xs text-amber-700 font-semibold flex items-center gap-1">
              <span>💡</span> {errors.annualInterestRate}
            </p>
          ) : (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-text-muted font-medium">نسب مقترحة:</span>
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
          )}
        </div>

        {/* ==================================================== */}
        {/* 3. First Installment Date & Installment Type */}
        {/* ==================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          
          {/* First Installment Date */}
          <div>
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <label
                htmlFor="firstInstallmentDate"
                className="block text-xs sm:text-sm font-bold text-brand-900 flex items-center gap-1.5"
              >
                <CalendarDays className="w-3.5 h-3.5 text-brand" />
                <span>تاريخ أول قسط</span>
              </label>
              <span className="text-[10px] text-text-muted font-medium">
                تاريخ الاستحقاق
              </span>
            </div>

            <div
              className={`flex rounded-xl border transition-all overflow-hidden ${
                errors.firstInstallmentDate
                  ? "border-red-400 bg-red-50/30"
                  : "border-surface-200 bg-surface-50/60 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand-500/20"
              }`}
            >
              <input
                id="firstInstallmentDate"
                type="date"
                dir="ltr"
                value={form.firstInstallmentDate}
                onChange={(e) => onChange("firstInstallmentDate", e.target.value)}
                className="w-full h-12 sm:h-13 px-3.5 text-right font-bold text-xs sm:text-sm bg-transparent focus:outline-none text-brand-900"
              />
            </div>

            {errors.firstInstallmentDate && (
              <p className="mt-1 text-xs text-red-600 font-semibold">
                {errors.firstInstallmentDate}
              </p>
            )}

            {/* Quick date chips */}
            <div className="mt-2 flex items-center gap-1.5">
              <button
                type="button"
                onClick={setDateToday}
                className="px-2 py-0.5 text-[11px] font-bold rounded bg-surface-100 hover:bg-brand-50 hover:text-brand text-text-muted border border-surface-200 transition-colors"
              >
                اليوم
              </button>
              <button
                type="button"
                onClick={setDateNextMonth}
                className="px-2 py-0.5 text-[11px] font-bold rounded bg-surface-100 hover:bg-brand-50 hover:text-brand text-text-muted border border-surface-200 transition-colors"
              >
                بعد شهر
              </button>
            </div>
          </div>

          {/* Installment Type */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-brand-900 mb-1.5">
              نوع القسط
            </label>
            <div
              className="grid grid-cols-2 p-1 bg-surface-100 rounded-xl border border-surface-200 gap-1 h-12 sm:h-13 items-center"
              role="radiogroup"
              aria-label="نوع القسط"
            >
              <button
                type="button"
                role="radio"
                aria-checked={form.installmentType === "monthly"}
                onClick={() => onChange("installmentType", "monthly")}
                className={`h-10 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                  form.installmentType === "monthly"
                    ? "bg-brand text-white shadow-xs"
                    : "text-text-muted hover:text-brand-900"
                }`}
              >
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>شهري</span>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={form.installmentType === "seasonal"}
                onClick={() => onChange("installmentType", "seasonal")}
                className={`h-10 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                  form.installmentType === "seasonal"
                    ? "bg-brand text-white shadow-xs"
                    : "text-text-muted hover:text-brand-900"
                }`}
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span>موسمي</span>
              </button>
            </div>
          </div>

        </div>

        {/* ==================================================== */}
        {/* 4. Duration Controls */}
        {/* ==================================================== */}
        {form.installmentType === "monthly" ? (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-brand-50/50 border border-brand-100 transition-all">
            <div className="flex flex-wrap items-center justify-between gap-1 mb-2">
              <label
                htmlFor="monthlyDuration"
                className="text-xs sm:text-sm font-bold text-brand-900 flex items-center gap-1"
              >
                <Clock className="w-3.5 h-3.5 text-brand shrink-0" />
                <span>مدة التقسيط</span>
              </label>
              <div className="text-brand font-black text-xs sm:text-sm">
                {form.monthlyDuration} شهر{" "}
                <span className="text-[11px] font-normal text-text-muted">
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
              className="w-full h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer"
              aria-label="مدة التقسيط بالشهور"
            />

            {errors.monthlyDuration && (
              <p className="mt-1 text-xs text-red-600 font-semibold">
                {errors.monthlyDuration}
              </p>
            )}

            {/* Monthly quick chips */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-text-muted font-bold ml-1">
                المدد الشائعة:
              </span>
              {MONTHLY_PRESETS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => onChange("monthlyDuration", m)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
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
          <div className="p-3.5 sm:p-4 rounded-2xl bg-accent-50/40 border border-accent-200 transition-all space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-1.5 pb-2 border-b border-accent-200/60">
              <span className="text-xs sm:text-sm font-bold text-brand-900 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-accent-500 shrink-0" />
                <span>نظام السداد الموسمي</span>
              </span>
              <div className="text-[11px] px-2.5 py-0.5 rounded-full bg-accent-500 text-white font-bold">
                {seasonalInterval > 0 &&
                  (Number.isInteger(seasonalInterval)
                    ? `دفعة كل ${seasonalInterval} شهور`
                    : `دفعة كل ${seasonalInterval.toFixed(1)} شهر`)}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Repayment Period */}
              <div>
                <label
                  htmlFor="repaymentPeriodMonths"
                  className="block text-xs font-bold text-brand-900 mb-1"
                >
                  فترة السداد الكلية
                </label>
                <select
                  id="repaymentPeriodMonths"
                  value={form.repaymentPeriodMonths}
                  onChange={(e) => {
                    const period = parseInt(e.target.value, 10);
                    onChange("repaymentPeriodMonths", period);
                    const maxAllowed = Math.min(12, period);
                    if (form.numberOfPayments > maxAllowed) {
                      onChange("numberOfPayments", maxAllowed);
                    }
                  }}
                  className="w-full h-11 px-3 rounded-xl border border-surface-200 bg-white font-bold text-xs sm:text-sm text-brand-900 focus:outline-none focus:ring-2 focus:ring-accent-400"
                >
                  {Array.from({ length: 36 }, (_, i) => i + 1).map((m) => (
                    <option key={`period-${m}`} value={m}>
                      {m} شهر ({(m / 12).toFixed(1)} سنة)
                    </option>
                  ))}
                </select>
                {errors.repaymentPeriodMonths && (
                  <p className="mt-1 text-xs text-red-600 font-semibold">
                    {errors.repaymentPeriodMonths}
                  </p>
                )}
              </div>

              {/* Number of Payments (Max 12) */}
              <div>
                <label
                  htmlFor="numberOfPayments"
                  className="block text-xs font-bold text-brand-900 mb-1"
                >
                  عدد الدفعات (بحد أقصى 12 دفعة)
                </label>
                <select
                  id="numberOfPayments"
                  value={form.numberOfPayments}
                  onChange={(e) =>
                    onChange("numberOfPayments", parseInt(e.target.value, 10))
                  }
                  className="w-full h-11 px-3 rounded-xl border border-surface-200 bg-white font-bold text-xs sm:text-sm text-brand-900 focus:outline-none focus:ring-2 focus:ring-accent-400"
                >
                  {Array.from(
                    { length: Math.min(12, form.repaymentPeriodMonths) },
                    (_, i) => i + 1
                  ).map((p) => {
                    const interval = form.repaymentPeriodMonths / p;
                    const intervalLabel =
                      interval === 1
                        ? "شهرياً"
                        : Number.isInteger(interval)
                        ? `كل ${interval} شهور`
                        : `كل ${interval.toFixed(1)} شهر`;

                    const labelText =
                      p === 1
                        ? `دفعة واحدة (${intervalLabel})`
                        : `${p} دفعات (${intervalLabel})`;

                    return (
                      <option key={`payment-opt-${p}`} value={p}>
                        {labelText}
                      </option>
                    );
                  })}
                </select>
                {errors.numberOfPayments && (
                  <p className="mt-1 text-xs text-red-600 font-semibold">
                    {errors.numberOfPayments}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* 5. Interest Method */}
        {/* ==================================================== */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-brand-900 mb-1.5">
            طريقة حساب الفائدة
          </label>
          <div
            className="grid grid-cols-2 p-1 bg-surface-100 rounded-xl border border-surface-200 gap-1"
            role="radiogroup"
            aria-label="طريقة حساب الفائدة"
          >
            <button
              type="button"
              role="radio"
              aria-checked={form.interestMethod === "flat"}
              onClick={() => onChange("interestMethod", "flat")}
              className={`py-2 px-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex flex-col items-center justify-center ${
                form.interestMethod === "flat"
                  ? "bg-brand text-white shadow-xs"
                  : "text-text-muted hover:text-brand-900"
              }`}
            >
              <span>فائدة ثابتة</span>
              <span className={`text-[10px] ${form.interestMethod === "flat" ? "text-brand-100" : "text-text-muted"}`}>
                Flat Rate
              </span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={form.interestMethod === "reducing"}
              onClick={() => onChange("interestMethod", "reducing")}
              className={`py-2 px-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex flex-col items-center justify-center ${
                form.interestMethod === "reducing"
                  ? "bg-brand text-white shadow-xs"
                  : "text-text-muted hover:text-brand-900"
              }`}
            >
              <span>رصيد متناقص</span>
              <span className={`text-[10px] ${form.interestMethod === "reducing" ? "text-brand-100" : "text-text-muted"}`}>
                PMT
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

