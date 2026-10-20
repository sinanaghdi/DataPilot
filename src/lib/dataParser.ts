import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Dataset } from '../types';
import { auditDataQuality, inspectColumns } from './qualityAudit';
import { calculateCategoryBreakdown, calculateCityBreakdown, calculateKPIs, calculateTimeSeries } from './analytics';
import { detectAnomalies } from './anomalyDetection';

export interface ParseResult {
  success: boolean;
  dataset?: Dataset;
  error?: string;
}

export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

export async function parseFile(file: File): Promise<ParseResult> {
  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      error: `حجم فایل (${(file.size / (1024 * 1024)).toFixed(1)} مگابایت) بیشتر از سقف مجاز ۲۵ مگابایت است.`,
    };
  }

  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!['csv', 'xlsx', 'xls'].includes(extension || '')) {
    return {
      success: false,
      error: 'فرمت فایل پشتیبانی نمی‌شود. لطفاً فایل CSV یا Excel (.xlsx, .xls) انتخاب کنید.',
    };
  }

  try {
    let rows: Record<string, any>[] = [];

    if (extension === 'csv') {
      rows = await parseCsvFile(file);
    } else {
      rows = await parseExcelFile(file);
    }

    if (rows.length === 0) {
      return {
        success: false,
        error: 'فایل بارگذاری شده خالی است یا هیچ داده‌ی قابل خواندنی ندارد.',
      };
    }

    // Clean up empty rows or rows with only empty keys
    rows = rows.filter((r) => Object.values(r).some((v) => v !== null && v !== undefined && String(v).trim() !== ''));

    const columns = inspectColumns(rows);
    const qualityReport = auditDataQuality(rows);
    const kpis = calculateKPIs(rows);
    const timeSeries = calculateTimeSeries(rows);
    const categoryBreakdown = calculateCategoryBreakdown(rows);
    const cityBreakdown = calculateCityBreakdown(rows);
    const anomalies = detectAnomalies(rows);

    const dataset: Dataset = {
      id: `ds-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: file.name.replace(/\.[^/.]+$/, ''),
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      rows,
      columns,
      qualityReport,
      kpis,
      timeSeries,
      categoryBreakdown,
      cityBreakdown,
      anomalies,
    };

    return {
      success: true,
      dataset,
    };
  } catch (err: any) {
    console.error('File Parse Error:', err);
    return {
      success: false,
      error: `خطا در پردازش ساختار فایل: ${err.message || 'فایل آسیب‌دیده یا فرمت نامعتبر است.'}`,
    };
  }
}

function parseCsvFile(file: File): Promise<Record<string, any>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: true,
      complete: (results) => {
        if (results.errors && results.errors.length > 5) {
          console.warn('PapaParse warnings:', results.errors);
        }
        resolve(results.data as Record<string, any>[]);
      },
      error: (err) => reject(err),
    });
  });
}

function parseExcelFile(file: File): Promise<Record<string, any>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          return resolve([]);
        }
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: null });
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

import { SAMPLE_ORDERS } from '../data/sampleDataset';

export function buildSampleDataset(): Dataset {
  const rows = [...SAMPLE_ORDERS];
  const columns = inspectColumns(rows);
  const qualityReport = auditDataQuality(rows);
  const kpis = calculateKPIs(rows);
  const timeSeries = calculateTimeSeries(rows);
  const categoryBreakdown = calculateCategoryBreakdown(rows);
  const cityBreakdown = calculateCityBreakdown(rows);
  const anomalies = detectAnomalies(rows);

  return {
    id: 'sample-iran-ecommerce-1403',
    name: 'فروشگاه دیجی‌کالا و بازار نمونه (۱۴۰۳)',
    fileName: 'sample_sales_data_1403.xlsx',
    fileSize: 48500,
    uploadedAt: new Date().toISOString(),
    rows,
    columns,
    qualityReport,
    kpis,
    timeSeries,
    categoryBreakdown,
    cityBreakdown,
    anomalies,
  };
}
