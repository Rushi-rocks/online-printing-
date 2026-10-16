import React from 'react';
import { JobFeedback, Region } from '../types';
import { 
  Star, 
  ThumbsUp, 
  Award, 
  MessageSquare, 
  TrendingUp, 
  CheckCircle2, 
  Filter,
  ShieldCheck
} from 'lucide-react';

interface FeedbackViewProps {
  feedbacks: JobFeedback[];
  currentRegion: Region;
  onOpenNewFeedback: () => void;
}

export const FeedbackView: React.FC<FeedbackViewProps> = ({
  feedbacks,
  currentRegion,
  onOpenNewFeedback,
}) => {
  const [selectedRating, setSelectedRating] = React.useState<number | 'all'>('all');

  const filteredFeedbacks = feedbacks.filter((fb) => {
    if (selectedRating === 'all') return true;
    return fb.rating === selectedRating;
  });

  const totalReviews = feedbacks.length;
  const avgRating = totalReviews > 0
    ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / totalReviews).toFixed(1)
    : '5.0';

  const fiveStarCount = feedbacks.filter((f) => f.rating === 5).length;
  const fourStarCount = feedbacks.filter((f) => f.rating === 4).length;
  const threeStarCount = feedbacks.filter((f) => f.rating === 3).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            <span>QUALITY CONTROL & CSAT AUDIT · {currentRegion.name}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Customer Service Quality & 5-Star Ratings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Auditing print fidelity, turnaround speed, and customer satisfaction across cyber cafe branches.
          </p>
        </div>

        <button
          onClick={onOpenNewFeedback}
          className="self-start md:self-auto px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Star className="w-4 h-4 fill-white" />
          <span>Submit Service Review</span>
        </button>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
        {/* Scorecard */}
        <div className="md:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Customer Satisfaction Index</div>
            <div className="flex items-baseline gap-3 my-2">
              <span className="font-mono text-4xl font-extrabold text-slate-900 tabular-nums">
                {avgRating}
              </span>
              <span className="text-slate-400 font-mono text-sm">/ 5.0</span>
            </div>
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= Math.round(Number(avgRating))
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300'
                  }`}
                />
              ))}
              <span className="text-xs text-slate-500 ml-2 font-mono">
                ({totalReviews} verified ratings)
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-emerald-600 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>98.4% of jobs meet SLA Quality Benchmarks</span>
          </div>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="md:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-2">
          <div className="text-xs font-semibold text-slate-700 mb-3">Rating Breakdown</div>
          
          {/* 5 Star */}
          <div className="flex items-center gap-3 text-xs">
            <span className="font-mono text-slate-600 w-12 flex items-center gap-1">
              5 <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
            </span>
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full"
                style={{ width: `${(fiveStarCount / (totalReviews || 1)) * 100}%` }}
              ></div>
            </div>
            <span className="font-mono text-slate-500 text-[11px] w-8 text-right">
              {fiveStarCount}
            </span>
          </div>

          {/* 4 Star */}
          <div className="flex items-center gap-3 text-xs">
            <span className="font-mono text-slate-600 w-12 flex items-center gap-1">
              4 <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
            </span>
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full"
                style={{ width: `${(fourStarCount / (totalReviews || 1)) * 100}%` }}
              ></div>
            </div>
            <span className="font-mono text-slate-500 text-[11px] w-8 text-right">
              {fourStarCount}
            </span>
          </div>

          {/* 3 Star */}
          <div className="flex items-center gap-3 text-xs">
            <span className="font-mono text-slate-600 w-12 flex items-center gap-1">
              3 <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
            </span>
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full"
                style={{ width: `${(threeStarCount / (totalReviews || 1)) * 100}%` }}
              ></div>
            </div>
            <span className="font-mono text-slate-500 text-[11px] w-8 text-right">
              {threeStarCount}
            </span>
          </div>
        </div>

        {/* Quality Dimensions Pillar */}
        <div className="md:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div className="text-xs font-semibold text-slate-700 mb-2">Quality Control Tags</div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Sharp Laser Clarity', score: '99%' },
              { label: 'Turnaround Under 2 Min', score: '96%' },
              { label: 'Accurate Color Calibration', score: '97%' },
              { label: 'Duplex Eco Alignment', score: '98%' },
              { label: 'QR Scan Speed', score: '100%' },
            ].map((dim) => (
              <span
                key={dim.label}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg"
              >
                <span>{dim.label}:</span>
                <strong className="font-mono text-indigo-700">{dim.score}</strong>
              </span>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Regularly audited by cafe floor supervisor</span>
          </div>
        </div>
      </div>

      {/* Review Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Customer Feedback Stream</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live responses logged from kiosk terminals and mobile pickup confirmations.
            </p>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setSelectedRating('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                selectedRating === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedRating(5)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                selectedRating === 5
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              5 Stars Only
            </button>
            <button
              onClick={() => setSelectedRating(4)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                selectedRating === 4
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              4 Stars Only
            </button>
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-slate-100">
          {filteredFeedbacks.map((fb, idx) => (
            <div key={idx} className="p-5 hover:bg-slate-50/50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                    {fb.customerName.charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900">{fb.customerName}</span>
                    <span className="text-slate-400 text-xs ml-2 font-mono">Job {fb.jobId}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: fb.rating }).map((_, s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(fb.submittedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 my-2">
                {fb.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <p className="text-xs text-slate-700 mt-1">"{fb.comment}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
