'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from './button';
import { Globe } from 'lucide-react';

export function LanguageToggle() {
  const { locale, setLocale } = useLanguage();

  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'bn' : 'en';
    setLocale(newLocale);
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleLanguage}>
      <Globe className="h-6 w-6" />
      <span className="sr-only">Toggle language</span>
    </Button>
  );
}
