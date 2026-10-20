import React, { useState } from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  CreditCard, 
  RotateCcw, 
  AlertTriangle, 
  Sparkles, 
  ArrowUpRight, 
  Layers, 
  Building2,
  Calendar,
  ChevronLeft,
  CheckCircle2,
  BookmarkPlus
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatCompactToman, formatPercent, formatToman, toPersianDigits } from '../lib/persianUtils';
import { DonutChart, RankingBarChart, TrendAreaChart } from '../components/charts/InteractiveCharts';
import { generateStrategicRecommendations } from '../lib/nlp';

interface DashboardPageProps {
  onNavigateTab: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateTab }) => {
  const { dataset, saveCurrentProject, isSaving } = useData();
  const { kpis, qualityReport, anomalies, timeSeries, categoryBreakdown, cityBreakdown } = dataset;

  const [projectTitle, setProjectTitle] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Recommendations state
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [loadingRecs, setLoadingRecs] = useState(false);

  const fetchRecommendations = async () => {
    setLoadingRecs(true);
    try {
      // Deterministic business rule engine execution
      await new Promise((resolve) => setTimeout(resolve, 150));
      const result = generateStrategicRecommendations(
        kpis,
        categoryBreakdown.slice(0, 3),
        cityBreakdown.slice(0, 3)
      );
      if (result.recommendationsText) {
        setRecommendations(result.recommendationsText);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleSaveProject = async () => {
    if (!projectTitle.trim()) return;
    await saveCurrentProject(projectTitle, `ذخیره خودکار داشبورد تحلیل داده ${dataset.name}`);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setShowSaveModal(false);
      setProjectTitle('');
    }, 1500);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">داشبورد شاخص‌های کلیدی عملکرد</h1>
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              داده زنده و پایش‌شده
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            بررسی جامع متریک‌های مالی، توزیع جغرافیایی و روند فروش بر اساس دیتاست «{dataset.name}»
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-[#FAF8F5] px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <BookmarkPlus className="h-4 w-4 text-emerald-700" />
            <span>ذخیره در پروژه‌های ابری</span>
          </button>

          <button
            onClick={() => onNavigateTab('assistant')}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-l from-emerald-700 to-teal-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:from-emerald-800 hover:to-teal-800 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>پرسش از دستیار داده</span>
          </button>
        </div>
      </div>

      {/* Anomaly Notice banner if anomalies exist */}
      {anomalies.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold">
                {toPersianDigits(anomalies.length)} ناهنجاری آماری در تراکنش‌ها کشف شد:
              </span>
              <p className="text-amber-800/90 text-[11px] mt-0.5">
                تراکنش‌هایی با انحراف معیار بالا (Z-Score &gt; 2.5) شناسایی شدند که نیازمند تایید حسابداری هستند.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('anomalies')}
            className="flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 transition-colors shrink-0"
          >
            <span>بررسی ناهنجاری‌ها</span>
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* KPI 1: Gross Revenue */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">کل درآمد ناخالص</span>
            <div className="rounded-lg bg-emerald-50 p-1.5 text-emerald-700">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-lg font-black text-slate-900 leading-tight">
            {formatCompactToman(kpis.totalRevenue)}
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
            <ArrowUpRight className="h-3 w-3" />
            <span>فروش ناخالص کل سفارشات</span>
          </div>
        </div>

        {/* KPI 2: Net Revenue */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">درآمد خالص تحقق‌یافته</span>
            <div className="rounded-lg bg-teal-50 p-1.5 text-teal-700">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="text-lg font-black text-slate-900 leading-tight">
            {formatCompactToman(kpis.netRevenue)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            کسر لغوی و مرجوعی‌ها
          </div>
        </div>

        {/* KPI 3: Total Orders */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">تعداد کل سفارش‌ها</span>
            <div className="rounded-lg bg-blue-50 p-1.5 text-blue-700">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </div>
          <div className="text-lg font-black text-slate-900 leading-tight">
            {toPersianDigits(kpis.totalOrders)} فاکتور
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            میانگین {toPersianDigits((kpis.totalOrders / Math.max(1, timeSeries.length)).toFixed(1))} در هر روز
          </div>
        </div>

        {/* KPI 4: AOV */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">میانگین هر سفارش (AOV)</span>
            <div className="rounded-lg bg-purple-50 p-1.5 text-purple-700">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="text-lg font-black text-slate-900 leading-tight">
            {formatCompactToman(kpis.averageOrderValue)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            ارزش میانگین هر سبد خرید
          </div>
        </div>

        {/* KPI 5: Return Rate */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">نرخ مرجوعی و کنسلی</span>
            <div className="rounded-lg bg-rose-50 p-1.5 text-rose-700">
              <RotateCcw className="h-4 w-4" />
            </div>
          </div>
          <div className="text-lg font-black text-slate-900 leading-tight">
            {formatPercent(kpis.returnRate + kpis.cancellationRate)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {toPersianDigits(kpis.returnRate)}٪ مرجوعی، {toPersianDigits(kpis.cancellationRate)}٪ لغو
          </div>
        </div>

        {/* KPI 6: Unique Customers */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">مشتریان یکتا</span>
            <div className="rounded-lg bg-amber-50 p-1.5 text-amber-700">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-lg font-black text-slate-900 leading-tight">
            {toPersianDigits(kpis.uniqueCustomers)} مشتری
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            پایگاه خریداران ثبت‌شده
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Over Time (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">روند زمانی فروش و نوسان تقاضا</h2>
              <p className="text-[11px] text-slate-500">تحلیل تغییرات روزانه و مقایسه جریان نقدینگی</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              <Calendar className="h-3.5 w-3.5 text-emerald-700" />
              <span>دوره ثبت سفارشات</span>
            </div>
          </div>

          <TrendAreaChart data={timeSeries} height={250} />
        </div>

        {/* Category Breakdown Donut (1 col) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">سهم دسته‌بندی محصولات</h2>
                <p className="text-[11px] text-slate-500">تفکیک حجم فروش بر اساس گروه کالا</p>
              </div>
            </div>
            <div className="pt-2">
              <DonutChart data={categoryBreakdown} />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>پرسودترین دسته:</span>
            <span className="font-bold text-emerald-800">
              {kpis.topCategory.name} ({formatPercent(kpis.topCategory.percentage)})
            </span>
          </div>
        </div>
      </div>

      {/* Second Charts & Summaries Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* City Ranking */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">رتبه‌بندی شهرها بر اساس درآمد</h2>
              <p className="text-[11px] text-slate-500">بزرگ‌ترین کانون‌های تقاضا و ارسال مرسوله</p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              برترین: {kpis.topCity.name}
            </span>
          </div>

          <RankingBarChart data={cityBreakdown} labelKey="city" maxItems={6} />
        </div>

        {/* Rule-Based Strategic Recommendations */}
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-[#F9F7F2] p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">توصیه‌های استراتژیک دیتاپایلوت</h2>
                  <p className="text-[11px] text-slate-500">تحلیل راهبردی متناسب با شاخص‌های کنونی</p>
                </div>
              </div>

              {!recommendations && (
                <button
                  onClick={fetchRecommendations}
                  disabled={loadingRecs}
                  className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50 transition-colors shadow-2xs"
                >
                  {loadingRecs ? 'در حال تحلیل...' : 'تولید توصیه‌ها'}
                </button>
              )}
            </div>

            {recommendations ? (
              <div className="space-y-2 mt-3 text-xs text-slate-700 leading-relaxed max-h-56 overflow-y-auto pr-1">
                <div className="whitespace-pre-line bg-white/80 p-3.5 rounded-xl border border-slate-200/80 shadow-2xs font-sans">
                  {recommendations}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500 space-y-2">
                <p>
                  برای دریافت ۴ توصیه اجرایی و استراتژیک در زمینه قیمت‌گذاری، بازاریابی استانی و ارتقای سودآوری دکمه بالا را لمس کنید.
                </p>
                <div className="text-[11px] text-slate-400">
                  تولید شده با موتور محاسبات قطعی و تحلیل استراتژیک دیتاپایلوت بر پایه داده‌های واقعی
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">نیاز به تحلیل عمیق‌تر دارید؟</span>
            <button
              onClick={() => onNavigateTab('workspace')}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1"
            >
              <span>ورود به محیط فیلتر و کاوش</span>
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Save Project Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl text-right">
            <h3 className="text-base font-bold text-slate-900 mb-1">ذخیره این تحلیل در پروژه ابری</h3>
            <p className="text-xs text-slate-500 mb-4">
              این تحلیل در حساب فایربیس شما ثبت می‌شود و در آینده از بخش پروژه‌ها قابل بازیابی است.
            </p>

            {saveSuccess ? (
              <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 p-4 text-emerald-800 font-bold text-xs">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span>پروژه با موفقیت در فایربیس ذخیره شد!</span>
              </div>
            ) : (
              <>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  عنوان پروژه:
                </label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="مثال: گزارش فصلی زمستان ۱۴۰۳"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-hidden"
                />

                <div className="mt-5 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setShowSaveModal(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    انصراف
                  </button>
                  <button
                    onClick={handleSaveProject}
                    disabled={isSaving || !projectTitle.trim()}
                    className="rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
                  >
                    {isSaving ? 'در حال ذخیره‌سازی...' : 'ذخیره پروژه'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
