import React, { useMemo, useState } from 'react';
import { 
  Filter, 
  RotateCcw, 
  Download, 
  Search, 
  SlidersHorizontal, 
  Printer, 
  ArrowUpDown, 
  ChevronRight, 
  ChevronLeft,
  Check
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatCompactToman, formatPercent, formatToman, toPersianDigits } from '../lib/persianUtils';

export const AnalyticsWorkspacePage: React.FC = () => {
  const { dataset, filters, updateFilters, resetFilters, filteredRows, filteredKpis } = useData();

  // Sorting state
  const [sortField, setSortField] = useState<string>('orderDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 12;

  // Extract unique categories, cities, and statuses for filter pills
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    dataset.rows.forEach((r) => {
      const c = r.category || r['دسته‌بندی'] || r['دسته'];
      if (c) set.add(String(c));
    });
    return Array.from(set);
  }, [dataset.rows]);

  const availableCities = useMemo(() => {
    const set = new Set<string>();
    dataset.rows.forEach((r) => {
      const c = r.city || r['شهر'] || r['استان'];
      if (c) set.add(String(c));
    });
    return Array.from(set);
  }, [dataset.rows]);

  const availableStatuses = useMemo(() => {
    const set = new Set<string>();
    dataset.rows.forEach((r) => {
      const s = r.status || r['وضعیت'];
      if (s) set.add(String(s));
    });
    return Array.from(set);
  }, [dataset.rows]);

  // Toggle helpers
  const toggleCategory = (cat: string) => {
    const current = filters.categories;
    const next = current.includes(cat) ? current.filter((c) => c !== cat) : [...current, cat];
    updateFilters({ categories: next });
    setCurrentPage(1);
  };

  const toggleCity = (city: string) => {
    const current = filters.cities;
    const next = current.includes(city) ? current.filter((c) => c !== city) : [...current, city];
    updateFilters({ cities: next });
    setCurrentPage(1);
  };

  const toggleStatus = (status: string) => {
    const current = filters.orderStatuses;
    const next = current.includes(status) ? current.filter((s) => s !== status) : [...current, status];
    updateFilters({ orderStatuses: next });
    setCurrentPage(1);
  };

  // Sorted rows
  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];

      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      return sortDirection === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredRows, sortField, sortDirection]);

  // Paginated rows
  const totalPages = Math.ceil(sortedRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, currentPage, pageSize]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Export handlers
  const exportFilteredCSV = () => {
    if (filteredRows.length === 0) return;
    const headers = Object.keys(filteredRows[0]);
    const csvContent = [
      headers.join(','),
      ...filteredRows.map((row) =>
        headers.map((h) => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `datapilot_filtered_export_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">محیط تحلیل و کاوش تعاملی داده</h1>
          <p className="mt-1 text-xs text-slate-500">
            فیلتر چندبعدی روی شاخص‌های فروش، دسته‌بندی‌ها، استان‌ها و وضعیت سفارشات با گزارش‌گیری اکسل
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-[#FAF8F5] px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
            <span>پاک کردن همه فیلترها</span>
          </button>

          <button
            onClick={exportFilteredCSV}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition-colors shadow-2xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>خروجی CSV نتایج فیلتر</span>
          </button>
        </div>
      </div>

      {/* Recalculated Filtered KPIs Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-2xl border border-emerald-600/20 bg-emerald-50/60 p-4">
        <div>
          <span className="text-[11px] font-medium text-emerald-900/80">تعداد سطرهای فیلترشده</span>
          <div className="text-lg font-black text-emerald-950 mt-0.5">
            {toPersianDigits(filteredRows.length)} از {toPersianDigits(dataset.rows.length)} سطر
          </div>
        </div>

        <div>
          <span className="text-[11px] font-medium text-emerald-900/80">فروش فیلتر جاری</span>
          <div className="text-lg font-black text-emerald-950 mt-0.5">
            {formatCompactToman(filteredKpis.totalRevenue)}
          </div>
        </div>

        <div>
          <span className="text-[11px] font-medium text-emerald-900/80">میانگین ارزش فاکتور فیلترشده</span>
          <div className="text-lg font-black text-emerald-950 mt-0.5">
            {formatCompactToman(filteredKpis.averageOrderValue)}
          </div>
        </div>

        <div>
          <span className="text-[11px] font-medium text-emerald-900/80">مشتریان در این محدوده</span>
          <div className="text-lg font-black text-emerald-950 mt-0.5">
            {toPersianDigits(filteredKpis.uniqueCustomers)} مشتری
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <SlidersHorizontal className="h-4 w-4 text-emerald-700" />
            <span>فیلترهای فعال چندبعدی:</span>
          </div>

          {/* Search Input */}
          <div className="relative w-full max-w-xs">
            <Search className="absolute right-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => {
                updateFilters({ searchQuery: e.target.value });
                setCurrentPage(1);
              }}
              placeholder="جستجو در کالا، مشتری، شهر..."
              className="w-full rounded-xl border border-slate-200 bg-[#FAF8F5] py-1.5 pr-8 pl-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Categories Chips */}
        {availableCategories.length > 0 && (
          <div>
            <span className="block text-[11px] font-semibold text-slate-500 mb-1.5">دسته‌بندی کالا:</span>
            <div className="flex flex-wrap gap-1.5">
              {availableCategories.map((cat) => {
                const isSelected = filters.categories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition-all ${
                      isSelected
                        ? 'bg-emerald-700 text-white font-semibold shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Cities Chips */}
        {availableCities.length > 0 && (
          <div>
            <span className="block text-[11px] font-semibold text-slate-500 mb-1.5">شهر و منطقه:</span>
            <div className="flex flex-wrap gap-1.5">
              {availableCities.map((city) => {
                const isSelected = filters.cities.includes(city);
                return (
                  <button
                    key={city}
                    onClick={() => toggleCity(city)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition-all ${
                      isSelected
                        ? 'bg-teal-700 text-white font-semibold shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                    <span>{city}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Order Status Chips */}
        {availableStatuses.length > 0 && (
          <div>
            <span className="block text-[11px] font-semibold text-slate-500 mb-1.5">وضعیت فاکتور:</span>
            <div className="flex flex-wrap gap-1.5">
              {availableStatuses.map((st) => {
                const isSelected = filters.orderStatuses.includes(st);
                return (
                  <button
                    key={st}
                    onClick={() => toggleStatus(st)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                    <span>{st}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Data Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#FAF8F5] text-slate-600 border-b border-slate-200 font-semibold select-none">
              <tr>
                <th
                  onClick={() => handleSort('orderId')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100/70"
                >
                  <div className="flex items-center gap-1">
                    <span>شماره سفارش</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('orderDate')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100/70"
                >
                  <div className="flex items-center gap-1">
                    <span>تاریخ</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('customerName')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100/70"
                >
                  <div className="flex items-center gap-1">
                    <span>مشتری</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3">دسته‌بندی و محصول</th>
                <th
                  onClick={() => handleSort('city')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100/70"
                >
                  <div className="flex items-center gap-1">
                    <span>شهر</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('totalAmount')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100/70 text-left"
                >
                  <div className="flex items-center gap-1 justify-end">
                    <span>مبلغ کل (تومان)</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3 text-center">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    هیچ داده‌ای با فیلترهای انتخابی شما همخوانی ندارد.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row, idx) => {
                  const status = String(row.status || row['وضعیت'] || '');
                  const amount = Number(row.totalAmount || row.amount || row['مبلغ کل'] || 0);

                  return (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-slate-800">
                        {toPersianDigits(row.orderId || row.id || `ORD-${idx + 1}`)}
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-sans">
                        {toPersianDigits(row.orderDate || row.date || '-')}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {row.customerName || row.customer || 'مشتری عادی'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">{row.productName || row.product || '-'}</div>
                        <div className="text-[10px] text-slate-400">{row.category || '-'}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{row.city || '-'}</td>
                      <td className="px-4 py-3 text-left font-bold text-slate-900">
                        {formatToman(amount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            status.includes('تکمیل')
                              ? 'bg-emerald-100 text-emerald-800'
                              : status.includes('مرجوع')
                              ? 'bg-rose-100 text-rose-800'
                              : status.includes('لغو')
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {status || 'تایید شده'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between border-t border-slate-200/80 bg-[#FAF8F5] px-4 py-3 text-xs">
          <span className="text-slate-500">
            صفحه {toPersianDigits(currentPage)} از {toPersianDigits(totalPages)} (مجموع {toPersianDigits(sortedRows.length)} سطر)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-slate-300 bg-white p-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-slate-300 bg-white p-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
