import { useLanguage } from '@/contexts/LanguageContext';
import en from '@/../public/locales/en/common.json';
import bn from '@/../public/locales/bn/common.json';

const translations = { en, bn };

type TranslationKey = keyof typeof en;

export const useTranslation = () => {
  const { locale } = useLanguage();

  const t = (key: TranslationKey) => {
    return translations[locale][key] || key;
  };

  return { t };
};
