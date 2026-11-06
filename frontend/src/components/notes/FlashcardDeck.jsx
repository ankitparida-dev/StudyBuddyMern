import { useState, useEffect, useCallback } from 'react';
import {
  RotateCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Shuffle,
  RefreshCw,
  Sparkles,
  LayoutGrid,
  Maximize2,
  HelpCircle,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { documentApi } from '../../utils/api';

export default function FlashcardDeck({ documentId, initialCards = [], onCardsUpdated }) {
  const [cards, setCards] = useState(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'unmastered', 'mastered'
  const [viewMode, setViewMode] = useState('focus'); // 'focus' or 'grid'
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    setCards(initialCards);
  }, [initialCards]);

  const filteredCards = cards.filter((c) => {
    if (filter === 'mastered') return c.mastered;
    if (filter === 'unmastered') return !c.mastered;
    return true;
  });

  const currentCard = filteredCards[currentIndex] || null;

  const handleNext = useCallback(() => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  }, [filteredCards.length]);

  const handlePrev = useCallback(() => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  }, [filteredCards.length]);

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (viewMode !== 'focus') return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, viewMode]);

  const toggleMaster = async (cardId, e) => {
    if (e) e.stopPropagation();
    const targetCard = cards.find((c) => c._id === cardId);
    if (!targetCard) return;

    const newMastered = !targetCard.mastered;

    // Optimistic UI update
    const updatedCards = cards.map((c) =>
      c._id === cardId ? { ...c, mastered: newMastered } : c
    );
    setCards(updatedCards);
    if (onCardsUpdated) onCardsUpdated(updatedCards);

    try {
      await documentApi.toggleMasterCard(cardId, newMastered);
      toast.success(newMastered ? 'Marked as Mastered! 🎉' : 'Marked for Review');
    } catch (err) {
      toast.error('Failed to update card status');
      setCards(cards); // Revert
    }
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    toast.success('Flashcard deck shuffled! 🔀');
  };

  const handleRegenerate = async () => {
    if (!documentId) return;
    if (!window.confirm('Regenerate a brand new set of flashcards from the notes?')) return;

    setIsRegenerating(true);
    try {
      const res = await documentApi.regenerateFlashcards(documentId);
      setCards(res.flashcards || []);
      setCurrentIndex(0);
      setIsFlipped(false);
      if (onCardsUpdated) onCardsUpdated(res.flashcards);
      toast.success(res.message || 'New flashcards generated!');
    } catch (err) {
      toast.error(err.message || 'Failed to regenerate flashcards');
    } finally {
      setIsRegenerating(false);
    }
  };

  const masteredCount = cards.filter((c) => c.mastered).length;
  const progressPercent = cards.length ? Math.round((masteredCount / cards.length) * 100) : 0;

  const difficultyColors = {
    easy: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    medium: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    hard: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border-red-200 dark:border-red-800',
  };

  if (!cards || cards.length === 0) {
    return (
      <div className="bg-white dark:bg-sb-dark-card p-12 text-center rounded-2xl border border-gray-100 dark:border-sb-dark-border space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-sb-blue">
          <Sparkles size={28} />
        </div>
        <h3 className="text-base font-bold text-gray-800 dark:text-white">
          No Flashcards Found
        </h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          Flashcards can be generated directly from your note's key concepts and formulas.
        </p>
        <button
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="px-4 py-2 bg-sb-blue text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition flex items-center gap-2 mx-auto"
        >
          <RefreshCw size={14} className={isRegenerating ? 'animate-spin' : ''} />
          {isRegenerating ? 'Generating...' : 'Generate Flashcards Now'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Deck Controls Header */}
      <div className="bg-white dark:bg-sb-dark-card p-4 rounded-2xl border border-gray-100 dark:border-sb-dark-border shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Progress bar and count */}
        <div className="flex items-center gap-4 min-w-[200px]">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
              <span>Mastery Progress</span>
              <span className="text-sb-blue">
                {masteredCount} / {cards.length} ({progressPercent}%)
              </span>
            </div>
            <div className="w-36 bg-gray-100 dark:bg-gray-700 rounded-full h-2 mt-1 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Pills */}
          <div className="flex items-center bg-gray-100 dark:bg-sb-dark-bg p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => {
                setFilter('all');
                setCurrentIndex(0);
              }}
              className={`px-3 py-1 rounded-lg transition ${
                filter === 'all'
                  ? 'bg-white dark:bg-sb-dark-card text-sb-blue shadow-sm font-bold'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              All ({cards.length})
            </button>
            <button
              onClick={() => {
                setFilter('unmastered');
                setCurrentIndex(0);
              }}
              className={`px-3 py-1 rounded-lg transition ${
                filter === 'unmastered'
                  ? 'bg-white dark:bg-sb-dark-card text-sb-blue shadow-sm font-bold'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              Review ({cards.length - masteredCount})
            </button>
            <button
              onClick={() => {
                setFilter('mastered');
                setCurrentIndex(0);
              }}
              className={`px-3 py-1 rounded-lg transition ${
                filter === 'mastered'
                  ? 'bg-white dark:bg-sb-dark-card text-sb-blue shadow-sm font-bold'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              Mastered ({masteredCount})
            </button>
          </div>

          {/* Shuffle button */}
          <button
            onClick={handleShuffle}
            title="Shuffle deck"
            className="p-2 text-gray-500 hover:text-sb-blue hover:bg-gray-100 dark:hover:bg-sb-dark-border rounded-xl transition"
          >
            <Shuffle size={16} />
          </button>

          {/* Regenerate Deck button */}
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            title="Regenerate cards with AI"
            className="p-2 text-gray-500 hover:text-sb-blue hover:bg-gray-100 dark:hover:bg-sb-dark-border rounded-xl transition"
          >
            <RefreshCw size={16} className={isRegenerating ? 'animate-spin text-sb-blue' : ''} />
          </button>

          {/* View mode toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-sb-dark-bg p-1 rounded-xl">
            <button
              onClick={() => setViewMode('focus')}
              title="Focus Flashcard Player"
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'focus'
                  ? 'bg-white dark:bg-sb-dark-card text-sb-blue shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Maximize2 size={15} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              title="Grid View"
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-sb-dark-card text-sb-blue shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <LayoutGrid size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* FOCUS / 3D FLIP MODE */}
      {viewMode === 'focus' ? (
        filteredCards.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-sb-dark-card rounded-2xl border border-gray-100 dark:border-sb-dark-border">
            <p className="text-sm text-gray-500">No cards match the "{filter}" filter.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            {/* Card Frame */}
            <div
              onClick={handleFlip}
              className="w-full max-w-xl h-80 sm:h-96 cursor-pointer select-none perspective-1000 group"
            >
              <div
                className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* FRONT SIDE (QUESTION) */}
                <div className="absolute inset-0 w-full h-full backface-hidden bg-white dark:bg-sb-dark-card rounded-3xl p-8 border-2 border-gray-100 dark:border-sb-dark-border shadow-lg flex flex-col justify-between hover:border-sb-blue/40 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-50 dark:bg-blue-900/30 text-sb-blue uppercase">
                        Question
                      </span>
                      <span className="text-xs text-gray-400">
                        {currentCard.topic || 'General'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${
                          difficultyColors[currentCard.difficulty || 'medium']
                        }`}
                      >
                        {currentCard.difficulty || 'medium'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => toggleMaster(currentCard._id, e)}
                        className={`p-1.5 rounded-full transition ${
                          currentCard.mastered
                            ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                            : 'text-gray-300 hover:text-emerald-500'
                        }`}
                        title={currentCard.mastered ? 'Mastered' : 'Mark as mastered'}
                      >
                        {currentCard.mastered ? (
                          <CheckCircle2 size={20} className="fill-emerald-500 text-white" />
                        ) : (
                          <Circle size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="my-auto text-center px-4">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-relaxed">
                      {currentCard.front}
                    </h3>
                  </div>

                  {/* Footer hint */}
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-50 dark:border-sb-dark-border">
                    <span className="flex items-center gap-1">
                      <RotateCw size={13} />
                      Click or press Space to reveal answer
                    </span>
                    <span>
                      {currentIndex + 1} of {filteredCards.length}
                    </span>
                  </div>
                </div>

                {/* BACK SIDE (ANSWER) */}
                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-blue-50/50 dark:bg-sb-dark-card rounded-3xl p-8 border-2 border-sb-blue/50 shadow-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 uppercase">
                        Answer & Explanation
                      </span>
                      <span className="text-xs text-gray-400">
                        {currentCard.topic || 'General'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => toggleMaster(currentCard._id, e)}
                      className={`p-1.5 rounded-full transition ${
                        currentCard.mastered
                          ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                          : 'text-gray-300 hover:text-emerald-500'
                      }`}
                      title={currentCard.mastered ? 'Mastered' : 'Mark as mastered'}
                    >
                      {currentCard.mastered ? (
                        <CheckCircle2 size={20} className="fill-emerald-500 text-white" />
                      ) : (
                        <Circle size={20} />
                      )}
                    </button>
                  </div>

                  {/* Answer Content */}
                  <div className="my-auto text-center px-4 overflow-y-auto max-h-48 py-2">
                    <p className="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">
                      {currentCard.back}
                    </p>
                  </div>

                  {/* Footer hint */}
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-blue-100 dark:border-sb-dark-border">
                    <span className="flex items-center gap-1">
                      <RotateCw size={13} />
                      Click to flip back to question
                    </span>
                    <span>
                      {currentIndex + 1} of {filteredCards.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={handlePrev}
                className="p-3 rounded-2xl bg-white dark:bg-sb-dark-card border border-gray-200 dark:border-sb-dark-border text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-sb-dark-border shadow-sm transition active:scale-95"
                title="Previous card (Left Arrow)"
              >
                <ChevronLeft size={20} />
              </button>

              <button
                onClick={handleFlip}
                className="px-6 py-2.5 rounded-2xl bg-sb-blue text-white font-semibold text-sm shadow-md shadow-blue-500/20 hover:bg-blue-600 transition active:scale-95 flex items-center gap-2"
              >
                <RotateCw size={15} />
                Flip Card
              </button>

              <button
                onClick={handleNext}
                className="p-3 rounded-2xl bg-white dark:bg-sb-dark-card border border-gray-200 dark:border-sb-dark-border text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-sb-dark-border shadow-sm transition active:scale-95"
                title="Next card (Right Arrow)"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )
      ) : (
        /* GRID VIEW MODE */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map((card, idx) => (
            <div
              key={card._id || idx}
              className={`p-5 rounded-2xl border transition bg-white dark:bg-sb-dark-card flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md ${
                card.mastered
                  ? 'border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/20'
                  : 'border-gray-100 dark:border-sb-dark-border'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-400">Card #{idx + 1}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-bold uppercase rounded border ${
                        difficultyColors[card.difficulty || 'medium']
                      }`}
                    >
                      {card.difficulty || 'medium'}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleMaster(card._id)}
                      className={`p-1 rounded-full transition ${
                        card.mastered ? 'text-emerald-500' : 'text-gray-300 hover:text-emerald-500'
                      }`}
                    >
                      {card.mastered ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                    </button>
                  </div>
                </div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white leading-snug">
                  {card.front}
                </h4>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-sb-dark-border text-xs text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50/50 dark:bg-sb-dark-bg/40 p-3 rounded-xl">
                <span className="font-semibold text-sb-blue block mb-1">Answer:</span>
                {card.back}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

