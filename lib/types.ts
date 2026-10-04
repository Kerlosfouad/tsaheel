/**
 * Type definitions for Tasaheel Loan Calculator
 */

export type ClientType = "new" | "renew"; // عميل جديد | تجديد
export type InstallmentType = "monthly" | "seasonal"; // شهري | موسمي
export type InterestMethod = "flat" | "reducing"; // فائدة ثابتة | رصيد متناقص

export interface CalculationInput {
  loanAmount: number; // مبلغ التمويل بالجنيه
  annualInterestRate: number; // الفائدة السنوية %
  clientType: ClientType; // نوع العميل
  installmentType: InstallmentType; // نوع القسط
  interestMethod: InterestMethod; // طريقة حساب الفائدة (افتراضي: flat)
  
  // خاص بالشهري
  monthlyDuration?: number; // مدة التقسيط بالشهور (1-36)
  
  // خاص بالموسمي
  repaymentPeriodMonths?: number; // فترة السداد بالشهور (1-36)
  numberOfPayments?: number; // عدد الدفعات
}

export interface ScheduleItem {
  installmentNumber: number; // رقم القسط
  dueMonth: number; // الشهر المستحق (أو ترتيب الدفعة)
  dueLabel: string; // تسمية موعد السداد (مثال: "الشهر 4")
  paymentAmount: number; // قيمة القسط
  interestPart: number; // جزء الفائدة
  principalPart: number; // جزء أصل المبلغ
  remainingBalance: number; // الرصيد المتبقي
}

export interface CalculationResult {
  installmentAmount: number; // قيمة القسط الواحد
  numberOfInstallments: number; // إجمالي عدد الأقساط / الدفعات
  totalInterest: number; // إجمالي الفائدة المستحقة
  totalPayable: number; // إجمالي المبلغ المسدد (الأصل + الفائدة)
  loanAmount: number; // أصل التمويل
  annualRate: number; // الفائدة السنوية
  clientType: ClientType;
  installmentType: InstallmentType;
  interestMethod: InterestMethod;
  
  // تفاصيل إضافية
  paymentFrequencyText: string; // نص دورية السداد (مثال: "شهرياً" أو "كل 4 شهور")
  intervalMonths: number; // الفترة بين الدفعات بالشهور
  totalPeriodMonths: number; // إجمالي مدة التمويل بالشهور
  
  // جدول السداد
  schedule: ScheduleItem[];
}

export interface FormState {
  loanAmount: string; // كـ string لتسهيل الكتابة والتحكم
  annualInterestRate: string; // فارغ مبدئياً
  clientType: ClientType;
  installmentType: InstallmentType;
  interestMethod: InterestMethod;
  monthlyDuration: number;
  repaymentPeriodMonths: number;
  numberOfPayments: number;
}

export interface FormErrors {
  loanAmount?: string;
  annualInterestRate?: string;
  monthlyDuration?: string;
  repaymentPeriodMonths?: string;
  numberOfPayments?: string;
}
