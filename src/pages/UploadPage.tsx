import React, { useRef, useState } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Download, 
  Layers, 
  ShieldCheck, 
  FileCheck2, 
  Table2,
  ArrowLeft
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { parseFile } from '../lib/dataParser';
import { formatPercent, toPersianDigits } from '../lib/persianUtils';
import { ColumnMapping, resolveColumns } from '../lib/analytics';

interface UploadPageProps {
  onNavigateToDashboard: () => void;
}

export const UploadPage: React.FC<UploadPageProps> = ({ onNavigateToDashboard }) => {
  const { dataset, setDataset, resetToSample, applyColumnMapping } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mapping, setMapping] = useState<ColumnMapping>(() => {
    return dataset.columnMapping || resolveColumns(dataset.columns.map((c) => c.name));
  });

  React.useEffect(() => {
    setMapping(dataset.columnMapping || resolveColumns(dataset.columns.map((c) => c.name)));
  }, [dataset.id, dataset.columns]);

  const handleMappingChange = (key: keyof ColumnMapping, value: string) => {
    const nextMapping = { ...mapping, [key]: value };
    setMapping(nextMapping);
    applyColumnMapping(nextMapping);
  };

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleProcessFile = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setUploadSuccess(false);

    try {
      const result = await parseFile(file);
      if (result.success && result.dataset) {
        setDataset(result.dataset);
        setUploadSuccess(true);
      } else {
        setErrorMessage(result.error || 'خطایی در پردازش فایل روی داد.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'خطا در خواندن فایل.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const downloadQualityReport = () => {
    const blob = new Blob([JSON.stringify(dataset.qualityReport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data_quality_report_${dataset.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const { qualityReport, columns } = dataset;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">بارگذاری، ساختار و ممیزی داده</h1>
          <p className="mt-1 text-xs text-slate-500">
            فایل اکسل (.xlsx, .xls) یا CSV فروشگاه خود را بارگذاری کرده و گزارش پاکسازی و سلامت ستون‌ها را مشاهده کنید.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetToSample}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-[#FAF8F5] px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
            <span>بارگذاری مجدد دیتای نمونه</span>
          </button>

          <button
            onClick={onNavigateToDashboard}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition-colors shadow-2xs"
          >
            <span>مشاهده در داشبورد</span>
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* File Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 md:p-12 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50/50 scale-101'
            : 'border-slate-300 bg-white hover:border-emerald-600/70 hover:bg-[#FAF8F5]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 shadow-2xs mb-4">
          <UploadCloud className="h-8 w-8" />
        </div>

        <h3 className="text-base sm:text-lg font-bold text-slate-800">
          فایل داده خود را اینجا بکشید یا برای انتخاب کلیک کنید
        </h3>
        <p className="mt-1 text-xs text-slate-500 max-w-md">
          پشتیبانی از فایل‌های اکسل (.xlsx و .xls) و فایلهای مقادیر مجزا با کاما (CSV) تا سقف ۲۵ مگابایت
        </p>

        <div className="mt-4 flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" /> Excel
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Table2 className="h-3.5 w-3.5 text-teal-600" /> CSV UTF-8
          </span>
          <span>·</span>
          <span>تشخیص خودکار ستون‌ها و تاریخ‌ها</span>
        </div>

        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-white/90 backdrop-blur-2xs">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-emerald-600 border-t-transparent" />
              <span className="text-xs font-bold text-slate-800">در حال آنالیز و استخراج ساختار داده...</span>
            </div>
          </div>
        )}
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {/* Success banner */}
      {uploadSuccess && (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span>فایل «{dataset.name}» با موفقیت بارگذاری، پاکسازی و تحلیل شد!</span>
          </div>
          <button
            onClick={onNavigateToDashboard}
            className="rounded-lg bg-emerald-700 px-3 py-1.5 font-bold text-white hover:bg-emerald-800 text-[11px]"
          >
            مشاهده در داشبورد
          </button>
        </div>
      )}

      {/* Quality Audit Report Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <FileCheck2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">گزارش ممیزی و کیفیت داده (Data Quality)</h2>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    qualityReport.healthStatus === 'عالی'
                      ? 'bg-emerald-100 text-emerald-800'
                      : qualityReport.healthStatus === 'خوب'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  وضعیت سلامت: {qualityReport.healthStatus}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                فایل: {dataset.fileName} ({toPersianDigits(qualityReport.totalRows)} سطر و {toPersianDigits(qualityReport.totalColumns)} ستون)
              </p>
            </div>
          </div>

          <button
            onClick={downloadQualityReport}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-[#FAF8F5] px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-slate-600" />
            <span>دانلود گزارش ممیزی (JSON)</span>
          </button>
        </div>

        {/* Column Mapping & Inferred Role Section */}
        <div className="my-6 rounded-xl border border-slate-200 bg-[#FAF8F5] p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-800">نگاشت هوشمند و نقش ستون‌ها (Column Mapping)</h3>
              <p className="text-[11px] text-slate-500">
                ستون‌های استخراج‌شده را تأیید کنید یا در صورت تمایل، ستون‌های مبنای تحلیل را تغییر دهید.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">ستون مبلغ (Amount):</label>
              <select
                value={mapping.amountKey || ''}
                onChange={(e) => handleMappingChange('amountKey', e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-hidden"
              >
                <option value="">انتخاب خودکار...</option>
                {columns.map((c) => (
                  <option key={c.name} value={c.name}>{c.name} ({c.type})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">ستون تاریخ (Date):</label>
              <select
                value={mapping.dateKey || ''}
                onChange={(e) => handleMappingChange('dateKey', e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-hidden"
              >
                <option value="">انتخاب خودکار...</option>
                {columns.map((c) => (
                  <option key={c.name} value={c.name}>{c.name} ({c.type})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">ستون دسته‌بندی (Category):</label>
              <select
                value={mapping.categoryKey || ''}
                onChange={(e) => handleMappingChange('categoryKey', e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-hidden"
              >
                <option value="">انتخاب خودکار...</option>
                {columns.map((c) => (
                  <option key={c.name} value={c.name}>{c.name} ({c.type})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">ستون شهر (City):</label>
              <select
                value={mapping.cityKey || ''}
                onChange={(e) => handleMappingChange('cityKey', e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-hidden"
              >
                <option value="">انتخاب خودکار...</option>
                {columns.map((c) => (
                  <option key={c.name} value={c.name}>{c.name} ({c.type})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">ستون وضعیت (Status):</label>
              <select
                value={mapping.statusKey || ''}
                onChange={(e) => handleMappingChange('statusKey', e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-hidden"
              >
                <option value="">انتخاب خودکار...</option>
                {columns.map((c) => (
                  <option key={c.name} value={c.name}>{c.name} ({c.type})</option>
                ))}
              </select>
            </div>
          </div>

          {!mapping.amountKey && (
            <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-2.5 text-[11px] text-amber-800">
              ⚠️ ستون متناظر با مبالغ مالی به صورت قطعی شناسایی نشد. لطفاً فیلد «ستون مبلغ» را مشخص کنید تا شاخص‌های مالی به دقت محاسبه شوند.
            </div>
          )}
        </div>

        {/* Quality Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
          <div className="rounded-xl border border-slate-100 bg-[#FAF8F5] p-3.5">
            <span className="text-[11px] text-slate-500">شاخص تمیزی (Score)</span>
            <div className="text-xl font-black text-slate-900 mt-1">
              {toPersianDigits(qualityReport.cleanlinessScore)} / ۱۰۰
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-[#FAF8F5] p-3.5">
            <span className="text-[11px] text-slate-500">سطرهای تکراری (Duplicates)</span>
            <div className="text-xl font-black text-slate-900 mt-1">
              {toPersianDigits(qualityReport.duplicateRowsCount)} سطر
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-[#FAF8F5] p-3.5">
            <span className="text-[11px] text-slate-500">مقادیر خالی و گم‌شده (Missing)</span>
            <div className="text-xl font-black text-slate-900 mt-1">
              {formatPercent(qualityReport.missingValuesPercentage)} ({toPersianDigits(qualityReport.missingValuesTotal)})
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-[#FAF8F5] p-3.5">
            <span className="text-[11px] text-slate-500">ناهنجاری‌های کشف‌شده</span>
            <div className="text-xl font-black text-emerald-800 mt-1">
              {toPersianDigits(dataset.anomalies.length)} مورد
            </div>
          </div>
        </div>

        {/* Actionable Cleaning Recommendations */}
        <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/60">
          <h4 className="text-xs font-bold text-slate-800 mb-2">توصیه‌ها و اقدامات ممیزی خودکار:</h4>
          <ul className="space-y-1.5 text-xs text-slate-600">
            {qualityReport.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Schema Inspection Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">ساختار و نوع داده ستون‌ها (Schema Inspection)</h2>
            <p className="text-xs text-slate-500">مشخصات فنی و مقادیر نمونه استخراج‌شده از فایل</p>
          </div>
          <span className="rounded bg-slate-100 px-2 py-1 text-xs font-mono text-slate-600">
            {toPersianDigits(columns.length)} ستون شناسایی شد
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#FAF8F5] text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="px-4 py-3">نام ستون</th>
                <th className="px-4 py-3">نوع استنباط‌شده</th>
                <th className="px-4 py-3">تعداد مقادیر خالی</th>
                <th className="px-4 py-3">تعداد یکتا</th>
                <th className="px-4 py-3">نمونه مقادیر</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {columns.map((col, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-900">{col.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[11px] font-mono ${
                        col.type === 'number'
                          ? 'bg-blue-50 text-blue-700'
                          : col.type === 'date'
                          ? 'bg-purple-50 text-purple-700'
                          : col.type === 'categorical'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {col.type === 'number'
                        ? 'عددی (Number)'
                        : col.type === 'date'
                        ? 'تاریخ (Date)'
                        : col.type === 'categorical'
                        ? 'دسته‌ای (Category)'
                        : 'متنی (String)'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {col.nullCount > 0 ? (
                      <span className="text-rose-600 font-semibold">{toPersianDigits(col.nullCount)} خالی</span>
                    ) : (
                      <span className="text-emerald-700">فاقد مقدار خالی</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono">{toPersianDigits(col.uniqueCount)}</td>
                  <td className="px-4 py-3 text-slate-500 font-sans truncate max-w-[280px]">
                    {col.sampleValues.map(String).join(' ، ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
