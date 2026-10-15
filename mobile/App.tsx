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
  I18nManager,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { FormState, CalculationResult } from "./lib/types";
import { validateForm } from "./lib/validation";
import { calculateInstallment } from "./lib/calculate";
import { formatCurrency, formatPercent, generateShareableSummary } from "./lib/format";

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

const MONTHLY_PRESETS = [6, 12, 18, 24, 30, 36];

export default function App() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE);
  const [isScheduleExpanded, setIsScheduleExpanded] = useState<boolean>(true);

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

  const handleAmountPreset = (val: number) => {
    setForm((prev) => ({ ...prev, loanAmount: val.toLocaleString("en-US") }));
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

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerIconWrapper}>
            <FontAwesome5 name="calculator" size={20} color="#ffffff" />
          </View>
          <View style={styles.headerTitles}>
            <Text style={styles.headerTitle}>تساهيل للتمويل</Text>
            <Text style={styles.headerSubtitle}>حاسبة الأقساط وجدول السداد التقديري</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ==================================================== */}
        {/* Form Card */}
        {/* ==================================================== */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Ionicons name="cash-outline" size={20} color="#004d40" />
            </View>
            <View>
              <Text style={styles.cardHeaderTitle}>بيانات التمويل المطلوبة</Text>
              <Text style={styles.cardHeaderSubtitle}>
                حدد تفاصيل التمويل لحساب قيمة القسط وجدول السداد
              </Text>
            </View>
          </View>

          {/* 1. Loan Amount */}
          <View style={styles.fieldSection}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>مبلغ التمويل المطلوب</Text>
              <Text style={styles.hintText}>5,000 إلى 15,000,000 ج.م</Text>
            </View>

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

          {/* 2. Annual Interest Rate % */}
          <View style={styles.fieldSection}>
            <View style={styles.labelRow}>
              <View style={styles.rowAlign}>
                <MaterialCommunityIcons name="percent" size={14} color="#d97706" />
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
            ) : (
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
            )}
          </View>

          {/* 3. First Installment Date */}
          <View style={styles.fieldSection}>
            <View style={styles.labelRow}>
              <View style={styles.rowAlign}>
                <Ionicons name="calendar-outline" size={14} color="#004d40" />
                <Text style={[styles.fieldLabel, { marginRight: 4 }]}>
                  تاريخ أول قسط
                </Text>
              </View>
              <Text style={styles.hintText}>تاريخ الاستحقاق</Text>
            </View>

            <View style={styles.inputGroup}>
              <TextInput
                style={styles.inputField}
                value={form.firstInstallmentDate}
                onChangeText={(text) =>
                  setForm((prev) => ({ ...prev, firstInstallmentDate: text }))
                }
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94a3b8"
              />
              <View style={styles.inputSuffix}>
                <Ionicons name="calendar" size={16} color="#004d40" />
              </View>
            </View>

            <View style={styles.chipsRow}>
              <TouchableOpacity onPress={setDateToday} style={styles.chip}>
                <Text style={styles.chipText}>اليوم</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={setDateNextMonth} style={styles.chip}>
                <Text style={styles.chipText}>بعد شهر</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 4. Installment Type (Monthly vs Seasonal) */}
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
                  name="calendar-outline"
                  size={16}
                  color={form.installmentType === "monthly" ? "#ffffff" : "#475569"}
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
                  name="layers-outline"
                  size={16}
                  color={form.installmentType === "seasonal" ? "#ffffff" : "#475569"}
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

          {/* 5. Duration Settings */}
          {form.installmentType === "monthly" ? (
            /* Monthly Duration */
            <View style={styles.monthlyBox}>
              <View style={styles.labelRow}>
                <Text style={styles.boxTitle}>مدة التقسيط</Text>
                <Text style={styles.durationValue}>
                  {form.monthlyDuration} شهر{" "}
                  <Text style={styles.durationYear}>
                    ({(form.monthlyDuration / 12).toFixed(1)} سنة)
                  </Text>
                </Text>
              </View>

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
          ) : (
            /* Seasonal Settings (2 Inputs) */
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
                <Text style={styles.subFieldLabel}>عدد الدفعات</Text>
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
                  {["2", "3", "4", "6"].map((p) => (
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
                <Text style={styles.subFieldLabel}>كل كام شهر (الدورية)</Text>
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

              {/* Seasonal Total Months Badge */}
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

          {/* 6. Interest Method */}
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
        {/* Results Card */}
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

              {/* Action Buttons */}
              <View style={styles.actionsRow}>
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
          /* Placeholder Card when rate is missing */
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
        {/* Schedule Table */}
        {/* ==================================================== */}
        {result && (
          <View style={styles.card}>
            <TouchableOpacity
              onPress={() => setIsScheduleExpanded(!isScheduleExpanded)}
              style={styles.scheduleHeader}
            >
              <View style={styles.rowAlign}>
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
              </View>
              <Ionicons
                name={isScheduleExpanded ? "chevron-up" : "chevron-down"}
                size={20}
                color="#004d40"
              />
            </TouchableOpacity>

            {isScheduleExpanded && (
              <View style={styles.scheduleContent}>
                {/* Table Header */}
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.tableHeaderCell, { flex: 0.6 }]}>#</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1.2 }]}>الاستحقاق</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1.2 }]}>القسط</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1.0 }]}>الفائدة</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1.2 }]}>المتبقي</Text>
                </View>

                {/* Table Rows */}
                {result.schedule.map((item, idx) => {
                  const isEven = idx % 2 === 0;
                  return (
                    <View
                      key={item.installmentNumber}
                      style={[
                        styles.tableRow,
                        isEven ? styles.tableRowEven : styles.tableRowOdd,
                      ]}
                    >
                      <Text style={[styles.tableCell, { flex: 0.6, fontWeight: "bold" }]}>
                        {item.installmentNumber}
                      </Text>
                      <Text style={[styles.tableCell, { flex: 1.2, fontSize: 11 }]}>
                        {item.formattedDueDate}
                      </Text>
                      <Text
                        style={[
                          styles.tableCell,
                          { flex: 1.2, fontWeight: "bold", color: "#004d40" },
                        ]}
                      >
                        {formatCurrency(item.paymentAmount, { showCurrency: false })}
                      </Text>
                      <Text
                        style={[
                          styles.tableCell,
                          { flex: 1.0, color: "#d97706", fontSize: 11 },
                        ]}
                      >
                        {formatCurrency(item.interestPart, { showCurrency: false })}
                      </Text>
                      <Text
                        style={[
                          styles.tableCell,
                          { flex: 1.2, color: "#64748b", fontSize: 11 },
                        ]}
                      >
                        {formatCurrency(item.remainingBalance, { showCurrency: false })}
                      </Text>
                    </View>
                  );
                })}

                {/* Total Footer */}
                <View style={styles.tableFooterRow}>
                  <Text style={[styles.tableFooterText, { flex: 1.8 }]}>
                    الإجمالي ({result.schedule.length})
                  </Text>
                  <Text style={[styles.tableFooterText, { flex: 1.2 }]}>
                    {formatCurrency(result.totalPayable, { showCurrency: false })}
                  </Text>
                  <Text style={[styles.tableFooterText, { flex: 1.0, color: "#fef08a" }]}>
                    {formatCurrency(result.totalInterest, { showCurrency: false })}
                  </Text>
                  <Text style={[styles.tableFooterText, { flex: 1.2 }]}>0.00</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            • الحسابات استرشادية وتخضع للشروط والأحكام وموافقة شركة تساهيل للتمويل.
          </Text>
          <Text style={styles.footerCopyright}>
            جميع الحقوق محفوظة © شركة تساهيل للتمويل {new Date().getFullYear()}
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
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#00332a",
  },
  headerContent: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  headerIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#00695c",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  headerTitles: {
    flex: 1,
    alignItems: "flex-end",
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900",
  },
  headerSubtitle: {
    color: "#80cbc4",
    fontSize: 11,
    marginTop: 2,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
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
    marginLeft: 10,
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0f172a",
    textAlign: "right",
  },
  cardHeaderSubtitle: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 1,
    textAlign: "right",
  },
  fieldSection: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  rowAlign: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#0f172a",
    textAlign: "right",
  },
  hintText: {
    fontSize: 10,
    color: "#64748b",
  },
  inputGroup: {
    flexDirection: "row-reverse",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    overflow: "hidden",
    alignItems: "center",
  },
  inputField: {
    flex: 1,
    height: 44,
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: "bold",
    color: "#0f172a",
    textAlign: "right",
  },
  inputSuffix: {
    backgroundColor: "#e0f2f1",
    paddingHorizontal: 12,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderLeftWidth: 1,
    borderLeftColor: "#b2dfdb",
  },
  suffixText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#004d40",
  },
  inputError: {
    borderColor: "#f87171",
    backgroundColor: "#fef2f2",
  },
  inputWarning: {
    borderColor: "#fbbf24",
    backgroundColor: "#fffbeb",
  },
  errorText: {
    fontSize: 11,
    color: "#dc2626",
    marginTop: 4,
    textAlign: "right",
  },
  warningText: {
    fontSize: 11,
    color: "#b45309",
    marginTop: 4,
    textAlign: "right",
  },
  badgeRequired: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  badgeRequiredText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#b45309",
  },
  presetContainer: {
    marginTop: 6,
  },
  presetTitle: {
    fontSize: 10,
    color: "#64748b",
    marginBottom: 4,
    textAlign: "right",
  },
  chipsRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
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
    fontWeight: "600",
    color: "#334155",
  },
  chipTextSelected: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  chipSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  chipTextSmall: {
    fontSize: 10,
    fontWeight: "600",
    color: "#334155",
  },
  toggleRow: {
    flexDirection: "row-reverse",
    gap: 8,
    marginTop: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row-reverse",
    height: 42,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  toggleButtonActive: {
    backgroundColor: "#004d40",
    borderColor: "#004d40",
  },
  toggleButtonText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#475569",
  },
  toggleButtonTextActive: {
    color: "#ffffff",
  },
  methodSubtext: {
    fontSize: 9,
    color: "#94a3b8",
    marginRight: 2,
  },
  monthlyBox: {
    backgroundColor: "#f0fdfa",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ccfbf1",
    marginBottom: 14,
  },
  boxTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0f172a",
    textAlign: "right",
  },
  durationValue: {
    fontSize: 13,
    fontWeight: "900",
    color: "#004d40",
  },
  durationYear: {
    fontSize: 10,
    fontWeight: "normal",
    color: "#64748b",
  },
  seasonalBox: {
    backgroundColor: "#fffbeb",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#fde68a",
    marginBottom: 14,
  },
  seasonalHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#fef3c7",
    marginBottom: 10,
  },
  badgeFrequency: {
    backgroundColor: "#d97706",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeFrequencyText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#ffffff",
  },
  innerField: {
    marginBottom: 10,
  },
  subFieldLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
    textAlign: "right",
  },
  totalDurationBanner: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fde68a",
    marginTop: 6,
  },
  bannerLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0f172a",
  },
  bannerValue: {
    fontSize: 12,
    fontWeight: "900",
    color: "#b45309",
  },
  bannerYear: {
    fontSize: 10,
    fontWeight: "normal",
    color: "#64748b",
  },
  resultCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  resultBanner: {
    backgroundColor: "#004d40",
    padding: 16,
    alignItems: "flex-end",
  },
  badgeRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },
  resultBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  resultBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
  },
  resultLabel: {
    color: "#b2dfdb",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  amountRow: {
    flexDirection: "row-reverse",
    alignItems: "baseline",
    gap: 6,
  },
  bigAmount: {
    fontSize: 32,
    fontWeight: "900",
    color: "#ffffff",
  },
  currencyText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fcd34d",
  },
  metricsContainer: {
    padding: 14,
  },
  metricsGrid: {
    flexDirection: "row-reverse",
    gap: 8,
    marginBottom: 12,
  },
  metricBox: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "flex-end",
  },
  metricBoxAmber: {
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
  },
  metricBoxBrand: {
    backgroundColor: "#f0fdfa",
    borderColor: "#ccfbf1",
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#64748b",
    marginBottom: 2,
    textAlign: "right",
  },
  metricValue: {
    fontSize: 12,
    fontWeight: "900",
    color: "#0f172a",
    textAlign: "right",
  },
  detailsRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    backgroundColor: "#f1f5f9",
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  detailsText: {
    fontSize: 11,
    color: "#64748b",
  },
  detailsBold: {
    fontWeight: "bold",
    color: "#0f172a",
  },
  actionsRow: {
    flexDirection: "row-reverse",
    gap: 8,
  },
  shareButton: {
    flex: 2,
    flexDirection: "row-reverse",
    height: 42,
    backgroundColor: "#00695c",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  shareButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  resetButton: {
    flex: 1,
    flexDirection: "row-reverse",
    height: 42,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 4,
  },
  resetButtonText: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "bold",
  },
  placeholderCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  placeholderIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fffbeb",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  placeholderTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
    textAlign: "center",
  },
  placeholderSubtitle: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 18,
  },
  scheduleHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scheduleIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#e0f2f1",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  scheduleContent: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 10,
  },
  tableHeaderRow: {
    flexDirection: "row-reverse",
    backgroundColor: "#f1f5f9",
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    marginBottom: 4,
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0f172a",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row-reverse",
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  tableRowEven: {
    backgroundColor: "#ffffff",
  },
  tableRowOdd: {
    backgroundColor: "#f8fafc",
  },
  tableCell: {
    fontSize: 10,
    color: "#334155",
    textAlign: "center",
  },
  tableFooterRow: {
    flexDirection: "row-reverse",
    backgroundColor: "#004d40",
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 8,
    marginTop: 6,
  },
  tableFooterText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
  },
  footerContainer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  footerText: {
    fontSize: 10,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 16,
    marginBottom: 6,
  },
  footerCopyright: {
    fontSize: 10,
    color: "#94a3b8",
    textAlign: "center",
  },
});
