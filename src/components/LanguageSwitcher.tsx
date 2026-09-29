import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-gray-500" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'en' | 'sw')}
        className="text-sm border border-gray-300 rounded-lg px-2 py-1 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
      >
        <option value="en">English</option>
        <option value="sw">Kiswahili</option>
      </select>
    </div>
  );
}
