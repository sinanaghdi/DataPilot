import { Dataset } from '../../types';
import { AssistantAnswer } from './types';
import { classifyIntent } from './intentClassifier';
import { calculateIntentMetrics } from './calculationEngine';

/**
 * Formats structured AssistantAnswer into a clean, professional Persian text response
 */
export function formatAnswerAsPersianText(answer: AssistantAnswer): string {
  const sections: string[] = [];

  // 1. Direct answer headline
  sections.push(`📊 پاسخ تحلیلی مستقیم:
${answer.directAnswer}`);

  // 2. Numerical Evidence
  if (answer.numericalEvidence && answer.numericalEvidence.length > 0) {
    sections.push(`🔍 شواهد و ارقام پشتیبان از داده:
${answer.numericalEvidence.map((e) => `• ${e}`).join('\n')}`);
  }

  // 3. Cautious Interpretation
  if (answer.cautiousInterpretation) {
    sections.push(`💡 تحلیل محتاطانه و علل محتمل:
${answer.cautiousInterpretation}`);
  }

  // 4. Actionable Recommendation
  if (answer.actionableRecommendation) {
    sections.push(`🎯 توصیه اجرایی و گام بعدی:
${answer.actionableRecommendation}`);
  }

  // 5. Data Limitations & Assumptions
  if (answer.dataLimitations) {
    sections.push(`⚠️ فرضیات و محدودیت‌های داده:
${answer.dataLimitations}`);
  }

  return sections.join('\n\n');
}

/**
 * Main entry point for the Persian DataPilot Assistant.
 * Fully local, deterministic, rule-based NLP pipeline without any LLM or network requests.
 */
export function answerDataQuestion(question: string, dataset: Dataset): AssistantAnswer {
  if (!question || question.trim().length === 0) {
    return {
      directAnswer: 'لطفاً پرسش خود را به زبان فارسی مطرح نمایید.',
      numericalEvidence: [],
      cautiousInterpretation: '',
      actionableRecommendation: 'می‌توانید یکی از پرسش‌های پیشنهادی را انتخاب کنید.',
      dataLimitations: '',
      suggestedQuestions: [
        'خلاصه فروش و کل درآمد چقدر است؟',
        'پرسودترین دسته محصولات کدام است؟',
      ],
      intent: 'UNKNOWN',
    };
  }

  // Extract available categories and cities from the active dataset
  const availableCategories = dataset.categoryBreakdown.map((c) => c.category);
  const availableCities = dataset.cityBreakdown.map((c) => c.city);

  // 1. Classify intent & extract entities
  const resolution = classifyIntent(question, availableCategories, availableCities);

  // 2. Deterministic calculations & structured reasoning
  const result = calculateIntentMetrics(resolution, dataset);

  return {
    directAnswer: result.headline,
    numericalEvidence: result.evidencePoints,
    cautiousInterpretation: result.cautiousInterpretation,
    actionableRecommendation: result.actionableRecommendation,
    dataLimitations: result.dataLimitations,
    suggestedQuestions: result.suggestedQuestions,
    calculatedMetrics: result.metrics,
    intent: resolution.intent,
  };
}
