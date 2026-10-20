import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Lock, 
  Coins, 
  CheckCircle2, 
  Save, 
  User, 
  FileLock2, 
  EyeOff, 
  DatabaseZap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { userProfile, updateCompanyProfile, currentUser, isGuest } = useAuth();

  const [companyName, setCompanyName] = useState(userProfile?.companyName || 'فروشگاه دیجی‌کالا و بازار آنلاین');
  const [industry, setIndustry] = useState(userProfile?.industry || 'خرده‌فروشی آنلاین و تجارت الکترونیک');
  const [currency, setCurrency] = useState('toman');
  const [usePersianDigits, setUsePersianDigits] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateCompanyProfile(companyName, industry);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">تنظیمات کسب‌وکار و حریم خصوصی داده‌ها</h1>
        <p className="mt-1 text-xs text-slate-500">
          پیکربندی مشخصات شرکت، واحد پولی، ترجیحات نمایش ارقام و بیانیه جامع امنیت اطلاعات
        </p>
      </div>

      {/* Business Profile Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">مشخصات فروشگاه یا سازمان</h2>
            <p className="text-[11px] text-slate-500">این اطلاعات در عنوان گزارش‌ها و توصیه‌های هوش مصنوعی لحاظ می‌شود</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                نام کسب‌وکار یا برند:
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                حوزه فعالیت تجاری:
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {saveSuccess ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                <span>مشخصات با موفقیت ذخیره شد.</span>
              </span>
            ) : <span />}

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50 transition-colors shadow-2xs"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isSaving ? 'در حال ثبت...' : 'ذخیره تنظیمات'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Presentation Preferences */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
            <Coins className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">واحد پول و نحوه نمایش ارقام</h2>
            <p className="text-[11px] text-slate-500">تنظیم قالب‌بندی مالی در نمودارها و کارت‌های KPI</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">واحد پولی اصلی:</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden"
            >
              <option value="toman">تومان (پیش‌فرض)</option>
              <option value="rial">ریال ایران</option>
              <option value="million_toman">میلیون تومان</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">سبک نمایش اعداد:</label>
            <div className="flex items-center gap-3 mt-2">
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="digits"
                  checked={usePersianDigits}
                  onChange={() => setUsePersianDigits(true)}
                  className="accent-emerald-700"
                />
                <span>ارقام فارسی (۱۲۳٬۴۵۶)</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="digits"
                  checked={!usePersianDigits}
                  onChange={() => setUsePersianDigits(false)}
                  className="accent-emerald-700"
                />
                <span>ارقام انگلیسی (123,456)</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Security & Privacy Policy Declaration */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-[#FAF8F5] to-white p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-200/80 pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">سیاست حریم خصوصی و امنیت داده‌ها (Data Privacy)</h2>
            <p className="text-[11px] text-slate-500">تضمین‌های حقوقی و فنی دیتاپایلوت برای حفاظت از داده‌های مالی</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700 pt-2">
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <FileLock2 className="h-4 w-4 text-emerald-600" />
              <span>پردازش کلاینت‌محور (Zero-Leak)</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              فایل‌های خام اکسل و CSV مستقیماً در مرورگر شما پردازش می‌شوند و هیچ کپی از فایل فیزیکی روی دیسک سرور ذخیره نمی‌گردد.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-4 space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <EyeOff className="h-4 w-4 text-teal-600" />
              <span>عدم استفاده برای آموزش هوش مصنوعی</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              ارقام و صورت‌حساب‌های مالی کسب‌وکار شما محرمانه بوده و هرگز برای بازآموزی مدل‌های هوش مصنوعی عمومی به کار گرفته نمی‌شوند.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-4 space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <DatabaseZap className="h-4 w-4 text-purple-600" />
              <span>ایزولاسیون کامل فایربیس (RBAC)</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              پایگاه داده ابری Firestore به صورت تفکیک‌شده و با قوانین امنیتی سخت‌گیرانه (Firestore Rules) تنها اجازه دسترسی به صاحب حساب را می‌دهد.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
