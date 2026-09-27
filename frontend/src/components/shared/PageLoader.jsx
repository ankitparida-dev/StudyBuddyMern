import { Loader2 } from 'lucide-react';

export default function PageLoader({ message = 'Loading...' }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <Loader2 className="text-sb-blue animate-spin" size={40} />
      <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
}