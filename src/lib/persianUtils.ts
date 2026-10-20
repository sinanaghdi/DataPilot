// Persian numbers and currency formatting utilities

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export function toPersianDigits(input: string | number | null | undefined): string {
  if (input === null || input === undefined) return '';
  const str = String(input);
  return str.replace(/[0-9]/g, (w) => PERSIAN_DIGITS[parseInt(w, 10)]);
}

export function toEnglishDigits(input: string): string {
  if (!input) return '';
  let str = input;
  for (let i = 0; i < 10; i++) {
    str = str.replace(new RegExp(PERSIAN_DIGITS[i], 'g'), String(i));
    str = str.replace(new RegExp(ARABIC_DIGITS[i], 'g'), String(i));
  }
  return str;
}

export function formatToman(amount: number, usePersianDigits = true): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '۰ تومان';
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat('en-US').format(rounded);
  if (usePersianDigits) {
    return `${toPersianDigits(formatted)} تومان`;
  }
  return `${formatted} تومان`;
}

export function formatCompactToman(amount: number): string {
  if (isNaN(amount)) return '۰';
  if (amount >= 1_000_000_000) {
    const val = (amount / 1_000_000_000).toFixed(1);
    return `${toPersianDigits(val)} میلیارد تومان`;
  }
  if (amount >= 1_000_000) {
    const val = (amount / 1_000_000).toFixed(1);
    return `${toPersianDigits(val)} میلیون تومان`;
  }
  if (amount >= 1_000) {
    const val = (amount / 1_000).toFixed(0);
    return `${toPersianDigits(val)} هزار تومان`;
  }
  return formatToman(amount);
}

export function formatPercent(value: number, usePersianDigits = true): string {
  if (isNaN(value)) return '۰٪';
  const rounded = value.toFixed(1);
  if (usePersianDigits) {
    return `${toPersianDigits(rounded)}٪`;
  }
  return `${rounded}%`;
}

export function formatJalaliDate(dateInput: string | Date | number): string {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d);
  } catch {
    return String(dateInput);
  }
}
