import { runAllTests } from './dataAnalytics.test';
import { runHandCalculatedTests } from './handCalculatedVerification.test';
import { runSecurityIsolationTests } from './securityIsolation.test';
import { runPersianNlpAssistantTests } from './persianNlpAssistant.test';

console.log('====================================================');
console.log('🚀 اجرای جامع ممیزی نهایی و آزمون‌های پلتفرم دیتاپایلوت');
console.log('====================================================');

const res1 = runAllTests();
const res2 = runHandCalculatedTests();
const res3 = runSecurityIsolationTests();
const res4 = runPersianNlpAssistantTests();

const totalPassed = res1.passed + res2.passed + res3.passed + res4.passed;
const totalFailed = res1.failed + res2.failed + res3.failed + res4.failed;

console.log('\n====================================================');
console.log(`📊 نتیجه کلی ممیزی: ${totalPassed} آزمون موفق | ${totalFailed} آزمون ناموفق`);
console.log('====================================================');

if (totalFailed > 0) {
  console.error('❌ خطا: برخی از آزمون‌های اعتبارسنجی با شکست مواجه شدند.');
  process.exit(1);
} else {
  console.log('🎉 تمامی آزمون‌های پردازش زبان طبیعی فارسی، صحت تحلیل، امنیت چندمستأجری و فرمول‌های ریاضی با موفقیت ۱۰۰٪ پاس شدند.');
  process.exit(0);
}
