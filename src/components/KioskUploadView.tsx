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
  AlertCircle,
  Camera,
  QrCode,
  MapPin,
  IndianRupee,
  Trash2,
  FileUp,
  Image as ImageIcon,
  CheckCircle2,
  FileCheck2
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
  onOpenLiveScanner?: () => void;
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
  onOpenLiveScanner,
  onSubmitJob,
}) => {
  // Start with a clean, empty state — zero hardcoded example documents
  const [document, setDocument] = React.useState<UploadedDocument | null>(null);
  const [customerName, setCustomerName] = React.useState<string>('Nuzvidu Customer');
  const [paymentMethod, setPaymentMethod] = React.useState<'wallet' | 'direct'>('direct');
  const [isDragging, setIsDragging] = React.useState<boolean>(false);

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
  const cameraInputRef = React.useRef<HTMLInputElement>(null);

  // Process uploaded or dropped file
  const processFile = (file: File) => {
    let pages = 1;
    const lowerName = file.name.toLowerCase();

    if (lowerName.endsWith('.pdf')) {
      // Estimate 1 page per ~300KB if binary text/pdf
      pages = Math.min(50, Math.max(1, Math.round(file.size / 300000)));
    } else if (lowerName.endsWith('.docx') || lowerName.endsWith('.doc')) {
      pages = Math.min(25, Math.max(1, Math.round(file.size / 250000)));
    } else if (file.type.startsWith('image/')) {
      pages = 1;
    }

    const newDoc: UploadedDocument = {
      id: `doc-${Date.now()}`,
      name: file.name,
      sizeBytes: file.size,
      type: file.type || 'application/octet-stream',
      totalPages: pages,
      previewSnippet: `${(file.size / (1024 * 1024)).toFixed(2)} MB · ${file.type || 'Document'} · Ready for high-speed spooling`,
      uploadedAt: Date.now(),
    };

    setDocument(newDoc);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
    e.target.value = ''; // reset so same file can be picked again
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Compute live dynamic quote (safe fallback if no doc yet)
  const totalDocPages = document ? document.totalPages : 1;

  const quote = React.useMemo(() => {
    return calculateDynamicQuote(
      preferences,
      totalDocPages,
      currentRegion,
      activeQueueCount,
      printers,
      marketplaceConfig
    );
  }, [preferences, totalDocPages, currentRegion, activeQueueCount, printers, marketplaceConfig]);

  const effectivePageCount = parsePageCount(preferences.pageRange, preferences.customPages, totalDocPages);
  const totalSheetsToPrint = effectivePageCount * preferences.copies;
  const hasSufficientWalletBalance = walletBalanceUSD >= quote.totalPriceUSD;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!document) return;
    onSubmitJob(document, preferences, customerName, paymentMethod);
  };

  // Helper for file type badge
  const getFileIcon = (doc: UploadedDocument) => {
    const lower = doc.name.toLowerCase();
    if (lower.endsWith('.pdf')) {
      return (
        <div className="w-11 h-11 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs border border-red-200">
          PDF
        </div>
      );
    }
    if (lower.endsWith('.doc') || lower.endsWith('.docx')) {
      return (
        <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs border border-blue-200">
          DOC
        </div>
      );
    }
    if (doc.type.startsWith('image/') || lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
      return (
        <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs border border-emerald-200">
          <ImageIcon className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 shadow-xs border border-slate-200">
        <FileText className="w-5 h-5" />
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Kiosk Station Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="tracking-wide">SYAM NET WORLD · NUZVIDU</span>
            <span className="text-slate-300">/</span>
            <span className="font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold border border-emerald-200">
              {stationId}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Self-Service Upload & Xerox Counter
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Upload your documents, customize print specifications, and pay instantly via UPI or Net Cafe Wallet.
          </p>
        </div>

        {/* QR & Scanner Controls */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {onOpenLiveScanner && (
            <button
              type="button"
              onClick={onOpenLiveScanner}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Scan Desk QR</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenQrModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-emerald-600" />
            <span>Show QR for Phone</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Clean Document Upload & Specifications (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Section 1: Pristine Document Upload Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>1. Upload Document</span>
              </h2>
              <span className="text-xs text-slate-400 font-mono">PDF · Word · Images · Aadhaar</span>
            </div>

            {/* Hidden file inputs */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.txt"
              className="hidden"
            />
            <input
              type="file"
              ref={cameraInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              capture="environment"
              className="hidden"
            />

            {/* If no document uploaded: Clean, Modern Drag-and-Drop Area */}
            {!document ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative rounded-2xl border-2 border-dashed p-8 sm:p-10 text-center transition-all flex flex-col items-center justify-center ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50/60 scale-[1.01] shadow-md'
                    : 'border-slate-300 hover:border-emerald-500/80 bg-slate-50/50 hover:bg-emerald-50/20'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs mb-3.5">
                  <FileUp className="w-7 h-7" />
                </div>

                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Drag and drop your document here
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md">
                  Choose a PDF, Word thesis, college hall ticket, Aadhaar card photocopy, or passport photo to print.
                </p>

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 mt-5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Browse Device Files</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span>Take Photo / Scan ID</span>
                  </button>
                </div>

                {/* Privacy & Media badges */}
                <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400 mt-6 pt-5 border-t border-slate-200/60">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Private & confidential local spooling</span>
                  </span>
                  <span>·</span>
                  <span>A4 / Legal / A3 supported</span>
                  <span>·</span>
                  <span>Max file size: 100 MB</span>
                </div>
              </div>
            ) : (
              /* If document is uploaded: Pristine Document Card */
              <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 shadow-xs flex flex-col sm:flex-row items-start justify-between gap-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-start gap-3.5">
                  {getFileIcon(document)}

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm sm:text-base break-all">
                        {document.name}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full shrink-0">
                        <Check className="w-3 h-3" /> Ready
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-2">
                      <span>{(document.sizeBytes / 1024 / 1024).toFixed(2)} MB</span>
                      <span>·</span>
                      <span>{document.type || 'Document'}</span>
                    </div>

                    {/* Page Count Adjustment Stepper */}
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-700">Total Pages in Doc:</span>
                      <div className="flex items-center border border-emerald-300 bg-white rounded-lg shadow-2xs overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setDocument({ ...document, totalPages: Math.max(1, document.totalPages - 1) })}
                          className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={500}
                          value={document.totalPages}
                          onChange={(e) => setDocument({ ...document, totalPages: Math.max(1, parseInt(e.target.value) || 1) })}
                          className="w-12 text-center text-xs font-mono font-bold focus:outline-none py-1"
                        />
                        <button
                          type="button"
                          onClick={() => setDocument({ ...document, totalPages: Math.min(500, document.totalPages + 1) })}
                          className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">(auto-detected)</span>
                    </div>
                  </div>
                </div>

                {/* Change or Remove Actions */}
                <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    Change File
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocument(null)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Printing Preferences Configurator */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span>2. Print Preferences</span>
              </h2>
              <span className="text-xs text-slate-500 font-mono">Color · Paper · Duplex · Copies</span>
            </div>

            {/* Preference: Color Mode */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Color Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPreferences({ ...preferences, colorMode: 'bw' })}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    preferences.colorMode === 'bw'
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">Black & White (Monochrome)</div>
                    <div className={`text-[11px] mt-0.5 ${preferences.colorMode === 'bw' ? 'text-slate-300' : 'text-slate-500'}`}>
                      ₹3.00 / page · High-speed laser Xerox
                    </div>
                  </div>
                  {preferences.colorMode === 'bw' && <Check className="w-4 h-4 text-emerald-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setPreferences({ ...preferences, colorMode: 'color' })}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    preferences.colorMode === 'color'
                      ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">Full CMYK Color Laser</div>
                    <div className={`text-[11px] mt-0.5 ${preferences.colorMode === 'color' ? 'text-emerald-800 font-medium' : 'text-slate-500'}`}>
                      ₹12.00 / page · High-definition ink
                    </div>
                  </div>
                  {preferences.colorMode === 'color' && <Check className="w-4 h-4 text-emerald-600" />}
                </button>
              </div>
            </div>

            {/* Preference: Paper Size */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Paper Size
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {(['A4', 'Legal', 'A3', 'Photo_4x6', 'Letter'] as PaperSize[]).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setPreferences({ ...preferences, paperSize: sz })}
                    className={`py-2.5 px-2 rounded-xl border text-center text-xs font-medium transition-all cursor-pointer ${
                      preferences.paperSize === sz
                        ? 'border-emerald-600 bg-emerald-600 text-white font-bold shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {sz === 'Photo_4x6' ? 'Photo 4x6' : sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Preference: Duplex Mode */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700">
                  Duplex (Two-Sided Printing)
                </label>
                <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                  Save 15% on paper cost!
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'single' as DuplexMode, label: 'Single Sided', desc: '1 page per sheet' },
                  { id: 'duplex_long' as DuplexMode, label: 'Double Sided (Long)', desc: 'Flip along long edge' },
                  { id: 'duplex_short' as DuplexMode, label: 'Double Sided (Short)', desc: 'Flip along short edge' },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setPreferences({ ...preferences, duplex: d.id })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      preferences.duplex === d.id
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">{d.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{d.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Copies & Page Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Number of Copies
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreferences({ ...preferences, copies: Math.max(1, preferences.copies - 1) })}
                    className="w-9 h-9 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 font-bold text-slate-700 flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={preferences.copies}
                    onChange={(e) => setPreferences({ ...preferences, copies: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-16 h-9 text-center border border-slate-300 rounded-lg font-mono font-bold text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setPreferences({ ...preferences, copies: Math.min(100, preferences.copies + 1) })}
                    className="w-9 h-9 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 font-bold text-slate-700 flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                  <span className="text-xs text-slate-500 ml-2">
                    Total: {totalSheetsToPrint} {totalSheetsToPrint === 1 ? 'sheet' : 'sheets'}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Page Range
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={preferences.pageRange}
                    onChange={(e) => setPreferences({ ...preferences, pageRange: e.target.value as any })}
                    className="h-9 px-3 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  >
                    <option value="all">All Pages {document ? `(1-${document.totalPages})` : ''}</option>
                    <option value="custom">Custom Page Range</option>
                  </select>
                  {preferences.pageRange === 'custom' && (
                    <input
                      type="text"
                      placeholder="e.g. 1-3, 5"
                      value={preferences.customPages || ''}
                      onChange={(e) => setPreferences({ ...preferences, customPages: e.target.value })}
                      className="h-9 px-3 border border-slate-300 rounded-lg text-xs font-mono w-28 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Quality & Finishing */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Quality:</span>
                {(['draft', 'standard', 'high_res'] as PrintQuality[]).map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setPreferences({ ...preferences, quality: q })}
                    className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                      preferences.quality === q
                        ? 'bg-slate-900 text-white font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {q === 'draft' ? 'Draft' : q === 'standard' ? 'Standard' : 'HD Studio'}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.stapling}
                    onChange={(e) => setPreferences({ ...preferences, stapling: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Corner Staple</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.collate}
                    onChange={(e) => setPreferences({ ...preferences, collate: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Collate Copies</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Pricing Engine Breakdown & Checkout (4 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Dynamic Price Quote</h3>
              </div>
              <span className="text-[11px] font-mono font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                SYAM NET WORLD Rate
              </span>
            </div>

            {/* Live Demand & Supply Meter */}
            <div className="my-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Cafe Queue Load:
                </span>
                <span className="font-mono font-semibold text-slate-800">
                  {activeQueueCount} jobs in spooler
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Marketplace Multiplier:</span>
                <span className={`font-mono font-bold ${quote.demandSurgeMultiplier > 1 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {quote.demandSurgeMultiplier.toFixed(2)}x {quote.demandSurgeMultiplier > 1 ? '(Congestion Surge)' : '(Standard Rate)'}
                </span>
              </div>
            </div>

            {/* Dynamic Price Factors */}
            <div className="space-y-2 text-xs text-slate-600 my-4">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Base ({preferences.colorMode === 'color' ? 'Color Laser' : 'B&W Xerox'}):</span>
                <span className="font-mono text-slate-900 font-semibold">
                  ₹{preferences.colorMode === 'color' ? '12.00' : '3.00'} / page
                </span>
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
                <span>Total Sheets to Print:</span>
                <span className="font-mono text-slate-900 font-bold">
                  {document ? `${totalSheetsToPrint} sheets` : '—'}
                </span>
              </div>
            </div>

            {/* Total Price Display */}
            <div className="p-4 rounded-xl bg-slate-900 text-white mb-5 shadow-inner">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Total Amount in INR</span>
                <span className="text-emerald-400 font-medium">SYAM NET WORLD, Nuzvidu</span>
              </div>
              <div className="text-3xl font-mono font-bold tracking-tight text-white tabular-nums">
                {document ? `₹${quote.totalPriceLocal.toLocaleString()}` : '₹0.00'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {document 
                  ? 'Includes GST, high-yield laser toner & 75 GSM paper'
                  : 'Please upload a document to calculate total cost'}
              </div>
            </div>

            {/* Customer Name Input */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Customer Name / Mobile
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Ramesh, Student, 98480..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                required
              />
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2 mb-5">
              <label className="text-xs font-semibold text-slate-700 block">
                Payment Option
              </label>

              {/* Direct UPI / PhonePe / GPay */}
              <button
                type="button"
                onClick={() => setPaymentMethod('direct')}
                className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  paymentMethod === 'direct'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 text-emerald-700" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Direct UPI & Counter Pay</div>
                    <div className="text-[11px] text-slate-500">PhonePe, Google Pay, Paytm or Cash</div>
                  </div>
                </div>
                {paymentMethod === 'direct' && <Check className="w-4 h-4 text-emerald-600" />}
              </button>
              
              {/* Wallet Option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('wallet')}
                className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  paymentMethod === 'wallet'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Wallet className="w-4 h-4 text-emerald-700" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Digital Net Cafe Wallet</div>
                    <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                      Balance: {formatCurrency(walletBalanceUSD, currentRegion)}
                    </div>
                  </div>
                </div>
                {paymentMethod === 'wallet' && <Check className="w-4 h-4 text-emerald-600" />}
              </button>

              {/* Insufficient wallet balance warning */}
              {paymentMethod === 'wallet' && !hasSufficientWalletBalance && document && (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-amber-800">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Insufficient wallet balance</span>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenTopUp}
                    className="text-xs font-bold text-emerald-800 underline cursor-pointer"
                  >
                    Recharge UPI
                  </button>
                </div>
              )}
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={!document || (paymentMethod === 'wallet' && !hasSufficientWalletBalance)}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>
                {document ? 'Send to SYAM NET WORLD Printer' : 'Select a Document to Print'}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="text-center mt-3 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instant 4-digit pickup PIN generated · Auto reprint on jam</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
