import React from 'react';
import { 
  BarChart3, 
  Sparkles, 
  ShieldCheck, 
  FileSpreadsheet, 
  SearchCheck, 
  Zap, 
  ArrowLeft, 
  CheckCircle2, 
  Database,
  Lock
} from 'lucide-react';
import { toPersianDigits } from '../lib/persianUtils';

interface LandingPageProps {
  onStartDashboard: () => void;
  onStartUpload: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartDashboard, onStartUpload }) => {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-b from-[#FFFDF9] to-[#F5F1E8] p-8 md:p-14 text-center shadow-xs">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800 shadow-2xs mb-6">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
          <span>پلتفرم تخصصی هوش تجاری و تحلیل داده‌های کسب‌وکار</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 max-w-3xl mx-auto leading-tight sm:leading-snug">
          تصمیم‌گیری آگاهانه با <span className="text-emerald-700">تحلیل هوشمند و بدون توهم</span> داده‌های فروش
        </h1>

        <p className="mt-5 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          فایل‌های اکسل و CSV فروشگاه یا شرکت خود را بارگذاری کنید؛ دیتاپایلوت به صورت خودکار خطاها را پاکسازی می‌کند، ناهنجاری‌ها را کشف کرده و به سوالات تحلیلی شما به زبان فارسی و با ارقام واقعی پاسخ می‌دهد.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onStartDashboard}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-700/25 hover:bg-emerald-800 transition-all hover:scale-102"
          >
            <span>مشاهده داشبورد با دیتای نمونه</span>
            <ArrowLeft className="h-4 w-4" />
          </button>

          <button
            onClick={onStartUpload}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>آپلود فایل اکسل یا CSV شما</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 border-t border-slate-200/60 pt-6">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>پشتیبانی کامل از زبان فارسی و تاریخ شمسی</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>محاسبه ریاضی دقیق بدون اطلاعات ساختگی</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="h-4 w-4 text-emerald-600" />
            <span>حفظ کامل حریم داده با احراز هویت فایربیس</span>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 mb-4">
            <SearchCheck className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2">ممیزی و پاکسازی خودکار داده</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            کشف سطرهای تکراری، مقادیر گم‌شده (Null)، خطاهای نوع داده و صدور نمره سلامت و کیفیت داده از ۰ تا ۱۰۰ همراه با توصیه‌های اصلاحی.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700 mb-4">
            <Zap className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2">شناسایی هوشمند ناهنجاری‌ها</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            استفاده از فرمول‌های آماری Z-Score و فاصله بین چارکی (IQR) برای کشف خریدهای غیرعادی، خطاهای ثبت قیمت و جهش‌های ناگهانی سفارشات.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 mb-4">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2">دستیار گفتگوی هوش تجاری</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            پاسخگویی به هر سوال تحلیلی به زبان فارسی با تکیه صرف بر ارقام واقعی فایل شما؛ ذکر صریح فرضیات و اعلام عدم قطعیت در صورت کمبود شواهد.
          </p>
        </div>
      </section>

      {/* Workflow Steps */}
      <section className="rounded-2xl border border-slate-200 bg-white p-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">مراحل ساده تبدیل داده خام به تصمیم تجاری</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">تنها در ۳ مرحله، کنترل کامل عملکرد فروش خود را به دست بگیرید</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm">
              {toPersianDigits(1)}
            </div>
            <h4 className="font-bold text-slate-800 text-sm">بارگذاری فایل</h4>
            <p className="text-xs text-slate-500 leading-normal">
              آپلود فایل CSV یا اکسل بدون نیاز به قالب خاص؛ هوش سیستم ستون‌های تاریخ، مبلغ و دسته‌ها را شناسایی می‌کند.
            </p>
          </div>

          <div className="text-center space-y-3">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm">
              {toPersianDigits(2)}
            </div>
            <h4 className="font-bold text-slate-800 text-sm">بررسی شاخص‌ها و ناهنجاری‌ها</h4>
            <p className="text-xs text-slate-500 leading-normal">
              مشاهده خودکار شاخص‌های درآمد، میانگین سبد، نرخ مرجوعی و موارد مشکوک در نمودارهای تعاملی.
            </p>
          </div>

          <div className="text-center space-y-3">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm">
              {toPersianDigits(3)}
            </div>
            <h4 className="font-bold text-slate-800 text-sm">پرسش و اقدام استراتژیک</h4>
            <p className="text-xs text-slate-500 leading-normal">
              با دستیار فارسی مشورت کنید، فیلترهای چندبعدی اعمال کرده و نتایج را در پروژه شخصی ابری ذخیره نمایید.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
