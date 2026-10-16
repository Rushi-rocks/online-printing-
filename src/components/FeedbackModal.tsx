import React from 'react';
import { PrintJob, JobFeedback } from '../types';
import { X, Star, Check, Sparkles, MessageSquare } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FeedbackModalProps {
  job: PrintJob | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitFeedback: (feedback: JobFeedback) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  job,
  isOpen,
  onClose,
  onSubmitFeedback,
}) => {
  const [rating, setRating] = React.useState<number>(5);
  const [hoverRating, setHoverRating] = React.useState<number>(0);
  const [selectedTags, setSelectedTags] = React.useState<string[]>([
    'Sharp Clarity',
    'Fast Turnaround',
  ]);
  const [comment, setComment] = React.useState<string>('');

  if (!isOpen || !job) return null;

  const availableTags = [
    'Sharp Clarity',
    'Fast Turnaround',
    'Affordable Rate',
    'Clean Duplex',
    'Paper Quality',
    'Easy QR Scan',
    'Accurate Colors',
    'No Wait Time',
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fb: JobFeedback = {
      jobId: job.id,
      rating,
      tags: selectedTags,
      comment: comment.trim() || 'Great printing experience at the cafe!',
      customerName: job.customerName,
      submittedAt: Date.now(),
    };

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });

    onSubmitFeedback(fb);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Rate Your Print Service</h3>
              <p className="text-[11px] text-slate-500 font-mono">Job {job.id} · {job.assignedPrinterName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 5-Star interactive picker */}
          <div className="text-center py-2">
            <label className="text-xs font-semibold text-slate-700 block mb-2">
              Overall Experience & Print Fidelity
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110 cursor-pointer"
                >
                  <Star
                    className={`w-8 h-8 ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="text-xs font-medium text-slate-600 mt-1">
              {rating === 5 && 'Outstanding · Studio Grade!'}
              {rating === 4 && 'Very Good · High Quality'}
              {rating === 3 && 'Average · Acceptable'}
              {rating === 2 && 'Needs Improvement'}
              {rating === 1 && 'Unsatisfactory'}
            </div>
          </div>

          {/* Quality Dimensions Tags */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">
              What did you like most?
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-amber-700" />}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comment text area */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Comments or Attendant Suggestions
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Paper thickness was great, loved the fast QR code upload..."
              className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Submit 5-Star Feedback</span>
          </button>
        </form>
      </div>
    </div>
  );
};
