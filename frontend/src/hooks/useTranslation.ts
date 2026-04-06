import { useLanguageStore } from '@/store/language';
import { t, TranslationKey } from '@/lib/i18n';

// 번역 훅 - 현재 로케일 기반 번역 함수와 로케일 전환 함수 반환
// Translation hook - returns translation function and locale setter based on current locale
export function useTranslation() {
  const { locale, setLocale } = useLanguageStore();
  return {
    t: (key: TranslationKey) => t(locale, key),
    locale,
    setLocale,
  };
}
