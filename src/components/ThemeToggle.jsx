import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import Button from './ui/Button';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      icon={isDark ? Sun : Moon}
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    />
  );
}
