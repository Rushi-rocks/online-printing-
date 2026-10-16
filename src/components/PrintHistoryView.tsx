import React from 'react';
import { PrintJob, Region, PrintPreferences, UploadedDocument } from '../types';
import { formatCurrency, calculateDynamicQuote } from '../services/dynamicPricing';
import { 
  Clock, 
  RotateCw, 
  FileText, 
  IndianRupee, 
  TrendingUp, 
  Layers, 
  Calendar, 
  CheckCircle2, 
  Download, 
  Search, 
  SlidersHorizontal, 
  Receipt, 
  Sparkles, 
  ArrowUpRight, 
  Leaf, 
  Star,
  Printer,
  ChevronRight,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PrintHistoryViewProps {
  jobs: PrintJob[];
  currentRegion: Region;
  walletBalanceUSD: number;
  onReorderJob: (doc: UploadedDocument, prefs: PrintPreferences, customerName: string) => void;
  onOpenFeedback: (job: PrintJob) => void;
  onOpenTopUp: () => void;
}

interface MonthlySummary {
  monthKey: string; // "YYYY-MM"
  monthName: string; // e.g. "October 2026"
  totalSpendUSD: number;
  totalSpendLocal: number;
  totalJobs: number;
  totalPages: number;
  bwPages: number;
  colorPages: number;
  sheetsSavedDuplex: number;
  moneySavedDuplexUSD: number;
  moneySavedDuplexLocal: number;
  avgCostPerPageLocal: number;
}

export const PrintHistoryView: React.FC<PrintHistoryViewProps> = ({
  jobs,
  currentRegion,
  walletBalanceUSD,
  onReorderJob,
  onOpenFeedback,
  onOpenTopUp,
}) => {
  const [selectedMonth, setSelectedMonth] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [colorFilter, setColorFilter] = React.useState<'all' | 'bw' | 'color'>('all');
  const [receiptJob, setReceiptJob] = React.useState<PrintJob | null>(null);
  
  // Customize & Reorder modal state
  const [customizeJob, setCustomizeJob] = React.useState<PrintJob | null>(null);
  const [customCopies, setCustomCopies] = React.useState<number>(1);
  const [customColor, setCustomColor] = React.useState<'bw' | 'color'>('bw');
  const [customDuplex, setCustomDuplex] = React.useState<'single' | 'duplex_long' | 'duplex_short'>('duplex_long');
  const [customPaper, setCustomPaper] = React.useState<'A4' | 'A3' | 'Letter' | 'Legal' | 'Photo_4x6'>('A4');

  // Filter completed or ready jobs for print history
  const historyJobs = React.useMemo(() => {
    return jobs.filter((j) => j.status === 'completed' || j.status === 'ready_for_pickup');
  }, [jobs]);

  // Group and compute monthly cost analysis
  const monthlySummaries = React.useMemo(() => {
    const map = new Map<string, {
      monthKey: string;
      dateObj: Date;
      totalSpendUSD: number;
      totalSpendLocal: number;
      totalJobs: number;
      totalPages: number;
      bwPages: number;
      colorPages: number;
      sheetsSavedDuplex: number;
      moneySavedDuplexUSD: number;
      moneySavedDuplexLocal: number;
    }>();

    for (const job of historyJobs) {
      const d = new Date(job.completedAt || job.createdAt);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const key = `${year}-${month}`;

      if (!map.has(key)) {
        map.set(key, {
          monthKey: key,
          dateObj: d,
          totalSpendUSD: 0,
          totalSpendLocal: 0,
          totalJobs: 0,
          totalPages: 0,
          bwPages: 0,
          colorPages: 0,
          sheetsSavedDuplex: 0,
          moneySavedDuplexUSD: 0,
          moneySavedDuplexLocal: 0,
        });
      }

      const rec = map.get(key)!;
      rec.totalSpendUSD += job.quote.totalPriceUSD;
      rec.totalSpendLocal += job.quote.totalPriceLocal;
      rec.totalJobs += 1;
      rec.totalPages += job.totalPages;

      if (job.preferences.colorMode === 'color') {
        rec.colorPages += job.totalPages;
      } else {
        rec.bwPages += job.totalPages;
      }

      if (job.preferences.duplex !== 'single') {
        const savedSheets = Math.floor(job.totalPages / 2);
        rec.sheetsSavedDuplex += savedSheets;
        // ~15% savings
        const savedUSD = job.quote.totalPriceUSD * 0.15;
        rec.moneySavedDuplexUSD += savedUSD;
        rec.moneySavedDuplexLocal += Math.round(savedUSD * currentRegion.exchangeRateToUSD);
      }
    }

    const result: MonthlySummary[] = [];
    // Sort keys descending
    const sortedKeys = Array.from(map.keys()).sort().reverse();

    for (const key of sortedKeys) {
      const data = map.get(key)!;
      const monthName = data.dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
      const avgCostPerPageLocal = data.totalPages > 0 
        ? Number((data.totalSpendLocal / data.totalPages).toFixed(1)) 
        : 0;

      result.push({
        monthKey: key,
        monthName,
        totalSpendUSD: data.totalSpendUSD,
        totalSpendLocal: data.totalSpendLocal,
        totalJobs: data.totalJobs,
        totalPages: data.totalPages,
        bwPages: data.bwPages,
        colorPages: data.colorPages,
        sheetsSavedDuplex: data.sheetsSavedDuplex,
        moneySavedDuplexUSD: data.moneySavedDuplexUSD,
        moneySavedDuplexLocal: data.moneySavedDuplexLocal,
        avgCostPerPageLocal,
      });
    }

    return result;
  }, [historyJobs, currentRegion]);

  // Overall aggregates
  const allTimeSpendLocal = monthlySummaries.reduce((acc, m) => acc + m.totalSpendLocal, 0);
  const allTimePages = monthlySummaries.reduce((acc, m) => acc + m.totalPages, 0);
  const allTimeSheetsSaved = monthlySummaries.reduce((acc, m) => acc + m.sheetsSavedDuplex, 0);
  const allTimeMoneySavedLocal = monthlySummaries.reduce((acc, m) => acc + m.moneySavedDuplexLocal, 0);

  // Filter jobs based on user controls
  const filteredJobs = React.useMemo(() => {
    return historyJobs.filter((job) => {
      // Month filter
      if (selectedMonth !== 'all') {
        const d = new Date(job.completedAt || job.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (key !== selectedMonth) return false;
      }

      // Color filter
      if (colorFilter !== 'all' && job.preferences.colorMode !== colorFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = job.document.name.toLowerCase().includes(q);
        const matchesId = job.id.toLowerCase().includes(q);
        const matchesCustomer = job.customerName.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesCustomer) return false;
      }

      return true;
    });
  }, [historyJobs, selectedMonth, colorFilter, searchQuery]);

  // Open Customize modal
  const handleOpenCustomize = (job: PrintJob) => {
    setCustomizeJob(job);
    setCustomCopies(job.preferences.copies || 1);
    setCustomColor(job.preferences.colorMode);
    setCustomDuplex(job.preferences.duplex);
    setCustomPaper(job.preferences.paperSize);
  };

  // Submit Customize & Reorder
  const handleSubmitCustomizeReorder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customizeJob) return;

    const updatedPrefs: PrintPreferences = {
      ...customizeJob.preferences,
      copies: customCopies,
      colorMode: customColor,
      duplex: customDuplex,
      paperSize: customPaper,
    };

    onReorderJob(customizeJob.document, updatedPrefs, customizeJob.customerName);
    setCustomizeJob(null);
  };

  // Instant 1-Click Reorder
  const handleInstantReorder = (job: PrintJob) => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
    onReorderJob(job.document, job.preferences, job.customerName);
  };

  // Export CSV summary
  const handleExportCSV = () => {
    const headers = 'Job ID,Date,Document Name,Pages,Color,Paper,Duplex,Cost (Local),PIN\n';
    const rows = filteredJobs
      .map((j) => {
        const dateStr = new Date(j.completedAt || j.createdAt).toISOString().split('T')[0];
        return `"${j.id}","${dateStr}","${j.document.name.replace(/"/g, '""')}",${j.totalPages},"${j.preferences.colorMode}","${j.preferences.paperSize}","${j.preferences.duplex}",${j.quote.totalPriceLocal},"${j.pickupPin}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `NetPrint_Expense_History_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            <Receipt className="w-4 h-4 text-emerald-600" />
            <span>ACCOUNT PRINT HISTORY & EXPENSE AUDIT · {currentRegion.name}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Print History & Monthly Cost Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review completed print jobs, analyze monthly expenditures in {currentRegion.currencySymbol} {currentRegion.currencyCode}, and re-order prints with 1 click.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            title="Export CSV expense report"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Monthly Statement</span>
          </button>
        </div>
      </div>

      {/* Monthly Cost Analysis Dashboard */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mb-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-slate-900 text-sm">Monthly Expenditure & Savings Summary</h2>
          </div>

          {/* Month selector dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Analyze Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
            >
              <option value="all">All Months Combined ({allTimePages} pages)</option>
              {monthlySummaries.map((m) => (
                <option key={m.monthKey} value={m.monthKey}>
                  {m.monthName} ({currentRegion.currencySymbol}{m.totalSpendLocal.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 4 Key Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Spend */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              {selectedMonth === 'all' ? 'All-Time Spend' : 'Monthly Spend'}
            </span>
            <div className="font-mono text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
              {currentRegion.currencySymbol}
              {(selectedMonth === 'all'
                ? allTimeSpendLocal
                : (monthlySummaries.find((m) => m.monthKey === selectedMonth)?.totalSpendLocal || 0)
              ).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {selectedMonth === 'all' ? `${historyJobs.length} completed orders` : 'Calculated at dynamic rates'}
            </div>
          </div>

          {/* Total Pages */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Total Pages Produced
            </span>
            <div className="font-mono text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
              {(selectedMonth === 'all'
                ? allTimePages
                : (monthlySummaries.find((m) => m.monthKey === selectedMonth)?.totalPages || 0)
              )}{' '}
              <span className="text-xs font-normal text-slate-500">sheets</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              B&W & CMYK laser output
            </div>
          </div>

          {/* Duplex Eco Savings */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block flex items-center gap-1">
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              <span>Eco Duplex Benefit</span>
            </span>
            <div className="font-mono text-2xl font-extrabold text-emerald-950 mt-1 tabular-nums">
              {currentRegion.currencySymbol}
              {(selectedMonth === 'all'
                ? allTimeMoneySavedLocal
                : (monthlySummaries.find((m) => m.monthKey === selectedMonth)?.moneySavedDuplexLocal || 0)
              ).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-emerald-800 mt-1">
              Saved{' '}
              <strong className="font-mono font-bold">
                {selectedMonth === 'all'
                  ? allTimeSheetsSaved
                  : (monthlySummaries.find((m) => m.monthKey === selectedMonth)?.sheetsSavedDuplex || 0)}{' '}
                paper sheets
              </strong>{' '}
              via two-sided printing
            </div>
          </div>

          {/* Average Cost per Page */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Avg Cost Per Page
            </span>
            <div className="font-mono text-2xl font-extrabold text-indigo-700 mt-1 tabular-nums">
              {currentRegion.currencySymbol}
              {selectedMonth === 'all'
                ? (allTimePages > 0 ? (allTimeSpendLocal / allTimePages).toFixed(1) : '0')
                : (monthlySummaries.find((m) => m.monthKey === selectedMonth)?.avgCostPerPageLocal || '0')}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Blended rate across duplex & color
            </div>
          </div>
        </div>

        {/* Month-by-Month Expenditure Bars */}
        <div className="pt-2">
          <div className="text-xs font-semibold text-slate-700 mb-3 flex items-center justify-between">
            <span>Month-over-Month Spending Progression</span>
            <span className="text-[11px] font-mono text-slate-400">Values in {currentRegion.currencySymbol}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {monthlySummaries.map((m) => {
              const maxSpend = Math.max(...monthlySummaries.map((x) => x.totalSpendLocal), 1);
              const barWidth = Math.max(10, Math.round((m.totalSpendLocal / maxSpend) * 100));
              const isSelected = selectedMonth === m.monthKey;

              return (
                <div
                  key={m.monthKey}
                  onClick={() => setSelectedMonth(m.monthKey)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-900">{m.monthName}</span>
                    <span className="font-mono font-bold text-indigo-900">
                      {currentRegion.currencySymbol}{m.totalSpendLocal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                      style={{ width: `${barWidth}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>{m.totalJobs} jobs · {m.totalPages} pages</span>
                    <span className="text-emerald-700">-{m.sheetsSavedDuplex} sheets eco</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search document name, Job ID..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Format:</span>
          </span>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            {(['all', 'bw', 'color'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setColorFilter(mode)}
                className={`px-2.5 py-1 rounded-md capitalize transition-colors cursor-pointer ${
                  colorFilter === mode
                    ? 'bg-white font-semibold text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode === 'all' ? 'All Color Modes' : mode === 'bw' ? 'B&W Monochrome' : 'Full CMYK Color'}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400 ml-2 font-mono shrink-0">
            {filteredJobs.length} {filteredJobs.length === 1 ? 'record' : 'records'}
          </span>
        </div>
      </div>

      {/* Completed Print Jobs List with Re-Order Actions */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-base">No print records match your filter</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Try resetting the search keyword or selecting "All Months" to inspect past print runs.
            </p>
            <button
              onClick={() => {
                setSelectedMonth('all');
                setColorFilter('all');
                setSearchQuery('');
              }}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredJobs.map((job) => {
            const isColor = job.preferences.colorMode === 'color';
            const isDuplex = job.preferences.duplex !== 'single';
            const dateStr = new Date(job.completedAt || job.createdAt).toLocaleString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left: Document info & specs */}
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                      isColor ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <FileText className="w-6 h-6" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-sm text-slate-900">{job.id}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{dateStr}</span>
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs font-semibold text-slate-700">{job.customerName}</span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm mt-0.5">{job.document.name}</h4>

                    {/* Specifications chips */}
                    <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600 mt-2 font-medium">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-700">
                        {job.preferences.paperSize} Standard
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        isColor ? 'bg-indigo-50 text-indigo-800 border border-indigo-200' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {isColor ? 'Full CMYK Color' : 'B&W Monochrome'}
                      </span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-700">
                        {job.preferences.duplex === 'single' ? 'Single-Sided' : 'Two-Sided (Duplex)'}
                      </span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {job.totalPages} sheets · {job.preferences.copies || 1} {job.preferences.copies === 1 ? 'copy' : 'copies'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 italic mt-1.5 line-clamp-1">
                      "{job.document.previewSnippet}"
                    </p>
                  </div>
                </div>

                {/* Right: Cost Breakdown & Re-Order Buttons */}
                <div className="flex flex-col sm:flex-row lg:flex-col sm:items-center lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  {/* Price display */}
                  <div className="text-left sm:text-right lg:text-right">
                    <div className="text-[11px] text-slate-400 font-medium">Total Paid</div>
                    <div className="font-mono text-xl font-bold text-slate-900 tabular-nums">
                      {currentRegion.currencySymbol}{job.quote.totalPriceLocal.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      PIN: {job.pickupPin} · {job.assignedPrinterName}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* View Receipt */}
                    <button
                      onClick={() => setReceiptJob(job)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      title="View printable tax invoice receipt"
                    >
                      <Receipt className="w-3.5 h-3.5 text-slate-500" />
                      <span>Receipt</span>
                    </button>

                    {/* Customize & Reorder */}
                    <button
                      onClick={() => handleOpenCustomize(job)}
                      className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      title="Change copies or specs before reprinting"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Customize</span>
                    </button>

                    {/* Instant 1-Click Reorder */}
                    <button
                      onClick={() => handleInstantReorder(job)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                      title="Re-order with exact same preferences"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Print Again</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Customize & Reorder */}
      {customizeJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <RotateCw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">Customize & Re-Order Print</h3>
                  <p className="text-[11px] text-slate-500 font-mono">Job {customizeJob.id} · {customizeJob.document.name}</p>
                </div>
              </div>
              <button
                onClick={() => setCustomizeJob(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCustomizeReorder} className="p-6 space-y-4 text-xs">
              {/* Document Summary */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">{customizeJob.document.name}</div>
                  <div className="text-[11px] text-slate-500">{customizeJob.document.totalPages} total doc pages</div>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-700">Ready to Spool</span>
              </div>

              {/* Color Mode */}
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1.5">Color Preference</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomColor('bw')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-colors ${
                      customColor === 'bw'
                        ? 'border-slate-900 bg-slate-900 text-white font-semibold'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    B&W Monochrome (₹3.50/page)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomColor('color')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-colors ${
                      customColor === 'color'
                        ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 font-semibold ring-1 ring-indigo-500'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    Full Color CMYK (₹15.00/page)
                  </button>
                </div>
              </div>

              {/* Duplex */}
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1.5">Sides & Paper Saving</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomDuplex('duplex_long')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-colors ${
                      customDuplex !== 'single'
                        ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 font-semibold ring-1 ring-indigo-500'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    Two-Sided Duplex (-15% discount)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomDuplex('single')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-colors ${
                      customDuplex === 'single'
                        ? 'border-slate-900 bg-slate-900 text-white font-semibold'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    Single-Sided (Standard)
                  </button>
                </div>
              </div>

              {/* Copies Stepper */}
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1.5">Copies Count</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCustomCopies(Math.max(1, customCopies - 1))}
                    className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-mono font-bold text-sm text-slate-900">
                    {customCopies}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCustomCopies(Math.min(50, customCopies + 1))}
                    className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 cursor-pointer"
                  >
                    +
                  </button>
                  <span className="text-slate-400 text-xs">
                    ({customizeJob.document.totalPages * customCopies} total sheets)
                  </span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCustomizeJob(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Send Re-Order to Spooler</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Official Print Receipt */}
      {receiptJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-600" />
                <span className="font-bold text-slate-900 text-sm">NetPrint Cafe Official Tax Receipt</span>
              </div>
              <button
                onClick={() => setReceiptJob(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-mono">
              <div className="text-center pb-3 border-b border-dashed border-slate-300">
                <div className="font-bold text-base font-sans text-slate-900">NETPRINT CYBER CAFE & XEROX</div>
                <div className="text-[11px] text-slate-500 font-sans mt-0.5">{currentRegion.name}</div>
                <div className="text-[10px] text-slate-400">GSTIN: 29AAAAA0000A1Z5 · SAC: 998314</div>
              </div>

              <div className="space-y-1 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span>Receipt No:</span>
                  <span className="font-bold text-slate-900">{receiptJob.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pickup PIN:</span>
                  <span className="font-bold text-amber-700">{receiptJob.pickupPin}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date & Time:</span>
                  <span>{new Date(receiptJob.completedAt || receiptJob.createdAt).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span>{receiptJob.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hardware Bay:</span>
                  <span>{receiptJob.assignedPrinterName}</span>
                </div>
              </div>

              <div className="py-2 border-y border-dashed border-slate-300 space-y-1.5 text-[11px]">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Item Description</span>
                  <span>Amount</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>{receiptJob.document.name.substring(0, 22)}...</span>
                  <span>{receiptJob.totalPages} pgs</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[10px]">
                  <span>Specs: {receiptJob.preferences.paperSize} · {receiptJob.preferences.colorMode.toUpperCase()} · {receiptJob.preferences.duplex}</span>
                  <span>Paid via Wallet</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm font-bold text-slate-900 pt-1">
                <span>TOTAL AMOUNT PAID:</span>
                <span className="font-mono text-base">
                  {currentRegion.currencySymbol}{receiptJob.quote.totalPriceLocal.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="text-center pt-3 text-[10px] text-slate-400 font-sans">
                Thank you for using NetPrint Cloud Kiosk. Please collect prints at {receiptJob.pickupTray}.
              </div>

              <button
                onClick={() => window.print()}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-sans font-semibold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Physical Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
