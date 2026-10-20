import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  ArrowUpRight, 
  FileSearch, 
  BookmarkPlus, 
  Zap,
  Info
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatToman, toPersianDigits } from '../lib/persianUtils';
import { explainAnomalies } from '../lib/nlp';

export const AnomaliesPage: React.FC = () => {
  const { dataset, saveAnalysis, isSaving } = useData();
  const { anomalies, kpis } = dataset;

  const [aiReport, setAiReport] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchAiAudit = async () => {
    setLoadingAi(true);
    try {
      // Deterministic root-cause analysis based on Z-score and IQR
      await new Promise((resolve) => setTimeout(resolve, 150));
      const explanation = explainAnomalies(anomalies, {
        name: dataset.name,
        totalRows: dataset.rows.length,
        totalRevenue: dataset.kpis.totalRevenue,
        aov: dataset.kpis.averageOrderValue,
        returnRate: dataset.kpis.returnRate,
      });

      setAiReport(explanation.fullReport);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSaveAnomalyReport = async () => {
    if (!aiReport) return;
    try {
      await saveAnalysis({
        projectId: dataset.id,
        title: `گزارش ریشه‌یابی ناهنجاری‌های ${dataset.name}`,
        question: `تحلیل ${toPersianDigits(anomalies.length)} ناهنجاری کشف‌شده با روش Z-Score و چارک‌های IQR`,
        findings: aiReport,
        assumptions: 'محاسبه قطعی بر مبنای نمره Z بالاتر از ۲.۰ و فاصله بین چارکی آماری',
        confidenceScore: 100,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">کشف ناهنجاری‌ها و موارد نامتعارف (Anomaly Detection)</h1>
            <span className="rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-xs font-bold text-rose-800">
              {toPersianDigits(anomalies.length)} مورد شناسایی شد
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            ممیزی آماری با استفاده از نمره Z (فاصله از انحراف معیار) و چارک‌های IQR برای رصد خطاهای داده یا تراکنش‌های نامتعارف
          </p>
        </div>

        <button
          onClick={fetchAiAudit}
          disabled={loadingAi}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-l from-emerald-700 to-teal-700 px-4 py-2.5 text-xs font-bold text-white shadow-2xs hover:from-emerald-800 hover:to-teal-800 transition-all disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" />
          <span>{loadingAi ? 'در حال تحلیل ریشه‌ای...' : 'تحلیل علل ریشه‌ای ناهنجاری‌ها'}</span>
        </button>
      </div>

      {/* Statistical Methodology Card */}
      <div className="rounded-2xl border border-slate-200 bg-[#FAF8F5] p-4 text-xs text-slate-700 flex items-start gap-3">
        <Info className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold text-slate-900">فرمول ریاضی تشخیص: </span>
          نمره Z طبق فرمول <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-900 font-bold">Z = (X - μ) / σ</code> محاسبه شده است. مقادیری که فاصله آن‌ها بیش از ۲.۵ برابر انحراف معیار باشد، به عنوان داده پرت بحرانی برچسب‌گذاری می‌شوند تا از خطاهای ثبتی در سیستم‌های مالی جلوگیری شود.
        </div>
      </div>

      {/* Root-Cause Report if generated */}
      {aiReport && (
        <div className="rounded-2xl border border-emerald-300/80 bg-gradient-to-br from-emerald-50/70 to-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-200/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <h3 className="font-black text-slate-900 text-sm">
                گزارش موشکافانه علل ناهنجاری‌ها و توصیه‌های اصلاحی دیتاپایلوت
              </h3>
            </div>

            <button
              onClick={handleSaveAnomalyReport}
              disabled={isSaving}
              className="flex items-center gap-1 rounded-lg border border-emerald-600 bg-white px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-50 transition-colors shadow-2xs"
            >
              <BookmarkPlus className="h-3.5 w-3.5" />
              <span>{savedSuccess ? 'در پروژه ذخیره شد' : 'ذخیره در ممیزی پروژه'}</span>
            </button>
          </div>

          <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line bg-white/90 p-4 rounded-xl border border-emerald-100 shadow-2xs font-sans">
            {aiReport}
          </div>
        </div>
      )}

      {/* Anomalies List */}
      <div className="space-y-3">
        {anomalies.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600 mb-2" />
            <h4 className="font-bold text-slate-800 text-sm">هیچ ناهنجاری آماری کشف نشد</h4>
            <p className="text-xs mt-1">تمامی ارقام و تراکنش‌ها در محدوده استاندارد و نرمال قرار دارند.</p>
          </div>
        ) : (
          anomalies.map((anom) => {
            const isHigh = anom.severity === 'high';
            return (
              <div
                key={anom.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        isHigh ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 text-sm">
                        ستون «{anom.columnName}» در سطر {toPersianDigits(anom.rowIndex + 1)}
                      </span>
                      {anom.zScore && (
                        <span className="mr-2 text-[11px] font-mono font-semibold text-slate-500">
                          (نمره Z: {toPersianDigits(anom.zScore)})
                        </span>
                      )}
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      isHigh ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isHigh ? 'شدت: بالا (بحرانی)' : 'شدت: متوسط'}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-[#FAF8F5] p-3 rounded-xl border border-slate-200/60 mb-3">
                  {anom.reasonPersian}
                </p>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-4">
                    <span>
                      مقدار ثبت‌شده: <strong className="text-slate-900">{typeof anom.value === 'number' ? formatToman(anom.value) : anom.value}</strong>
                    </span>
                    <span>
                      حد نرمال مورد انتظار: <strong className="text-slate-700">{anom.expectedRange}</strong>
                    </span>
                  </div>

                  <div className="text-slate-400">
                    مشتری: {anom.affectedRowData?.customerName || anom.affectedRowData?.customer || 'نامشخص'}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
