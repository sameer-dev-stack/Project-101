'use client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

export const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center justify-center w-12 h-8 rounded-full bg-gray-200 dark:bg-gray-700 focus:outline-none"
    >
      <div
        className={`w-10 h-6 flex items-center justify-between rounded-full bg-white dark:bg-gray-600 shadow-inner transition-all duration-300 ease-in-out`}
      >
        <span className={`px-1 text-xs font-semibold ${language === 'en' ? 'text-white bg-blue-500 rounded-full' : 'text-gray-500'}`}>
          EN
        </span>
        <span className={`px-1 text-xs font-semibold ${language === 'bn' ? 'text-white bg-blue-500 rounded-full' : 'text-gray-500'}`}>
          বাং
        </span>
      </div>
    </button>
  );
};
