import React from 'react';
import { PrintJob, Region } from '../types';
import { formatCurrency } from '../services/dynamicPricing';
import { QrCodeSvg } from './QrCodeSvg';
import { 
  Printer, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  XCircle, 
  RotateCw, 
  Star, 
  FileText, 
  ShieldAlert, 
  Sparkles,
  ArrowRight,
  MapPin,
  Key
} from 'lucide-react';

interface JobTrackerViewProps {
  jobs: PrintJob[];
  currentRegion: Region;
  onCancelAndRefund: (jobId: string) => void;
  onOpenFeedback: (job: PrintJob) => void;
  onSimulatePrintProgress: (jobId: string) => void;
}

export const JobTrackerView: React.FC<JobTrackerViewProps> = ({
  jobs,
  currentRegion,
  onCancelAndRefund,
  onOpenFeedback,
  onSimulatePrintProgress,
}) => {
  const [filter, setFilter] = React.useState<'all' | 'active' | 'completed'>('active');

  const filteredJobs = jobs.filter((j) => {
    if (filter === 'active') return j.status === 'queued' || j.status === 'printing' || j.status === 'ready_for_pickup';
    if (filter === 'completed') return j.status === 'completed';
    return true;
  });

  const getStatusBadge = (status: PrintJob['status']) => {
    switch (status) {
      case 'printing':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
            Printing Now
          </span>
        );
      case 'ready_for_pickup':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Ready for Pickup
          </span>
        );
      case 'queued':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            In Spooler Queue
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
            Collected
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Cancelled & Refunded
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Title & Filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Live Print Spooler & Status Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time telemetry on your documents moving through cafe laser printers.
          </p>
        </div>

        {/* Filter segmented buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80 self-start sm:self-auto">
          {(['active', 'completed', 'all'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize cursor-pointer ${
                filter === tab
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'active' ? 'Active Jobs' : tab === 'completed' ? 'Collected History' : 'All Orders'}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <Printer className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No {filter} print jobs found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            Upload your first document from the Kiosk tab to track its live printing progress here.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Refresh Queue
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredJobs.map((job) => {
            const isFinished = job.status === 'ready_for_pickup' || job.status === 'completed';
            const isPrinting = job.status === 'printing';
            const isQueued = job.status === 'queued';

            return (
              <div
                key={job.id}
                className={`bg-white rounded-2xl border transition-all shadow-xs overflow-hidden ${
                  isPrinting
                    ? 'border-indigo-300 ring-2 ring-indigo-500/10'
                    : isFinished
                    ? 'border-emerald-200/90'
                    : 'border-slate-200'
                }`}
              >
                {/* Header row */}
                <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/40">
                  <div className="flex items-start sm:items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        isPrinting
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : isFinished
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Printer className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-sm text-slate-900">
                          {job.id}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs font-semibold text-slate-700">
                          {job.customerName}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-500 font-mono">
                          {job.stationId}
                        </span>
                        <span className="text-slate-300">·</span>
                        {getStatusBadge(job.status)}
                      </div>

                      <div className="text-xs text-slate-600 mt-1 flex items-center gap-2 font-medium">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-800">{job.document.name}</span>
                        <span className="text-slate-400">·</span>
                        <span>
                          {job.totalPages} pages ({job.preferences.colorMode.toUpperCase()})
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="font-mono text-slate-900">
                          {formatCurrency(job.quote.totalPriceUSD, currentRegion)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Top Right: Hardware Bay & Pickup PIN */}
                  <div className="flex items-center gap-3 self-end md:self-auto">
                    {/* Pickup PIN Callout */}
                    <div className="bg-amber-50 border border-amber-200/90 rounded-xl px-3 py-1.5 text-center">
                      <div className="text-[10px] font-semibold text-amber-800 flex items-center gap-1 justify-center">
                        <Key className="w-3 h-3" />
                        <span>PICKUP PIN</span>
                      </div>
                      <div className="font-mono font-extrabold text-base text-amber-950 tracking-wider">
                        {job.pickupPin}
                      </div>
                    </div>

                    {/* Printer Bay Info */}
                    <div className="hidden sm:block text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Assigned Hardware</div>
                      <div className="text-xs font-bold text-slate-800">{job.assignedPrinterName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 justify-end">
                        <MapPin className="w-3 h-3 text-indigo-500" />
                        <span>{job.pickupTray}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Body: Live Pipeline Visualizer */}
                <div className="p-5 sm:p-6 space-y-6">
                  {/* Step pipeline indicator */}
                  <div className="relative">
                    <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
                      {[
                        {
                          title: '1. Spooled',
                          desc: 'File parsed & verified',
                          active: true,
                          complete: true,
                        },
                        {
                          title: '2. Payment Debited',
                          desc: 'Wallet transaction verified',
                          active: true,
                          complete: true,
                        },
                        {
                          title: '3. Laser Printing',
                          desc: isPrinting
                            ? `Sheet ${job.currentPrintingPage} of ${job.totalPages}`
                            : isFinished
                            ? 'All sheets completed'
                            : 'Waiting in spooler',
                          active: isPrinting || isFinished,
                          complete: isFinished,
                        },
                        {
                          title: '4. Tray Ready',
                          desc: isFinished ? job.pickupTray : 'Awaiting completion',
                          active: isFinished,
                          complete: job.status === 'completed',
                        },
                      ].map((step, sIdx) => (
                        <div
                          key={sIdx}
                          className={`p-3 rounded-xl border text-center transition-colors ${
                            step.complete
                              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                              : step.active
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-950 ring-1 ring-indigo-400'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                        >
                          <div className="text-xs font-bold">{step.title}</div>
                          <div className="text-[11px] mt-0.5 opacity-80">{step.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Printing Progress Bar & Live Feed */}
                  {isPrinting && (
                    <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                          <span className="font-semibold text-slate-200">
                            Printing in progress: {job.assignedPrinterName}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-emerald-400 text-sm">
                          {job.progressPercent}% ({job.currentPrintingPage}/{job.totalPages} sheets)
                        </span>
                      </div>

                      {/* Animated Progress Bar */}
                      <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-linear-to-r from-indigo-500 via-purple-500 to-emerald-400 h-full rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${job.progressPercent}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>Speed: 38 PPM Laser Engine</span>
                        <span>Estimated time remaining: ~{job.estimatedWaitSeconds}s</span>
                      </div>
                    </div>
                  )}

                  {/* Ready for Pickup Celebration & QR Code */}
                  {job.status === 'ready_for_pickup' && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                          <CheckCircle2 className="w-7 h-7" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                            <span>Your prints are ready!</span>
                            <Sparkles className="w-4 h-4 text-amber-500" />
                          </div>
                          <p className="text-xs text-emerald-800 mt-0.5">
                            Collect at <strong className="underline">{job.pickupTray}</strong>. Use PIN <strong className="font-mono text-sm bg-white px-2 py-0.5 rounded border border-emerald-300">{job.pickupPin}</strong> or show this QR to the desk attendant.
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-3">
                        <QrCodeSvg value={`NETPRINT-COLLECT-${job.id}-${job.pickupPin}`} size={85} />
                      </div>
                    </div>
                  )}

                  {/* Interactive Action Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      {isQueued && (
                        <button
                          onClick={() => onCancelAndRefund(job.id)}
                          className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel Job & Refund Wallet</span>
                        </button>
                      )}

                      {/* Fast Simulate Progress Button for Testing */}
                      {(isQueued || isPrinting) && (
                        <button
                          onClick={() => onSimulatePrintProgress(job.id)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                          title="Simulate printer advancement"
                        >
                          <RotateCw className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Step Print Simulation</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Leave Feedback CTA */}
                      {isFinished && !job.feedback && (
                        <button
                          onClick={() => onOpenFeedback(job)}
                          className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Star className="w-3.5 h-3.5 fill-white" />
                          <span>Leave 5-Star Rating</span>
                        </button>
                      )}

                      {job.feedback && (
                        <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                          <div className="flex">
                            {Array.from({ length: job.feedback.rating }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-500 text-amber-500" />
                            ))}
                          </div>
                          <span>Feedback Recorded</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
