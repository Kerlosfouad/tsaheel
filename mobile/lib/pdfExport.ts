import { CalculationResult } from "./types";
import { formatCurrency, formatPercent } from "./format";

/**
 * طباعة وتنزيل جدول الأقساط كملف PDF عالي الجودة يدعم اللغة العربية وتواريخ الاستحقاق
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

  const rowsHtml = result.schedule
    .map(
      (item, idx) => `
      <tr style="background-color: ${idx % 2 === 0 ? "#ffffff" : "#f8fafc"};">
        <td style="padding: 7px 8px; text-align: center; font-weight: bold; border: 1px solid #cbd5e1; color: #475569;">${item.installmentNumber}</td>
        <td style="padding: 7px 8px; font-weight: bold; color: #004d40; border: 1px solid #cbd5e1;">${item.dueLabel}</td>
        <td style="padding: 7px 8px; text-align: center; font-weight: 800; color: #0f172a; direction: ltr; border: 1px solid #cbd5e1;">${item.formattedDueDate}</td>
        <td style="padding: 7px 8px; text-align: left; font-weight: bold; color: #004d40; direction: ltr; border: 1px solid #cbd5e1;">${formatCurrency(item.paymentAmount)}</td>
        <td style="padding: 7px 8px; text-align: left; color: #d97706; direction: ltr; border: 1px solid #cbd5e1;">${formatCurrency(item.interestPart)}</td>
        <td style="padding: 7px 8px; text-align: left; color: #0f172a; direction: ltr; border: 1px solid #cbd5e1;">${formatCurrency(item.principalPart)}</td>
        <td style="padding: 7px 8px; text-align: left; color: #64748b; direction: ltr; border: 1px solid #cbd5e1;">${formatCurrency(item.remainingBalance)}</td>
      </tr>
    `
    )
    .join("");

  const htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <title>جدول_أقساط_تساهيل_${result.firstInstallmentDate || "تقرير"}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 10mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Cairo', 'Tajawal', sans-serif;
          margin: 0;
          padding: 8px;
          color: #0f172a;
          background: #ffffff;
        }
        .report-box {
          border: 2px solid #004d40;
          border-radius: 10px;
          padding: 16px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #004d40;
          padding-bottom: 10px;
          margin-bottom: 12px;
        }
        .title {
          font-size: 20px;
          font-weight: 900;
          color: #004d40;
          margin: 0;
        }
        .subtitle {
          font-size: 12px;
          font-weight: 600;
          color: #475569;
          margin: 3px 0 0 0;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          background-color: #f1f5f9;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 10px;
          margin-bottom: 14px;
          font-size: 11.5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10.5px;
          margin-bottom: 12px;
        }
        th {
          background-color: #004d40 !important;
          color: #ffffff !important;
          padding: 7px 6px;
          border: 1px solid #00332a;
        }
        tfoot tr {
          background-color: #00251a !important;
          color: #ffffff !important;
          font-weight: bold;
        }
        tfoot td {
          padding: 8px 6px;
          border: 1px solid #00251a;
        }
        .disclaimer {
          border-top: 1px dashed #cbd5e1;
          padding-top: 8px;
          font-size: 9.5px;
          color: #64748b;
          line-height: 1.5;
        }
      </style>
    </head>
    <body>
      <div class="report-box">
        <div class="header">
          <div>
            <h1 class="title">شركة تساهيل للتمويل</h1>
            <p class="subtitle">جدول سداد الأقساط وتواريخ الاستحقاق التفصيلية</p>
          </div>
          <div style="text-align: left;">
            <div style="font-size: 10px; color: #64748b;">تاريخ التقرير:</div>
            <div style="font-size: 12px; font-weight: bold; color: #004d40;">${currentDateFormatted}</div>
          </div>
        </div>

        <div class="info-grid">
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

        <table>
          <thead>
            <tr>
              <th style="width: 30px; text-align: center;">#</th>
              <th style="text-align: right;">الدفعة / القسط</th>
              <th style="text-align: center;">تاريخ الاستحقاق</th>
              <th style="text-align: left;">قيمة القسط</th>
              <th style="text-align: left;">جزء الفائدة</th>
              <th style="text-align: left;">أصل المبلغ</th>
              <th style="text-align: left;">الرصيد المتبقي</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td style="text-align: center;">الإجمالي</td>
              <td>${result.numberOfInstallments} ${result.installmentType === "monthly" ? "أقساط" : "دفعات"}</td>
              <td style="text-align: center;">-</td>
              <td style="text-align: left; direction: ltr; color: #fbbf24;">${formatCurrency(result.totalPayable)}</td>
              <td style="text-align: left; direction: ltr; color: #fde68a;">${formatCurrency(result.totalInterest)}</td>
              <td style="text-align: left; direction: ltr;">${formatCurrency(result.loanAmount)}</td>
              <td style="text-align: left; direction: ltr;">0.00 جنيه</td>
            </tr>
          </tfoot>
        </table>

        <div class="disclaimer">
          <div>• جدول السداد استرشادي وتعتمد التواريخ والقيم النهائية على العقد المبرم والموافقة الائتمانية.</div>
          <div>• تم إصدار هذا التقرير عبر حاسبة أقساط تساهيل للتمويل.</div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Use hidden iframe to trigger direct PDF print dialog without blank canvas issues
  let iframe = document.getElementById("tasaheel-print-iframe") as HTMLIFrameElement;
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.id = "tasaheel-print-iframe";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);
  }

  const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
  if (iframeDoc && iframe.contentWindow) {
    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }, 300);
  } else {
    // Popup window fallback
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 300);
    } else {
      window.print();
    }
  }
}


