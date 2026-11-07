import { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Hash,
  Lightbulb,
  CheckCircle,
  Copy,
  Check,
  Cpu,
  Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotesSummaryView({ document }) {
  const [copied, setCopied] = useState(false);
  const summary = document?.summary || {};

  const handleCopy = () => {
    const textToCopy = `
# ${document.title} - AI Summary
Subject: ${document.subject.toUpperCase()}

## Overview
${summary.overview || ''}

## Key Topics
${(summary.keyTopics || []).map((t) => `- ${t}`).join('\n')}

## Important Formulas & Concepts
${(summary.keyFormulas || []).map((f) => `- ${f}`).join('\n')}

## Key Takeaways
${(summary.bulletPoints || []).map((b) => `- ${b}`).join('\n')}

## Study Tips
${(summary.studyTips || []).map((s) => `- ${s}`).join('\n')}
`.trim();

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success('Summary copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Overview & Quick Meta */}
      <div className="bg-white dark:bg-sb-dark-card p-6 rounded-2xl border border-gray-100 dark:border-sb-dark-border shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-sb-dark-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-sb-blue">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Executive Study Summary
              </h3>
              <p className="text-xs text-gray-500">
                Extracted & synthesized by StudyBuddy AI RAG Pipeline
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-sb-dark-border text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-sb-dark-border flex items-center gap-1.5 transition"
            >
              {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy Summary'}
            </button>
          </div>
        </div>

        {/* Overview paragraph */}
        <div className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">
          {summary.overview || 'No overview summary available.'}
        </div>

        {/* Badges / Metrics */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 dark:border-sb-dark-border text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-50 dark:bg-sb-dark-bg">
            <BookOpen size={13} />
            {document.pageCount || 1} Pages
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-50 dark:bg-sb-dark-bg">
            <Cpu size={13} />
            {document.chunkCount || 0} Indexed RAG Chunks
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-50 dark:bg-sb-dark-bg">
            <Layers size={13} />
            {document.flashcardCount || 0} Generated Flashcards
          </span>
          <span className="capitalize px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/40 text-sb-blue font-medium">
            {document.subject}
          </span>
        </div>
      </div>

      {/* Key Topics */}
      {summary.keyTopics && summary.keyTopics.length > 0 && (
        <div className="bg-white dark:bg-sb-dark-card p-6 rounded-2xl border border-gray-100 dark:border-sb-dark-border shadow-sm space-y-3">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Hash size={16} className="text-sb-blue" />
            Key Topics & Core Concepts
          </h4>
          <div className="flex flex-wrap gap-2">
            {summary.keyTopics.map((topic, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-sb-blue text-xs font-semibold border border-blue-100 dark:border-blue-900/30"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Key Formulas & Equations */}
      {summary.keyFormulas && summary.keyFormulas.length > 0 && (
        <div className="bg-white dark:bg-sb-dark-card p-6 rounded-2xl border border-gray-100 dark:border-sb-dark-border shadow-sm space-y-3">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500" />
            Key Formulas & Fundamental Laws
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {summary.keyFormulas.map((formula, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs font-mono text-gray-800 dark:text-amber-200 leading-normal"
              >
                {formula}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* High-Yield Bullet Points & Exam Takeaways */}
      {summary.bulletPoints && summary.bulletPoints.length > 0 && (
        <div className="bg-white dark:bg-sb-dark-card p-6 rounded-2xl border border-gray-100 dark:border-sb-dark-border shadow-sm space-y-3">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-500" />
            High-Yield Exam Takeaways
          </h4>
          <ul className="space-y-2">
            {summary.bulletPoints.map((point, idx) => (
              <li
                key={idx}
                className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actionable Study Tips & Traps */}
      {summary.studyTips && summary.studyTips.length > 0 && (
        <div className="bg-white dark:bg-sb-dark-card p-6 rounded-2xl border border-gray-100 dark:border-sb-dark-border shadow-sm space-y-3">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Lightbulb size={16} className="text-purple-500" />
            Study Strategy & Common Traps to Avoid
          </h4>
          <div className="space-y-2">
            {summary.studyTips.map((tip, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 text-xs text-purple-900 dark:text-purple-200 flex items-start gap-2"
              >
                <span className="font-bold text-purple-600 dark:text-purple-400">#{idx + 1}</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

