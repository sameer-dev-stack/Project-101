import { en } from './en';
import { bn } from './bn';

const translations = {
  en,
  bn,
};

export const getTranslation = (lang) => {
  return translations[lang] || en;
};
