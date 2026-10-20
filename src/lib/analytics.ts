import { CategorySummary, CitySummary, DatasetKPIs, FilterState, TimeSeriesPoint } from '../types';
import { formatJalaliDate, toEnglishDigits } from './persianUtils';

export function parseNumericAmount(val: any): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (val === null || val === undefined) return 0;
  const str = String(val).trim();
  if (str === '') return 0;
  const normalized = toEnglishDigits(str).replace(/,/g, '').trim();
  const num = Number(normalized);
  return isNaN(num) ? 0 : num;
}

export interface ColumnMapping {
  amountKey?: string;
  customerKey?: string;
  statusKey?: string;
  categoryKey?: string;
  cityKey?: string;
  dateKey?: string;
}

const AMOUNT_CANDIDATES = [
  'totalamount', 'amount', 'مبلغ کل', 'مبلغ', 'قیمت', 'قیمت کل', 'بها',
  'بهای کل', 'فروش', 'ارزش', 'جمع کل', 'price', 'total', 'revenue',
  'sales', 'gross', 'net', 'مبلغ نهایی', 'مبلغ پرداختی'
];

const CUSTOMER_CANDIDATES = [
  'customername', 'customer', 'مشتری', 'نام مشتری', 'خریدار',
  'نام خریدار', 'customerid', 'کاربر', 'نام کاربر', 'طرف حساب'
];

const STATUS_CANDIDATES = [
  'status', 'وضعیت', 'orderstatus', 'وضعیت سفارش', 'وضعیت فاکتور', 'وضعیت خرید'
];

const CATEGORY_CANDIDATES = [
  'category', 'دسته‌بندی', 'دسته', 'گروه', 'گروه کالا', 'نوع کالا', 'دسته بندی', 'نوع'
];

const CITY_CANDIDATES = [
  'city', 'شهر', 'استان', 'منطقه', 'محل ارسال', 'شهرستان', 'مقصد'
];

const DATE_CANDIDATES = [
  'orderdate', 'date', 'تاریخ', 'تاریخ سفارش', 'تاریخ فاکتور', 'زمان', 'createdat', 'created_at'
];

export function resolveColumns(keys: string[], mapping?: ColumnMapping): Required<ColumnMapping> {
  const findMatch = (candidates: string[]) =>
    keys.find((k) => candidates.includes(k.toLowerCase().trim())) || '';

  return {
    amountKey: mapping?.amountKey || findMatch(AMOUNT_CANDIDATES),
    customerKey: mapping?.customerKey || findMatch(CUSTOMER_CANDIDATES),
    statusKey: mapping?.statusKey || findMatch(STATUS_CANDIDATES),
    categoryKey: mapping?.categoryKey || findMatch(CATEGORY_CANDIDATES),
    cityKey: mapping?.cityKey || findMatch(CITY_CANDIDATES),
    dateKey: mapping?.dateKey || findMatch(DATE_CANDIDATES),
  };
}

export function calculateKPIs(rows: Record<string, any>[], mapping?: ColumnMapping): DatasetKPIs {
  if (rows.length === 0) {
    return {
      totalRevenue: 0,
      netRevenue: 0,
      totalOrders: 0,
      uniqueCustomers: 0,
      averageOrderValue: 0,
      returnRate: 0,
      cancellationRate: 0,
      grossProfitMarginEstimate: 0,
      topCategory: { name: 'نامشخص', revenue: 0, percentage: 0 },
      topCity: { name: 'نامشخص', revenue: 0, percentage: 0 },
    };
  }

  const keys = Object.keys(rows[0]);
  const resolved = resolveColumns(keys, mapping);

  let totalRevenue = 0;
  let returnedRevenue = 0;
  let returnCount = 0;
  let cancelCount = 0;
  const uniqueCustomersSet = new Set<string>();
  const categoryTotals: Record<string, number> = {};
  const cityTotals: Record<string, number> = {};

  for (const row of rows) {
    const rawAmt = resolved.amountKey ? row[resolved.amountKey] : 0;
    const amount = parseNumericAmount(rawAmt);
    totalRevenue += amount;

    if (resolved.customerKey && row[resolved.customerKey]) {
      uniqueCustomersSet.add(String(row[resolved.customerKey]));
    }

    const status = resolved.statusKey ? String(row[resolved.statusKey]).toLowerCase() : '';
    if (status.includes('مرجوع') || status.includes('return')) {
      returnCount++;
      returnedRevenue += amount;
    } else if (status.includes('لغو') || status.includes('cancel')) {
      cancelCount++;
      returnedRevenue += amount;
    }

    if (resolved.categoryKey && row[resolved.categoryKey]) {
      const cat = String(row[resolved.categoryKey]);
      categoryTotals[cat] = (categoryTotals[cat] || 0) + amount;
    }

    if (resolved.cityKey && row[resolved.cityKey]) {
      const city = String(row[resolved.cityKey]);
      cityTotals[city] = (cityTotals[city] || 0) + amount;
    }
  }

  const totalOrders = rows.length;
  const netRevenue = Math.max(0, totalRevenue - returnedRevenue);
  const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const returnRate = totalOrders > 0 ? Number(((returnCount / totalOrders) * 100).toFixed(1)) : 0;
  const cancellationRate = totalOrders > 0 ? Number(((cancelCount / totalOrders) * 100).toFixed(1)) : 0;
  const grossProfitMarginEstimate = 28.5;

  // Top Category
  let topCatName = 'عمومی';
  let topCatRev = 0;
  for (const [cat, rev] of Object.entries(categoryTotals)) {
    if (rev > topCatRev) {
      topCatRev = rev;
      topCatName = cat;
    }
  }
  const topCatPct = totalRevenue > 0 ? Number(((topCatRev / totalRevenue) * 100).toFixed(1)) : 0;

  // Top City
  let topCityName = 'تهران';
  let topCityRev = 0;
  for (const [city, rev] of Object.entries(cityTotals)) {
    if (rev > topCityRev) {
      topCityRev = rev;
      topCityName = city;
    }
  }
  const topCityPct = totalRevenue > 0 ? Number(((topCityRev / totalRevenue) * 100).toFixed(1)) : 0;

  return {
    totalRevenue,
    netRevenue,
    totalOrders,
    uniqueCustomers: uniqueCustomersSet.size || totalOrders,
    averageOrderValue,
    returnRate,
    cancellationRate,
    grossProfitMarginEstimate,
    topCategory: { name: topCatName, revenue: topCatRev, percentage: topCatPct },
    topCity: { name: topCityName, revenue: topCityRev, percentage: topCityPct },
  };
}

export function calculateCategoryBreakdown(rows: Record<string, any>[], mapping?: ColumnMapping): CategorySummary[] {
  if (rows.length === 0) return [];
  const keys = Object.keys(rows[0]);
  const resolved = resolveColumns(keys, mapping);

  if (!resolved.categoryKey || !resolved.amountKey) return [];

  const map: Record<string, { revenue: number; orderCount: number }> = {};
  let totalRev = 0;

  for (const row of rows) {
    const cat = String(row[resolved.categoryKey] || 'سایر');
    const rawAmt = row[resolved.amountKey];
    const amount = parseNumericAmount(rawAmt);

    if (!map[cat]) {
      map[cat] = { revenue: 0, orderCount: 0 };
    }
    map[cat].revenue += amount;
    map[cat].orderCount += 1;
    totalRev += amount;
  }

  return Object.entries(map)
    .map(([category, data]) => ({
      category,
      revenue: data.revenue,
      orderCount: data.orderCount,
      percentage: totalRev > 0 ? Number(((data.revenue / totalRev) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

export function calculateCityBreakdown(rows: Record<string, any>[], mapping?: ColumnMapping): CitySummary[] {
  if (rows.length === 0) return [];
  const keys = Object.keys(rows[0]);
  const resolved = resolveColumns(keys, mapping);

  if (!resolved.cityKey || !resolved.amountKey) return [];

  const map: Record<string, { revenue: number; orderCount: number }> = {};
  let totalRev = 0;

  for (const row of rows) {
    const city = String(row[resolved.cityKey] || 'نامشخص');
    const rawAmt = row[resolved.amountKey];
    const amount = parseNumericAmount(rawAmt);

    if (!map[city]) {
      map[city] = { revenue: 0, orderCount: 0 };
    }
    map[city].revenue += amount;
    map[city].orderCount += 1;
    totalRev += amount;
  }

  return Object.entries(map)
    .map(([city, data]) => ({
      city,
      revenue: data.revenue,
      orderCount: data.orderCount,
      percentage: totalRev > 0 ? Number(((data.revenue / totalRev) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

export function calculateTimeSeries(rows: Record<string, any>[], mapping?: ColumnMapping): TimeSeriesPoint[] {
  if (rows.length === 0) return [];
  const keys = Object.keys(rows[0]);
  const resolved = resolveColumns(keys, mapping);

  if (!resolved.dateKey || !resolved.amountKey) return [];

  const map: Record<string, { revenue: number; orderCount: number }> = {};

  for (const row of rows) {
    const rawDate = String(row[resolved.dateKey] || '');
    if (!rawDate) continue;

    let dateStr = rawDate;
    if (rawDate.includes('T')) {
      dateStr = rawDate.split('T')[0];
    }

    const rawAmt = row[resolved.amountKey];
    const amount = parseNumericAmount(rawAmt);

    if (!map[dateStr]) {
      map[dateStr] = { revenue: 0, orderCount: 0 };
    }
    map[dateStr].revenue += amount;
    map[dateStr].orderCount += 1;
  }

  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({
      date,
      jalaliDate: formatJalaliDate(date),
      revenue: data.revenue,
      orderCount: data.orderCount,
      avgOrderValue: data.orderCount > 0 ? Math.round(data.revenue / data.orderCount) : 0,
    }));
}

export function filterRows(rows: Record<string, any>[], filters: FilterState, mapping?: ColumnMapping): Record<string, any>[] {
  if (rows.length === 0) return [];
  const keys = Object.keys(rows[0]);
  const resolved = resolveColumns(keys, mapping);

  return rows.filter((row) => {
    // Category filter
    if (filters.categories.length > 0 && resolved.categoryKey) {
      const val = String(row[resolved.categoryKey]);
      if (!filters.categories.includes(val)) return false;
    }

    // City filter
    if (filters.cities.length > 0 && resolved.cityKey) {
      const val = String(row[resolved.cityKey]);
      if (!filters.cities.includes(val)) return false;
    }

    // Status filter
    if (filters.orderStatuses.length > 0 && resolved.statusKey) {
      const val = String(row[resolved.statusKey]);
      if (!filters.orderStatuses.includes(val)) return false;
    }

    // Amount range
    if (resolved.amountKey) {
      const rawAmt = row[resolved.amountKey];
      const amount = parseNumericAmount(rawAmt);
      if (filters.minAmount !== undefined && amount < filters.minAmount) return false;
      if (filters.maxAmount !== undefined && amount > filters.maxAmount) return false;
    }

    // Date range
    if (resolved.dateKey && (filters.dateRange.start || filters.dateRange.end)) {
      const d = String(row[resolved.dateKey] || '');
      if (filters.dateRange.start && d < filters.dateRange.start) return false;
      if (filters.dateRange.end && d > filters.dateRange.end) return false;
    }

    // Text search
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.trim().toLowerCase();
      const match = Object.values(row).some((val) => String(val).toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });
}
