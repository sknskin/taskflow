import { create } from 'zustand';
import { Locale } from '@/lib/i18n';

// 로컬스토리지 키 상수
// localStorage key constant
const LS_LOCALE = 'taskflow_locale';

interface LanguageState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

// 언어 상태 스토어
// Language state store
export const useLanguageStore = create<LanguageState>((set) => ({
  locale: (typeof window !== 'undefined' ? (localStorage.getItem(LS_LOCALE) as Locale) : null) || 'en',
  setLocale: (locale) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LS_LOCALE, locale);
    }
    set({ locale });
  },
}));
