import { CalculationResult } from "./types";

/**
 * تنسيق المبالغ المالية بالجنيه المصري بالأرقام الإنجليزية القياسية وفواصل الآلاف
 */
export function formatCurrency(
  amount: number,
  options?: {
    showCurrency?: boolean;
    decimals?: number;
  }
): string {
  const { showCurrency = true, decimals = 2 } = options || {};

  if (isNaN(amount) || amount === null || amount === undefined) {
    return showCurrency ? "0 جنيه" : "0";
  }

  // استخدام Intl.NumberFormat مع en-US لضمان أرقام 0-9
  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals === 0 ? 0 : 2,
    maximumFractionDigits: decimals,
  });

  const formattedNumber = formatter.format(amount);
  return showCurrency ? `${formattedNumber} جنيه` : formattedNumber;
}

/**
 * تنسيق الأرقام البسيطة بدون كسور عشرية
 */
export function formatNumber(val: number): string {
  if (isNaN(val)) return "0";
  return new Intl.NumberFormat("en-US").format(val);
}

/**
 * تنسيق النسبة المئوية
 */
export function formatPercent(rate: number): string {
  if (isNaN(rate)) return "0%";
  return `${rate}%`;
}

/**
 * إنشاء ملخص نصي أنيق باللغة العربية لمشاركته أو طباعته
 */
export function generateShareableSummary(result: CalculationResult): string {
  const installmentTypeLabel =
    result.installmentType === "monthly" ? "شهري" : "موسمي";
  const methodLabel =
    result.interestMethod === "flat" ? "فائدة ثابتة" : "رصيد متناقص";

  const lines = [
    "━━━━━━━━━━━━━━━━━━━━━━━━",
    "🏢 تساهيل للتمويل - ملخص حساب القسط",
    "━━━━━━━━━━━━━━━━━━━━━━━━",
    `💰 مبلغ التمويل: ${formatCurrency(result.loanAmount)}`,
    `📊 الفائدة السنوية: ${formatPercent(result.annualRate)}`,
    `📅 تاريخ أول قسط: ${result.firstInstallmentDate}`,
    `🔄 نظام السداد: ${installmentTypeLabel} (${result.paymentFrequencyText})`,
    `⏳ إجمالي المدة: ${result.totalPeriodMonths} شهر (${result.numberOfInstallments} ${result.installmentType === "monthly" ? "أقساط" : "دفعات"})`,
    `📈 طريقة الحساب: ${methodLabel}`,
    "────────────────────────",
    `💳 قيمة القسط: ${formatCurrency(result.installmentAmount)} (${result.paymentFrequencyText})`,
    `🏷️ إجمالي الفائدة: ${formatCurrency(result.totalInterest)}`,
    `💵 إجمالي المبلغ المسدد: ${formatCurrency(result.totalPayable)}`,
    "━━━━━━━━━━━━━━━━━━━━━━━━",
    "⚠️ ملحوظة: هذا الحساب تقديري ولا يمثل عرضاً نهائياً. القيمة النهائية تحدد بعد الاستعلام الائتماني والميداني وموافقة الشركة.",
  ];

  return lines.join("\n");
}

