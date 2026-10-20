export type ColumnType = 'number' | 'string' | 'date' | 'boolean' | 'categorical';

export interface ColumnMeta {
  name: string;
  type: ColumnType;
  sampleValues: any[];
  nullCount: number;
  uniqueCount: number;
  min?: number;
  max?: number;
  mean?: number;
}

export interface DataQualityReport {
  totalRows: number;
  totalColumns: number;
  duplicateRowsCount: number;
  missingValuesTotal: number;
  missingValuesPercentage: number;
  cleanlinessScore: number; // 0 to 100
  columnDetails: {
    columnName: string;
    inferredType: ColumnType;
    missingCount: number;
    missingPercentage: number;
    uniqueValuesCount: number;
    hasOutliers: boolean;
  }[];
  malformedRowsCount: number;
  healthStatus: 'عالی' | 'خوب' | 'نیازمند پاکسازی' | 'بحرانی';
  recommendations: string[];
}

export interface DataAnomaly {
  id: string;
  rowIndex: number;
  columnName: string;
  value: number | string;
  expectedRange: string;
  zScore?: number;
  severity: 'high' | 'medium' | 'low';
  type: 'outlier_high' | 'outlier_low' | 'sudden_drop' | 'sudden_spike' | 'unusual_pattern';
  reasonPersian: string;
  affectedRowData: Record<string, any>;
}

export interface DatasetKPIs {
  totalRevenue: number;
  netRevenue: number;
  totalOrders: number;
  uniqueCustomers: number;
  averageOrderValue: number;
  returnRate: number; // percentage
  cancellationRate: number; // percentage
  grossProfitMarginEstimate: number; // percentage
  topCategory: { name: string; revenue: number; percentage: number };
  topCity: { name: string; revenue: number; percentage: number };
}

export interface TimeSeriesPoint {
  date: string;
  jalaliDate: string;
  revenue: number;
  orderCount: number;
  avgOrderValue: number;
}

export interface CategorySummary {
  category: string;
  revenue: number;
  orderCount: number;
  percentage: number;
}

export interface CitySummary {
  city: string;
  revenue: number;
  orderCount: number;
  percentage: number;
}

export interface Dataset {
  id: string;
  name: string;
  fileName: string;
  fileSize: number; // in bytes
  uploadedAt: string;
  rows: Record<string, any>[];
  columns: ColumnMeta[];
  qualityReport: DataQualityReport;
  kpis: DatasetKPIs;
  timeSeries: TimeSeriesPoint[];
  categoryBreakdown: CategorySummary[];
  cityBreakdown: CitySummary[];
  anomalies: DataAnomaly[];
  columnMapping?: {
    amountKey?: string;
    customerKey?: string;
    statusKey?: string;
    categoryKey?: string;
    cityKey?: string;
    dateKey?: string;
  };
}

export interface FilterState {
  dateRange: { start: string; end: string };
  categories: string[];
  cities: string[];
  orderStatuses: string[];
  minAmount?: number;
  maxAmount?: number;
  searchQuery: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  evidence?: {
    metrics?: Record<string, any>;
    assumptions?: string[];
  };
}

export interface SavedProject {
  id: string;
  userId: string;
  title: string;
  description?: string;
  datasetName: string;
  rowCount: number;
  columnCount: number;
  metricsSummary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedAnalysis {
  id: string;
  userId: string;
  projectId: string;
  title: string;
  question: string;
  findings: string;
  assumptions?: string;
  confidenceScore?: number;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  companyName?: string;
  industry?: string;
  createdAt: string;
  updatedAt: string;
}
