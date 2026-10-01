import { LoaderCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function Spinner({ className }) {
  return <LoaderCircle className={cn('h-5 w-5 animate-spin text-brand-600 dark:text-brand-400', className)} aria-hidden="true" />;
}
