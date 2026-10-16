import React from 'react';
import { QrCodeSvg } from './QrCodeSvg';
import { Region } from '../types';
import { 
  X, 
  Smartphone, 
  Copy, 
  Check, 
  Printer, 
  UploadCloud, 
  Camera, 
  ExternalLink,
  Edit2,
  Sparkles,
  HelpCircle,
  FileCheck
} from 'lucide-react';

interface StationQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  stationId: string;
  onSelectStation: (stId: string) => void;
  currentRegion: Region;
  onOpenLiveScanner: () => void;
  onOpenUploadDirectly: () => void;
}

export const StationQrModal: React.FC<StationQrModalProps> = ({
  isOpen,
  onClose,
  stationId,
  onSelectStation,
  currentRegion,
  onOpenLiveScanner,
  onOpenUploadDirectly,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'single' | 'placards'>('single');
  const [customBaseUrl, setCustomBaseUrl] = React.useState<string>('');
  const [isEditingUrl, setIsEditingUrl] = React.useState<boolean>(false);

  // Auto-detect browser URL
  const defaultBaseUrl = React.useMemo(() => {
    if (typeof window !== 'undefined') {
      return `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    }
    return 'https://syamnetworld-nuzvidu.com/';
  }, []);

  const activeBaseUrl = customBaseUrl.trim() || defaultBaseUrl;

  const getDeskLink = (desk: string) => {
    const cleanBase = activeBaseUrl.endsWith('/') ? activeBaseUrl.slice(0, -1) : activeBaseUrl;
    return `${cleanBase}?station=${encodeURIComponent(desk)}&mode=upload`;
  };

  const currentQrLink = getDeskLink(stationId);

  const desks = ['Desk-01', 'Desk-02', 'Desk-03', 'Desk-04', 'Desk-05', 'Desk-06'];

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentQrLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintPlacards = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Scan QR Code to Upload & Print</h3>
              <p className="text-[11px] text-emerald-700 font-mono font-medium">SYAM NET WORLD · Nuzvidu, AP</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setViewMode(viewMode === 'single' ? 'placards' : 'single')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              {viewMode === 'single' ? 'Desk Placards' : 'Single QR'}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-center text-xs text-slate-700">
          {viewMode === 'single' ? (
            <>
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 text-left flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950 leading-relaxed">
                  <strong>Standard Scannable QR:</strong> Open your smartphone camera, Google Lens, WhatsApp QR scanner, or Paytm on your phone and aim at the QR code below to upload documents instantly!
                </div>
              </div>

              {/* Desk Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Select Desk at SYAM NET WORLD:
                </label>
                <div className="grid grid-cols-6 gap-1.5">
                  {desks.map((d) => (
                    <button
                      key={d}
                      onClick={() => onSelectStation(d)}
                      className={`py-2 px-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        d === stationId
                          ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500/20'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      #{d.replace('Desk-', '')}
                    </button>
                  ))}
                </div>
              </div>

              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center p-5 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner">
                <QrCodeSvg value={currentQrLink} size={200} />
                
                <div className="mt-3.5 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-mono text-sm font-bold text-slate-900">{stationId}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-xs font-semibold text-emerald-800">SYAM NET WORLD (Nuzvidu)</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Upload PDF, Aadhaar Card, Photos & Pay via PhonePe / GPay
                </p>
              </div>

              {/* Action Buttons to guarantee upload access */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenUploadDirectly();
                  }}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload Documents Directly on this Screen</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenLiveScanner();
                  }}
                  className="w-full py-2 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-xl border border-indigo-200 transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4 text-indigo-600" />
                  <span>Open Camera to Scan a Physical QR Sticker</span>
                </button>
              </div>

              {/* URL Details & Cafe Wi-Fi IP Configuration */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-left space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-700">QR Encoded URL:</span>
                  <button
                    onClick={() => setIsEditingUrl(!isEditingUrl)}
                    className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>{isEditingUrl ? 'Close Edit' : 'Edit IP / URL'}</span>
                  </button>
                </div>

                {isEditingUrl ? (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] text-slate-500">
                      If testing from phones on your cafe Wi-Fi, enter your PC's local LAN IP (e.g. <code>http://192.168.1.100:3000</code>):
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={customBaseUrl}
                        onChange={(e) => setCustomBaseUrl(e.target.value)}
                        placeholder={defaultBaseUrl}
                        className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <button
                        onClick={() => setIsEditingUrl(false)}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-semibold text-xs cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-white rounded-lg p-1.5 border border-slate-200 text-xs text-slate-600 font-mono">
                    <span className="truncate flex-1 px-1 text-[11px]">{currentQrLink}</span>
                    <button
                      onClick={handleCopy}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700 font-sans font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Placards Mode: Print Cards for Desks 1 to 6 */
            <div className="space-y-4 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Printable Desk QR Cards</h4>
                  <p className="text-xs text-slate-500">Print and paste these QR cards on customer computer tables.</p>
                </div>
                <button
                  onClick={handlePrintPlacards}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Cards</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto p-1">
                {desks.map((d) => (
                  <div key={d} className="p-3 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl text-center space-y-2">
                    <div className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">SYAM NET WORLD · Nuzvidu</div>
                    <div className="flex justify-center">
                      <QrCodeSvg value={getDeskLink(d)} size={110} />
                    </div>
                    <div className="font-mono font-bold text-xs text-slate-900 bg-white py-0.5 rounded border border-slate-200">
                      {d}
                    </div>
                    <div className="text-[10px] text-slate-600 leading-tight">
                      Scan to Upload & Print
                      <div className="text-[9px] text-slate-500 font-medium">ఫోన్‌తో స్కాన్ చేయండి</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
