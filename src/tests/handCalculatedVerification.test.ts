import { calculateCategoryBreakdown, calculateCityBreakdown, calculateKPIs, filterRows, resolveColumns, parseNumericAmount } from '../lib/analytics';
import { auditDataQuality } from '../lib/qualityAudit';
import { FilterState } from '../types';

export function runHandCalculatedTests(): { passed: number; failed: number; errors: string[] } {
  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  function assert(condition: boolean, testName: string) {
    if (condition) {
      passed++;
      console.log(`✅ PASS: ${testName}`);
    } else {
      failed++;
      const msg = `❌ FAIL: ${testName}`;
      console.error(msg);
      errors.push(msg);
    }
  }

  console.log('\n======================================================');
  console.log('📐 آزمون صحت تحلیل با دیتاست کوچک و قابل محاسبه دستی');
  console.log('======================================================');

  // Exact 5-row hand-calculable dataset:
  const handCalculatedDataset = [
    { orderId: 'ORD-101', customerName: 'احمد', category: 'کتاب', city: 'تهران', totalAmount: 100000, status: 'تکمیل شده', orderDate: '2025-01-01' },
    { orderId: 'ORD-102', customerName: 'احمد', category: 'کتاب', city: 'تهران', totalAmount: 200000, status: 'تکمیل شده', orderDate: '2025-01-02' },
    { orderId: 'ORD-103', customerName: 'زهرا', category: 'لوازم‌التحریر', city: 'شیراز', totalAmount: 150000, status: 'مرجوعی', orderDate: '2025-01-03' },
    { orderId: 'ORD-104', customerName: 'رضا', category: 'کتاب', city: 'مشهد', totalAmount: 50000, status: 'لغو شده', orderDate: '2025-01-04' },
    { orderId: 'ORD-105', customerName: 'مریم', category: 'لوازم‌التحریر', city: 'اصفهان', totalAmount: 100000, status: 'در حال ارسال', orderDate: '2025-01-05' },
  ];

  const kpis = calculateKPIs(handCalculatedDataset);

  // 1. Gross Revenue
  assert(kpis.totalRevenue === 600000, `Gross revenue: expected 600,000, got ${kpis.totalRevenue}`);

  // 2. Net Revenue (600,000 - 150,000 returned - 50,000 cancelled = 400,000)
  assert(kpis.netRevenue === 400000, `Net revenue: expected 400,000, got ${kpis.netRevenue}`);

  // 3. Total Orders
  assert(kpis.totalOrders === 5, `Total orders: expected 5, got ${kpis.totalOrders}`);

  // 4. Average Order Value (600,000 / 5 = 120,000)
  assert(kpis.averageOrderValue === 120000, `AOV: expected 120,000, got ${kpis.averageOrderValue}`);

  // 5. Unique Customers (احمد, زهرا, رضا, مریم = 4)
  assert(kpis.uniqueCustomers === 4, `Unique customers: expected 4, got ${kpis.uniqueCustomers}`);

  // 6. Return Rate (1 / 5 = 20.0%)
  assert(kpis.returnRate === 20.0, `Return rate: expected 20.0%, got ${kpis.returnRate}%`);

  // 7. Cancellation Rate (1 / 5 = 20.0%)
  assert(kpis.cancellationRate === 20.0, `Cancellation rate: expected 20.0%, got ${kpis.cancellationRate}%`);

  // 8. Top Category Breakdown (کتاب: 100k+200k+50k = 350,000, لوازم‌التحریر: 150k+100k = 250,000)
  const catBreakdown = calculateCategoryBreakdown(handCalculatedDataset);
  assert(catBreakdown[0].category === 'کتاب' && catBreakdown[0].revenue === 350000, 'Top category is کتاب with 350,000');
  assert(catBreakdown[0].percentage === 58.3, `Top category percentage expected 58.3%, got ${catBreakdown[0].percentage}%`);

  // 9. Top City Breakdown (تهران: 300k = 50.0%)
  const cityBreakdown = calculateCityBreakdown(handCalculatedDataset);
  assert(cityBreakdown[0].city === 'تهران' && cityBreakdown[0].revenue === 300000, 'Top city is تهران with 300,000');
  assert(cityBreakdown[0].percentage === 50.0, `Top city percentage expected 50.0%, got ${cityBreakdown[0].percentage}%`);

  // --- Edge Cases Testing ---
  console.log('\n--- تست رفتار شاخص‌ها در شرایط داده‌های نامتعارف (Edge Cases) ---');

  // Edge Case A: Missing/Null amount handling
  const datasetWithNullAmount = [
    { orderId: '1', totalAmount: 100000, status: 'تکمیل شده' },
    { orderId: '2', totalAmount: null, status: 'تکمیل شده' },
    { orderId: '3', totalAmount: undefined, status: 'تکمیل شده' },
  ];
  const nullAmtKPIs = calculateKPIs(datasetWithNullAmount);
  assert(nullAmtKPIs.totalRevenue === 100000, 'Null/undefined amounts do not cause NaN and are treated as 0');
  assert(nullAmtKPIs.totalOrders === 3, 'Counts all rows even when amounts are missing');

  // Edge Case B: Negative amount (e.g. discount adjustment or refund)
  const datasetWithNegative = [
    { orderId: '1', totalAmount: 100000, status: 'تکمیل شده' },
    { orderId: '2', totalAmount: -20000, status: 'تکمیل شده' },
  ];
  const negKPIs = calculateKPIs(datasetWithNegative);
  assert(negKPIs.totalRevenue === 80000, 'Correctly factors negative transaction adjustments into total');

  // Edge Case C: Unknown status
  const datasetWithUnknownStatus = [
    { orderId: '1', totalAmount: 50000, status: 'در انتظار پرداخت بانکی' },
    { orderId: '2', totalAmount: 50000, status: 'نامشخص' },
  ];
  const unknownStatusKPIs = calculateKPIs(datasetWithUnknownStatus);
  assert(unknownStatusKPIs.returnRate === 0 && unknownStatusKPIs.cancellationRate === 0, 'Unknown status is not falsely counted as return or cancellation');
  assert(unknownStatusKPIs.netRevenue === 100000, 'Unknown status orders are retained in net revenue');

  // Edge Case E: Persian Digits in Amount Fields (e.g. '۲۵۰,۰۰۰')
  const persianDigitsDataset = [
    { orderId: '1', amount: '۲۵۰,۰۰۰', status: 'تکمیل شده' },
    { orderId: '2', amount: '۱۵۰,۰۰۰', status: 'مرجوع شده' },
  ];
  const persianDigitKPIs = calculateKPIs(persianDigitsDataset);
  assert(persianDigitKPIs.totalRevenue === 400000, 'Correctly parses Persian digits with commas into numeric revenue (400,000)');
  assert(persianDigitKPIs.netRevenue === 250000, 'Correctly computes net revenue with Persian digits (250,000)');
  assert(persianDigitKPIs.returnRate === 50.0, 'Computes 50% return rate accurately');

  // Edge Case F: Empty Dataset Zero Division Protection
  const emptyKPIs = calculateKPIs([]);
  assert(emptyKPIs.totalRevenue === 0 && emptyKPIs.averageOrderValue === 0, 'Empty dataset results in 0 AOV without NaN');
  assert(emptyKPIs.returnRate === 0 && emptyKPIs.cancellationRate === 0, 'Empty dataset produces 0 rates without NaN');

  // Edge Case G: parseNumericAmount unit safety
  assert(parseNumericAmount('  -50,000  ') === -50000, 'parseNumericAmount handles negative formatted amounts');
  assert(parseNumericAmount(null) === 0 && parseNumericAmount(undefined) === 0, 'parseNumericAmount handles null/undefined gracefully');
  assert(parseNumericAmount('غیرعددی') === 0, 'parseNumericAmount handles invalid text without throwing');

  return { passed, failed, errors };
}
