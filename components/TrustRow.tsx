import React from "react";
import { Zap, FileCheck2, Award, ArrowLeft } from "lucide-react";

export const TrustRow: React.FC = () => {
  const features = [
    {
      icon: Zap,
      title: "أسرع الإجراءات",
      description:
        "دراسة ائتمانية فورية وسرعة في صرف التمويل لمساعدتك على بدء أو تنمية نشاطك بدون انتظار.",
      badge: "صرف سريع",
      iconColor: "text-amber-500",
      bgColor: "bg-amber-50",
    },
    {
      icon: FileCheck2,
      title: "أبسط الأوراق",
      description:
        "إجراءات ومستندات مبسطة بدون تعقيدات تناسب جميع المشروعات والشركات الصغيرة ومتناهية الصغر.",
      badge: "متطلبات ميسرة",
      iconColor: "text-brand",
      bgColor: "bg-brand-50",
    },
    {
      icon: Award,
      title: "أفضل البرامج التمويلية",
      description:
        "حلول تمويل مرنة بأنظمة سداد شهرية وموسمية مصممة خصيصاً لتناسب التدفقات النقدية لمشروعك.",
      badge: "سداد مريح",
      iconColor: "text-brand-600",
      bgColor: "bg-brand-100/60",
    },
  ];

  return (
    <div className="my-10 sm:my-14 no-print">
      <div className="text-center mb-8">
        <h3 className="text-xl sm:text-2xl font-black text-brand-900 mb-2">
          لماذا تختار التمويل من تساهيل؟
        </h3>
        <p className="text-xs sm:text-sm text-text-muted font-medium max-w-md mx-auto">
          خطوات سهلة وبسيطة لدعم نمو أعمالك ومشروعاتك في كافة محافظات مصر
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {features.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl sm:rounded-3xl p-6 shadow-soft border border-surface-200 hover:shadow-card hover:border-brand-300 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-2xl ${item.bgColor} ${item.iconColor} flex items-center justify-center transition-transform group-hover:scale-110`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-surface-100 text-brand-900 border border-surface-200">
                  {item.badge}
                </span>
              </div>

              <h4 className="text-lg font-black text-brand-900 mb-2 group-hover:text-brand transition-colors">
                {item.title}
              </h4>

              <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-medium">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
