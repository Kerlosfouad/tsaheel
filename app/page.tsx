"use client";

import React, { useState, useMemo } from "react";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { CalculatorForm } from "../components/CalculatorForm";
import { ResultCard } from "../components/ResultCard";
import { ScheduleTable } from "../components/ScheduleTable";
import { Footer } from "../components/Footer";
import { FormState, CalculationResult } from "../lib/types";
import { validateForm } from "../lib/validation";
import { calculateInstallment } from "../lib/calculate";
import { formatCurrency, formatPercent } from "../lib/format";

const INITIAL_FORM_STATE: FormState = {
  loanAmount: "100,000",
  annualInterestRate: "", // فارغ بدون قيمة افتراضية
  clientType: "new",
  installmentType: "monthly",
  interestMethod: "flat",
  monthlyDuration: 12,
  repaymentPeriodMonths: 12,
  numberOfPayments: 3,
};

export default function Home() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE);

  // Validate form
  const { isValid, errors } = useMemo(() => validateForm(form), [form]);

  // Calculate live results when valid
  const result: CalculationResult | null = useMemo(() => {
    if (!isValid) return null;

    try {
      const parsedAmount = parseFloat(form.loanAmount.replace(/,/g, ""));
      const parsedRate = parseFloat(form.annualInterestRate);

      return calculateInstallment({
        loanAmount: parsedAmount,
        annualInterestRate: parsedRate,
        clientType: form.clientType,
        installmentType: form.installmentType,
        interestMethod: form.interestMethod,
        monthlyDuration: form.monthlyDuration,
        repaymentPeriodMonths: form.repaymentPeriodMonths,
        numberOfPayments: form.numberOfPayments,
      });
    } catch (err) {
      console.error("Calculation error:", err);
      return null;
    }
  }, [form, isValid]);

  const handleFieldChange = <K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleReset = () => {
    setForm(INITIAL_FORM_STATE);
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-50">
      
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <Hero />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Print-Only Header */}
        <div className="hidden print-only mb-6 pb-4 border-b-2 border-brand-900">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black text-brand-900">
                تساهيل للتمويل - تقرير حساب القسط
              </h1>
              <p className="text-xs text-gray-600 mt-1">
                تاريخ الاستخراج: {new Date().toLocaleDateString("ar-EG")} - الخط الساخن: 16134
              </p>
            </div>
            <div className="text-right text-xs font-bold text-gray-700">
              www.tasaheelfinance.com
            </div>
          </div>
          {result && (
            <div className="grid grid-cols-4 gap-3 mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold">
              <div>مبلغ التمويل: {formatCurrency(result.loanAmount)}</div>
              <div>الفائدة السنوية: {formatPercent(result.annualRate)}</div>
              <div>نظام السداد: {result.installmentType === "monthly" ? "شهري" : "موسمي"}</div>
              <div>قيمة القسط: {formatCurrency(result.installmentAmount)}</div>
            </div>
          )}
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* Left / Top Form (6 Cols on desktop) */}
          <div className="lg:col-span-6 space-y-6">
            <CalculatorForm
              form={form}
              errors={errors}
              onChange={handleFieldChange}
              onReset={handleReset}
            />
          </div>

          {/* Right / Bottom Results (6 Cols on desktop) */}
          <div className="lg:col-span-6 space-y-6">
            <ResultCard
              result={result}
              isValid={isValid}
              onReset={handleReset}
            />

            {/* Repayment Schedule Table */}
            {result && <ScheduleTable result={result} />}
          </div>

        </div>

      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}
