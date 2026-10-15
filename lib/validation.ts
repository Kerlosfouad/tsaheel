import { FormState, FormErrors } from "./types";

export const MIN_LOAN_AMOUNT = 5000;
export const MAX_LOAN_AMOUNT = 15000000;
export const MIN_DURATION_MONTHS = 1;
export const MAX_DURATION_MONTHS = 36;

/**
 * التحقق من صحة مدخلات النموذج وإرجاع رسائل الخطأ بالعربية
 */
export function validateForm(form: FormState): {
  isValid: boolean;
  errors: FormErrors;
} {
  const errors: FormErrors = {};

  // 1. التحقق من مبلغ التمويل
  const parsedAmount = parseFloat(form.loanAmount.replace(/,/g, ""));
  if (!form.loanAmount || isNaN(parsedAmount)) {
    errors.loanAmount = "يرجى كتابة مبلغ التمويل المطلوب";
  } else if (parsedAmount < MIN_LOAN_AMOUNT) {
    errors.loanAmount = `الحد الأدنى للتمويل هو ${MIN_LOAN_AMOUNT.toLocaleString("en-US")} جنيه`;
  } else if (parsedAmount > MAX_LOAN_AMOUNT) {
    errors.loanAmount = `الحد الأقصى للتمويل هو ${MAX_LOAN_AMOUNT.toLocaleString("en-US")} جنيه (15 مليون)`;
  }

  // 2. التحقق من نسبة الفائدة السنوية (بدون قيمة افتراضية)
  const parsedRate = parseFloat(form.annualInterestRate);
  if (!form.annualInterestRate || form.annualInterestRate.trim() === "") {
    errors.annualInterestRate = "اكتب نسبة الفائدة السنوية % للبدء في الحساب";
  } else if (isNaN(parsedRate)) {
    errors.annualInterestRate = "يرجى إدخال رقم صحيح لنسبة الفائدة";
  } else if (parsedRate <= 0) {
    errors.annualInterestRate = "نسبة الفائدة يجب أن تكون أكبر من 0%";
  } else if (parsedRate > 100) {
    errors.annualInterestRate = "يرجى التأكد من نسبة الفائدة (الحد الأقصى 100%)";
  }

  // 3. التحقق من تاريخ أول قسط
  if (!form.firstInstallmentDate || form.firstInstallmentDate.trim() === "") {
    errors.firstInstallmentDate = "يرجى تحديد تاريخ أول قسط";
  }

  // 4. التحقق حسب نوع القسط
  if (form.installmentType === "monthly") {
    if (
      !form.monthlyDuration ||
      form.monthlyDuration < MIN_DURATION_MONTHS ||
      form.monthlyDuration > MAX_DURATION_MONTHS
    ) {
      errors.monthlyDuration = `مدة التقسيط يجب أن تكون بين شهر و ${MAX_DURATION_MONTHS} شهراً (3 سنوات)`;
    }
  } else {
    // موسمي: التحقق من عدد الدفعات وكل كام شهر
    const parsedPayments = parseInt(String(form.numberOfPayments || "").trim(), 10);
    const parsedInterval = parseInt(String(form.paymentIntervalMonths || "").trim(), 10);

    if (!form.numberOfPayments || isNaN(parsedPayments) || parsedPayments < 1) {
      errors.numberOfPayments = "يرجى كتابة عدد الدفعات (دفعة واحدة على الأقل)";
    } else if (parsedPayments > 60) {
      errors.numberOfPayments = "الحد الأقصى لعدد الدفعات هو 60 دفعة";
    }

    if (!form.paymentIntervalMonths || isNaN(parsedInterval) || parsedInterval < 1) {
      errors.paymentIntervalMonths = "يرجى كتابة الدورية بالأشهر (شهر واحد على الأقل)";
    } else if (parsedInterval > 36) {
      errors.paymentIntervalMonths = "الحد الأقصى للدورية هو 36 شهراً";
    }

    if (!errors.numberOfPayments && !errors.paymentIntervalMonths) {
      const totalMonths = parsedPayments * parsedInterval;
      if (totalMonths > 120) {
        errors.numberOfPayments = `إجمالي مدة السداد (${totalMonths} شهر) يتجاوز 10 سنوات`;
      }
    }
  }

  const isValid = Object.keys(errors).length === 0;

  return { isValid, errors };
}


