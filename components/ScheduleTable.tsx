import React, { useState } from "react";
import { ScheduleItem, CalculationResult } from "../lib/types";
import { formatCurrency } from "../lib/format";
import { ChevronDown, ChevronUp, Table, Info } from "lucide-react";

interface ScheduleTableProps {
  result: CalculationResult | null;
}

export const ScheduleTable: React.FC<ScheduleTableProps> = ({ result }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  if (!result || result.schedule.length === 0) {
    return null;
  }

  const { schedule, loanAmount, totalInterest, totalPayable } = result;

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-card border border-surface-200 overflow-hidden transition-all print-break-inside-avoid">
      
      {/* Header with Toggle Button */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 sm:p-6 flex items-center justify-between text-right bg-surface-50/70 hover:bg-surface-100/70 border-b border-surface-200 transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-inset"
        aria-expanded={isExpanded}
        aria-controls="schedule-table-content"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand flex items-center justify-center font-bold">
            <Table className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-brand-900">
                جدول السداد التقديري للأقساط
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 font-bold border border-brand-200">
                {schedule.length} {result.installmentType === "monthly" ? "قسط" : "دفعة"}
              </span>
            </div>
            <p className="text-xs text-text-muted font-medium mt-0.5">
              تفاصيل توزيع أصل التمويل والفائدة والرصيد المتبقي لكل قسط
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand px-3 py-1.5 rounded-lg bg-white border border-surface-200 shadow-xs no-print">
          <span>{isExpanded ? "إخفاء الجدول" : "عرض الجدول"}</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </button>

      {/* Collapsible Content */}
      <div
        id="schedule-table-content"
        className={`${isExpanded ? "block" : "hidden"} transition-all`}
      >
        <div className="overflow-x-auto max-h-[480px]">
          <table className="w-full text-right border-collapse text-xs sm:text-sm">
            <thead className="sticky top-0 bg-surface-100 border-b border-surface-200 text-brand-900 font-extrabold z-10">
              <tr>
                <th className="py-3.5 px-4 text-center w-16">#</th>
                <th className="py-3.5 px-4">موعد الاستحقاق</th>
                <th className="py-3.5 px-4">قيمة القسط</th>
                <th className="py-3.5 px-4">جزء الفائدة</th>
                <th className="py-3.5 px-4">أصل المبلغ</th>
                <th className="py-3.5 px-4">الرصيد المتبقي</th>
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
                    <td className="py-3 px-4 text-center font-bold text-text-muted">
                      {item.installmentNumber}
                    </td>

                    {/* Due Label */}
                    <td className="py-3 px-4 font-bold text-brand-900">
                      {item.dueLabel}
                    </td>

                    {/* Payment Amount */}
                    <td className="py-3 px-4 font-black text-brand-700 font-sans" dir="ltr">
                      {formatCurrency(item.paymentAmount)}
                    </td>

                    {/* Interest Part */}
                    <td className="py-3 px-4 font-medium text-accent-600 font-sans" dir="ltr">
                      {formatCurrency(item.interestPart)}
                    </td>

                    {/* Principal Part */}
                    <td className="py-3 px-4 font-medium text-brand-900 font-sans" dir="ltr">
                      {formatCurrency(item.principalPart)}
                    </td>

                    {/* Remaining Balance */}
                    <td className="py-3 px-4 font-bold text-text-muted font-sans" dir="ltr">
                      {formatCurrency(item.remainingBalance)}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Totals Footer */}
            <tfoot className="sticky bottom-0 bg-brand-900 text-white font-black z-10 border-t-2 border-brand-800">
              <tr>
                <td className="py-3.5 px-4 text-center">الإجمالي</td>
                <td className="py-3.5 px-4 font-normal text-brand-200">
                  {schedule.length} {result.installmentType === "monthly" ? "قسط" : "دفعة"}
                </td>
                <td className="py-3.5 px-4 font-sans text-accent-300" dir="ltr">
                  {formatCurrency(totalPayable)}
                </td>
                <td className="py-3.5 px-4 font-sans text-accent-200" dir="ltr">
                  {formatCurrency(totalInterest)}
                </td>
                <td className="py-3.5 px-4 font-sans text-white" dir="ltr">
                  {formatCurrency(loanAmount)}
                </td>
                <td className="py-3.5 px-4 font-sans text-brand-300" dir="ltr">
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
              ? "ملاحظة: في نظام الفائدة الثابتة يتم توزيع قيمة الفائدة وأصل القرض بالتساوي على كامل جدول السداد."
              : "ملاحظة: في نظام الرصيد المتناقص تنخفض قيمة الفائدة تدريجياً مع سداد أصل القرض."}
          </span>
        </div>
      </div>
    </div>
  );
};
