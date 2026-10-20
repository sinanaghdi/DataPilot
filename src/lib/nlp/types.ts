export type AssistantIntent =
  | 'SALES_SUMMARY'
  | 'GROSS_NET_REVENUE'
  | 'ORDER_COUNT'
  | 'AOV'
  | 'UNIQUE_CUSTOMERS'
  | 'RETURN_CANCEL_RATE'
  | 'TOP_BOTTOM_PRODUCTS_CATEGORIES'
  | 'TIME_COMPARISON'
  | 'CITY_ANALYSIS'
  | 'CATEGORY_ANALYSIS'
  | 'SALES_TREND_DROP_GROWTH'
  | 'ANOMALIES'
  | 'DATA_QUALITY'
  | 'RECOMMENDATIONS'
  | 'METRIC_DEFINITIONS'
  | 'LIMITATIONS_AND_SCOPE'
  | 'UNKNOWN';

export interface ExtractedParameters {
  category?: string;
  city?: string;
  timeRange?: 'today' | 'yesterday' | 'last_7_days' | 'this_month' | 'last_month' | 'last_quarter' | 'this_year' | 'last_year' | 'all' | string;
  comparisonPeriod?: 'previous_period' | 'month_over_month';
  targetMetric?: 'revenue' | 'orders' | 'aov' | 'returns' | 'customers';
  rawMatchedKeywords: string[];
}

export interface IntentResolution {
  intent: AssistantIntent;
  confidence: number; // 0.0 to 1.0 (internal rule confidence score)
  confidenceLabel: 'قطعی' | 'بالا' | 'متوسط' | 'پایین';
  parameters: ExtractedParameters;
  dataRequirements: string[];
  isSupported: boolean;
}

export interface AssistantAnswer {
  directAnswer: string;
  numericalEvidence: string[];
  cautiousInterpretation: string;
  actionableRecommendation: string;
  dataLimitations?: string;
  suggestedQuestions?: string[];
  calculatedMetrics?: Record<string, any>;
  intent: AssistantIntent;
}
