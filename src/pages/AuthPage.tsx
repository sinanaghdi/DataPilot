import React, { useState } from 'react';
import { ShieldCheck, Sparkles, CheckCircle2, Lock, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthPageProps {
  onSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const { signInWithGoogle, signInAsGuest, currentUser, isGuest } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await signInWithGoogle();
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setErrorMsg('ورود با گوگل انجام نشد. می‌توانید از حساب آزمایشی مهمان استفاده کنید.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    signInAsGuest();
    onSuccess();
  };

  return (
    <div className="mx-auto max-w-lg py-8 px-4">
      <div className="rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-10 shadow-sm text-center">
        {/* Brand Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 mb-5 shadow-2xs">
          <Sparkles className="h-7 w-7" />
        </div>

        <h2 className="text-2xl font-black text-slate-900">ورود به حساب کاربری دیتاپایلوت</h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
          برای ذخیره تحلیل‌ها، همگام‌سازی پروژه‌ها و دسترسی نامحدود به دستیار هوشمند وارد شوید.
        </p>

        {errorMsg && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 text-right">
            {errorMsg}
          </div>
        )}

        {/* Auth Action Buttons */}
        <div className="mt-8 space-y-3">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs sm:text-sm font-bold text-slate-800 shadow-2xs hover:bg-slate-50 hover:border-slate-400 transition-all disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{loading ? 'در حال اتصال به فایربیس...' : 'ورود امن با حساب کاربری گوگل'}</span>
          </button>

          <div className="relative my-4 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative bg-white px-3 text-[11px] text-slate-400">یا برای آزمایش سریع</span>
          </div>

          <button
            onClick={handleGuestLogin}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors"
          >
            <UserCheck className="h-4 w-4" />
            <span>ورود به عنوان کاربر مهمان (نسخه دمو)</span>
          </button>
        </div>

        {/* Security & Features list */}
        <div className="mt-8 rounded-2xl bg-[#F8F6F1] p-4 text-right space-y-2.5 text-xs text-slate-600 border border-slate-200/60">
          <div className="flex items-center gap-2 font-bold text-slate-800 mb-1">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>امنیت و استانداردهای حریم خصوصی:</span>
          </div>
          <div className="flex items-start gap-2 text-[11px]">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>فایل‌های اکسل و داده‌های فروشگاه شما روی دیتابیس خارجی اشتراک‌گذاری نمی‌شوند.</span>
          </div>
          <div className="flex items-start gap-2 text-[11px]">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>قوانین دسترسی سفت‌وسخت فایربیس (Firestore Security Rules) از داده‌های هر کاربر محافظت می‌کند.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
