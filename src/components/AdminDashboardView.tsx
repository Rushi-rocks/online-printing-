import React from 'react';
import { Printer, PrintJob, MarketplaceConfig, Region } from '../types';
import { formatCurrency } from '../services/dynamicPricing';
import { 
  ShieldCheck, 
  Layers, 
  Droplets, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  RotateCw, 
  XCircle, 
  Plus, 
  Sliders, 
  PauseCircle, 
  PlayCircle,
  FileText,
  Clock,
  Printer as PrinterIcon,
  Zap,
  Activity,
  Network,
  Server,
  Settings,
  HelpCircle,
  Radio
} from 'lucide-react';

interface AdminDashboardViewProps {
  printers: Printer[];
  jobs: PrintJob[];
  marketplaceConfig: MarketplaceConfig;
  currentRegion: Region;
  onUpdateMarketplaceConfig: (config: MarketplaceConfig) => void;
  onRefillInk: (printerId: string, color: 'cyan' | 'magenta' | 'yellow' | 'black' | 'all') => void;
  onRestockPaper: (printerId: string, tray: 'a4' | 'a3' | 'photo') => void;
  onTogglePrinterStatus: (printerId: string) => void;
  onPrioritizeJob: (jobId: string) => void;
  onCancelAndRefund: (jobId: string) => void;
  onReprintJob: (job: PrintJob) => void;
  onEditHardware: (printer: Printer) => void;
  onOpenDeploymentGuide: () => void;
  onAddPrinter: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  printers,
  jobs,
  marketplaceConfig,
  currentRegion,
  onUpdateMarketplaceConfig,
  onRefillInk,
  onRestockPaper,
  onTogglePrinterStatus,
  onPrioritizeJob,
  onCancelAndRefund,
  onReprintJob,
  onEditHardware,
  onOpenDeploymentGuide,
  onAddPrinter,
}) => {
  const [activeTab, setActiveTab] = React.useState<'printers' | 'queues' | 'pricing'>('printers');
  const [queuePaused, setQueuePaused] = React.useState<boolean>(false);

  // Queue stats
  const activeJobs = jobs.filter((j) => j.status === 'queued' || j.status === 'printing');
  const completedJobs = jobs.filter((j) => j.status === 'completed' || j.status === 'ready_for_pickup');
  const totalRevenueUSD = completedJobs.reduce((acc, j) => acc + j.quote.totalPriceUSD, 0);
  const totalPagesPrinted = completedJobs.reduce((acc, j) => acc + j.totalPages, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>OPERATOR CONTROL CONSOLE · {currentRegion.name}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Print Queues & Hardware Fleet Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure LAN IP addresses, monitor real-time printer telemetry, refill CMYK toners, and supervise active queues.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Real World Deployment Guide Button */}
          <button
            onClick={onOpenDeploymentGuide}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Server className="w-4 h-4" />
            <span>Real-World Setup & IP Guide</span>
          </button>

          {/* Tab switchers */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab('printers')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'printers' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Network className="w-3.5 h-3.5 text-cyan-600" />
              <span>Hardware & IP Addresses ({printers.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('queues')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'queues' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-indigo-600" />
              <span>Live Queues ({activeJobs.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'pricing' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dynamic Demand Engine</span>
            </button>
          </div>
        </div>
      </div>

      {/* Operations Quick KPIs Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Today's Print Revenue</div>
          <div className="font-mono text-xl font-bold text-slate-900 mt-1 tabular-nums">
            {formatCurrency(totalRevenueUSD, currentRegion)}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
            <span className="font-mono">+{completedJobs.length} paid orders</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Pages Produced</div>
          <div className="font-mono text-xl font-bold text-slate-900 mt-1 tabular-nums">
            {totalPagesPrinted} <span className="text-xs font-normal text-slate-500">sheets</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            High efficiency laser output
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Active Spooler Queue</div>
          <div className="font-mono text-xl font-bold text-indigo-600 mt-1 tabular-nums">
            {activeJobs.length} <span className="text-xs font-normal text-slate-500">jobs pending</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Avg wait: ~1.2 mins
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">LAN Fleet Connectivity</div>
          <div className="font-mono text-xl font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>{printers.filter(p => p.connectionStatus === 'connected').length}/{printers.length} Online</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            LAN Sockets Active on 192.168.1.x
          </div>
        </div>
      </div>

      {/* Tab 1: Hardware & Consumables (Ink Gauges & IP Addresses) */}
      {activeTab === 'printers' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Network className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-indigo-950 text-sm">Where Hardware Properties & IP Addresses are Added:</h4>
                <p className="text-xs text-indigo-800">
                  Each machine below is bound to a physical IP on your cyber cafe router subnet. Click <strong>"Edit Hardware & IP"</strong> on any card to update its IP, port, or driver.
                </p>
              </div>
            </div>

            <button
              onClick={onAddPrinter}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Network Printer</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {printers.map((printer) => {
              const isJam = printer.status === 'paper_jam';
              const isLowToner = printer.status === 'low_toner';

              return (
                <div
                  key={printer.id}
                  className={`bg-white rounded-2xl border transition-all p-5 shadow-xs flex flex-col justify-between ${
                    isJam
                      ? 'border-rose-300 ring-2 ring-rose-500/20'
                      : isLowToner
                      ? 'border-amber-300'
                      : 'border-slate-200'
                  }`}
                >
                  <div>
                    {/* Printer Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-[11px] font-mono font-semibold text-slate-400 uppercase">
                          Bay {printer.bayNumber} Hardware
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm leading-tight">
                          {printer.name}
                        </h4>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {printer.model}
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          printer.status === 'printing'
                            ? 'bg-indigo-100 text-indigo-800'
                            : isJam
                            ? 'bg-rose-100 text-rose-800'
                            : isLowToner
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {printer.status.toUpperCase().replace('_', ' ')}
                      </span>
                    </div>

                    {/* Network & IP Address Badge Box */}
                    <div className="my-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <Radio className="w-3.5 h-3.5 text-emerald-600" />
                          <span>LAN Socket IP:</span>
                        </span>
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          {printer.ipAddress}:{printer.port}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                        <span>Protocol: {printer.protocol}</span>
                        <span className="text-emerald-600 font-bold">{printer.lastPingMs}ms ping</span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-200/60">
                        <span>MAC: {printer.macAddress}</span>
                        <span>SNMP: {printer.snmpCommunity}</span>
                      </div>
                    </div>

                    {/* Paper Jam Alert Warning if simulated */}
                    {isJam && (
                      <div className="mb-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-800">
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>Paper feed sensor jam</span>
                        </div>
                        <button
                          onClick={() => onTogglePrinterStatus(printer.id)}
                          className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-semibold text-[11px] cursor-pointer"
                        >
                          Clear Jam
                        </button>
                      </div>
                    )}

                    {/* Ink / Toner Levels Gauges */}
                    <div className="mb-5">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                        <span className="flex items-center gap-1.5">
                          <Droplets className="w-3.5 h-3.5 text-cyan-600" />
                          CMYK Laser Toner Gauges
                        </span>
                        <button
                          onClick={() => onRefillInk(printer.id, 'all')}
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                        >
                          Refill All
                        </button>
                      </div>

                      <div className="space-y-2">
                        {/* Cyan */}
                        <div>
                          <div className="flex justify-between text-[11px] text-slate-600 mb-0.5 font-mono">
                            <span>Cyan (C)</span>
                            <span className={printer.ink.cyan < 25 ? 'text-rose-600 font-bold' : ''}>
                              {printer.ink.cyan}%
                            </span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                              style={{ width: `${printer.ink.cyan}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Magenta */}
                        <div>
                          <div className="flex justify-between text-[11px] text-slate-600 mb-0.5 font-mono">
                            <span>Magenta (M)</span>
                            <span className={printer.ink.magenta < 25 ? 'text-rose-600 font-bold' : ''}>
                              {printer.ink.magenta}%
                            </span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-pink-500 rounded-full transition-all duration-300"
                              style={{ width: `${printer.ink.magenta}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Yellow */}
                        <div>
                          <div className="flex justify-between text-[11px] text-slate-600 mb-0.5 font-mono">
                            <span>Yellow (Y)</span>
                            <span className={printer.ink.yellow < 25 ? 'text-rose-600 font-bold' : ''}>
                              {printer.ink.yellow}%
                            </span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-400 rounded-full transition-all duration-300"
                              style={{ width: `${printer.ink.yellow}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Black */}
                        <div>
                          <div className="flex justify-between text-[11px] text-slate-600 mb-0.5 font-mono">
                            <span>Key Black (K)</span>
                            <span className={printer.ink.black < 25 ? 'text-rose-600 font-bold' : ''}>
                              {printer.ink.black}%
                            </span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-slate-900 rounded-full transition-all duration-300"
                              style={{ width: `${printer.ink.black}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Paper Trays Capacity */}
                    <div className="mb-4">
                      <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-slate-600" />
                        <span>Paper Trays Inventory</span>
                      </div>
                      <div className="space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                          <div>
                            <span className="font-semibold text-slate-800">Tray 1: A4 Standard</span>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {printer.paper.a4} / {printer.paper.a4Max} sheets
                            </div>
                          </div>
                          <button
                            onClick={() => onRestockPaper(printer.id, 'a4')}
                            className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-[11px] font-semibold cursor-pointer"
                          >
                            +500 Sheets
                          </button>
                        </div>

                        {printer.supportsA3 && (
                          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                            <div>
                              <span className="font-semibold text-slate-800">Tray 2: A3 Ledger</span>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {printer.paper.a3} / {printer.paper.a3Max} sheets
                              </div>
                            </div>
                            <button
                              onClick={() => onRestockPaper(printer.id, 'a3')}
                              className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-[11px] font-semibold cursor-pointer"
                            >
                              +250 Sheets
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Hardware & Diagnostics Action Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => onEditHardware(printer)}
                      className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Edit Hardware & IP</span>
                    </button>

                    <button
                      onClick={() => onTogglePrinterStatus(printer.id)}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline cursor-pointer"
                    >
                      {isJam ? 'Reset Printer' : 'Simulate Jam'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Live Queues Management */}
      {activeTab === 'queues' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Real-Time Spooler Job Queue</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Supervise active customer printing batches, bump priority, or issue instant wallet refunds.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQueuePaused(!queuePaused)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    queuePaused
                      ? 'bg-amber-500 text-white border-amber-600'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {queuePaused ? <PlayCircle className="w-3.5 h-3.5" /> : <PauseCircle className="w-3.5 h-3.5" />}
                  <span>{queuePaused ? 'Resume Spooler' : 'Pause Spooler'}</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-5">Job ID & PIN</th>
                    <th className="py-3 px-5">Customer & Terminal</th>
                    <th className="py-3 px-5">Document</th>
                    <th className="py-3 px-5">Specs</th>
                    <th className="py-3 px-5">Hardware IP & Bay</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {jobs.map((job) => {
                    const isQueued = job.status === 'queued';
                    const isPrinting = job.status === 'printing';
                    const assignedP = printers.find(p => p.id === job.assignedPrinterId);

                    return (
                      <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="font-mono font-bold text-slate-900">{job.id}</div>
                          <div className="text-[10px] text-amber-700 font-mono font-semibold">
                            PIN: {job.pickupPin}
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="font-semibold text-slate-800">{job.customerName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{job.stationId}</div>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="font-medium text-slate-900 truncate max-w-[180px]">
                            {job.document.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {job.totalPages} sheets · {(job.document.sizeBytes / 1024 / 1024).toFixed(1)} MB
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="font-mono text-slate-700 uppercase font-medium">
                            {job.preferences.paperSize} · {job.preferences.colorMode} · {job.preferences.duplex}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-slate-700 font-medium">
                          <div>{job.assignedPrinterName}</div>
                          {assignedP && (
                            <div className="text-[10px] text-slate-400 font-mono">
                              {assignedP.ipAddress}:{assignedP.port}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-5">
                          {isPrinting && (
                            <span className="inline-flex items-center gap-1 font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping"></span>
                              Printing ({job.progressPercent}%)
                            </span>
                          )}
                          {isQueued && (
                            <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Queued
                            </span>
                          )}
                          {job.status === 'ready_for_pickup' && (
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                              Ready in Tray
                            </span>
                          )}
                          {job.status === 'completed' && (
                            <span className="text-slate-500 font-medium">Completed</span>
                          )}
                          {job.status === 'cancelled' && (
                            <span className="text-rose-600 font-medium">Cancelled</span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-right space-x-1">
                          {isQueued && (
                            <button
                              onClick={() => onPrioritizeJob(job.id)}
                              className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-[11px] font-semibold cursor-pointer"
                              title="Bump to top of print queue"
                            >
                              Prioritize
                            </button>
                          )}
                          {(isQueued || isPrinting) && (
                            <button
                              onClick={() => onCancelAndRefund(job.id)}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-[11px] font-semibold cursor-pointer"
                              title="Cancel and auto-refund customer"
                            >
                              Refund
                            </button>
                          )}
                          {job.status === 'completed' && (
                            <button
                              onClick={() => onReprintJob(job)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold cursor-pointer"
                              title="Send duplicate copy to printer"
                            >
                              Reprint
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Dynamic Demand & Supply Marketplace Controls */}
      {activeTab === 'pricing' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Marketplace Surge & Supply Calibration</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure real-time pricing algorithms responding dynamically to queue congestion and consumable levels.
              </p>
            </div>

            {/* Toggle 1: Auto Surge */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <div className="text-xs font-bold text-slate-900">
                  Automatic Dynamic Surge Pricing
                </div>
                <div className="text-[11px] text-slate-500">
                  Automatically adjusts rates between 1.0x and 1.45x based on real-time spooler queues.
                </div>
              </div>
              <button
                onClick={() =>
                  onUpdateMarketplaceConfig({
                    ...marketplaceConfig,
                    autoSurgeEnabled: !marketplaceConfig.autoSurgeEnabled,
                  })
                }
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  marketplaceConfig.autoSurgeEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    marketplaceConfig.autoSurgeEnabled ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Sensitivity */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                Surge Sensitivity Curve
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'balanced', 'aggressive'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() =>
                      onUpdateMarketplaceConfig({
                        ...marketplaceConfig,
                        surgeSensitivity: lvl,
                      })
                    }
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold capitalize transition-all cursor-pointer ${
                      marketplaceConfig.surgeSensitivity === lvl
                        ? 'border-indigo-600 bg-indigo-50/80 text-indigo-900 ring-1 ring-indigo-500/30'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Happy Hour Off-Peak Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
              <div>
                <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Off-Peak "Green Hour" Discount</span>
                </div>
                <div className="text-[11px] text-emerald-800">
                  Incentivize print jobs during quiet morning and late evening hours with -15% off.
                </div>
              </div>
              <button
                onClick={() =>
                  onUpdateMarketplaceConfig({
                    ...marketplaceConfig,
                    offPeakHappyHour: !marketplaceConfig.offPeakHappyHour,
                  })
                }
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  marketplaceConfig.offPeakHappyHour ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    marketplaceConfig.offPeakHappyHour ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Manual Surge Multiplier Override */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Manual Multiplier Override</span>
                <span className="font-mono text-indigo-600 font-bold">
                  {marketplaceConfig.manualSurgeMultiplier.toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min="0.8"
                max="2.0"
                step="0.05"
                value={marketplaceConfig.manualSurgeMultiplier}
                onChange={(e) =>
                  onUpdateMarketplaceConfig({
                    ...marketplaceConfig,
                    manualSurgeMultiplier: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>0.80x (Discount)</span>
                <span>1.0x (Standard)</span>
                <span>2.00x (Extreme Peak)</span>
              </div>
            </div>
          </div>

          {/* Simulator & Transparency Card */}
          <div className="md:col-span-5 bg-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-indigo-400 uppercase tracking-wider mb-2">
                Live Pricing Telemetry Simulator
              </div>
              <h4 className="text-lg font-bold">Demand & Supply Impact</h4>
              <p className="text-xs text-slate-400 mt-1 mb-5">
                Current cafe queue conditions produce the following dynamic multiplier for incoming customer requests.
              </p>

              <div className="space-y-3 bg-slate-800/80 rounded-xl p-4 border border-slate-700/60 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Queue Length:</span>
                  <span className="text-white font-bold">{activeJobs.length} active jobs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Demand Multiplier:</span>
                  <span className="text-emerald-400 font-bold">
                    {activeJobs.length >= 4 ? '1.25x (Surge)' : '1.00x (Normal)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cyan Toner Status:</span>
                  <span className="text-cyan-300">
                    {printers.some((p) => p.ink.cyan < 30) ? 'Scarcity warning' : 'Nominal'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-700">
                  <span className="text-white font-bold">Net Multiplier:</span>
                  <span className="text-indigo-300 font-bold">
                    {(activeJobs.length >= 4 ? 1.25 : 1.0).toFixed(2)}x
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800 text-[11px] text-slate-400">
              *All pricing dynamically syncs with all customer terminal kiosks and mobile QR sessions instantly.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
