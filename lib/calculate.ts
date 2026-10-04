import { CalculationInput, CalculationResult, ScheduleItem } from "./types";

/**
 * Pure calculation function for Tasaheel Loan Installment Calculator.
 * 
 * يدعم نظامين لحساب الفائدة:
 * 1) فائدة ثابتة (Flat Rate) - النظام الافتراضي في التمويل متناهي الصغر والمشروعات.
 *    إجمالي الفائدة = المبلغ × (الفائدة السنوية ÷ 100) × (إجمالي عدد الشهور ÷ 12)
 *    إجمالي المسدد = أصل المبلغ + إجمالي الفائدة
 *    قيمة القسط = إجمالي المسدد ÷ عدد الأقساط
 * 
 * 2) رصيد متناقص (Reducing Balance) - نظام الإهلاك المالي القياسي (Amortization PMT).
 *    معدل الفائدة الدوري r = (الفائدة السنوية ÷ 100) × (الفترة بين الدفعات بالشهور ÷ 12)
 *    القسط الدوري PMT = المبلغ × [ r(1+r)^n ] ÷ [ (1+r)^n - 1 ]
 * 
 * @param input بيانات التمويل المدخلة
 * @returns نتيجة الحساب مع جدول السداد المفصل
 */
export function calculateInstallment(input: CalculationInput): CalculationResult {
  const {
    loanAmount,
    annualInterestRate,
    clientType,
    installmentType,
    interestMethod = "flat",
    monthlyDuration = 12,
    repaymentPeriodMonths = 12,
    numberOfPayments = 3,
  } = input;

  // التحقق من صحة المدخلات الأساسية
  if (loanAmount <= 0 || annualInterestRate < 0) {
    throw new Error("بيانات التمويل أو الفائدة غير صالحة");
  }

  // تحديد مدة التمويل وعدد الدفعات والفترة الفاصلة
  let totalPeriodMonths: number;
  let numberOfInstallments: number;
  let intervalMonths: number;
  let paymentFrequencyText: string;

  if (installmentType === "monthly") {
    totalPeriodMonths = Math.max(1, Math.min(36, Math.round(monthlyDuration)));
    numberOfInstallments = totalPeriodMonths;
    intervalMonths = 1;
    paymentFrequencyText = "شهرياً";
  } else {
    totalPeriodMonths = Math.max(1, Math.min(36, Math.round(repaymentPeriodMonths)));
    numberOfInstallments = Math.max(
      1,
      Math.min(totalPeriodMonths, Math.round(numberOfPayments))
    );
    intervalMonths = totalPeriodMonths / numberOfInstallments;
    
    if (intervalMonths === 1) {
      paymentFrequencyText = "شهرياً";
    } else if (Number.isInteger(intervalMonths)) {
      paymentFrequencyText = `كل ${intervalMonths} شهور`;
    } else {
      paymentFrequencyText = `كل ${intervalMonths.toFixed(1)} شهر`;
    }
  }

  let installmentAmount: number;
  let totalInterest: number;
  let totalPayable: number;
  const schedule: ScheduleItem[] = [];

  if (interestMethod === "flat") {
    // ==========================================
    // 1. طريقة الفائدة الثابتة (Flat Rate)
    // ==========================================
    // إجمالي الفائدة المستحقة = المبلغ × النسبة السنوية × (عدد الشهور / 12)
    const annualRateDecimal = annualInterestRate / 100;
    const periodInYears = totalPeriodMonths / 12;
    totalInterest = loanAmount * annualRateDecimal * periodInYears;
    totalPayable = loanAmount + totalInterest;
    installmentAmount = totalPayable / numberOfInstallments;

    const interestPartPerPayment = totalInterest / numberOfInstallments;
    const principalPartPerPayment = loanAmount / numberOfInstallments;

    let runningBalance = loanAmount;

    for (let i = 1; i <= numberOfInstallments; i++) {
      const dueMonth = Math.round(i * intervalMonths);
      const isLast = i === numberOfInstallments;

      // في القسط الأخير نضمن تصفير الرصيد بدقة لتفادي فروق الكسور العشرية
      const currentPrincipal = isLast ? runningBalance : principalPartPerPayment;
      const remaining = isLast ? 0 : Math.max(0, runningBalance - currentPrincipal);
      runningBalance = remaining;

      schedule.push({
        installmentNumber: i,
        dueMonth,
        dueLabel: installmentType === "monthly" ? `الشهر ${dueMonth}` : `الدفعة ${i} (الشهر ${dueMonth})`,
        paymentAmount: installmentAmount,
        interestPart: interestPartPerPayment,
        principalPart: currentPrincipal,
        remainingBalance: remaining,
      });
    }
  } else {
    // ==========================================
    // 2. طريقة الرصيد المتناقص (Reducing Balance - PMT)
    // ==========================================
    // الفائدة الدورية = الفائدة السنوية × (الفترة بين الأقساط بالشهور / 12)
    const periodicRate = (annualInterestRate / 100) * (intervalMonths / 12);
    const n = numberOfInstallments;

    if (periodicRate === 0) {
      installmentAmount = loanAmount / n;
      totalInterest = 0;
      totalPayable = loanAmount;
    } else {
      // قانون القسط الدوري المتساوي: PMT = P * [ r*(1+r)^n / ((1+r)^n - 1) ]
      const compoundFactor = Math.pow(1 + periodicRate, n);
      installmentAmount = loanAmount * ((periodicRate * compoundFactor) / (compoundFactor - 1));
      totalPayable = installmentAmount * n;
      totalInterest = totalPayable - loanAmount;
    }

    let runningBalance = loanAmount;

    for (let i = 1; i <= n; i++) {
      const dueMonth = Math.round(i * intervalMonths);
      const isLast = i === n;

      const interestPart = runningBalance * periodicRate;
      let principalPart = installmentAmount - interestPart;

      let remaining = runningBalance - principalPart;
      if (isLast || remaining < 0) {
        // ضبط القسط الأخير لإنهاء الرصيد بالكامل عند 0
        principalPart = runningBalance;
        remaining = 0;
      }
      runningBalance = remaining;

      schedule.push({
        installmentNumber: i,
        dueMonth,
        dueLabel: installmentType === "monthly" ? `الشهر ${dueMonth}` : `الدفعة ${i} (الشهر ${dueMonth})`,
        paymentAmount: installmentAmount,
        interestPart,
        principalPart,
        remainingBalance: remaining,
      });
    }
  }

  return {
    installmentAmount,
    numberOfInstallments,
    totalInterest,
    totalPayable,
    loanAmount,
    annualRate: annualInterestRate,
    clientType,
    installmentType,
    interestMethod,
    paymentFrequencyText,
    intervalMonths,
    totalPeriodMonths,
    schedule,
  };
}
