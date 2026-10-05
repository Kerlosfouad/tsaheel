import React, { useState } from "react";
import { ScheduleItem, CalculationResult } from "../lib/types";
import { formatCurrency } from "../lib/format";
import { exportSchedulePDF } from "../lib/pdfExport";
import { ChevronDown, ChevronUp, Table, Info, FileDown, CalendarDays } from "lucide-react";

interface ScheduleTableProps {
  result: CalculationResult | null;
}

export const ScheduleTable: React.FC<ScheduleTableProps> = ({ result }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  if (!result || result.schedule.length === 0) {
    return null;
  }

  const { schedule, loanAmount, totalInterest, totalPayable } = result;

  const handleDownloadPDF = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsExporting(true);
      await exportSchedulePDF(result);
    } catch (err) {
      console.error("PDF export failed", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-card border border-surface-200 overflow-hidden transition-all print-break-inside-avoid">
      
      {/* Header with Toggle Button */}
      <div className="w-full p-4 sm:p-6 flex flex-wrap items-center justify-between gap-3 bg-surface-50/70 border-b border-surface-200">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-3 text-right focus:outline-none group cursor-pointer"
          aria-expanded={isExpanded}
          aria-controls="schedule-table-content"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand flex items-center justify-center font-bold group-hover:bg-brand-100 transition-colors">
            <Table className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-brand-900 group-hover:text-brand transition-colors">
                جدول السداد وتواريخ الاستحقاق
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 font-bold border border-brand-200">
                {schedule.length} {result.installmentType === "monthly" ? "قسط" : "دفعة"}
              </span>
            </div>
            <p className="text-xs text-text-muted font-medium mt-0.5">
              تواريخ استحقاق الأقساط وتوزيع أصل التمويل والفائدة والرصيد المتبقي
            </p>
          </div>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-2 no-print">
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 px-3 py-2 rounded-xl shadow-xs transition-all disabled:opacity-50"
            aria-label="تحميل جدول السداد كملف PDF"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>{isExporting ? "جاري التحميل..." : "تحميل PDF"}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs font-bold text-brand px-3 py-2 rounded-xl bg-white hover:bg-surface-100 border border-surface-200 shadow-xs transition-colors"
            aria-label={isExpanded ? "إخفاء الجدول" : "عرض الجدول"}
          >
            <span>{isExpanded ? "إخفاء" : "عرض"}</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      <div
        id="schedule-table-content"
        className={`${isExpanded ? "block" : "hidden"} transition-all`}
      >
        <div className="overflow-x-auto max-h-[500px] -mx-1 sm:mx-0">
          <table className="w-full min-w-[620px] text-right border-collapse text-xs sm:text-sm">
            <thead className="sticky top-0 bg-surface-100 border-b border-surface-200 text-brand-900 font-extrabold z-10">
              <tr>
                <th className="py-3 px-3 text-center w-12">#</th>
                <th className="py-3 px-3">الدفعة / القسط</th>
                <th className="py-3 px-3 text-center">
                  <div className="inline-flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5 text-brand" />
                    <span>تاريخ الاستحقاق</span>
                  </div>
                </th>
                <th className="py-3 px-3">قيمة القسط</th>
                <th className="py-3 px-3">جزء الفائدة</th>
                <th className="py-3 px-3">أصل المبلغ</th>
                <th className="py-3 px-3">الرصيد المتبقي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200">
              {schedule.map((item: ScheduleItem, idx: number) => {
                const isEven = idx % 2 === 0;
                return (
                  <tr
                    key={item.installmentNumber}
                    className={`hover:bg-brand-50/40 transition-colors ${
                      isEven ? "bg-white" : "bg-surface-50/40"
                    }`}
                  >
                    {/* Index */}
                    <td className="py-3 px-3 text-center font-bold text-text-muted">
                      {item.installmentNumber}
                    </td>

                    {/* Due Label */}
                    <td className="py-3 px-3 font-bold text-brand-900">
                      {item.dueLabel}
                    </td>

                    {/* Due Date */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className="inline-block px-2.5 py-1 rounded-lg bg-surface-100 text-brand-950 font-bold font-sans text-xs border border-surface-200"
                        dir="ltr"
                      >
                        {item.formattedDueDate}
                      </span>
                    </td>

                    {/* Payment Amount */}
                    <td className="py-3 px-3 font-black text-brand-700 font-sans" dir="ltr">
                      {formatCurrency(item.paymentAmount)}
                    </td>

                    {/* Interest Part */}
                    <td className="py-3 px-3 font-medium text-accent-600 font-sans" dir="ltr">
                      {formatCurrency(item.interestPart)}
                    </td>

                    {/* Principal Part */}
                    <td className="py-3 px-3 font-medium text-brand-900 font-sans" dir="ltr">
                      {formatCurrency(item.principalPart)}
                    </td>

                    {/* Remaining Balance */}
                    <td className="py-3 px-3 font-bold text-text-muted font-sans" dir="ltr">
                      {formatCurrency(item.remainingBalance)}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Totals Footer */}
            <tfoot className="sticky bottom-0 bg-brand-900 text-white font-black z-10 border-t-2 border-brand-800">
              <tr>
                <td className="py-3.5 px-3 text-center">الإجمالي</td>
                <td className="py-3.5 px-3 font-normal text-brand-200">
                  {schedule.length} {result.installmentType === "monthly" ? "قسط" : "دفعة"}
                </td>
                <td className="py-3.5 px-3 text-center font-normal text-brand-300">
                  -
                </td>
                <td className="py-3.5 px-3 font-sans text-accent-300" dir="ltr">
                  {formatCurrency(totalPayable)}
                </td>
                <td className="py-3.5 px-3 font-sans text-accent-200" dir="ltr">
                  {formatCurrency(totalInterest)}
                </td>
                <td className="py-3.5 px-3 font-sans text-white" dir="ltr">
                  {formatCurrency(loanAmount)}
                </td>
                <td className="py-3.5 px-3 font-sans text-brand-300" dir="ltr">
                  0.00 جنيه
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Note on table */}
        <div className="p-3.5 bg-surface-50 border-t border-surface-200 text-xs text-text-muted font-medium flex items-center gap-2">
          <Info className="w-4 h-4 text-brand-500 shrink-0" />
          <span>
            {result.interestMethod === "flat"
              ? "ملاحظة: في نظام الفائدة الثابتة يتم توزيع قيمة الفائدة وأصل القرض بالتساوي على كامل جدول السداد بناءً على تواريخ الاستحقاق المحددة."
              : "ملاحظة: في نظام الرصيد المتناقص تنخفض قيمة الفائدة تدريجياً مع سداد أصل القرض لكل قسط."}
          </span>
        </div>
      </div>
    </div>
  );
};

