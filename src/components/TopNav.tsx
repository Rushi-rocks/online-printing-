import React from 'react';
import { Region, RegionId } from '../types';
import { 
  Printer, 
  Wallet, 
  ListOrdered, 
  UploadCloud, 
  ShieldCheck, 
  Star, 
  QrCode,
  Globe,
  ChevronDown,
  History,
  Receipt
} from 'lucide-react';
import { formatCurrency } from '../services/dynamicPricing';

interface TopNavProps {
  activeTab: 'upload' | 'tracker' | 'history' | 'wallet' | 'admin' | 'feedback';
  setActiveTab: (tab: 'upload' | 'tracker' | 'history' | 'wallet' | 'admin' | 'feedback') => void;
  walletBalanceUSD: number;
  currentRegion: Region;
  regions: Region[];
  onSelectRegion: (regionId: RegionId) => void;
  onOpenQrModal: () => void;
  onOpenTopUp: () => void;
  activeJobsCount: number;
  stationId: string;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  walletBalanceUSD,
  currentRegion,
  regions,
  onSelectRegion,
  onOpenQrModal,
  onOpenTopUp,
  activeJobsCount,
  stationId,
}) => {
  const [regionDropdownOpen, setRegionDropdownOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Upper micro-bar for regional network telemetry */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-medium text-white">{currentRegion.name}</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400 font-mono text-[11px]">{currentRegion.edgeNode}</span>
            <span className="text-slate-500">·</span>
            <span className="text-emerald-400 font-mono text-[11px]">{currentRegion.latencyMs}ms latency</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="hidden sm:inline">Active Terminal: <strong className="text-white font-mono">{stationId}</strong></span>
            <button
              onClick={onOpenQrModal}
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              <span>Station QR Code</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Top Bar adhering to 3-zone contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div 
            onClick={() => setActiveTab('upload')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:bg-indigo-700 transition-colors">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-slate-900 leading-none block">
                NetPrint Hub
              </span>
              <span className="text-[11px] text-slate-500 font-medium leading-none block mt-0.5">
                Cyber Cafe Smart Kiosk
              </span>
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-indigo-600" />
            <span>Kiosk Upload</span>
          </button>

          <button
            onClick={() => setActiveTab('tracker')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 relative ${
              activeTab === 'tracker'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ListOrdered className="w-4 h-4 text-emerald-600" />
            <span>Live Tracker</span>
            {activeJobsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[11px] font-mono font-bold bg-amber-500 text-white rounded-full">
                {activeJobsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <History className="w-4 h-4 text-indigo-600" />
            <span>Print History</span>
          </button>

          <button
            onClick={() => setActiveTab('wallet')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'wallet'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Wallet className="w-4 h-4 text-blue-600" />
            <span>Digital Wallet</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'admin'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Admin Queue & Ink</span>
          </button>

          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'feedback'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-500/20" />
            <span>Service Quality</span>
          </button>
        </nav>

        {/* Zone 3: Actions (Region Selector & Wallet Button) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Region selector dropdown */}
          <div className="relative">
            <button
              onClick={() => setRegionDropdownOpen(!regionDropdownOpen)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">{currentRegion.city}</span>
              <span className="font-mono font-semibold">{currentRegion.currencySymbol}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {regionDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setRegionDropdownOpen(false)} 
                />
                <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Select Cafe Region
                  </div>
                  {regions.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        onSelectRegion(r.id);
                        setRegionDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                        r.id === currentRegion.id ? 'bg-indigo-50/70 text-indigo-900 font-semibold' : 'text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-slate-900">{r.name}</div>
                        <div className="text-[11px] text-slate-500">{r.city}, {r.country} · {r.edgeNode}</div>
                      </div>
                      <span className="font-mono font-bold text-slate-900">{r.currencySymbol} {r.currencyCode}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Integrated Wallet Balance Quick CTA */}
          <button
            onClick={onOpenTopUp}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Wallet className="w-3.5 h-3.5 text-indigo-200" />
            <div className="text-left">
              <span className="hidden sm:inline text-indigo-200 text-[10px] block leading-none">Wallet</span>
              <span className="font-mono tabular-nums leading-none block">
                {formatCurrency(walletBalanceUSD, currentRegion)}
              </span>
            </div>
            <span className="w-4 h-4 rounded bg-indigo-500/80 flex items-center justify-center text-[11px] font-bold">+</span>
          </button>
        </div>
      </div>

      {/* Mobile secondary tab strip */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200 bg-slate-50/80 px-2 py-1.5 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-2.5 py-1 rounded font-medium whitespace-nowrap ${
            activeTab === 'upload' ? 'bg-white shadow-xs text-indigo-700 font-semibold' : 'text-slate-600'
          }`}
        >
          Upload
        </button>
        <button
          onClick={() => setActiveTab('tracker')}
          className={`px-2.5 py-1 rounded font-medium whitespace-nowrap relative ${
            activeTab === 'tracker' ? 'bg-white shadow-xs text-emerald-700 font-semibold' : 'text-slate-600'
          }`}
        >
          Tracker {activeJobsCount > 0 ? `(${activeJobsCount})` : ''}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-2.5 py-1 rounded font-medium whitespace-nowrap ${
            activeTab === 'history' ? 'bg-white shadow-xs text-indigo-700 font-semibold' : 'text-slate-600'
          }`}
        >
          History
        </button>
        <button
          onClick={() => setActiveTab('wallet')}
          className={`px-2.5 py-1 rounded font-medium whitespace-nowrap ${
            activeTab === 'wallet' ? 'bg-white shadow-xs text-blue-700 font-semibold' : 'text-slate-600'
          }`}
        >
          Wallet
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`px-2.5 py-1 rounded font-medium whitespace-nowrap ${
            activeTab === 'admin' ? 'bg-white shadow-xs text-purple-700 font-semibold' : 'text-slate-600'
          }`}
        >
          Admin
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-2.5 py-1 rounded font-medium whitespace-nowrap ${
            activeTab === 'feedback' ? 'bg-white shadow-xs text-amber-700 font-semibold' : 'text-slate-600'
          }`}
        >
          Reviews
        </button>
      </div>
    </header>
  );
};
