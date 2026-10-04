import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "حاسبة القسط | تساهيل للتمويل",
  description:
    "احسب قسط التمويل والمشروعات مع تساهيل - برامج تمويلية مرنة من 5,000 حتى 15 مليون جنيه بأنظمة سداد ميسرة وسريعة.",
  keywords: [
    "تساهيل",
    "حاسبة القسط",
    "تمويل المشروعات",
    "تمويل متناهي الصغر",
    "قروض المشروعات",
    "Tasaheel",
    "حساب القسط الشهري",
    "حساب القسط الموسمي",
  ],
  authors: [{ name: "تساهيل مصر للتمويل" }],
  openGraph: {
    title: "حاسبة القسط التقديرية | تساهيل للتمويل",
    description: "احسب قسطك الشهري أو الموسمي بخطوات بسيطة مع شركة تساهيل للتمويل",
    url: "https://tasaheelfinance.com",
    siteName: "تساهيل للتمويل",
    locale: "ar_EG",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B7A5A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="font-sans antialiased bg-surface-50 text-brand-900 selection:bg-brand-100 selection:text-brand-800">
        {children}
      </body>
    </html>
  );
}
