import { CalculationResult } from "./types";
import { formatCurrency, formatPercent } from "./format";

/**
 * تصدير جدول الأقساط كملف PDF عالي الجودة يدعم اللغة العربية وتواريخ الاستحقاق
 */
export async function exportSchedulePDF(result: CalculationResult): Promise<void> {
  if (typeof window === "undefined") return;

  const installmentTypeLabel =
    result.installmentType === "monthly" ? "شهري" : "موسمي";
  const methodLabel =
    result.interestMethod === "flat" ? "فائدة ثابتة (Flat Rate)" : "رصيد متناقص (PMT)";

  const currentDateFormatted = new Date().toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Create clean printable HTML container positioned in viewport behind all layers
  const container = document.createElement("div");
  container.id = "tasaheel-pdf-export-container";
  container.style.position = "fixed";
  container.style.top = "0";
  container.style.left = "0";
  container.style.width = "794px"; // Standard A4 width in px
  container.style.zIndex = "-99999";
  container.style.backgroundColor = "#ffffff";
  container.style.color = "#0f172a";
  container.style.padding = "20px";
  container.style.boxSizing = "border-box";
  container.style.fontFamily = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Cairo', 'Tajawal', sans-serif";
  container.dir = "rtl";

  const rowsHtml = result.schedule
    .map(
      (item, idx) => `
      <tr style="background-color: ${idx % 2 === 0 ? "#ffffff" : "#f8fafc"}; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 7px 8px; text-align: center; font-weight: bold; color: #475569;">${item.installmentNumber}</td>
        <td style="padding: 7px 8px; font-weight: bold; color: #004d40;">${item.dueLabel}</td>
        <td style="padding: 7px 8px; text-align: center; font-weight: 800; color: #0f172a; direction: ltr;">${item.formattedDueDate}</td>
        <td style="padding: 7px 8px; text-align: left; font-weight: bold; color: #004d40; direction: ltr;">${formatCurrency(item.paymentAmount)}</td>
        <td style="padding: 7px 8px; text-align: left; color: #d97706; direction: ltr;">${formatCurrency(item.interestPart)}</td>
        <td style="padding: 7px 8px; text-align: left; color: #0f172a; direction: ltr;">${formatCurrency(item.principalPart)}</td>
        <td style="padding: 7px 8px; text-align: left; color: #64748b; direction: ltr;">${formatCurrency(item.remainingBalance)}</td>
      </tr>
    `
    )
    .join("");

  container.innerHTML = `
    <div style="border: 2px solid #004d40; border-radius: 12px; padding: 18px; background-color: #ffffff;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #004d40; padding-bottom: 12px; margin-bottom: 14px;">
        <div>
          <h1 style="margin: 0; font-size: 20px; font-weight: 900; color: #004d40;">شركة تساهيل للتمويل</h1>
          <p style="margin: 3px 0 0 0; font-size: 12px; font-weight: 600; color: #475569;">جدول سداد الأقساط وتواريخ الاستحقاق التفصيلية</p>
        </div>
        <div style="text-align: left;">
          <div style="font-size: 11px; color: #64748b;">تاريخ التقرير:</div>
          <div style="font-size: 12px; font-weight: bold; color: #004d40;">${currentDateFormatted}</div>
        </div>
      </div>

      <!-- Financial Info Box -->
      <div style="background-color: #f1f5f9; border-radius: 8px; padding: 12px; margin-bottom: 16px; border: 1px solid #cbd5e1;">
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; font-size: 11.5px;">
          <div><strong>مبلغ التمويل:</strong> <span style="direction: ltr; font-weight: bold; color: #004d40;">${formatCurrency(result.loanAmount)}</span></div>
          <div><strong>الفائدة السنوية:</strong> <span style="font-weight: bold;">${formatPercent(result.annualRate)}</span></div>
          <div><strong>تاريخ أول قسط:</strong> <span style="font-weight: 800; color: #004d40; direction: ltr;">${result.firstInstallmentDate}</span></div>
          <div><strong>نظام السداد:</strong> <span>${installmentTypeLabel} (${result.paymentFrequencyText})</span></div>
          <div><strong>طريقة الفائدة:</strong> <span>${methodLabel}</span></div>
          <div><strong>عدد الأقساط:</strong> <span>${result.numberOfInstallments} ${result.installmentType === "monthly" ? "أقساط" : "دفعات"} (${result.totalPeriodMonths} شهر)</span></div>
          <div><strong>قيمة القسط:</strong> <span style="direction: ltr; font-weight: 900; color: #004d40;">${formatCurrency(result.installmentAmount)}</span></div>
          <div><strong>إجمالي الفائدة:</strong> <span style="direction: ltr; font-weight: bold; color: #d97706;">${formatCurrency(result.totalInterest)}</span></div>
          <div><strong>إجمالي المسدد:</strong> <span style="direction: ltr; font-weight: 900; color: #004d40;">${formatCurrency(result.totalPayable)}</span></div>
        </div>
      </div>

      <!-- Schedule Table -->
      <table style="width: 100%; border-collapse: collapse; font-size: 10.5px; margin-bottom: 14px;">
        <thead>
          <tr style="background-color: #004d40; color: #ffffff;">
            <th style="padding: 8px 6px; text-align: center; width: 30px;">#</th>
            <th style="padding: 8px 6px; text-align: right;">الدفعة / القسط</th>
            <th style="padding: 8px 6px; text-align: center;">تاريخ الاستحقاق</th>
            <th style="padding: 8px 6px; text-align: left;">قيمة القسط</th>
            <th style="padding: 8px 6px; text-align: left;">جزء الفائدة</th>
            <th style="padding: 8px 6px; text-align: left;">أصل المبلغ</th>
            <th style="padding: 8px 6px; text-align: left;">الرصيد المتبقي</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
        <tfoot>
          <tr style="background-color: #00251a; color: #ffffff; font-weight: bold;">
            <td style="padding: 9px 6px; text-align: center;">الإجمالي</td>
            <td style="padding: 9px 6px;">${result.numberOfInstallments} ${result.installmentType === "monthly" ? "أقساط" : "دفعات"}</td>
            <td style="padding: 9px 6px; text-align: center;">-</td>
            <td style="padding: 9px 6px; text-align: left; direction: ltr; color: #fbbf24;">${formatCurrency(result.totalPayable)}</td>
            <td style="padding: 9px 6px; text-align: left; direction: ltr; color: #fde68a;">${formatCurrency(result.totalInterest)}</td>
            <td style="padding: 9px 6px; text-align: left; direction: ltr;">${formatCurrency(result.loanAmount)}</td>
            <td style="padding: 9px 6px; text-align: left; direction: ltr;">0.00 جنيه</td>
          </tr>
        </tfoot>
      </table>

      <!-- Notes and Disclaimers -->
      <div style="border-top: 1px dashed #cbd5e1; padding-top: 10px; font-size: 9.5px; color: #64748b; line-height: 1.5;">
        <div>• جدول السداد استرشادي وتعتمد التواريخ والقيم النهائية على العقد المبرم والموافقة الائتمانية.</div>
        <div>• تم إصدار هذا الجدول عبر حاسبة أقساط تساهيل للتمويل.</div>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    // Dynamically import html2pdf.js on client side
    // @ts-ignore
    const html2pdfModule = await import("html2pdf.js");
    const html2pdf = html2pdfModule.default || html2pdfModule;

    const opt = {
      margin: 8,
      filename: `جدول_أقساط_تساهيل_${result.firstInstallmentDate || "تقرير"}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 800,
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
    };

    await html2pdf().from(container).set(opt).save();
  } catch (error) {
    console.error("PDF generation failed, falling back to print", error);
    window.print();
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

