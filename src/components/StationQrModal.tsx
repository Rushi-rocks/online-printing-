import React from 'react';
import { QrCodeSvg } from './QrCodeSvg';
import { Region } from '../types';
import { X, Smartphone, Copy, Check, Printer, ExternalLink } from 'lucide-react';

interface StationQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  stationId: string;
  onSelectStation: (stId: string) => void;
  currentRegion: Region;
}

export const StationQrModal: React.FC<StationQrModalProps> = ({
  isOpen,
  onClose,
  stationId,
  onSelectStation,
  currentRegion,
}) => {
  const [copied, setCopied] = React.useState(false);
  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://netprint.cybercafe.internal';
  const qrLink = `${currentUrl}?station=${encodeURIComponent(stationId)}&region=${encodeURIComponent(currentRegion.id)}`;

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(qrLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateScan = () => {
    // Already at this station, just close with feedback
    onClose();
  };

  const stations = [
    'Station-01',
    'Station-02',
    'Station-03',
    'Station-04',
    'Station-05',
    'Station-06',
    'Station-07',
    'Station-08',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-slate-900 text-base">Terminal QR Scanner & Badge</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <p className="text-xs text-slate-500 mb-4">
            Customers can point their smartphone camera at this station desk QR code to instantly upload documents and pay from their phone without logging in.
          </p>

          {/* Station selector */}
          <div className="mb-4">
            <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-1.5">
              Select Kiosk / Desk Terminal
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {stations.map((st) => (
                <button
                  key={st}
                  onClick={() => onSelectStation(st)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                    st === stationId
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {st.replace('Station-', '#')}
                </button>
              ))}
            </div>
          </div>

          {/* QR Code graphic */}
          <div className="flex flex-col items-center justify-center my-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <QrCodeSvg value={qrLink} size={190} />
            <div className="mt-3 text-xs font-mono font-bold text-slate-800">
              {stationId} · {currentRegion.name}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              Auto-sync enabled · Fast Spooler
            </div>
          </div>

          {/* Deep link copy */}
          <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1.5 text-xs text-slate-600 font-mono text-left mb-4">
            <span className="truncate flex-1 px-2">{qrLink}</span>
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 rounded-md border border-slate-200 text-slate-700 font-sans font-medium text-xs flex items-center gap-1 transition-colors cursor-pointer shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Footer actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateScan}
              className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Simulate Customer Scan</span>
            </button>
            <button
              onClick={() => window.print()}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              title="Print table sticker"
            >
              <Printer className="w-4 h-4" />
              <span>Print Sticker</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
