import React from 'react';
import { 
  UploadedDocument, 
  PrintPreferences, 
  Region, 
  Printer, 
  MarketplaceConfig, 
  PaperSize, 
  DuplexMode, 
  PrintQuality, 
  ColorMode 
} from '../types';
import { calculateDynamicQuote, formatCurrency, parsePageCount } from '../services/dynamicPricing';
import { 
  UploadCloud, 
  FileText, 
  Check, 
  Sparkles, 
  Layers, 
  TrendingUp, 
  Info, 
  Wallet, 
  CreditCard, 
  Smartphone,
  Sliders,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface KioskUploadViewProps {
  stationId: string;
  currentRegion: Region;
  printers: Printer[];
  activeQueueCount: number;
  marketplaceConfig: MarketplaceConfig;
  walletBalanceUSD: number;
  onOpenTopUp: () => void;
  onOpenQrModal: () => void;
  onSubmitJob: (doc: UploadedDocument, prefs: PrintPreferences, customerName: string, paymentMethod: 'wallet' | 'direct') => void;
}

export const KioskUploadView: React.FC<KioskUploadViewProps> = ({
  stationId,
  currentRegion,
  printers,
  activeQueueCount,
  marketplaceConfig,
  walletBalanceUSD,
  onOpenTopUp,
  onOpenQrModal,
  onSubmitJob,
}) => {
  // Preset sample documents for instant testing
  const SAMPLE_DOCS: UploadedDocument[] = [
    {
      id: 'doc-resume',
      name: 'Executive_Resume_CV_2026.pdf',
      sizeBytes: 1420000,
      type: 'application/pdf',
      totalPages: 2,
      previewSnippet: 'Senior systems architect credentials, technical competencies, and publication bibliography.',
      uploadedAt: Date.now(),
    },
    {
      id: 'doc-deck',
      name: 'Quarterly_Strategy_Pitch_Deck.pdf',
      sizeBytes: 6850000,
      type: 'application/pdf',
      totalPages: 8,
      previewSnippet: 'Investor deck with infographics, market forecasts, and regional expansion roadmap.',
      uploadedAt: Date.now(),
    },
    {
      id: 'doc-blueprint',
      name: 'Architectural_Floorplan_A3.pdf',
      sizeBytes: 9400000,
      type: 'application/pdf',
      totalPages: 4,
      previewSnippet: 'Scale 1:50 structural engineering schematics and electrical riser layouts.',
      uploadedAt: Date.now(),
    },
    {
      id: 'doc-photo',
      name: 'Studio_Portrait_Headshot.png',
      sizeBytes: 4200000,
      type: 'image/png',
      totalPages: 1,
      previewSnippet: 'High-resolution 300DPI color portrait calibrated for glossy photo finish.',
      uploadedAt: Date.now(),
    },
  ];

  const [document, setDocument] = React.useState<UploadedDocument>(SAMPLE_DOCS[0]);
  const [customerName, setCustomerName] = React.useState<string>('Guest User');
  const [paymentMethod, setPaymentMethod] = React.useState<'wallet' | 'direct'>('wallet');

  // Print Preferences
  const [preferences, setPreferences] = React.useState<PrintPreferences>({
    colorMode: 'bw',
    paperSize: 'A4',
    duplex: 'duplex_long',
    copies: 1,
    pageRange: 'all',
    customPages: '',
    orientation: 'portrait',
    quality: 'standard',
    stapling: false,
    collate: true,
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate page count based on file size/type
    let pages = 1;
    if (file.name.endsWith('.pdf')) {
      pages = Math.min(30, Math.max(1, Math.round(file.size / 400000)));
    } else if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
      pages = Math.min(15, Math.max(1, Math.round(file.size / 300000)));
    }

    const newDoc: UploadedDocument = {
      id: `doc-${Date.now()}`,
      name: file.name,
      sizeBytes: file.size,
      type: file.type || 'application/octet-stream',
      totalPages: pages,
      previewSnippet: `Uploaded file (${(file.size / (1024 * 1024)).toFixed(2)} MB), ready for spooling.`,
      uploadedAt: Date.now(),
    };

    setDocument(newDoc);
  };

  // Compute live dynamic quote
  const quote = React.useMemo(() => {
    return calculateDynamicQuote(
      preferences,
      document.totalPages,
      currentRegion,
      activeQueueCount,
      printers,
      marketplaceConfig
    );
  }, [preferences, document.totalPages, currentRegion, activeQueueCount, printers, marketplaceConfig]);

  const effectivePageCount = parsePageCount(preferences.pageRange, preferences.customPages, document.totalPages);
  const totalSheetsToPrint = effectivePageCount * preferences.copies;
  const hasSufficientWalletBalance = walletBalanceUSD >= quote.totalPriceUSD;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitJob(document, preferences, customerName, paymentMethod);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Kiosk Station Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>TERMINAL ACTIVE</span>
            <span className="text-slate-300">/</span>
            <span className="font-mono text-slate-700">{stationId}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Self-Service Cloud Print Station
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Upload documents, customize precision preferences, and pay via wallet or phone scan.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenQrModal}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
          >
            <Smartphone className="w-4 h-4 text-indigo-600" />
            <span>Open Phone Scanner</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Document Upload & Preferences (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Section 1: Document Upload Dropzone */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>1. Document Selection</span>
              </h2>
              <span className="text-xs text-slate-400">PDF, Word, Images supported</span>
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.txt"
              className="hidden"
            />

            {/* Active Document Card */}
            <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 mb-4 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{document.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>{(document.sizeBytes / 1024 / 1024).toFixed(2)} MB</span>
                    <span>·</span>
                    <strong className="text-indigo-900 font-mono">{document.totalPages} total pages</strong>
                    <span>·</span>
                    <span>{document.type.split('/')[1]?.toUpperCase() || 'DOCUMENT'}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 italic">
                    "{document.previewSnippet}"
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
              >
                Upload Other
              </button>
            </div>

            {/* Quick Sample Files Bar */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Quick Test Samples (Instant 1-Click Load)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SAMPLE_DOCS.map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setDocument(doc)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      document.id === doc.id
                        ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 text-indigo-950 font-semibold'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="truncate text-xs font-medium">{doc.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {doc.totalPages} {doc.totalPages === 1 ? 'page' : 'pages'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Printing Preferences Configurator */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span>2. Print Specifications</span>
              </h2>
              <span className="text-xs text-slate-500">Fine-tune paper, ink & duplex</span>
            </div>

            {/* Preference: Color Mode */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                Color Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPreferences({ ...preferences, colorMode: 'bw' })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    preferences.colorMode === 'bw'
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">Black & White (Monochrome)</div>
                    <div className={`text-[11px] mt-0.5 ${preferences.colorMode === 'bw' ? 'text-slate-300' : 'text-slate-500'}`}>
                      Economy rate · High-speed laser
                    </div>
                  </div>
                  {preferences.colorMode === 'bw' && <Check className="w-4 h-4 text-emerald-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setPreferences({ ...preferences, colorMode: 'color' })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    preferences.colorMode === 'color'
                      ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <span>Full Color (CMYK)</span>
                      <span className="w-2 h-2 rounded-full bg-linear-to-r from-cyan-400 via-pink-400 to-yellow-400"></span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      True photographic laser reproduction
                    </div>
                  </div>
                  {preferences.colorMode === 'color' && <Check className="w-4 h-4 text-indigo-600" />}
                </button>
              </div>
            </div>

            {/* Preference: Paper Size */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                Paper Size
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'A4', label: 'A4 Standard', desc: '210 × 297 mm' },
                  { id: 'A3', label: 'A3 Ledger', desc: '297 × 420 mm (2.1x)' },
                  { id: 'Letter', label: 'Letter', desc: '8.5 × 11 in' },
                  { id: 'Legal', label: 'Legal', desc: '8.5 × 14 in' },
                  { id: 'Photo_4x6', label: 'Photo Glossy', desc: '4 × 6 in Gloss' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPreferences({ ...preferences, paperSize: p.id as PaperSize })}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      preferences.paperSize === p.id
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold ring-1 ring-indigo-500/30'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-semibold">{p.label}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Preference: Duplex (Two-Sided) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700">
                  Duplex / Sides
                </label>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Duplex saves 15% on paper!
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'single', title: 'Single-Sided', desc: '1 page per physical sheet' },
                  { id: 'duplex_long', title: 'Two-Sided (Long Edge)', desc: 'Standard notebook flip' },
                  { id: 'duplex_short', title: 'Two-Sided (Short Edge)', desc: 'Calendar / booklet flip' },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setPreferences({ ...preferences, duplex: d.id as DuplexMode })}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      preferences.duplex === d.id
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold ring-1 ring-indigo-500/30'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-medium">{d.title}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{d.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Grid for Copies, Page Range, Orientation, Quality */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Copies Stepper */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Number of Copies
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreferences({ ...preferences, copies: Math.max(1, preferences.copies - 1) })}
                    className="w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center font-bold text-slate-700 cursor-pointer"
                  >
                    -
                  </button>
                  <div className="w-16 text-center font-mono font-bold text-sm text-slate-900">
                    {preferences.copies}
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreferences({ ...preferences, copies: Math.min(50, preferences.copies + 1) })}
                    className="w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center font-bold text-slate-700 cursor-pointer"
                  >
                    +
                  </button>
                  <span className="text-xs text-slate-500 ml-2">
                    ({totalSheetsToPrint} sheets total)
                  </span>
                </div>
              </div>

              {/* Orientation */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Orientation
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['portrait', 'landscape'] as const).map((ori) => (
                    <button
                      key={ori}
                      type="button"
                      onClick={() => setPreferences({ ...preferences, orientation: ori })}
                      className={`py-2 px-3 rounded-lg border text-xs capitalize text-center transition-colors cursor-pointer ${
                        preferences.orientation === ori
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-semibold'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {ori}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Page Range */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Page Range
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPreferences({ ...preferences, pageRange: 'all', customPages: '' })}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer ${
                    preferences.pageRange === 'all'
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-semibold'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  All ({document.totalPages} pages)
                </button>
                <button
                  type="button"
                  onClick={() => setPreferences({ ...preferences, pageRange: 'custom' })}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer ${
                    preferences.pageRange === 'custom'
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-semibold'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  Custom Pages
                </button>
                {preferences.pageRange === 'custom' && (
                  <input
                    type="text"
                    placeholder="e.g. 1-3, 5"
                    value={preferences.customPages}
                    onChange={(e) => setPreferences({ ...preferences, customPages: e.target.value })}
                    className="flex-1 px-3 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                )}
              </div>
            </div>

            {/* Quality & Finishing Options */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">Quality:</span>
                {(['draft', 'standard', 'high_res'] as PrintQuality[]).map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setPreferences({ ...preferences, quality: q })}
                    className={`px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer capitalize ${
                      preferences.quality === q
                        ? 'bg-slate-900 text-white font-medium'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {q === 'draft' ? 'Eco Draft (-10%)' : q === 'standard' ? 'Standard' : 'HD Studio (+25%)'}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.stapling}
                    onChange={(e) => setPreferences({ ...preferences, stapling: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Corner Staple</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.collate}
                    onChange={(e) => setPreferences({ ...preferences, collate: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Collate Copies</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Pricing Engine Breakdown & Checkout (4 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          {/* Dynamic Pricing Engine Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Dynamic Marketplace Quote</h3>
              </div>
              <span className="text-[11px] font-mono font-semibold text-slate-500">
                {currentRegion.currencyCode} Rate
              </span>
            </div>

            {/* Live Demand & Supply Meter */}
            <div className="my-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Cafe Spooler Load:
                </span>
                <span className="font-mono font-semibold text-slate-800">
                  {activeQueueCount} jobs in queue
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Dynamic Multiplier:</span>
                <span className={`font-mono font-bold ${quote.demandSurgeMultiplier > 1 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {quote.demandSurgeMultiplier.toFixed(2)}x {quote.demandSurgeMultiplier > 1 ? '(Congestion Surge)' : '(Nominal)'}
                </span>
              </div>
            </div>

            {/* Dynamic Price Factors */}
            <div className="space-y-2 text-xs text-slate-600 my-4">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Base ({preferences.colorMode === 'color' ? 'Full CMYK Color' : 'B&W Monochrome'}):</span>
                <span className="font-mono text-slate-900">${quote.basePerSheet.toFixed(2)} / sheet</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Paper Size ({preferences.paperSize}):</span>
                <span className="font-mono text-slate-900">{quote.paperMultiplier}x</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Duplex Discount:</span>
                <span className="font-mono text-emerald-600">
                  {quote.duplexDiscountRatio < 1 ? '-15% paper saving' : 'None'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Total Sheets:</span>
                <span className="font-mono text-slate-900">{totalSheetsToPrint} sheets</span>
              </div>
            </div>

            {/* Transparency Reason Badges */}
            <div className="mb-5 space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Marketplace Factors Applied
              </div>
              {quote.priceBreakdownReasons.map((r, idx) => (
                <div key={idx} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-indigo-600 shrink-0" />
                  <span>{r}</span>
                </div>
              ))}
            </div>

            {/* Total Price Display */}
            <div className="p-4 rounded-xl bg-slate-900 text-white mb-5">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Total Amount Due</span>
                <span className="font-mono text-slate-400">~${quote.totalPriceUSD.toFixed(2)} USD</span>
              </div>
              <div className="text-2xl font-mono font-bold tracking-tight text-white tabular-nums">
                {currentRegion.currencySymbol}
                {currentRegion.currencyCode === 'JPY' || currentRegion.currencyCode === 'INR'
                  ? quote.totalPriceLocal.toLocaleString()
                  : quote.totalPriceLocal.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Includes all taxes, ink wear & physical media
              </div>
            </div>

            {/* Customer Name Input */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Customer Name / Alias
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Kenji, Sarah, Terminal User"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2 mb-5">
              <label className="text-xs font-semibold text-slate-700 block">
                Payment Source
              </label>
              
              {/* Wallet Option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('wallet')}
                className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  paymentMethod === 'wallet'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500/30'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Wallet className="w-4 h-4 text-indigo-600" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Digital Net Cafe Wallet</div>
                    <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                      Balance: {formatCurrency(walletBalanceUSD, currentRegion)}
                    </div>
                  </div>
                </div>
                {paymentMethod === 'wallet' && <Check className="w-4 h-4 text-indigo-600" />}
              </button>

              {/* Insufficient wallet balance warning */}
              {paymentMethod === 'wallet' && !hasSufficientWalletBalance && (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-amber-800">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Insufficient balance</span>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenTopUp}
                    className="text-xs font-bold text-indigo-700 underline cursor-pointer"
                  >
                    Quick Top-Up
                  </button>
                </div>
              )}

              {/* Direct Card / Phone Option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('direct')}
                className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  paymentMethod === 'direct'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500/30'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 text-slate-700" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Direct Pay / Phone Tap</div>
                    <div className="text-[11px] text-slate-500">Apple Pay, Card, or UPI Counter</div>
                  </div>
                </div>
                {paymentMethod === 'direct' && <Check className="w-4 h-4 text-indigo-600" />}
              </button>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={paymentMethod === 'wallet' && !hasSufficientWalletBalance}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Authorize & Send to Printer</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="text-center mt-3 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Guaranteed queue priority · Instant refund if paper jams</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
