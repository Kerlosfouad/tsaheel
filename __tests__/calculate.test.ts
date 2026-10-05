import { describe, it, expect } from "vitest";
import { calculateInstallment, computeDueDate } from "../lib/calculate";

describe("Loan Calculation Logic (حاسبة أقساط تساهيل)", () => {
  // Test Case 1: 100,000 EGP, 24% annual, monthly, 12 months, flat.
  it("Test Case 1: 100,000 EGP, 24% annual, monthly, 12 months, flat", () => {
    const result = calculateInstallment({
      loanAmount: 100000,
      annualInterestRate: 24,
      firstInstallmentDate: "2026-11-05",
      installmentType: "monthly",
      interestMethod: "flat",
      monthlyDuration: 12,
    });

    expect(result.loanAmount).toBe(100000);
    expect(result.numberOfInstallments).toBe(12);
    expect(result.totalInterest).toBe(24000);
    expect(result.totalPayable).toBe(124000);
    expect(result.installmentAmount).toBeCloseTo(10333.33, 2);
    expect(result.paymentFrequencyText).toBe("شهرياً");
    expect(result.schedule.length).toBe(12);
    expect(result.schedule[0].dueDate).toBe("2026-11-05");
    expect(result.schedule[0].formattedDueDate).toBe("05/11/2026");
    expect(result.schedule[1].dueDate).toBe("2026-12-05");
    expect(result.schedule[11].remainingBalance).toBe(0);
  });

  // Test Case 2: 200,000 EGP, 20% annual, seasonal, 12-month period, 3 payments, flat.
  it("Test Case 2: 200,000 EGP, 20% annual, seasonal, 12-month period, 3 payments, flat", () => {
    const result = calculateInstallment({
      loanAmount: 200000,
      annualInterestRate: 20,
      firstInstallmentDate: "2026-11-01",
      installmentType: "seasonal",
      interestMethod: "flat",
      repaymentPeriodMonths: 12,
      numberOfPayments: 3,
    });

    expect(result.loanAmount).toBe(200000);
    expect(result.numberOfInstallments).toBe(3);
    expect(result.totalInterest).toBe(40000);
    expect(result.totalPayable).toBe(240000);
    expect(result.installmentAmount).toBe(80000);
    expect(result.intervalMonths).toBe(4);
    expect(result.paymentFrequencyText).toBe("كل 4 شهور");
    expect(result.schedule.length).toBe(3);
    expect(result.schedule[0].dueMonth).toBe(4);
    expect(result.schedule[0].dueDate).toBe("2026-11-01");
    expect(result.schedule[1].dueDate).toBe("2027-03-01");
    expect(result.schedule[2].dueMonth).toBe(12);
    expect(result.schedule[2].dueDate).toBe("2027-07-01");
    expect(result.schedule[2].remainingBalance).toBe(0);
  });

  // Test Case 3: 50,000 EGP, 18% annual, monthly, 36 months, reducing balance.
  it("Test Case 3: 50,000 EGP, 18% annual, monthly, 36 months, reducing balance", () => {
    const result = calculateInstallment({
      loanAmount: 50000,
      annualInterestRate: 18,
      firstInstallmentDate: "2026-10-15",
      installmentType: "monthly",
      interestMethod: "reducing",
      monthlyDuration: 36,
    });

    expect(result.loanAmount).toBe(50000);
    expect(result.numberOfInstallments).toBe(36);
    // PMT = 50000 * (0.015 * 1.015^36) / (1.015^36 - 1) ≈ 1807.62
    expect(result.installmentAmount).toBeCloseTo(1807.62, 2);
    expect(result.totalPayable).toBeCloseTo(65074.31, 1);
    expect(result.totalInterest).toBeCloseTo(15074.31, 1);
    expect(result.schedule.length).toBe(36);
    expect(result.schedule[0].dueDate).toBe("2026-10-15");
    expect(result.schedule[35].remainingBalance).toBe(0);
  });

  // Extra Test: Seasonal with reducing balance
  it("handles seasonal payments with reducing balance correctly", () => {
    const result = calculateInstallment({
      loanAmount: 120000,
      annualInterestRate: 18,
      firstInstallmentDate: "2026-10-01",
      installmentType: "seasonal",
      interestMethod: "reducing",
      repaymentPeriodMonths: 12,
      numberOfPayments: 4, // every 3 months
    });

    expect(result.numberOfInstallments).toBe(4);
    expect(result.intervalMonths).toBe(3);
    expect(result.paymentFrequencyText).toBe("كل 3 شهور");
    expect(result.schedule.length).toBe(4);
    expect(result.schedule[0].dueDate).toBe("2026-10-01");
    expect(result.schedule[1].dueDate).toBe("2027-01-01");
    expect(result.schedule[3].remainingBalance).toBe(0);
  });

  // Error handling test
  it("throws error for negative or zero values", () => {
    expect(() =>
      calculateInstallment({
        loanAmount: 0,
        annualInterestRate: 20,
        installmentType: "monthly",
        interestMethod: "flat",
      })
    ).toThrow();
  });
});

