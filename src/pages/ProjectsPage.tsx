import React, { useState } from 'react';
import { 
  FolderKanban, 
  Trash2, 
  Calendar, 
  FileText, 
  Eye, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  X,
  BookmarkPlus
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { formatJalaliDate, toPersianDigits } from '../lib/persianUtils';
import { SavedAnalysis } from '../types';

export const ProjectsPage: React.FC = () => {
  const { savedProjects, savedAnalyses, deleteProject, deleteAnalysis, dataset, saveCurrentProject, isSaving } = useData();
  const { currentUser, isGuest } = useAuth();

  const [activeTab, setActiveTab] = useState<'projects' | 'analyses'>('projects');
  const [selectedAnalysis, setSelectedAnalysis] = useState<SavedAnalysis | null>(null);

  // New project save state
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    await saveCurrentProject(newTitle, newDesc);
    setIsCreating(false);
    setNewTitle('');
    setNewDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">پروژه‌ها و تاریخچه تحلیل‌های ذخیره‌شده</h1>
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-semibold text-emerald-800">
              Cloud Firestore
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            مدیریت گزارش‌ها، ممیزی‌های ناهنجاری و پاسخ‌های ذخیره‌شده دستیار هوشمند در فضای ابری فایربیس
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition-colors shadow-2xs"
        >
          <BookmarkPlus className="h-4 w-4" />
          <span>ذخیره وضعیت فعلی به عنوان پروژه</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'projects'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FolderKanban className="h-4 w-4" />
          <span>پروژه‌های ذخیره‌شده ({toPersianDigits(savedProjects.length)})</span>
        </button>

        <button
          onClick={() => setActiveTab('analyses')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'analyses'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>تحلیل‌ها و پاسخ‌های هوش مصنوعی ({toPersianDigits(savedAnalyses.length)})</span>
        </button>
      </div>

      {/* Projects List */}
      {activeTab === 'projects' && (
        <div className="space-y-3">
          {savedProjects.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
              <FolderKanban className="mx-auto h-10 w-10 text-slate-300 mb-2" />
              <h4 className="font-bold text-slate-800 text-sm">هنوز پروژه‌ای ذخیره نکرده‌اید</h4>
              <p className="text-xs mt-1">
                از دکمه بالا یا دکمه «ذخیره پروژه» در داشبورد برای ثبت دائم گزارشات در فایربیس استفاده کنید.
              </p>
            </div>
          ) : (
            savedProjects.map((p) => (
              <div
                key={p.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-slate-300 transition-colors"
              >
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{p.title}</h3>
                  {p.description && <p className="text-xs text-slate-500 mt-1">{p.description}</p>}
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatJalaliDate(p.createdAt)}</span>
                    </span>
                    <span>دیتاست: {p.datasetName}</span>
                    <span>{toPersianDigits(p.rowCount)} سطر پردازش‌شده</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => deleteProject(p.id)}
                    className="flex items-center gap-1 rounded-xl border border-rose-200 p-2 text-rose-600 hover:bg-rose-50 transition-colors text-xs"
                    title="حذف پروژه"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Saved Analyses List */}
      {activeTab === 'analyses' && (
        <div className="space-y-3">
          {savedAnalyses.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
              <FileText className="mx-auto h-10 w-10 text-slate-300 mb-2" />
              <h4 className="font-bold text-slate-800 text-sm">هیچ تحلیلی ذخیره نشده است</h4>
              <p className="text-xs mt-1">
                در صفحه «دستیار داده» یا «ناهنجاری‌ها»، دکمه «ذخیره در پروژه» را انتخاب کنید تا پاسخ‌ها اینجا ثبت شوند.
              </p>
            </div>
          ) : (
            savedAnalyses.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                  <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedAnalysis(item)}
                      className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>مشاهده کامل</span>
                    </button>
                    <button
                      onClick={() => deleteAnalysis(item.id)}
                      className="rounded-lg p-1 text-slate-400 hover:text-rose-600"
                      title="حذف"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-600 line-clamp-2 bg-[#FAF8F5] p-3 rounded-xl border border-slate-200/50">
                  {item.findings}
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <span>ثبت شده در: {formatJalaliDate(item.createdAt)}</span>
                  <span>اطمینان شواهد: {toPersianDigits(item.confidenceScore || 95)}٪</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* View Analysis Modal */}
      {selectedAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl text-right max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">{selectedAnalysis.title}</h3>
              <button
                onClick={() => setSelectedAnalysis(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs leading-relaxed text-slate-800">
              <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-slate-200/70">
                <span className="font-bold text-slate-900 block mb-1">پرسش کاربر:</span>
                <p className="text-slate-600">{selectedAnalysis.question}</p>
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-1">یافته‌ها و استدلال مستند هوش مصنوعی:</span>
                <div className="whitespace-pre-line bg-white p-4 rounded-xl border border-slate-200">
                  {selectedAnalysis.findings}
                </div>
              </div>

              {selectedAnalysis.assumptions && (
                <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200/60">
                  <strong>فرضیات و محدودیت‌ها: </strong>
                  {selectedAnalysis.assumptions}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedAnalysis(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
              >
                بستن پنجره
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl text-right">
            <h3 className="text-base font-bold text-slate-900 mb-1">ذخیره پروژه جدید در فایربیس</h3>
            <p className="text-xs text-slate-500 mb-4">
              نام و توضیحات مورد نظر خود را برای این تحلیل بنویسید.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">عنوان پروژه:</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: گزارش جامع فروش فصل بهار"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">یادداشت و توضیحات (اختیاری):</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={3}
                  placeholder="نکات مهم یا تصمیمات مدیریتی متناظر با این فایل..."
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-hidden resize-none"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsCreating(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                انصراف
              </button>
              <button
                onClick={handleCreate}
                disabled={isSaving || !newTitle.trim()}
                className="rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
              >
                {isSaving ? 'در حال ثبت...' : 'تایید و ذخیره'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
