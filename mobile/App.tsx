import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Share,
  Platform,
  Linking,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { FormState, CalculationResult } from "./lib/types";
import {
  validateForm,
  MIN_LOAN_AMOUNT,
  MAX_LOAN_AMOUNT,
  MIN_DURATION_MONTHS,
  MAX_DURATION_MONTHS,
} from "./lib/validation";
import { calculateInstallment } from "./lib/calculate";
import {
  formatCurrency,
  formatPercent,
  generateShareableSummary,
} from "./lib/format";
import { exportSchedulePDF } from "./lib/pdfExport";

const getTodayDateString = () => {
  return new Date().toISOString().split("T")[0];
};

const INITIAL_FORM_STATE: FormState = {
  loanAmount: "100,000",
  annualInterestRate: "",
  firstInstallmentDate: getTodayDateString(),
  installmentType: "monthly",
  interestMethod: "reducing",
  monthlyDuration: 12,
  repaymentPeriodMonths: 12,
  numberOfPayments: "3",
  paymentIntervalMonths: "4",
};

const POPULAR_AMOUNTS = [
  { label: "25 ألف", value: 25000 },
  { label: "50 ألف", value: 50000 },
  { label: "100 ألف", value: 100000 },
  { label: "250 ألف", value: 250000 },
  { label: "500 ألف", value: 500000 },
  { label: "1 مليون", value: 1000000 },
];

const YEAR_TARGETS = [
  { label: "1 سنة", months: 12 },
  { label: "1.5 سنة", months: 18 },
  { label: "2 سنة", months: 24 },
  { label: "2.5 سنة", months: 30 },
  { label: "3 سنوات", months: 36 },
];

const MONTHLY_PRESETS = [6, 12, 18, 24, 30, 36];

/**
 * Tasaheel Official Stacked Layers Vector Logo
 */
const TasaheelLogo: React.FC<{ size?: number }> = ({ size = 22 }) => (
  <View style={styles.logoBox}>
    <MaterialCommunityIcons name="layers-triple" size={size} color="#ffffff" />
  </View>
);

export default function App() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE);
  const [isScheduleExpanded, setIsScheduleExpanded] = useState<boolean>(true);
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);

  // Form Validation
  const { isValid, errors } = useMemo(() => validateForm(form), [form]);

  // Calculation Result
  const result: CalculationResult | null = useMemo(() => {
    if (!isValid) return null;

    try {
      const parsedAmount = parseFloat(form.loanAmount.replace(/,/g, ""));
      const parsedRate = parseFloat(form.annualInterestRate);
      const parsedPayments = parseInt(String(form.numberOfPayments), 10);
      const parsedInterval = parseInt(String(form.paymentIntervalMonths), 10);
      const totalMonths =
        !isNaN(parsedPayments) && !isNaN(parsedInterval)
          ? parsedPayments * parsedInterval
          : 12;

      return calculateInstallment({
        loanAmount: parsedAmount,
        annualInterestRate: parsedRate,
        firstInstallmentDate: form.firstInstallmentDate,
        installmentType: form.installmentType,
        interestMethod: form.interestMethod,
        monthlyDuration: form.monthlyDuration,
        repaymentPeriodMonths: totalMonths,
        numberOfPayments: parsedPayments || 3,
        paymentIntervalMonths: parsedInterval || 4,
      });
    } catch (err) {
      console.error("Calculation error:", err);
      return null;
    }
  }, [form, isValid]);

  const handleAmountChange = (text: string) => {
    const rawVal = text.replace(/[^0-9]/g, "");
    if (!rawVal) {
      setForm((prev) => ({ ...prev, loanAmount: "" }));
      return;
    }
    const num = parseInt(rawVal, 10);
    setForm((prev) => ({ ...prev, loanAmount: num.toLocaleString("en-US") }));
  };

  const adjustAmount = (delta: number) => {
    const current = parseFloat(form.loanAmount.replace(/,/g, "")) || 0;
    const next = Math.max(MIN_LOAN_AMOUNT, Math.min(MAX_LOAN_AMOUNT, current + delta));
    setForm((prev) => ({ ...prev, loanAmount: next.toLocaleString("en-US") }));
  };

  const handleAmountPreset = (val: number) => {
    setForm((prev) => ({ ...prev, loanAmount: val.toLocaleString("en-US") }));
  };

  const adjustRate = (delta: number) => {
    const current = parseFloat(form.annualInterestRate) || 20;
    const next = Math.max(0.1, Math.min(100, parseFloat((current + delta).toFixed(1))));
    setForm((prev) => ({ ...prev, annualInterestRate: next.toString() }));
  };

  const adjustDuration = (deltaMonths: number) => {
    const current = form.monthlyDuration || 12;
    const next = Math.max(MIN_DURATION_MONTHS, Math.min(MAX_DURATION_MONTHS, current + deltaMonths));
    setForm((prev) => ({ ...prev, monthlyDuration: next }));
  };

  const adjustPaymentsCount = (delta: number) => {
    const current = parseInt(String(form.numberOfPayments || "3"), 10) || 3;
    const next = Math.max(1, Math.min(36, current + delta));
    setForm((prev) => ({ ...prev, numberOfPayments: next.toString() }));
  };

  const adjustIntervalMonths = (delta: number) => {
    const current = parseInt(String(form.paymentIntervalMonths || "4"), 10) || 4;
    const next = Math.max(1, Math.min(24, current + delta));
    setForm((prev) => ({ ...prev, paymentIntervalMonths: next.toString() }));
  };

  const setDateToday = () => {
    setForm((prev) => ({ ...prev, firstInstallmentDate: getTodayDateString() }));
  };

  const setDateNextMonth = () => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    const yyyy = nextMonth.getFullYear();
    const mm = String(nextMonth.getMonth() + 1).padStart(2, "0");
    const dd = String(nextMonth.getDate()).padStart(2, "0");
    setForm((prev) => ({
      ...prev,
      firstInstallmentDate: `${yyyy}-${mm}-${dd}`,
    }));
  };

  const handleCallHotline = () => {
    Linking.openURL("tel:16134").catch(() => {
      Alert.alert("الخط الساخن", "رقم الخط الساخن لشركة تساهيل: 16134");
    });
  };

  const handleShare = async () => {
    if (!result) return;
    try {
      const message = generateShareableSummary(result);
      await Share.share({
        message,
        title: "حاسبة أقساط تساهيل",
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleDownloadPDF = async () => {
    if (!result) return;
    try {
      setIsExportingPDF(true);
      await exportSchedulePDF(result);
    } catch (error) {
      console.error("Error generating PDF:", error);
      Alert.alert("تنبيه", "حدث خطأ أثناء إصدار ملف الـ PDF، يرجى المحاولة مرة أخرى.");
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleReset = () => {
    setForm(INITIAL_FORM_STATE);
  };

  const numericAmount = parseFloat(form.loanAmount.replace(/,/g, "")) || 0;
  const parsedPayments = parseInt(String(form.numberOfPayments || ""), 10) || 0;
  const parsedInterval = parseInt(String(form.paymentIntervalMonths || ""), 10) || 0;
  const seasonalTotalMonths = parsedPayments * parsedInterval;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#004d40" />

      {/* ==================================================== */}
      {/* 1. Official Header (نفس هيدر الموقع) */}
      {/* ==================================================== */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {/* Logo & Brand Info */}
          <View style={styles.headerBrandRow}>
            <TasaheelLogo size={24} />
            <View style={styles.headerTitles}>
              <Text style={styles.headerTitle}>تساهيل</Text>
              <Text style={styles.headerSubtitle}>
                البرنامج التقديري لحساب أقساط تمويل المشروعات
              </Text>
            </View>
          </View>

          {/* Hotline Button */}
          <TouchableOpacity
            style={styles.hotlineButton}
            onPress={handleCallHotline}
            activeOpacity={0.8}
          >
            <View style={styles.hotlineIcon}>
              <Ionicons name="call" size={14} color="#004d40" />
            </View>
            <View style={styles.hotlineTextCol}>
              <Text style={styles.hotlineLabel}>الخط الساخن</Text>
              <Text style={styles.hotlineNumber}>16134</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ==================================================== */}
        {/* 2. Hero Section (نفس الهيرو في الموقع) */}
        {/* ==================================================== */}
        <View style={styles.heroSection}>
          <View style={styles.heroBadge}>
            <Ionicons name="sparkles" size={13} color="#d97706" />
            <Text style={styles.heroBadgeText}>حاسبة أقساط التمويل الميسر</Text>
          </View>

          <Text style={styles.heroTitle}>
            احسب قسطك مع <Text style={styles.heroHighlight}>تساهيل</Text>
          </Text>

          <Text style={styles.heroSubtitle}>
            تمويل يبدأ من <Text style={styles.heroBold}>5,000 جنيه</Text> حتى{" "}
            <Text style={styles.heroBold}>15 مليون جنيه</Text> بأنظمة سداد ميسرة.
          </Text>

          {/* Feature Pills */}
          <View style={styles.heroPillsRow}>
            <View style={styles.heroPill}>
              <Ionicons name="checkmark-circle" size={13} color="#00796b" />
              <Text style={styles.heroPillText}>أقساط شهرية وموسمية</Text>
            </View>
            <View style={styles.heroPill}>
              <Ionicons name="time" size={13} color="#d97706" />
              <Text style={styles.heroPillText}>سداد حتى 36 شهراً</Text>
            </View>
            <View style={styles.heroPill}>
              <Ionicons name="trending-up" size={13} color="#00796b" />
              <Text style={styles.heroPillText}>فائدة ثابتة أو متناقصة</Text>
            </View>
          </View>
        </View>

        {/* ==================================================== */}
        {/* 3. Calculator Form Card */}
        {/* ==================================================== */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Ionicons name="cash-outline" size={20} color="#004d40" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardHeaderTitle}>بيانات التمويل المطلوبة</Text>
              <Text style={styles.cardHeaderSubtitle}>
                حدد المبلغ وتاريخ القسط ونظام السداد لحساب القسط وجدول السداد
              </Text>
            </View>
          </View>

          {/* ---------------- 1. Loan Amount ---------------- */}
          <View style={styles.fieldSection}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>مبلغ التمويل المطلوب</Text>
              <Text style={styles.hintText}>5,000 إلى 15,000,000 ج.م</Text>
            </View>

            {/* Input & Suffix */}
            <View style={[styles.inputGroup, errors.loanAmount && styles.inputError]}>
              <TextInput
                style={styles.inputField}
                value={form.loanAmount}
                onChangeText={handleAmountChange}
                placeholder="100,000"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
              />
              <View style={styles.inputSuffix}>
                <Text style={styles.suffixText}>جنيه</Text>
              </View>
            </View>

            {errors.loanAmount && (
              <Text style={styles.errorText}>⚠️ {errors.loanAmount}</Text>
            )}

            {/* Steppers (+ / - adjustments) */}
            <View style={styles.steppersRow}>
              <TouchableOpacity
                onPress={() => adjustAmount(50000)}
                style={styles.stepperBtn}
              >
                <Text style={styles.stepperBtnText}>+ 50 ألف</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => adjustAmount(10000)}
                style={styles.stepperBtn}
              >
                <Text style={styles.stepperBtnText}>+ 10 آلاف</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => adjustAmount(-10000)}
                style={styles.stepperBtn}
              >
                <Text style={styles.stepperBtnText}>- 10 آلاف</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => adjustAmount(-50000)}
                style={styles.stepperBtn}
              >
                <Text style={styles.stepperBtnText}>- 50 ألف</Text>
              </TouchableOpacity>
            </View>

            {/* Amount Presets */}
            <View style={styles.presetContainer}>
              <Text style={styles.presetTitle}>مبالغ سريعة:</Text>
              <View style={styles.chipsRow}>
                {POPULAR_AMOUNTS.map((p) => {
                  const isSelected = numericAmount === p.value;
                  return (
                    <TouchableOpacity
                      key={p.value}
                      onPress={() => handleAmountPreset(p.value)}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextSelected,
                        ]}
                      >
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* ---------------- 2. Annual Interest Rate % ---------------- */}
          <View style={styles.fieldSection}>
            <View style={styles.labelRow}>
              <View style={styles.rowAlign}>
                <MaterialCommunityIcons name="percent" size={15} color="#d97706" />
                <Text style={[styles.fieldLabel, { marginRight: 4 }]}>
                  الفائدة السنوية %
                </Text>
              </View>
              <View style={styles.badgeRequired}>
                <Text style={styles.badgeRequiredText}>مطلوبة للحساب</Text>
              </View>
            </View>

            <View
              style={[
                styles.inputGroup,
                errors.annualInterestRate && styles.inputWarning,
              ]}
            >
              <TextInput
                style={styles.inputField}
                value={form.annualInterestRate}
                onChangeText={(text) =>
                  setForm((prev) => ({ ...prev, annualInterestRate: text }))
                }
                placeholder="اكتب النسبة (مثال: 20 أو 24)"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
              />
              <View style={styles.inputSuffix}>
                <Text style={styles.suffixText}>%</Text>
              </View>
            </View>

            {errors.annualInterestRate ? (
              <Text style={styles.warningText}>💡 {errors.annualInterestRate}</Text>
            ) : null}

            {/* Steppers & Suggested Rates */}
            <View style={styles.steppersRow}>
              <TouchableOpacity
                onPress={() => adjustRate(1)}
                style={styles.stepperBtn}
              >
                <Text style={styles.stepperBtnText}>+ 1%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => adjustRate(0.5)}
                style={styles.stepperBtn}
              >
                <Text style={styles.stepperBtnText}>+ 0.5%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => adjustRate(-0.5)}
                style={styles.stepperBtn}
              >
                <Text style={styles.stepperBtnText}>- 0.5%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => adjustRate(-1)}
                style={styles.stepperBtn}
              >
                <Text style={styles.stepperBtnText}>- 1%</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.presetContainer}>
              <Text style={styles.presetTitle}>نسب مقترحة:</Text>
              <View style={styles.chipsRow}>
                {[18, 20, 22, 24].map((r) => {
                  const isSelected = form.annualInterestRate === r.toString();
                  return (
                    <TouchableOpacity
                      key={r}
                      onPress={() =>
                        setForm((prev) => ({
                          ...prev,
                          annualInterestRate: r.toString(),
                        }))
                      }
                      style={[
                        styles.chip,
                        isSelected && styles.chipAccentSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextSelected,
                        ]}
                      >
                        {r}%
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* ---------------- 3. First Date & Installment Type ---------------- */}
          <View style={styles.fieldSection}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>تاريخ استحقاق أول قسط</Text>
              <Text style={styles.hintText}>يوم-شهر-سنة</Text>
            </View>

            <View style={styles.inputGroup}>
              <TextInput
                style={styles.inputField}
                value={form.firstInstallmentDate}
                onChangeText={(text) =>
                  setForm((prev) => ({ ...prev, firstInstallmentDate: text }))
                }
                placeholder="2026-05-01"
                placeholderTextColor="#94a3b8"
              />
              <View style={styles.inputSuffix}>
                <Ionicons name="calendar-outline" size={16} color="#004d40" />
              </View>
            </View>

            <View style={styles.dateButtonsRow}>
              <TouchableOpacity
                onPress={setDateToday}
                style={styles.dateQuickBtn}
              >
                <Text style={styles.dateQuickBtnText}>اليوم</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={setDateNextMonth}
                style={styles.dateQuickBtn}
              >
                <Text style={styles.dateQuickBtnText}>بعد شهر</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ---------------- 4. Installment Type Toggle ---------------- */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>نوع القسط</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                onPress={() =>
                  setForm((prev) => ({ ...prev, installmentType: "monthly" }))
                }
                style={[
                  styles.toggleButton,
                  form.installmentType === "monthly" && styles.toggleButtonActive,
                ]}
              >
                <Ionicons
                  name="calendar"
                  size={16}
                  color={form.installmentType === "monthly" ? "#ffffff" : "#64748b"}
                />
                <Text
                  style={[
                    styles.toggleButtonText,
                    form.installmentType === "monthly" && styles.toggleButtonTextActive,
                  ]}
                >
                  شهري
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  setForm((prev) => ({ ...prev, installmentType: "seasonal" }))
                }
                style={[
                  styles.toggleButton,
                  form.installmentType === "seasonal" && styles.toggleButtonActive,
                ]}
              >
                <MaterialCommunityIcons
                  name="layers"
                  size={16}
                  color={form.installmentType === "seasonal" ? "#ffffff" : "#64748b"}
                />
                <Text
                  style={[
                    styles.toggleButtonText,
                    form.installmentType === "seasonal" && styles.toggleButtonTextActive,
                  ]}
                >
                  موسمي
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ---------------- 5. Duration & Targets ---------------- */}
          {form.installmentType === "monthly" ? (
            <View style={styles.monthlyBox}>
              <View style={styles.labelRow}>
                <View style={styles.rowAlign}>
                  <Ionicons name="time-outline" size={16} color="#004d40" />
                  <Text style={[styles.fieldLabel, { marginRight: 4 }]}>
                    مدة التقسيط بالشهور
                  </Text>
                </View>
                <Text style={styles.durationBadge}>
                  {form.monthlyDuration} شهر{" "}
                  <Text style={styles.durationYear}>
                    ({(form.monthlyDuration / 12).toFixed(1)} سنة)
                  </Text>
                </Text>
              </View>

              {/* Stepper + / - for Duration */}
              <View style={styles.durationStepperRow}>
                <TouchableOpacity
                  onPress={() => adjustDuration(-6)}
                  style={styles.stepperIconBtn}
                  disabled={form.monthlyDuration <= MIN_DURATION_MONTHS}
                >
                  <Ionicons name="remove" size={18} color="#004d40" />
                </TouchableOpacity>

                <View style={styles.durationDisplay}>
                  <Text style={styles.durationDisplayText}>
                    {form.monthlyDuration} شهر
                  </Text>
                  <Text style={styles.durationDisplaySub}>
                    {(form.monthlyDuration / 12).toFixed(1)} سنة
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => adjustDuration(6)}
                  style={styles.stepperIconBtn}
                  disabled={form.monthlyDuration >= MAX_DURATION_MONTHS}
                >
                  <Ionicons name="add" size={18} color="#004d40" />
                </TouchableOpacity>
              </View>

              {/* Year Target Buttons (أزرار الترجيت بالسنين) */}
              <View style={styles.targetSection}>
                <Text style={styles.targetSectionTitle}>🎯 مدد السنوات المباشرة:</Text>
                <View style={styles.chipsRow}>
                  {YEAR_TARGETS.map((target) => {
                    const isSelected = form.monthlyDuration === target.months;
                    return (
                      <TouchableOpacity
                        key={target.months}
                        onPress={() =>
                          setForm((prev) => ({
                            ...prev,
                            monthlyDuration: target.months,
                          }))
                        }
                        style={[
                          styles.targetChip,
                          isSelected && styles.targetChipSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.targetChipText,
                            isSelected && styles.targetChipTextSelected,
                          ]}
                        >
                          {target.label}
                        </Text>
                        <Text
                          style={[
                            styles.targetChipSub,
                            isSelected && styles.targetChipSubSelected,
                          ]}
                        >
                          {target.months} شهر
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Quick Monthly Presets */}
              <View style={styles.presetContainer}>
                <Text style={styles.presetTitle}>المدد الشائعة:</Text>
                <View style={styles.chipsRow}>
                  {MONTHLY_PRESETS.map((m) => {
                    const isSelected = form.monthlyDuration === m;
                    return (
                      <TouchableOpacity
                        key={m}
                        onPress={() =>
                          setForm((prev) => ({ ...prev, monthlyDuration: m }))
                        }
                        style={[styles.chip, isSelected && styles.chipSelected]}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            isSelected && styles.chipTextSelected,
                          ]}
                        >
                          {m} شهر
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          ) : (
            /* Seasonal Settings (2 Inputs with Steppers) */
            <View style={styles.seasonalBox}>
              <View style={styles.seasonalHeader}>
                <View style={styles.rowAlign}>
                  <MaterialCommunityIcons name="layers" size={16} color="#d97706" />
                  <Text style={[styles.boxTitle, { marginRight: 4 }]}>
                    نظام السداد الموسمي
                  </Text>
                </View>
                <View style={styles.badgeFrequency}>
                  <Text style={styles.badgeFrequencyText}>
                    {parsedInterval > 0
                      ? parsedInterval === 1
                        ? "شهرياً"
                        : `دفعة كل ${parsedInterval} شهور`
                      : "دورية السداد"}
                  </Text>
                </View>
              </View>

              {/* Input 1: عدد الدفعات */}
              <View style={styles.innerField}>
                <View style={styles.labelRow}>
                  <Text style={styles.subFieldLabel}>عدد الدفعات</Text>
                  <View style={styles.steppersInline}>
                    <TouchableOpacity
                      onPress={() => adjustPaymentsCount(-1)}
                      style={styles.miniStepperBtn}
                    >
                      <Ionicons name="remove" size={14} color="#b45309" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => adjustPaymentsCount(1)}
                      style={styles.miniStepperBtn}
                    >
                      <Ionicons name="add" size={14} color="#b45309" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View
                  style={[
                    styles.inputGroup,
                    errors.numberOfPayments && styles.inputError,
                  ]}
                >
                  <TextInput
                    style={styles.inputField}
                    value={form.numberOfPayments}
                    onChangeText={(text) => {
                      const val = text.replace(/[^0-9]/g, "");
                      setForm((prev) => ({ ...prev, numberOfPayments: val }));
                    }}
                    placeholder="3"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                  />
                  <View style={styles.inputSuffix}>
                    <Text style={styles.suffixText}>دفعات</Text>
                  </View>
                </View>

                {errors.numberOfPayments && (
                  <Text style={styles.errorText}>⚠️ {errors.numberOfPayments}</Text>
                )}

                <View style={styles.chipsRow}>
                  {["2", "3", "4", "5", "6"].map((p) => (
                    <TouchableOpacity
                      key={`pay-${p}`}
                      onPress={() =>
                        setForm((prev) => ({ ...prev, numberOfPayments: p }))
                      }
                      style={[
                        styles.chipSmall,
                        form.numberOfPayments === p && styles.chipAccentSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipTextSmall,
                          form.numberOfPayments === p && styles.chipTextSelected,
                        ]}
                      >
                        {p} دفعات
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Input 2: كل كام شهر */}
              <View style={styles.innerField}>
                <View style={styles.labelRow}>
                  <Text style={styles.subFieldLabel}>كل كام شهر (الدورية)</Text>
                  <View style={styles.steppersInline}>
                    <TouchableOpacity
                      onPress={() => adjustIntervalMonths(-1)}
                      style={styles.miniStepperBtn}
                    >
                      <Ionicons name="remove" size={14} color="#b45309" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => adjustIntervalMonths(1)}
                      style={styles.miniStepperBtn}
                    >
                      <Ionicons name="add" size={14} color="#b45309" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View
                  style={[
                    styles.inputGroup,
                    errors.paymentIntervalMonths && styles.inputError,
                  ]}
                >
                  <TextInput
                    style={styles.inputField}
                    value={form.paymentIntervalMonths}
                    onChangeText={(text) => {
                      const val = text.replace(/[^0-9]/g, "");
                      setForm((prev) => ({
                        ...prev,
                        paymentIntervalMonths: val,
                      }));
                    }}
                    placeholder="4"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                  />
                  <View style={styles.inputSuffix}>
                    <Text style={styles.suffixText}>شهور</Text>
                  </View>
                </View>

                {errors.paymentIntervalMonths && (
                  <Text style={styles.errorText}>
                    ⚠️ {errors.paymentIntervalMonths}
                  </Text>
                )}

                <View style={styles.chipsRow}>
                  {[
                    { label: "كل شهرين", val: "2" },
                    { label: "كل 3 شهور", val: "3" },
                    { label: "كل 4 شهور", val: "4" },
                    { label: "كل 6 شهور", val: "6" },
                  ].map((item) => (
                    <TouchableOpacity
                      key={`int-${item.val}`}
                      onPress={() =>
                        setForm((prev) => ({
                          ...prev,
                          paymentIntervalMonths: item.val,
                        }))
                      }
                      style={[
                        styles.chipSmall,
                        form.paymentIntervalMonths === item.val &&
                          styles.chipAccentSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipTextSmall,
                          form.paymentIntervalMonths === item.val &&
                            styles.chipTextSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Total Duration Banner */}
              {seasonalTotalMonths > 0 && (
                <View style={styles.totalDurationBanner}>
                  <Text style={styles.bannerLabel}>إجمالي فترة السداد الكلية:</Text>
                  <Text style={styles.bannerValue}>
                    {seasonalTotalMonths} شهر{" "}
                    <Text style={styles.bannerYear}>
                      ({(seasonalTotalMonths / 12).toFixed(1)} سنة)
                    </Text>
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* ---------------- 6. Interest Method ---------------- */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>طريقة حساب الفائدة</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                onPress={() =>
                  setForm((prev) => ({ ...prev, interestMethod: "flat" }))
                }
                style={[
                  styles.toggleButton,
                  form.interestMethod === "flat" && styles.toggleButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    form.interestMethod === "flat" && styles.toggleButtonTextActive,
                  ]}
                >
                  فائدة ثابتة
                </Text>
                <Text style={styles.methodSubtext}>Flat Rate</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  setForm((prev) => ({ ...prev, interestMethod: "reducing" }))
                }
                style={[
                  styles.toggleButton,
                  form.interestMethod === "reducing" && styles.toggleButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    form.interestMethod === "reducing" && styles.toggleButtonTextActive,
                  ]}
                >
                  رصيد متناقص
                </Text>
                <Text style={styles.methodSubtext}>PMT</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ==================================================== */}
        {/* 4. Results Card (نفس كارت النتائج في الموقع) */}
        {/* ==================================================== */}
        {result ? (
          <View style={styles.resultCard}>
            {/* Header Banner */}
            <View style={styles.resultBanner}>
              <View style={styles.badgeRow}>
                <View style={styles.resultBadge}>
                  <Text style={styles.resultBadgeText}>
                    أول قسط: {result.firstInstallmentDate}
                  </Text>
                </View>
                <View style={styles.resultBadge}>
                  <Text style={styles.resultBadgeText}>
                    نظام {result.installmentType === "monthly" ? "شهري" : "موسمي"}
                  </Text>
                </View>
                <View style={[styles.resultBadge, { backgroundColor: "#d97706" }]}>
                  <Text style={styles.resultBadgeText}>
                    {result.interestMethod === "flat"
                      ? "فائدة ثابتة"
                      : "رصيد متناقص"}
                  </Text>
                </View>
              </View>

              <Text style={styles.resultLabel}>
                قيمة القسط التقديري ({result.paymentFrequencyText})
              </Text>
              <View style={styles.amountRow}>
                <Text style={styles.bigAmount}>
                  {formatCurrency(result.installmentAmount, {
                    showCurrency: false,
                  })}
                </Text>
                <Text style={styles.currencyText}>جنيه</Text>
              </View>
            </View>

            {/* Metrics Breakdown */}
            <View style={styles.metricsContainer}>
              <View style={styles.metricsGrid}>
                {/* Principal */}
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>أصل التمويل</Text>
                  <Text style={styles.metricValue}>
                    {formatCurrency(result.loanAmount)}
                  </Text>
                </View>

                {/* Interest */}
                <View style={[styles.metricBox, styles.metricBoxAmber]}>
                  <Text style={[styles.metricLabel, { color: "#b45309" }]}>
                    إجمالي الفائدة
                  </Text>
                  <Text style={[styles.metricValue, { color: "#b45309" }]}>
                    {formatCurrency(result.totalInterest)}
                  </Text>
                </View>

                {/* Total Payable */}
                <View style={[styles.metricBox, styles.metricBoxBrand]}>
                  <Text style={[styles.metricLabel, { color: "#004d40" }]}>
                    إجمالي المسدد
                  </Text>
                  <Text style={[styles.metricValue, { color: "#004d40" }]}>
                    {formatCurrency(result.totalPayable)}
                  </Text>
                </View>
              </View>

              {/* Extra Details Row */}
              <View style={styles.detailsRow}>
                <Text style={styles.detailsText}>
                  عدد الأقساط:{" "}
                  <Text style={styles.detailsBold}>
                    {result.numberOfInstallments}{" "}
                    {result.installmentType === "monthly" ? "أقساط" : "دفعات"}
                  </Text>
                </Text>
                <Text style={styles.detailsText}>
                  الفائدة السنوية:{" "}
                  <Text style={styles.detailsBold}>
                    {formatPercent(result.annualRate)}
                  </Text>
                </Text>
              </View>

              {/* Action Buttons: PDF Download, Share, Reset */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  onPress={handleDownloadPDF}
                  style={styles.pdfButton}
                  disabled={isExportingPDF}
                >
                  {isExportingPDF ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Ionicons name="document-text" size={16} color="#ffffff" />
                  )}
                  <Text style={styles.pdfButtonText}>
                    {isExportingPDF ? "جاري التجهيز..." : "تحميل PDF"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleShare}
                  style={styles.shareButton}
                >
                  <Ionicons name="share-social-outline" size={16} color="#ffffff" />
                  <Text style={styles.shareButtonText}>مشاركة الملخص</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleReset}
                  style={styles.resetButton}
                >
                  <Ionicons name="refresh" size={16} color="#64748b" />
                  <Text style={styles.resetButtonText}>إعادة ضبط</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.placeholderCard}>
            <View style={styles.placeholderIcon}>
              <Ionicons name="information-circle-outline" size={28} color="#d97706" />
            </View>
            <Text style={styles.placeholderTitle}>
              في انتظار إدخال الفائدة السنوية
            </Text>
            <Text style={styles.placeholderSubtitle}>
              اكتب نسبة الفائدة السنوية % بالأعلى لحساب قيمة القسط وجدول السداد فوراً.
            </Text>
          </View>
        )}

        {/* ==================================================== */}
        {/* 5. Schedule Table (نفس جدول السداد والـ PDF) */}
        {/* ==================================================== */}
        {result && (
          <View style={styles.card}>
            <View style={styles.scheduleHeaderRow}>
              <TouchableOpacity
                onPress={() => setIsScheduleExpanded(!isScheduleExpanded)}
                style={styles.scheduleTitleTouch}
              >
                <View style={styles.scheduleIconWrapper}>
                  <Ionicons name="list" size={18} color="#004d40" />
                </View>
                <View>
                  <Text style={styles.cardHeaderTitle}>جدول السداد وتواريخ الاستحقاق</Text>
                  <Text style={styles.cardHeaderSubtitle}>
                    {result.schedule.length}{" "}
                    {result.installmentType === "monthly" ? "قسط" : "دفعة"}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.scheduleHeaderActions}>
                <TouchableOpacity
                  onPress={handleDownloadPDF}
                  style={styles.miniPdfBtn}
                  disabled={isExportingPDF}
                >
                  {isExportingPDF ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Ionicons name="download-outline" size={14} color="#ffffff" />
                  )}
                  <Text style={styles.miniPdfBtnText}>PDF</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setIsScheduleExpanded(!isScheduleExpanded)}
                  style={styles.toggleCollapseBtn}
                >
                  <Ionicons
                    name={isScheduleExpanded ? "chevron-up" : "chevron-down"}
                    size={18}
                    color="#004d40"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {isScheduleExpanded && (
              <View style={styles.scheduleContent}>
                {/* Horizontal Scroll Table */}
                <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                  <View>
                    {/* Table Header */}
                    <View style={styles.tableHeaderRow}>
                      <Text style={[styles.tableHeaderCell, { width: 35 }]}>#</Text>
                      <Text style={[styles.tableHeaderCell, { width: 85 }]}>البيان</Text>
                      <Text style={[styles.tableHeaderCell, { width: 95 }]}>الاستحقاق</Text>
                      <Text style={[styles.tableHeaderCell, { width: 95 }]}>قيمة القسط</Text>
                      <Text style={[styles.tableHeaderCell, { width: 85 }]}>الفائدة</Text>
                      <Text style={[styles.tableHeaderCell, { width: 85 }]}>الأصل</Text>
                      <Text style={[styles.tableHeaderCell, { width: 95 }]}>المتبقي</Text>
                    </View>

                    {/* Table Rows */}
                    {result.schedule.map((item, idx) => {
                      const isEven = idx % 2 === 0;
                      return (
                        <View
                          key={item.installmentNumber}
                          style={[
                            styles.tableRow,
                            isEven && styles.tableRowEven,
                          ]}
                        >
                          <Text style={[styles.tableCell, { width: 35, textAlign: "center", fontWeight: "700" }]}>
                            {item.installmentNumber}
                          </Text>
                          <Text style={[styles.tableCell, { width: 85, color: "#004d40", fontWeight: "700" }]}>
                            {item.dueLabel}
                          </Text>
                          <Text style={[styles.tableCell, { width: 95, textAlign: "center" }]}>
                            {item.formattedDueDate}
                          </Text>
                          <Text style={[styles.tableCell, { width: 95, fontWeight: "700", color: "#004d40" }]}>
                            {formatCurrency(item.paymentAmount)}
                          </Text>
                          <Text style={[styles.tableCell, { width: 85, color: "#d97706" }]}>
                            {formatCurrency(item.interestPart)}
                          </Text>
                          <Text style={[styles.tableCell, { width: 85 }]}>
                            {formatCurrency(item.principalPart)}
                          </Text>
                          <Text style={[styles.tableCell, { width: 95, color: "#64748b" }]}>
                            {formatCurrency(item.remainingBalance)}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {/* ==================================================== */}
        {/* 6. TrustRow Section (نفس ميزات الثقة في الموقع) */}
        {/* ==================================================== */}
        <View style={styles.trustSection}>
          <Text style={styles.trustTitle}>لماذا تختار التمويل من تساهيل؟</Text>
          <Text style={styles.trustSubtitle}>
            خطوات سهلة وبسيطة لدعم نمو أعمالك ومشروعاتك في كافة محافظات مصر
          </Text>

          <View style={styles.trustGrid}>
            <View style={styles.trustCard}>
              <View style={[styles.trustIconBox, { backgroundColor: "#fef3c7" }]}>
                <Ionicons name="flash" size={20} color="#d97706" />
              </View>
              <Text style={styles.trustCardTitle}>أسرع الإجراءات</Text>
              <Text style={styles.trustCardDesc}>
                دراسة ائتمانية فورية وسرعة في صرف التمويل لمساعدتك على بدء نشاطك بدون انتظار.
              </Text>
            </View>

            <View style={styles.trustCard}>
              <View style={[styles.trustIconBox, { backgroundColor: "#e0f2f1" }]}>
                <Ionicons name="document-text" size={20} color="#004d40" />
              </View>
              <Text style={styles.trustCardTitle}>أبسط الأوراق</Text>
              <Text style={styles.trustCardDesc}>
                إجراءات ومستندات مبسطة بدون تعقيدات تناسب جميع المشروعات والشركات الصغيرة.
              </Text>
            </View>

            <View style={styles.trustCard}>
              <View style={[styles.trustIconBox, { backgroundColor: "#e2e8f0" }]}>
                <Ionicons name="ribbon" size={20} color="#00796b" />
              </View>
              <Text style={styles.trustCardTitle}>أفضل البرامج التمويلية</Text>
              <Text style={styles.trustCardDesc}>
                حلول تمويل مرنة بأنظمة سداد شهرية وموسمية مصممة خصيصاً لمشروعك.
              </Text>
            </View>
          </View>
        </View>

        {/* ==================================================== */}
        {/* 7. Official Footer (نفس فوتر الموقع مع بيانات المطور) */}
        {/* ==================================================== */}
        <View style={styles.footer}>
          <View style={styles.footerBrandRow}>
            <TasaheelLogo size={20} />
            <Text style={styles.footerBrandTitle}>تساهيل - حاسبة القسط</Text>
          </View>
          <Text style={styles.footerDesc}>
            حاسبة مخصصة لموظفي وعملاء شركة تساهيل لحساب أقساط التمويل الشهرية والموسمية وجدول السداد بدقة وفورية.
          </Text>

          {/* Developer Credit Box */}
          <View style={styles.developerBox}>
            <Text style={styles.developerLabel}>من تطوير:</Text>
            <Text style={styles.developerName}>بشمهندس كيرلس فؤاد شفيق</Text>
            <Text style={styles.developerRole}>عضو رقابة كوم الفرج</Text>
          </View>

          <Text style={styles.copyrightText}>
            تساهيل مصر © 2026 جميع الحقوق محفوظة.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#004d40",
  },
  header: {
    backgroundColor: "#004d40",
    borderBottomWidth: 1,
    borderBottomColor: "#00382e",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerBrandRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#00796b",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#26a69a",
  },
  headerTitles: {
    alignItems: "flex-end",
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#ffffff",
    textAlign: "right",
  },
  headerSubtitle: {
    fontSize: 10,
    color: "#b2dfdb",
    fontWeight: "600",
    textAlign: "right",
    marginTop: 1,
  },
  hotlineButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#00382e",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#00695c",
    gap: 6,
  },
  hotlineIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#d97706",
    alignItems: "center",
    justifyContent: "center",
  },
  hotlineTextCol: {
    alignItems: "flex-end",
  },
  hotlineLabel: {
    fontSize: 8,
    color: "#80cbc4",
    fontWeight: "600",
  },
  hotlineNumber: {
    fontSize: 12,
    color: "#fde68a",
    fontWeight: "900",
  },

  scrollContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    paddingBottom: 40,
  },

  /* Hero Section */
  heroSection: {
    backgroundColor: "#f1f5f9",
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  heroBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    gap: 6,
    marginBottom: 8,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#004d40",
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0f172a",
    textAlign: "center",
    marginBottom: 4,
  },
  heroHighlight: {
    color: "#004d40",
  },
  heroSubtitle: {
    fontSize: 12,
    color: "#475569",
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 18,
    maxWidth: 320,
    marginBottom: 10,
  },
  heroBold: {
    fontWeight: "800",
    color: "#004d40",
  },
  heroPillsRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
  },
  heroPill: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 4,
  },
  heroPillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#004d40",
  },

  /* Card */
  card: {
    backgroundColor: "#ffffff",
    marginHorizontal: 14,
    marginTop: 14,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    marginBottom: 14,
  },
  cardHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#e0f2f1",
    alignItems: "center",
    justifyContent: "center",
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#004d40",
    textAlign: "right",
  },
  cardHeaderSubtitle: {
    fontSize: 11,
    color: "#64748b",
    textAlign: "right",
    marginTop: 1,
  },

  fieldSection: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "right",
  },
  hintText: {
    fontSize: 10,
    color: "#94a3b8",
    fontWeight: "500",
  },
  inputGroup: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    overflow: "hidden",
  },
  inputError: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  inputWarning: {
    borderColor: "#f59e0b",
    backgroundColor: "#fffbeb",
  },
  inputField: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "right",
  },
  inputSuffix: {
    backgroundColor: "#e0f2f1",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderLeftWidth: 1,
    borderLeftColor: "#b2dfdb",
  },
  suffixText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#004d40",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "right",
    marginTop: 4,
  },
  warningText: {
    color: "#b45309",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "right",
    marginTop: 4,
  },

  /* Steppers */
  steppersRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  stepperBtn: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  stepperBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#004d40",
  },

  presetContainer: {
    marginTop: 8,
  },
  presetTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
    textAlign: "right",
    marginBottom: 4,
  },
  chipsRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  chipSelected: {
    backgroundColor: "#004d40",
    borderColor: "#004d40",
  },
  chipAccentSelected: {
    backgroundColor: "#d97706",
    borderColor: "#d97706",
  },
  chipText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  chipTextSelected: {
    color: "#ffffff",
  },

  rowAlign: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  badgeRequired: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  badgeRequiredText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#b45309",
  },

  dateButtonsRow: {
    flexDirection: "row-reverse",
    gap: 8,
    marginTop: 6,
  },
  dateQuickBtn: {
    backgroundColor: "#e0f2f1",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#b2dfdb",
  },
  dateQuickBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#004d40",
  },

  toggleRow: {
    flexDirection: "row-reverse",
    backgroundColor: "#f1f5f9",
    padding: 4,
    borderRadius: 12,
    gap: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  toggleButtonActive: {
    backgroundColor: "#004d40",
  },
  toggleButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
  },
  toggleButtonTextActive: {
    color: "#ffffff",
  },
  methodSubtext: {
    fontSize: 9,
    color: "#94a3b8",
  },

  /* Monthly Box */
  monthlyBox: {
    backgroundColor: "#f0fdf4",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    marginBottom: 16,
  },
  durationBadge: {
    fontSize: 13,
    fontWeight: "800",
    color: "#004d40",
  },
  durationYear: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748b",
  },
  durationStepperRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 8,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  stepperIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#e0f2f1",
    alignItems: "center",
    justifyContent: "center",
  },
  durationDisplay: {
    alignItems: "center",
  },
  durationDisplayText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#004d40",
  },
  durationDisplaySub: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "600",
  },
  targetSection: {
    marginTop: 6,
    marginBottom: 10,
  },
  targetSectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#004d40",
    textAlign: "right",
    marginBottom: 6,
  },
  targetChip: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#86efac",
    alignItems: "center",
  },
  targetChipSelected: {
    backgroundColor: "#004d40",
    borderColor: "#004d40",
  },
  targetChipText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#004d40",
  },
  targetChipTextSelected: {
    color: "#ffffff",
  },
  targetChipSub: {
    fontSize: 9,
    color: "#64748b",
    fontWeight: "600",
  },
  targetChipSubSelected: {
    color: "#b2dfdb",
  },

  /* Seasonal Box */
  seasonalBox: {
    backgroundColor: "#fffbeb",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#fde68a",
    marginBottom: 16,
  },
  seasonalHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#fef3c7",
    marginBottom: 10,
  },
  boxTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#b45309",
  },
  badgeFrequency: {
    backgroundColor: "#d97706",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeFrequencyText: {
    fontSize: 10,
    color: "#ffffff",
    fontWeight: "800",
  },
  innerField: {
    marginBottom: 10,
  },
  subFieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "right",
  },
  steppersInline: {
    flexDirection: "row-reverse",
    gap: 4,
  },
  miniStepperBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  chipSmall: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  chipTextSmall: {
    fontSize: 10,
    fontWeight: "700",
    color: "#b45309",
  },
  totalDurationBanner: {
    backgroundColor: "#fef3c7",
    borderRadius: 10,
    padding: 8,
    marginTop: 4,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  bannerLabel: {
    fontSize: 10,
    color: "#92400e",
    fontWeight: "600",
  },
  bannerValue: {
    fontSize: 13,
    fontWeight: "900",
    color: "#b45309",
    marginTop: 2,
  },
  bannerYear: {
    fontSize: 11,
    fontWeight: "600",
    color: "#92400e",
  },

  /* Results Card */
  resultCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 14,
    marginTop: 14,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  resultBanner: {
    backgroundColor: "#004d40",
    padding: 16,
    alignItems: "center",
  },
  badgeRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
    marginBottom: 8,
  },
  resultBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  resultBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#ffffff",
  },
  resultLabel: {
    fontSize: 12,
    color: "#b2dfdb",
    fontWeight: "600",
    marginBottom: 4,
  },
  amountRow: {
    flexDirection: "row-reverse",
    alignItems: "baseline",
    gap: 4,
  },
  bigAmount: {
    fontSize: 28,
    fontWeight: "900",
    color: "#ffffff",
  },
  currencyText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fde68a",
  },
  metricsContainer: {
    padding: 14,
  },
  metricsGrid: {
    flexDirection: "row-reverse",
    gap: 6,
    marginBottom: 10,
  },
  metricBox: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 8,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  metricBoxAmber: {
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
  },
  metricBoxBrand: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
  metricLabel: {
    fontSize: 9,
    color: "#64748b",
    fontWeight: "600",
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0f172a",
  },
  detailsRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  detailsText: {
    fontSize: 11,
    color: "#64748b",
  },
  detailsBold: {
    fontWeight: "800",
    color: "#004d40",
  },
  actionsRow: {
    flexDirection: "row-reverse",
    gap: 8,
    marginTop: 10,
  },
  pdfButton: {
    flex: 1.2,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00796b",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  pdfButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
  shareButton: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#004d40",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  shareButtonText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  resetButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    gap: 4,
  },
  resetButtonText: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "700",
  },

  placeholderCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 14,
    marginTop: 14,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  placeholderIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  placeholderTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#004d40",
    marginBottom: 4,
  },
  placeholderSubtitle: {
    fontSize: 11,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 16,
  },

  /* Schedule Table */
  scheduleHeaderRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scheduleTitleTouch: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  scheduleIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#e0f2f1",
    alignItems: "center",
    justifyContent: "center",
  },
  scheduleHeaderActions: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },
  miniPdfBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#00796b",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  miniPdfBtnText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
  },
  toggleCollapseBtn: {
    padding: 6,
  },
  scheduleContent: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 8,
  },
  tableHeaderRow: {
    flexDirection: "row-reverse",
    backgroundColor: "#f1f5f9",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 6,
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: "800",
    color: "#004d40",
    textAlign: "right",
  },
  tableRow: {
    flexDirection: "row-reverse",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  tableRowEven: {
    backgroundColor: "#fafafa",
  },
  tableCell: {
    fontSize: 10,
    color: "#0f172a",
    textAlign: "right",
  },

  /* TrustRow Section */
  trustSection: {
    marginHorizontal: 14,
    marginTop: 24,
    alignItems: "center",
  },
  trustTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#004d40",
    textAlign: "center",
    marginBottom: 4,
  },
  trustSubtitle: {
    fontSize: 11,
    color: "#64748b",
    textAlign: "center",
    maxWidth: 280,
    marginBottom: 12,
  },
  trustGrid: {
    gap: 10,
    width: "100%",
  },
  trustCard: {
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  trustIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  trustCardTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#004d40",
    textAlign: "right",
    marginBottom: 2,
  },
  trustCardDesc: {
    fontSize: 11,
    color: "#64748b",
    textAlign: "right",
    lineHeight: 16,
  },

  /* Footer */
  footer: {
    backgroundColor: "#00382e",
    marginTop: 24,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#002820",
  },
  footerBrandRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  footerBrandTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#ffffff",
  },
  footerDesc: {
    fontSize: 11,
    color: "#b2dfdb",
    textAlign: "center",
    lineHeight: 16,
    maxWidth: 300,
    marginBottom: 14,
  },
  developerBox: {
    backgroundColor: "#002820",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#004d40",
    marginBottom: 14,
    width: "100%",
  },
  developerLabel: {
    fontSize: 10,
    color: "#80cbc4",
    fontWeight: "600",
  },
  developerName: {
    fontSize: 13,
    fontWeight: "900",
    color: "#fde68a",
    marginVertical: 2,
  },
  developerRole: {
    fontSize: 11,
    color: "#ffffff",
    fontWeight: "700",
  },
  copyrightText: {
    fontSize: 10,
    color: "#80cbc4",
    textAlign: "center",
  },
});
