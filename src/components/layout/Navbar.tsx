import React from 'react';
import { 
  BarChart3, 
  Database, 
  Sparkles, 
  User as UserIcon, 
  LogOut, 
  RotateCcw, 
  Upload,
  Menu,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatJalaliDate, toPersianDigits } from '../../lib/persianUtils';

interface NavbarProps {
  onToggleSidebar: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, activeTab, setActiveTab }) => {
  const { currentUser, userProfile, isGuest, signOut } = useAuth();
  const { dataset, resetToSample } = useData();

  const todayJalali = formatJalaliDate(new Date());

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 md:px-6 backdrop-blur-md">
      {/* Right side (RTL Start): Hamburger & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          title="باز کردن منو"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div 
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-slate-900">دیتاپایلوت</span>
              <span className="rounded bg-emerald-100/80 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800">
                هوش تجاری
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">DataPilot Business Intelligence</p>
          </div>
        </div>

        {/* Active Dataset status badge */}
        <div className="hidden lg:flex items-center gap-2 mr-4 rounded-full border border-slate-200/90 bg-[#FBF9F6] py-1 px-3 text-xs text-slate-700 shadow-xs">
          <Database className="h-3.5 w-3.5 text-emerald-600" />
          <span className="font-medium truncate max-w-[170px]" title={dataset.name}>
            {dataset.name}
          </span>
          <span className="rounded-full bg-slate-200/70 px-1.5 py-0.5 text-[10px] text-slate-600 font-mono">
            {toPersianDigits(dataset.rows.length)} سطر
          </span>
          <button
            onClick={resetToSample}
            className="text-[11px] text-slate-400 hover:text-emerald-700 flex items-center gap-1 mr-1 transition-colors"
            title="بازنشانی به دیتای نمونه"
          >
            <RotateCcw className="h-3 w-3" />
            <span>نمونه</span>
          </button>
        </div>
      </div>

      {/* Left side (RTL End): Date, Quick Actions, User info */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Date pill */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
          <span>امروز:</span>
          <span className="text-slate-700">{todayJalali}</span>
        </div>

        {/* Upload Quick Button */}
        <button
          onClick={() => setActiveTab('upload')}
          className="flex items-center gap-1.5 rounded-lg border border-emerald-600/30 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100/80 transition-colors shadow-xs"
        >
          <Upload className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">آپلود دیتاست</span>
        </button>

        {/* User Account / Profile */}
        {currentUser || isGuest ? (
          <div className="flex items-center gap-2 border-r border-slate-200 pr-3 mr-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold overflow-hidden">
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt="User" className="h-full w-full object-cover" />
                ) : (
                  <UserIcon className="h-4 w-4 text-slate-500" />
                )}
              </div>
              <div className="hidden xl:block text-right">
                <div className="text-xs font-semibold text-slate-800 truncate max-w-[120px]">
                  {userProfile?.displayName || (isGuest ? 'حساب آزمایشی' : 'کاربر')}
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                  {userProfile?.companyName || 'کسب‌وکار شما'}
                </div>
              </div>
            </div>

            <button
              onClick={signOut}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
              title="خروج از حساب"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setActiveTab('auth')}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs"
          >
            ورود به سیستم
          </button>
        )}
      </div>
    </header>
  );
};
