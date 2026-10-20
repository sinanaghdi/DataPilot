import React from 'react';
import { 
  LayoutDashboard, 
  UploadCloud, 
  LineChart, 
  MessageSquareText, 
  AlertTriangle, 
  FolderKanban, 
  Settings, 
  Sparkles,
  HelpCircle,
  ExternalLink,
  ChevronLeft,
  X
} from 'lucide-react';
import { toPersianDigits } from '../../lib/persianUtils';
import { useData } from '../../context/DataContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, activeTab, setActiveTab }) => {
  const { dataset, savedProjects } = useData();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'داشبورد مدیریتی',
      sublabel: 'شاخص‌ها و نمودارهای کلیدی',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'upload',
      label: 'بارگذاری و ممیزی دیتا',
      sublabel: 'پیش‌نمایش، ساختار و پاکسازی',
      icon: UploadCloud,
      badge: dataset.qualityReport.healthStatus,
      badgeColor: dataset.qualityReport.healthStatus === 'عالی' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800',
    },
    {
      id: 'workspace',
      label: 'محیط تحلیل تعاملی',
      sublabel: 'فیلترها، تفکیک استانی و دسته‌ها',
      icon: LineChart,
      badge: null,
    },
    {
      id: 'assistant',
      label: 'دستیار داده هوشمند',
      sublabel: 'پرسش و پاسخ فارسی به استناد دیتا',
      icon: MessageSquareText,
      badge: 'هوشمند',
      badgeColor: 'bg-indigo-100 text-indigo-700 font-bold',
    },
    {
      id: 'anomalies',
      label: 'شناسایی ناهنجاری‌ها',
      sublabel: 'تحلیل آماری Z-Score و IQR',
      icon: AlertTriangle,
      badge: dataset.anomalies.length > 0 ? `${toPersianDigits(dataset.anomalies.length)} مورد` : null,
      badgeColor: 'bg-rose-100 text-rose-700',
    },
    {
      id: 'projects',
      label: 'پروژه‌ها و تاریخچه',
      sublabel: 'گزارش‌های ذخیره‌شده فایربیس',
      icon: FolderKanban,
      badge: savedProjects.length > 0 ? toPersianDigits(savedProjects.length) : null,
      badgeColor: 'bg-slate-200 text-slate-700',
    },
    {
      id: 'settings',
      label: 'تنظیمات و حریم داده',
      sublabel: 'پیکربندی، واحد پول و امنیت',
      icon: Settings,
      badge: null,
    },
    {
      id: 'landing',
      label: 'صفحه معرفی پلتفرم',
      sublabel: 'توضیحات محصول و قابلیت‌ها',
      icon: Sparkles,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-72 flex-col border-l border-slate-200/90 bg-[#FAF8F5] transition-transform duration-300 md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Mobile Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-200/80 md:hidden">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900">منوی دیتاپایلوت</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-slate-400">
            ابزارهای هوش تجاری
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-right transition-all ${
                  isActive
                    ? 'bg-emerald-700 text-white font-medium shadow-md shadow-emerald-700/15'
                    : 'text-slate-700 hover:bg-slate-200/60 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-white text-slate-500 group-hover:text-emerald-700 border border-slate-200/70 shadow-2xs'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold leading-tight">{item.label}</div>
                    <div className={`text-[10px] mt-0.5 leading-tight ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                      {item.sublabel}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      isActive ? 'bg-white/25 text-white' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Dataset Cleanliness Score mini banner */}
        <div className="p-3.5 m-3 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-800">شاخص سلامت داده:</span>
            <span className="font-bold text-emerald-700 font-mono">
              {toPersianDigits(dataset.qualityReport.cleanlinessScore)} از ۱۰۰
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                dataset.qualityReport.cleanlinessScore > 80
                  ? 'bg-emerald-500'
                  : dataset.qualityReport.cleanlinessScore > 50
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${dataset.qualityReport.cleanlinessScore}%` }}
            />
          </div>
          <p className="mt-2 text-[10px] text-slate-500 leading-normal">
            {dataset.qualityReport.duplicateRowsCount > 0
              ? `${toPersianDigits(dataset.qualityReport.duplicateRowsCount)} سطر تکراری شناسایی شده`
              : 'ساختار ستون‌ها پایدار و فاقد تکرار بحرانی است.'}
          </p>
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-200/80 p-3.5 text-center text-[10px] text-slate-400">
          دیتاپایلوت نگارش ۱.۰ · با هوش مصنوعی و فایربیس
        </div>
      </aside>
    </>
  );
};
