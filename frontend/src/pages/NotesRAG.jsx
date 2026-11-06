import { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  UploadCloud,
  Sparkles,
  BookOpen,
  Layers,
  CheckCircle2,
  Trash2,
  Search,
  ExternalLink,
  Loader2,
  X,
  AlertCircle,
  Brain,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageTransition from '../components/shared/PageTransition';
import NotesUploadModal from '../components/notes/NotesUploadModal';
import NotesSummaryView from '../components/notes/NotesSummaryView';
import FlashcardDeck from '../components/notes/FlashcardDeck';
import RagChat from '../components/notes/RagChat';
import { documentApi } from '../utils/api';
import { usePageTitle } from '../utils/usePageTitle';

const SUBJECT_COLORS = {
  physics: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-900',
  chemistry: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
  math: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-900',
  biology: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-900',
  general: 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
};

export default function NotesRAG() {
  usePageTitle('AI Notes & Flashcards');

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary', 'flashcards', 'chat'
  const [docFlashcards, setDocFlashcards] = useState([]);
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await documentApi.list();
      setDocuments(res.documents || []);
    } catch (err) {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleOpenDoc = async (doc, initialTab = 'summary') => {
    setSelectedDoc(doc);
    setActiveTab(initialTab);
    setLoadingFlashcards(true);
    try {
      const res = await documentApi.getFlashcards(doc._id);
      setDocFlashcards(res.flashcards || []);
    } catch (err) {
      toast.error('Failed to load flashcards');
    } finally {
      setLoadingFlashcards(false);
    }
  };

  const handleDelete = async (docId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this note, its summary, and flashcards?')) {
      return;
    }
    try {
      await documentApi.delete(docId);
      setDocuments((prev) => prev.filter((d) => d._id !== docId));
      if (selectedDoc?._id === docId) setSelectedDoc(null);
      toast.success('Document deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete document');
    }
  };

  const filteredDocs = useMemo(() => {
    return documents.filter((d) => {
      const matchSearch =
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.fileName || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchSubject = selectedSubject === 'all' || d.subject === selectedSubject;
      return matchSearch && matchSubject;
    });
  }, [documents, searchQuery, selectedSubject]);

  // Overall Statistics
  const totalNotes = documents.length;
  const totalPages = documents.reduce((acc, d) => acc + (d.pageCount || 1), 0);
  const totalFlashcards = documents.reduce((acc, d) => acc + (d.flashcardCount || 0), 0);
  const totalChunks = documents.reduce((acc, d) => acc + (d.chunkCount || 0), 0);

  return (
    <PageTransition>
      <div className="space-y-8 pb-12">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-sb-blue">
                <Brain size={24} />
              </span>
              AI Notes & Flashcards (RAG)
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Upload syllabus notes or lecture PDFs to generate executive summaries, high-yield flashcards, and chat with notes via RAG.
            </p>
          </div>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-sb-blue text-white font-semibold text-sm shadow-md shadow-blue-500/20 hover:bg-blue-600 transition flex items-center gap-2 active:scale-95 self-start sm:self-auto"
          >
            <UploadCloud size={18} />
            Upload Notes PDF
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-sb-dark-card p-4 rounded-2xl border border-gray-100 dark:border-sb-dark-border shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-sb-blue">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Uploaded Notes</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{totalNotes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-sb-dark-card p-4 rounded-2xl border border-gray-100 dark:border-sb-dark-border shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                <Layers size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">AI Flashcards</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{totalFlashcards}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-sb-dark-card p-4 rounded-2xl border border-gray-100 dark:border-sb-dark-border shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600">
                <BookOpen size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Pages Processed</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{totalPages}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-sb-dark-card p-4 rounded-2xl border border-gray-100 dark:border-sb-dark-border shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">RAG Chunks Indexed</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{totalChunks}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-sb-dark-border bg-white dark:bg-sb-dark-card text-gray-800 dark:text-sb-dark-text focus:outline-none focus:ring-2 focus:ring-sb-blue/30"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 no-scrollbar">
            {['all', 'physics', 'chemistry', 'math', 'biology'].map((subj) => (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition whitespace-nowrap ${
                  selectedSubject === subj
                    ? 'bg-sb-blue text-white shadow-xs'
                    : 'bg-white dark:bg-sb-dark-card border border-gray-200 dark:border-sb-dark-border text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                {subj}
              </button>
            ))}
          </div>
        </div>

        {/* Notes Cards Grid */}
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-3">
            <Loader2 size={32} className="animate-spin text-sb-blue" />
            <p className="text-sm text-gray-500">Loading your notes library...</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="bg-white dark:bg-sb-dark-card p-12 text-center rounded-2xl border border-gray-100 dark:border-sb-dark-border space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-sb-blue">
              <UploadCloud size={28} />
            </div>
            <h3 className="text-base font-bold text-gray-800 dark:text-white">
              {searchQuery || selectedSubject !== 'all'
                ? 'No matching notes found'
                : 'No notes uploaded yet'}
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {searchQuery || selectedSubject !== 'all'
                ? 'Try adjusting your search query or subject filter.'
                : 'Upload your first lecture PDF or study notes to generate summaries, formulas, and flashcards.'}
            </p>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-5 py-2.5 bg-sb-blue text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition flex items-center gap-2 mx-auto shadow-md shadow-blue-500/20 active:scale-95"
            >
              <UploadCloud size={16} />
              Upload PDF Notes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDocs.map((doc) => (
              <div
                key={doc._id}
                onClick={() => handleOpenDoc(doc)}
                className="bg-white dark:bg-sb-dark-card rounded-2xl border border-gray-100 dark:border-sb-dark-border p-5 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between group hover:border-sb-blue/40"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase border ${
                        SUBJECT_COLORS[doc.subject] || SUBJECT_COLORS.general
                      }`}
                    >
                      {doc.subject}
                    </span>
                    <button
                      onClick={(e) => handleDelete(doc._id, e)}
                      className="p-1 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition opacity-0 group-hover:opacity-100"
                      title="Delete document"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-gray-900 dark:text-white group-hover:text-sb-blue transition line-clamp-1">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{doc.fileName}</p>
                  </div>

                  {/* Summary preview */}
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                    {doc.summary?.overview || 'Click to view full AI summary and flashcards.'}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-sb-dark-border flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <BookOpen size={13} />
                      {doc.pageCount || 1}p
                    </span>
                    <span className="flex items-center gap-1 text-sb-blue font-semibold">
                      <Layers size={13} />
                      {doc.flashcardCount || 0} cards
                    </span>
                  </div>

                  <span className="flex items-center gap-1 font-semibold text-sb-blue group-hover:translate-x-0.5 transition-transform">
                    Open Hub
                    <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STUDY HUB MODAL / DRAWER */}
        {selectedDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white dark:bg-sb-dark-card w-full max-w-5xl h-[92vh] rounded-3xl shadow-2xl border border-gray-100 dark:border-sb-dark-border flex flex-col overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-100 dark:border-sb-dark-border flex items-center justify-between flex-shrink-0 bg-gray-50/60 dark:bg-sb-dark-bg/40">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-sb-blue flex-shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                        {selectedDoc.title}
                      </h2>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border flex-shrink-0 ${
                          SUBJECT_COLORS[selectedDoc.subject] || SUBJECT_COLORS.general
                        }`}
                      >
                        {selectedDoc.subject}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {selectedDoc.fileName} • {selectedDoc.pageCount || 1} Pages • {selectedDoc.flashcardCount || 0} Flashcards
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedDoc(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-sb-dark-border transition flex-shrink-0"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center px-6 border-b border-gray-100 dark:border-sb-dark-border bg-white dark:bg-sb-dark-card flex-shrink-0 gap-6">
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`py-3.5 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
                    activeTab === 'summary'
                      ? 'border-sb-blue text-sb-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  <Sparkles size={16} />
                  AI Summary & Formulas
                </button>

                <button
                  onClick={() => setActiveTab('flashcards')}
                  className={`py-3.5 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
                    activeTab === 'flashcards'
                      ? 'border-sb-blue text-sb-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  <Layers size={16} />
                  Flashcards Deck ({docFlashcards.length})
                </button>

                <button
                  onClick={() => setActiveTab('chat')}
                  className={`py-3.5 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
                    activeTab === 'chat'
                      ? 'border-sb-blue text-sb-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  <MessageSquare size={16} />
                  Ask Notes AI (RAG)
                </button>
              </div>

              {/* Modal Content Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-sb-bg/40 dark:bg-sb-dark-bg/40">
                {activeTab === 'summary' && <NotesSummaryView document={selectedDoc} />}

                {activeTab === 'flashcards' && (
                  loadingFlashcards ? (
                    <div className="p-12 flex flex-col items-center justify-center space-y-2">
                      <Loader2 size={24} className="animate-spin text-sb-blue" />
                      <p className="text-xs text-gray-500">Loading flashcards...</p>
                    </div>
                  ) : (
                    <FlashcardDeck
                      documentId={selectedDoc._id}
                      initialCards={docFlashcards}
                      onCardsUpdated={(updated) => {
                        setDocFlashcards(updated);
                        setSelectedDoc((prev) => ({
                          ...prev,
                          flashcardCount: updated.length,
                        }));
                      }}
                    />
                  )
                )}

                {activeTab === 'chat' && <RagChat document={selectedDoc} />}
              </div>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        <NotesUploadModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onSuccess={(newDoc) => {
            setDocuments((prev) => [newDoc, ...prev]);
            handleOpenDoc(newDoc, 'summary');
          }}
        />
      </div>
    </PageTransition>
  );
}

