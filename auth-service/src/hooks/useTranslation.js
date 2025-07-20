import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/translations';

export const useTranslation = () => {
  const { language } = useLanguage();
  const translations = getTranslation(language);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key "${key}" not found for language "${language}".`);
        // Fallback to English
        const enTranslations = getTranslation('en');
        let fallbackValue = enTranslations;
        for (const fk of keys) {
          if (fallbackValue && typeof fallbackValue === 'object' && fk in fallbackValue) {
            fallbackValue = fallbackValue[fk];
          } else {
            return key; // Return the key itself if not found in English either
          }
        }
        return fallbackValue;
      }
    }
    return value;
  };

  return { t, language };
};
