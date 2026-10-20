import { ColumnMeta, ColumnType, DataQualityReport } from '../types';

export function inferColumnType(values: any[]): ColumnType {
  const nonNulls = values.filter((v) => v !== null && v !== undefined && v !== '');
  if (nonNulls.length === 0) return 'string';

  let numCount = 0;
  let dateCount = 0;
  let boolCount = 0;

  for (const v of nonNulls) {
    if (typeof v === 'boolean' || v === 'true' || v === 'false') {
      boolCount++;
    } else if (typeof v === 'number' && !isNaN(v)) {
      numCount++;
    } else if (typeof v === 'string') {
      const cleanNum = v.replace(/,/g, '').trim();
      if (!isNaN(Number(cleanNum)) && cleanNum !== '') {
        numCount++;
      } else if (!isNaN(Date.parse(v)) && (v.includes('-') || v.includes('/'))) {
        dateCount++;
      }
    }
  }

  const threshold = nonNulls.length * 0.7;
  if (numCount >= threshold) return 'number';
  if (dateCount >= threshold) return 'date';
  if (boolCount >= threshold) return 'boolean';

  const uniqueCount = new Set(nonNulls).size;
  if (uniqueCount <= 12 && nonNulls.length > 20) return 'categorical';

  return 'string';
}

export function inspectColumns(rows: Record<string, any>[]): ColumnMeta[] {
  if (rows.length === 0) return [];
  const keys = Object.keys(rows[0]);

  return keys.map((key) => {
    const rawValues = rows.map((r) => r[key]);
    const nullCount = rawValues.filter((v) => v === null || v === undefined || v === '').length;
    const nonNulls = rawValues.filter((v) => v !== null && v !== undefined && v !== '');
    const uniqueCount = new Set(nonNulls).size;
    const type = inferColumnType(nonNulls);

    let min: number | undefined;
    let max: number | undefined;
    let mean: number | undefined;

    if (type === 'number') {
      const nums = nonNulls.map((v) => (typeof v === 'number' ? v : Number(String(v).replace(/,/g, '')))).filter((n) => !isNaN(n));
      if (nums.length > 0) {
        min = Math.min(...nums);
        max = Math.max(...nums);
        mean = nums.reduce((a, b) => a + b, 0) / nums.length;
      }
    }

    return {
      name: key,
      type,
      sampleValues: nonNulls.slice(0, 5),
      nullCount,
      uniqueCount,
      min,
      max,
      mean,
    };
  });
}

export function auditDataQuality(rows: Record<string, any>[]): DataQualityReport {
  const totalRows = rows.length;
  if (totalRows === 0) {
    return {
      totalRows: 0,
      totalColumns: 0,
      duplicateRowsCount: 0,
      missingValuesTotal: 0,
      missingValuesPercentage: 0,
      cleanlinessScore: 0,
      columnDetails: [],
      malformedRowsCount: 0,
      healthStatus: 'بحرانی',
      recommendations: ['فایل داده حاوی هیچ سطری نیست.'],
    };
  }

  const columns = inspectColumns(rows);
  const totalColumns = columns.length;
  const totalCells = totalRows * totalColumns;

  // Duplicate rows detection
  const rowSignatures = new Set<string>();
  let duplicateRowsCount = 0;
  let malformedRowsCount = 0;

  for (const row of rows) {
    const rowKeys = Object.keys(row);
    if (rowKeys.length < totalColumns * 0.5) {
      malformedRowsCount++;
    }
    const signature = JSON.stringify(row);
    if (rowSignatures.has(signature)) {
      duplicateRowsCount++;
    } else {
      rowSignatures.add(signature);
    }
  }

  // Missing values
  let missingValuesTotal = 0;
  const columnDetails = columns.map((col) => {
    missingValuesTotal += col.nullCount;
    const missingPercentage = totalRows > 0 ? (col.nullCount / totalRows) * 100 : 0;
    const hasOutliers = col.type === 'number' && col.min !== undefined && col.max !== undefined && col.mean !== undefined && col.max > (col.mean * 4);

    return {
      columnName: col.name,
      inferredType: col.type,
      missingCount: col.nullCount,
      missingPercentage: Number(missingPercentage.toFixed(1)),
      uniqueValuesCount: col.uniqueCount,
      hasOutliers,
    };
  });

  const missingValuesPercentage = totalCells > 0 ? (missingValuesTotal / totalCells) * 100 : 0;

  // Cleanliness Score Calculation: 100 - penalties
  let cleanlinessScore = 100;
  cleanlinessScore -= Math.min(40, missingValuesPercentage * 2);
  cleanlinessScore -= Math.min(25, (duplicateRowsCount / totalRows) * 50);
  cleanlinessScore -= Math.min(20, (malformedRowsCount / totalRows) * 50);
  cleanlinessScore = Math.max(0, Math.round(cleanlinessScore));

  let healthStatus: 'عالی' | 'خوب' | 'نیازمند پاکسازی' | 'بحرانی' = 'عالی';
  if (cleanlinessScore < 50) healthStatus = 'بحرانی';
  else if (cleanlinessScore < 75) healthStatus = 'نیازمند پاکسازی';
  else if (cleanlinessScore < 90) healthStatus = 'خوب';

  const recommendations: string[] = [];
  if (duplicateRowsCount > 0) {
    recommendations.push(`${duplicateRowsCount} سطر تکراری کشف شد؛ پیشنهاد می‌شود قبل از تحلیل نهایی حذف شوند.`);
  }
  if (missingValuesTotal > 0) {
    recommendations.push(`${missingValuesTotal} مقدار گم‌شده (Null/خالی) در ستون‌ها وجود دارد. مقادیر پیش‌فرض یا میانگین جایگزین شوند.`);
  }
  const outlierCols = columnDetails.filter((c) => c.hasOutliers).map((c) => c.columnName);
  if (outlierCols.length > 0) {
    recommendations.push(`ستون‌های (${outlierCols.join('، ')}) شامل داده‌های پرت با فاصله شدید از میانگین هستند.`);
  }
  if (recommendations.length === 0) {
    recommendations.push('کیفیت داده‌ها در سطح استاندارد عالی است و آماده پردازش تحلیلی می‌باشد.');
  }

  return {
    totalRows,
    totalColumns,
    duplicateRowsCount,
    missingValuesTotal,
    missingValuesPercentage: Number(missingValuesPercentage.toFixed(1)),
    cleanlinessScore,
    columnDetails,
    malformedRowsCount,
    healthStatus,
    recommendations,
  };
}
