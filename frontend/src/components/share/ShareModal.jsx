import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { X, Download, Loader2, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ShareCard from './ShareCard';

export default function ShareModal({ isOpen, onClose, user, stats, insight }) {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!cardRef.current || downloading) return;

    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error('Failed to generate image');
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `studybuddy-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Card downloaded! Share it 📸');
      }, 'image/png');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate card');
    } finally {
      setDownloading(false);
    }
  };

  const handleNativeShare = async () => {
    if (!cardRef.current) return;

    if (!navigator.share) {
      toast.error('Sharing not supported. Download instead.');
      return;
    }

    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'studybuddy-card.png', {
          type: 'image/png',
        });

        try {
          await navigator.share({
            files: [file],
            title: 'My StudyBuddy progress',
            text: `I'm on a ${stats.streak}-day study streak on StudyBuddy! 📚🔥`,
          });
          toast.success('Shared!');
        } catch (err) {
          if (err.name !== 'AbortError') {
            toast.error('Share cancelled');
          }
        }
      }, 'image/png');
    } catch (err) {
      toast.error('Failed to share');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-sb-dark-card rounded-3xl shadow-2xl max-w-lg w-full my-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white dark:bg-sb-dark-bg dark:hover:bg-sb-dark-border rounded-full text-gray-600 dark:text-sb-dark-text transition"
          title="Close"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="p-6 pb-4">
          <h2 className="text-xl font-bold dark:text-sb-dark-text">
            Share your progress 📸
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Download and share on Instagram, LinkedIn, or WhatsApp
          </p>
        </div>

        {/* Card preview — scaled down for display */}
        <div className="flex justify-center bg-sb-bg dark:bg-sb-dark-bg py-6 overflow-hidden">
          <div
            style={{
              transform: 'scale(0.62)',
              transformOrigin: 'top center',
              height: '446px',
              width: '335px',
            }}
          >
            <ShareCard
              ref={cardRef}
              user={user}
              stats={stats}
              insight={insight}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleNativeShare}
            disabled={downloading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-sb-blue text-sb-blue font-semibold hover:bg-sb-blue/10 transition disabled:opacity-50"
          >
            <Share2 size={18} /> Share
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-sb-blue text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {downloading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Download size={18} />
            )}
            {downloading ? 'Generating...' : 'Download'}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 pb-5">
          Tip: On mobile, use "Share" to post directly. On desktop, use
          "Download" then upload.
        </p>
      </div>
    </div>
  );
}