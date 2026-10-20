import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  HelpCircle, 
  BookmarkPlus, 
  Check, 
  AlertCircle, 
  Copy,
  Lightbulb,
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { ChatMessage } from '../types';
import { answerDataQuestion, formatAnswerAsPersianText, AssistantAnswer } from '../lib/nlp';

interface EnhancedChatMessage extends ChatMessage {
  structured?: AssistantAnswer;
}

export const AssistantPage: React.FC = () => {
  const { dataset, saveAnalysis, isSaving } = useData();

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<EnhancedChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content: `سلام! من «دیتاپایلوت» هستم، دستیار تحلیلی داده‌های کسب‌وکار شما.
پاسخ‌های من با موتور پردازش زبان طبیعی فارسی و محاسبات قطعی ریاضی مستقیماً روی فایل «${dataset.name}» محاسبه می‌شوند. هیچ مدل زبانی یا حدسیات ساختگی وجود ندارد و هیچ داده‌ای به سرورهای خارجی ارسال نمی‌گردد.

می‌توانید یکی از پرسش‌های پیشنهادی زیر را انتخاب کنید یا پرسش دلخواه خود را بنویسید:`,
      timestamp: new Date().toLocaleTimeString('fa-IR'),
    },
  ]);

  const presetQuestions = [
    'پرسودترین دسته محصولات کدام است و چه سهمی از کل فروش دارد؟',
    'وضعیت تمرکز جغرافیایی سفارش‌ها در شهرهای مختلف چگونه است؟',
    'آیا ناهنجاری قیمتی یا خرید مشکوکی در داده‌ها شناسایی شده است؟',
    'نرخ مرجوعی و کنسلی سفارشات چقدر است و چه توصیه‌ای دارید؟',
    'کل درآمد ناخالص و درآمد خالص چقدر است و چه تفاوتی دارند؟',
    'میانگین ارزش سفارش (AOV) و تعداد کل سفارش‌ها چقدر است؟',
  ];

  const handleSend = async (queryToSend?: string) => {
    const q = (queryToSend || inputQuery).trim();
    if (!q || loading) return;

    setErrorMsg(null);
    setInputQuery('');

    const userMessage: EnhancedChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString('fa-IR'),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      // 100% Rule-based Persian NLP calculation directly in-memory (Zero external API / Zero network latency)
      // Slight async tick for natural fluid UI interaction
      await new Promise((resolve) => setTimeout(resolve, 180));

      const structuredAnswer = answerDataQuestion(q, dataset);
      const formattedContent = formatAnswerAsPersianText(structuredAnswer);

      const botMessage: EnhancedChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        content: formattedContent,
        structured: structuredAnswer,
        timestamp: new Date().toLocaleTimeString('fa-IR'),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('خطا در پردازش پرسش تحلیلی با موتور پردازش زبان طبیعی فارسی.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveToProject = async (msg: EnhancedChatMessage) => {
    try {
      const userQuestion = messages[messages.indexOf(msg) - 1]?.content || 'استعلام داده';
      await saveAnalysis({
        projectId: dataset.id,
        title: `تحلیل: ${userQuestion.slice(0, 40)}`,
        question: userQuestion,
        findings: msg.content,
        assumptions: 'محاسبه قطعی بر مبنای ارقام واقعی فایل بارگذاری‌شده',
        confidenceScore: 100,
      });
      setSavedId(msg.id);
      setTimeout(() => setSavedId(null), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900">دستیار تحلیلی داده‌های کسب‌وکار (DataPilot)</h1>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                  پردازش قانون‌محور و قطعی
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                پاسخگویی سریع به زبان فارسی، استناد ۱۰۰٪ به ارقام واقعی فایل بدون جعل داده یا وابستگی به مدل‌های زبانی ابری
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-slate-200 shrink-0">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>حفظ کامل حریم خصوصی (بدون خروج داده)</span>
          </div>
        </div>
      </div>

      {/* Preset Suggestion Chips */}
      <div className="rounded-2xl border border-slate-200 bg-[#FAF8F5] p-4">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2.5">
          <Lightbulb className="h-4 w-4 text-amber-600" />
          <span>پرسش‌های پیشنهادی متناسب با شاخص‌های فایل «{dataset.name}»:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {presetQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              disabled={loading}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:border-emerald-600/70 hover:text-emerald-900 transition-colors shadow-2xs text-right disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-5 min-h-[380px] max-h-[560px] overflow-y-auto">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const structured = msg.structured;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-slate-900 text-white'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                  isUser
                    ? 'bg-slate-900 text-white'
                    : 'bg-[#F9F7F2] text-slate-800 border border-slate-200/80 shadow-2xs'
                }`}
              >
                {/* Structured Bot Message View if available */}
                {!isUser && structured ? (
                  <div className="space-y-3 text-slate-800">
                    {/* Direct headline */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
                      <div className="font-bold text-slate-900 text-[13px] flex items-center gap-1.5 text-emerald-900 mb-1">
                        <span>📊 پاسخ تحلیلی مستقیم</span>
                      </div>
                      <p className="text-slate-800 leading-relaxed font-sans">{structured.directAnswer}</p>
                    </div>

                    {/* Numerical Evidence */}
                    {structured.numericalEvidence && structured.numericalEvidence.length > 0 && (
                      <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200/70 space-y-1.5">
                        <div className="font-bold text-emerald-900 text-xs flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                          <span>شواهد و ارقام پشتیبان از داده:</span>
                        </div>
                        <ul className="space-y-1 text-slate-700 text-[11px] pr-2">
                          {structured.numericalEvidence.map((ev, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-emerald-700 font-bold">•</span>
                              <span>{ev}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Cautious Interpretation */}
                    {structured.cautiousInterpretation && (
                      <div className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/70 text-[11px] text-amber-950 leading-relaxed">
                        <span className="font-bold text-amber-900">💡 تحلیل محتاطانه و علل محتمل: </span>
                        <span>{structured.cautiousInterpretation}</span>
                      </div>
                    )}

                    {/* Actionable Recommendation */}
                    {structured.actionableRecommendation && (
                      <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-200/70 text-[11px] text-blue-950 leading-relaxed">
                        <span className="font-bold text-blue-900">🎯 توصیه اجرایی و گام بعدی: </span>
                        <span>{structured.actionableRecommendation}</span>
                      </div>
                    )}

                    {/* Follow-up Question Chips */}
                    {structured.suggestedQuestions && structured.suggestedQuestions.length > 0 && (
                      <div className="pt-2 border-t border-slate-200/60">
                        <span className="text-[11px] font-bold text-slate-600 block mb-1.5">پرسش‌های مرتبط بعدی:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {structured.suggestedQuestions.map((sq, i) => (
                            <button
                              key={i}
                              onClick={() => handleSend(sq)}
                              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[11px] text-slate-700 hover:border-emerald-600 hover:text-emerald-900 transition-colors shadow-2xs text-right"
                            >
                              {sq}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="whitespace-pre-line font-sans">{msg.content}</div>
                )}

                {/* Bottom message tools for assistant answers */}
                {!isUser && msg.id !== 'welcome' && (
                  <div className="flex items-center justify-between border-t border-slate-200/60 pt-2.5 text-[11px] text-slate-500">
                    <span>{msg.timestamp}</span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="flex items-center gap-1 hover:text-slate-800"
                        title="کپی پاسخ"
                      >
                        {copiedId === msg.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        <span>{copiedId === msg.id ? 'کپی شد' : 'کپی'}</span>
                      </button>

                      <button
                        onClick={() => handleSaveToProject(msg)}
                        disabled={isSaving}
                        className="flex items-center gap-1 font-semibold text-emerald-800 hover:text-emerald-950"
                        title="ذخیره این تحلیل در فایربیس"
                      >
                        {savedId === msg.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <BookmarkPlus className="h-3.5 w-3.5" />
                        )}
                        <span>{savedId === msg.id ? 'در پروژه ذخیره شد' : 'ذخیره در پروژه'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
              <Bot className="h-4 w-4 animate-pulse" />
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-500 flex items-center gap-2">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
              <span>دیتاپایلوت در حال استخراج و تطبیق شاخص‌ها از دیتاست...</span>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="relative flex items-center gap-2"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="هر سوالی در مورد مبالغ، دسته‌بندی‌ها، روند یا مشتریان دارید به فارسی بپرسید..."
          disabled={loading}
          className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pr-4 pl-14 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-hidden shadow-2xs"
        />

        <button
          type="submit"
          disabled={loading || !inputQuery.trim()}
          className="absolute left-2 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-40 transition-colors shadow-2xs"
          title="ارسال پرسش"
        >
          <Send className="h-4 w-4 rotate-180" />
        </button>
      </form>
    </div>
  );
};
