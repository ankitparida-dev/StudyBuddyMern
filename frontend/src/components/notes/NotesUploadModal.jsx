import { useState, useRef } from 'react';
import { UploadCloud, FileText, X, AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { documentApi } from '../../utils/api';

const SUBJECT_OPTIONS = [
  { value: 'physics', label: 'Physics' },
  { value: 'chemistry', label: 'Chemistry' },
  { value: 'math', label: 'Mathematics' },
  { value: 'biology', label: 'Biology' },
  { value: 'general', label: 'General / Mixed' },
];

export default function NotesUploadModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('physics');
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (selectedFile) => {
    if (!selectedFile.name.toLowerCase().endsWith('.pdf') && selectedFile.type !== 'application/pdf') {
      toast.error('Please upload a PDF document (.pdf)');
      return;
    }
    if (selectedFile.size > 15 * 1024 * 1024) {
      toast.error('File size exceeds 15MB limit.');
      return;
    }
    setFile(selectedFile);
    if (!title) {
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please choose a PDF file to upload');
      return;
    }

    setIsUploading(true);
    setCurrentStep(1);

    // Simulate animated pipeline progress steps
    const stepTimer1 = setTimeout(() => setCurrentStep(2), 2500);
    const stepTimer2 = setTimeout(() => setCurrentStep(3), 6000);
    const stepTimer3 = setTimeout(() => setCurrentStep(4), 11000);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title.trim() || file.name.replace(/\.[^/.]+$/, ''));
    formData.append('subject', subject);

    try {
      const res = await documentApi.upload(formData);
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setCurrentStep(5);

      toast.success('Notes processed! Summary and flashcards created.');
      setTimeout(() => {
        setIsUploading(false);
        onSuccess(res.document);
        onClose();
      }, 800);
    } catch (err) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setIsUploading(false);
      setCurrentStep(0);
      toast.error(err.message || 'Failed to process notes');
    }
  };

  const steps = [
    'Parsing PDF text and page structure...',
    'Chunking content and generating vector embeddings...',
    'Generating comprehensive AI notes summary...',
    'Crafting high-yield study flashcards...',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-sb-dark-card w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 dark:border-sb-dark-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-sb-dark-border">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-sb-blue">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Upload Notes (RAG Pipeline)</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">PDF to AI summary, flashcards & interactive Q&A</p>
            </div>
          </div>
          {!isUploading && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Dropzone */}
          {!file ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center ${
                dragActive
                  ? 'border-sb-blue bg-blue-50/50 dark:bg-blue-950/20'
                  : 'border-gray-200 dark:border-sb-dark-border hover:border-sb-blue/60 bg-gray-50/50 dark:bg-sb-dark-bg/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-12 h-12 mb-3 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-sb-blue">
                <UploadCloud size={24} />
              </div>
              <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                Click to browse or drag & drop your PDF notes
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Supports lecture slides, handwritten PDF exports, syllabus chapters (Max 15MB)
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-sb-blue flex-shrink-0">
                  <FileText size={22} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • PDF Document
                  </p>
                </div>
              </div>
              {!isUploading && (
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-gray-400 hover:text-red-500 p-1 transition"
                  title="Remove file"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          )}

          {/* Title & Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Note Title
              </label>
              <input
                type="text"
                disabled={isUploading}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Thermodynamics Ch. 4"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-sb-dark-border bg-white dark:bg-sb-dark-bg text-gray-900 dark:text-sb-dark-text focus:outline-none focus:ring-2 focus:ring-sb-blue/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Subject
              </label>
              <select
                disabled={isUploading}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-sb-dark-border bg-white dark:bg-sb-dark-bg text-gray-900 dark:text-sb-dark-text focus:outline-none focus:ring-2 focus:ring-sb-blue/30"
              >
                {SUBJECT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Processing Indicator */}
          {isUploading && (
            <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-sb-dark-bg/60 border border-gray-100 dark:border-sb-dark-border space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-sb-blue">
                <span className="flex items-center gap-1.5">
                  <Loader2 size={14} className="animate-spin" />
                  AI RAG Pipeline Running
                </span>
                <span>Step {Math.min(currentStep, 4)} of 4</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-sb-blue h-1.5 transition-all duration-500 rounded-full"
                  style={{ width: `${(Math.min(currentStep, 4) / 4) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 italic">
                {steps[Math.min(currentStep - 1, 3)] || 'Initializing...'}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            {!isUploading && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-sb-dark-border rounded-xl transition"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={!file || isUploading}
              className={`px-5 py-2 text-sm font-semibold rounded-xl text-white transition flex items-center gap-2 ${
                !file || isUploading
                  ? 'bg-blue-300 dark:bg-blue-900/40 cursor-not-allowed'
                  : 'bg-sb-blue hover:bg-blue-600 shadow-md shadow-blue-500/20 active:scale-95'
              }`}
            >
              {isUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing Note...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Process & Generate
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

