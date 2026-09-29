import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function DarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('lendingos_dark_mode');
    return saved === 'true';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('lendingos_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('lendingos_dark_mode', 'false');
    }
  }, [isDark]);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? (
        <Sun size={20} className="text-gray-600 dark:text-gray-300" />
      ) : (
        <Moon size={20} className="text-gray-600" />
      )}
    </button>
  );
}
