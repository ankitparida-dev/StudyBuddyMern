import { Sparkles, ArrowRight } from 'lucide-react';

export default function InsightBanner({ insight }) {
  if (!insight) return null;

  return (
    <div className="bg-gradient-to-r from-sb-yellow/40 via-sb-pink/20 to-sb-blue/20 rounded-2xl p-5 border border-sb-yellow/30">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-white/60 dark:bg-sb-dark-bg/60 flex items-center justify-center shrink-0">
          <Sparkles className="text-sb-blue" size={20} />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold tracking-wide text-sb-blue mb-1">
            AI INSIGHT
          </p>
          <p className="text-sm dark:text-sb-dark-text leading-relaxed">
            {insight}
          </p>
        </div>
      </div>
    </div>
  );
}