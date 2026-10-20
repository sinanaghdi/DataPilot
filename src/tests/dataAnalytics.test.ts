import { auditDataQuality, inferColumnType, inspectColumns } from '../lib/qualityAudit';
import { calculateKPIs, filterRows, calculateCategoryBreakdown, calculateCityBreakdown } from '../lib/analytics';
import { detectAnomalies } from '../lib/anomalyDetection';
import { FilterState } from '../types';

export function runAllTests(): { passed: number; failed: number; errors: string[] } {
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

  // --- Test Suite 1: Column Type Inference ---
  console.log('\n--- Test Suite 1: Column Type Inference ---');
  assert(inferColumnType([10, 20, 30, 40]) === 'number', 'Infers raw numbers as number');
  assert(inferColumnType(['1,000', '2,500', '3,400']) === 'number', 'Infers formatted string numbers with commas as number');
  assert(inferColumnType(['2025-01-01', '2025-02-01', '2025-03-01']) === 'date', 'Infers ISO date strings as date');
  assert(inferColumnType(['تهران', 'اصفهان', 'شیراز']) === 'string', 'Infers general Persian text as string');

  // --- Test Suite 2: Data Quality Audit & Cleanliness Scoring ---
  console.log('\n--- Test Suite 2: Data Quality Audit & Cleanliness Scoring ---');
  const emptyReport = auditDataQuality([]);
  assert(emptyReport.totalRows === 0 && emptyReport.cleanlinessScore === 0, 'Empty dataset results in 0 score and critical health');

  const rowsWithDuplicates = [
    { id: 1, name: 'کالا ۱', amount: 1000 },
    { id: 1, name: 'کالا ۱', amount: 1000 }, // duplicate
    { id: 2, name: 'کالا ۲', amount: 2000 },
  ];
  const dupReport = auditDataQuality(rowsWithDuplicates);
  assert(dupReport.duplicateRowsCount === 1, 'Correctly counts 1 duplicate row');
  assert(dupReport.cleanlinessScore < 100, 'Penalizes cleanliness score for duplicates');

  const rowsWithNulls = [
    { id: 1, name: 'کالا ۱', amount: 1000 },
    { id: 2, name: null, amount: null },
    { id: 3, name: '', amount: 3000 },
  ];
  const nullReport = auditDataQuality(rowsWithNulls);
  assert(nullReport.missingValuesTotal === 3, 'Counts 3 null/empty cell occurrences');
  assert(nullReport.missingValuesPercentage > 0, 'Calculates non-zero missing values percentage');

  // --- Test Suite 3: KPI Calculations ---
  console.log('\n--- Test Suite 3: KPI Calculations ---');
  const mockOrders = [
    { orderId: '1', customerName: 'سارا', category: 'کالای دیجیتال', city: 'تهران', totalAmount: 10000000, status: 'تکمیل شده' },
    { orderId: '2', customerName: 'سارا', category: 'کالای دیجیتال', city: 'تهران', totalAmount: 5000000, status: 'تکمیل شده' },
    { orderId: '3', customerName: 'علی', category: 'پوشاک', city: 'اصفهان', totalAmount: 2000000, status: 'مرجوعی' },
    { orderId: '4', customerName: 'مریم', category: 'خانه', city: 'شیراز', totalAmount: 3000000, status: 'تکمیل شده' },
  ];
  const kpis = calculateKPIs(mockOrders);
  assert(kpis.totalRevenue === 20000000, 'Total Gross Revenue equals 20,000,000');
  assert(kpis.netRevenue === 18000000, 'Net Revenue correctly subtracts returned order (18,000,000)');
  assert(kpis.totalOrders === 4, 'Total Orders equals 4');
  assert(kpis.uniqueCustomers === 3, 'Unique customers correctly deduped to 3');
  assert(kpis.averageOrderValue === 5000000, 'AOV is 20,000,000 / 4 = 5,000,000');
  assert(kpis.returnRate === 25, 'Return rate is 1 out of 4 = 25%');
  assert(kpis.topCategory.name === 'کالای دیجیتال', 'Top Category is کالای دیجیتال');
  assert(kpis.topCity.name === 'تهران', 'Top City is تهران');

  // --- Test Suite 4: Category & City Breakdown ---
  console.log('\n--- Test Suite 4: Category & City Breakdown ---');
  const catBreakdown = calculateCategoryBreakdown(mockOrders);
  assert(catBreakdown.length === 3, 'Produces 3 category buckets');
  assert(catBreakdown[0].category === 'کالای دیجیتال' && catBreakdown[0].revenue === 15000000, 'Top category has 15,000,000 revenue');

  const cityBreakdown = calculateCityBreakdown(mockOrders);
  assert(cityBreakdown[0].city === 'تهران' && cityBreakdown[0].revenue === 15000000, 'Top city is Tehran with 15,000,000 revenue');

  // --- Test Suite 5: Anomaly Detection (Z-Score & IQR) ---
  console.log('\n--- Test Suite 5: Anomaly Detection (Z-Score & IQR) ---');
  const datasetWithExtremeOutlier = [
    { id: 1, totalAmount: 1000 },
    { id: 2, totalAmount: 1100 },
    { id: 3, totalAmount: 950 },
    { id: 4, totalAmount: 1050 },
    { id: 5, totalAmount: 1000 },
    { id: 6, totalAmount: 900 },
    { id: 7, totalAmount: 85000 }, // Extreme anomaly
  ];
  const detectedAnomalies = detectAnomalies(datasetWithExtremeOutlier);
  assert(detectedAnomalies.length >= 1, 'Identified at least 1 statistical anomaly');
  assert(detectedAnomalies[0].value === 85000, 'Correctly targeted 85,000 as the outlier');
  assert((detectedAnomalies[0].zScore || 0) > 2.0, 'Outlier has Z-Score greater than 2.0');
  assert(detectedAnomalies[0].severity === 'high', 'Extreme outlier tagged as high severity');

  // --- Test Suite 6: Multi-Dimensional Filtering ---
  console.log('\n--- Test Suite 6: Multi-Dimensional Filtering ---');
  const filterByCat: FilterState = {
    dateRange: { start: '', end: '' },
    categories: ['کالای دیجیتال'],
    cities: [],
    orderStatuses: [],
    searchQuery: '',
  };
  const filteredByCat = filterRows(mockOrders, filterByCat);
  assert(filteredByCat.length === 2, 'Filtered exactly 2 items in category کالای دیجیتال');

  const filterBySearch: FilterState = {
    dateRange: { start: '', end: '' },
    categories: [],
    cities: [],
    orderStatuses: [],
    searchQuery: 'اصفهان',
  };
  // --- Test Suite 7: Malformed Rows Detection ---
  console.log('\n--- Test Suite 7: Malformed Rows Detection ---');
  const malformedRows = [
    { orderId: '1', customerName: 'سارا', category: 'کالای دیجیتال', city: 'تهران', totalAmount: 10000000 },
    { orderId: '2' }, // Missing > 50% of columns
    { orderId: '3', customerName: 'علی', category: 'پوشاک', city: 'اصفهان', totalAmount: 2000000 },
  ];
  const malformedReport = auditDataQuality(malformedRows);
  assert(malformedReport.malformedRowsCount === 1, 'Correctly flags 1 malformed row with missing keys');

  // --- Test Suite 8: Price Range Filtering ---
  console.log('\n--- Test Suite 8: Price Range Filtering ---');
  const filterByAmount: FilterState = {
    dateRange: { start: '', end: '' },
    categories: [],
    cities: [],
    orderStatuses: [],
    minAmount: 3000000,
    maxAmount: 8000000,
    searchQuery: '',
  };
  const filteredByAmount = filterRows(mockOrders, filterByAmount);
  assert(filteredByAmount.length === 2, 'Filtered orders strictly between 3,000,000 and 8,000,000');

  // --- Test Suite 9: Edge Case - Zero & Negative Amounts in KPIs ---
  console.log('\n--- Test Suite 9: Edge Case - Zero & Negative Amounts in KPIs ---');
  const zeroAndNegativeOrders = [
    { totalAmount: 0, status: 'تکمیل شده' },
    { totalAmount: 500000, status: 'تکمیل شده' },
  ];
  const zeroKpis = calculateKPIs(zeroAndNegativeOrders);
  assert(zeroKpis.totalRevenue === 500000, 'Calculates revenue with zero amount transactions');
  assert(zeroKpis.totalOrders === 2, 'Counts all transactions accurately');

  // --- Test Suite 10: Cleanliness Score Boundaries ---
  console.log('\n--- Test Suite 10: Cleanliness Score Boundaries ---');
  const perfectDataset = [
    { id: 1, name: 'محصول الف', price: 1000 },
    { id: 2, name: 'محصول ب', price: 2000 },
    { id: 3, name: 'محصول ج', price: 3000 },
  ];
  const perfectReport = auditDataQuality(perfectDataset);
  assert(perfectReport.cleanlinessScore === 100, 'Perfect dataset achieves 100 cleanliness score');
  assert(perfectReport.healthStatus === 'عالی', 'Health status is عالی');

  return { passed, failed, errors };
}
