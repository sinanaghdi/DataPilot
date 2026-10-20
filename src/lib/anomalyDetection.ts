import { DataAnomaly } from '../types';

export function detectAnomalies(rows: Record<string, any>[]): DataAnomaly[] {
  const anomalies: DataAnomaly[] = [];
  if (rows.length < 3) return anomalies;

  // 1. Identify primary numerical metric column (e.g., totalAmount, amount, price, value)
  const candidateKeys = ['totalamount', 'amount', 'مبلغ کل', 'مبلغ', 'قیمت', 'price', 'total', 'revenue', 'فروش', 'sales'];
  let metricCol = Object.keys(rows[0]).find((k) => candidateKeys.includes(k.toLowerCase())) || '';

  if (!metricCol) {
    // Fallback to first non-id numeric column
    for (const key of Object.keys(rows[0])) {
      if (['id', 'orderid', 'کد', 'ردیف', 'index'].includes(key.toLowerCase())) continue;
      const isNumeric = rows.every((r) => {
        const val = r[key];
        return val !== null && val !== undefined && !isNaN(Number(String(val).replace(/,/g, '')));
      });
      if (isNumeric) {
        metricCol = key;
        break;
      }
    }
  }

  if (!metricCol) return anomalies;

  const values: { index: number; val: number; row: Record<string, any> }[] = [];
  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i][metricCol];
    const num = typeof raw === 'number' ? raw : Number(String(raw).replace(/,/g, ''));
    if (!isNaN(num) && num > 0) {
      values.push({ index: i, val: num, row: rows[i] });
    }
  }

  if (values.length < 3) return anomalies;

  // Mean & Standard Deviation
  const sum = values.reduce((acc, curr) => acc + curr.val, 0);
  const mean = sum / values.length;
  const variance = values.reduce((acc, curr) => acc + Math.pow(curr.val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // Sorted values for IQR
  const sortedVals = [...values].sort((a, b) => a.val - b.val);
  const q1 = sortedVals[Math.floor(sortedVals.length * 0.25)].val;
  const q3 = sortedVals[Math.floor(sortedVals.length * 0.75)].val;
  const iqr = q3 - q1;
  const upperThresholdIQR = q3 + 1.5 * iqr;

  // Identify outliers
  for (const item of values) {
    const zScore = stdDev > 0 ? (item.val - mean) / stdDev : 0;

    // High anomaly: Z-Score >= 2.0 or above IQR upper bound
    if (zScore >= 2.0 || item.val > upperThresholdIQR) {
      const isExtreme = zScore >= 2.2 || item.val > upperThresholdIQR * 2;
      anomalies.push({
        id: `anom-${item.index}-${metricCol}`,
        rowIndex: item.index,
        columnName: metricCol,
        value: item.val,
        expectedRange: `میانگین: ${Math.round(mean).toLocaleString('fa-IR')} (حد نرمال: تا ${Math.round(mean + 2 * stdDev).toLocaleString('fa-IR')})`,
        zScore: Number(zScore.toFixed(2)),
        severity: isExtreme ? 'high' : 'medium',
        type: 'outlier_high',
        reasonPersian: `مقدار این تراکنش (${item.val.toLocaleString('fa-IR')}) به میزان ${zScore.toFixed(1)} برابر انحراف معیار بالاتر از میانگین است. احتمال خرید سازمانی، تخفیف اشتباه یا سفارش عمده.`,
        affectedRowData: item.row,
      });
    } else if (zScore <= -2.2 && item.val > 0) {
      anomalies.push({
        id: `anom-${item.index}-${metricCol}-low`,
        rowIndex: item.index,
        columnName: metricCol,
        value: item.val,
        expectedRange: `حداقل انتظار: ${Math.round(Math.max(0, mean - 2 * stdDev)).toLocaleString('fa-IR')}`,
        zScore: Number(zScore.toFixed(2)),
        severity: 'low',
        type: 'outlier_low',
        reasonPersian: `مبلغ به صورت نامتعارف کمتر از میانگین فروش است. ممکن است کالای اشانتیون یا خطای محاسبه تخفیف باشد.`,
        affectedRowData: item.row,
      });
    }
  }

  // 2. Identify unusual status pattern (e.g. repeated returns or cancellations)
  const statusKey = Object.keys(rows[0]).find((k) => ['status', 'وضعیت', 'orderstatus'].includes(k.toLowerCase()));
  if (statusKey) {
    const returnCount = rows.filter((r) => String(r[statusKey]).includes('مرجوع') || String(r[statusKey]).includes('لغو')).length;
    const returnRate = (returnCount / rows.length) * 100;
    if (returnRate > 15) {
      anomalies.push({
        id: 'anom-status-rate',
        rowIndex: 0,
        columnName: statusKey,
        value: `${returnRate.toFixed(1)}%`,
        expectedRange: 'کمتر از ۵٪ تا ۸٪',
        severity: 'high',
        type: 'unusual_pattern',
        reasonPersian: `نرخ مرجوعی و کنسلی کل سفارشات (${returnRate.toFixed(1)}٪) بیش از حد استاندارد است. این موضوع نشان‌دهنده نقص در لجستیک یا مغایرت کالای ارسالی با سایت است.`,
        affectedRowData: { totalOrders: rows.length, affectedOrders: returnCount },
      });
    }
  }

  return anomalies;
}
