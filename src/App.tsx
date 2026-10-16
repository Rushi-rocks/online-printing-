import React from 'react';
import { 
  Region, 
  RegionId, 
  Printer, 
  PrintJob, 
  WalletAccount, 
  JobFeedback, 
  MarketplaceConfig, 
  UploadedDocument, 
  PrintPreferences 
} from './types';
import { 
  REGIONS, 
  INITIAL_PRINTERS, 
  INITIAL_JOBS, 
  INITIAL_WALLET, 
  INITIAL_FEEDBACK, 
  INITIAL_MARKETPLACE_CONFIG 
} from './data/initialData';
import { calculateDynamicQuote } from './services/dynamicPricing';
import { TopNav } from './components/TopNav';
import { KioskUploadView } from './components/KioskUploadView';
import { JobTrackerView } from './components/JobTrackerView';
import { WalletView } from './components/WalletView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { FeedbackView } from './components/FeedbackView';
import { TopUpModal } from './components/TopUpModal';
import { StationQrModal } from './components/StationQrModal';
import { CameraQrScannerModal } from './components/CameraQrScannerModal';
import { FeedbackModal } from './components/FeedbackModal';
import { PrinterHardwareModal } from './components/PrinterHardwareModal';
import { RealWorldDeploymentGuideModal } from './components/RealWorldDeploymentGuideModal';
import { PrintHistoryView } from './components/PrintHistoryView';
import confetti from 'canvas-confetti';

export default function App() {
  // Query parameters parsing for station (Default to SYA Net World Desk-01)
  const [stationId, setStationId] = React.useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const st = params.get('station');
      if (st) return st;
    }
    return 'Desk-01';
  });

  // Single region: SYAM NET WORLD (Nuzvidu, Andhra Pradesh, India)
  const regionId: RegionId = 'syam_nuzvidu';
  const currentRegion = REGIONS[0];

  // Main navigation tab
  const [activeTab, setActiveTab] = React.useState<'upload' | 'tracker' | 'history' | 'wallet' | 'admin' | 'feedback'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'upload' || params.get('station')) {
        return 'upload';
      }
    }
    return 'upload';
  });

  // Core App State
  const [printers, setPrinters] = React.useState<Printer[]>(INITIAL_PRINTERS);
  const [jobs, setJobs] = React.useState<PrintJob[]>(INITIAL_JOBS);
  const [wallet, setWallet] = React.useState<WalletAccount>(INITIAL_WALLET);
  const [feedbacks, setFeedbacks] = React.useState<JobFeedback[]>(INITIAL_FEEDBACK);
  const [marketplaceConfig, setMarketplaceConfig] = React.useState<MarketplaceConfig>(INITIAL_MARKETPLACE_CONFIG);

  // Modals
  const [topUpModalOpen, setTopUpModalOpen] = React.useState<boolean>(false);
  const [qrModalOpen, setQrModalOpen] = React.useState<boolean>(false);
  const [cameraScannerOpen, setCameraScannerOpen] = React.useState<boolean>(false);
  const [feedbackModalJob, setFeedbackModalJob] = React.useState<PrintJob | null>(null);
  const [hardwareModalPrinter, setHardwareModalPrinter] = React.useState<Printer | null>(null);
  const [deploymentGuideOpen, setDeploymentGuideOpen] = React.useState<boolean>(false);

  // Active print queue count for dynamic demand pricing
  const activeQueueCount = React.useMemo(() => {
    return jobs.filter((j) => j.status === 'queued' || j.status === 'printing').length;
  }, [jobs]);

  // Real-time printing simulator interval
  React.useEffect(() => {
    const timer = setInterval(() => {
      setJobs((prevJobs) => {
        let hasChanges = false;
        const updated = prevJobs.map((job) => {
          if (job.status === 'printing') {
            hasChanges = true;
            const newProgress = Math.min(100, job.progressPercent + 14);
            const newPage = Math.min(job.totalPages, Math.max(1, Math.ceil((newProgress / 100) * job.totalPages)));
            const newWait = Math.max(0, job.estimatedWaitSeconds - 4);

            if (newProgress >= 100) {
              confetti({
                particleCount: 65,
                spread: 70,
                origin: { y: 0.5 },
              });

              // Decrement printer paper and toner slightly
              setPrinters((prevP) =>
                prevP.map((p) => {
                  if (p.id === job.assignedPrinterId) {
                    return {
                      ...p,
                      status: 'idle',
                      totalJobsPrinted: p.totalJobsPrinted + 1,
                      ink: {
                        ...p.ink,
                        black: Math.max(5, p.ink.black - (job.preferences.colorMode === 'bw' ? 2 : 1)),
                        cyan: job.preferences.colorMode === 'color' ? Math.max(5, p.ink.cyan - 3) : p.ink.cyan,
                        magenta: job.preferences.colorMode === 'color' ? Math.max(5, p.ink.magenta - 3) : p.ink.magenta,
                        yellow: job.preferences.colorMode === 'color' ? Math.max(5, p.ink.yellow - 3) : p.ink.yellow,
                      },
                      paper: {
                        ...p.paper,
                        a4: Math.max(10, p.paper.a4 - (job.preferences.paperSize === 'A4' ? job.totalPages : 0)),
                      },
                    };
                  }
                  return p;
                })
              );

              return {
                ...job,
                status: 'ready_for_pickup' as const,
                progressPercent: 100,
                currentPrintingPage: job.totalPages,
                estimatedWaitSeconds: 0,
                completedAt: Date.now(),
              };
            }

            return {
              ...job,
              progressPercent: newProgress,
              currentPrintingPage: newPage,
              estimatedWaitSeconds: newWait,
            };
          } else if (job.status === 'queued') {
            const printer = printers.find((p) => p.id === job.assignedPrinterId);
            if (printer && printer.status !== 'paper_jam') {
              hasChanges = true;
              return {
                ...job,
                status: 'printing' as const,
                progressPercent: 12,
                currentPrintingPage: 1,
              };
            }
          }
          return job;
        });

        return hasChanges ? updated : prevJobs;
      });
    }, 2400);

    return () => clearInterval(timer);
  }, [printers]);

  // Handlers for Kiosk Print Submission
  const handleSubmitJob = (
    doc: UploadedDocument,
    prefs: PrintPreferences,
    customerName: string,
    paymentMethod: 'wallet' | 'direct'
  ) => {
    const quote = calculateDynamicQuote(
      prefs,
      doc.totalPages,
      currentRegion,
      activeQueueCount,
      printers,
      marketplaceConfig
    );

    let targetPrinter = printers.find(
      (p) =>
        p.status !== 'offline' &&
        p.status !== 'paper_jam' &&
        (prefs.colorMode === 'bw' || p.supportsColor) &&
        (prefs.paperSize !== 'A3' || p.supportsA3)
    );
    if (!targetPrinter) {
      targetPrinter = printers[0];
    }

    const newJobId = `JOB-${Math.floor(1000 + Math.random() * 9000)}`;
    const randomPin = String(Math.floor(1000 + Math.random() * 9000));

    const newJob: PrintJob = {
      id: newJobId,
      pickupPin: randomPin,
      customerName: customerName || 'Nuzvidu Customer',
      stationId,
      regionId,
      document: doc,
      preferences: prefs,
      quote,
      status: 'queued',
      currentPrintingPage: 0,
      totalPages: doc.totalPages * prefs.copies,
      progressPercent: 0,
      assignedPrinterId: targetPrinter.id,
      assignedPrinterName: `${targetPrinter.name} (Bay ${targetPrinter.bayNumber})`,
      pickupTray: `Tray ${targetPrinter.bayNumber === 1 ? 'A' : targetPrinter.bayNumber === 2 ? 'B' : 'C'} - Station Counter`,
      estimatedWaitSeconds: 25 + activeQueueCount * 20,
      createdAt: Date.now(),
    };

    if (paymentMethod === 'wallet') {
      const deductionUSD = quote.totalPriceUSD;
      setWallet((prev) => ({
        balanceUSD: Number((prev.balanceUSD - deductionUSD).toFixed(2)),
        transactions: [
          {
            id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
            type: 'print_payment',
            amountUSD: -deductionUSD,
            amountLocal: -quote.totalPriceLocal,
            currencySymbol: currentRegion.currencySymbol,
            description: `Print Job #${newJobId} (${doc.name})`,
            timestamp: Date.now(),
            jobId: newJobId,
            paymentMethod: 'Digital Wallet',
          },
          ...prev.transactions,
        ],
      }));
    } else {
      setWallet((prev) => ({
        ...prev,
        transactions: [
          {
            id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
            type: 'print_payment',
            amountUSD: -quote.totalPriceUSD,
            amountLocal: -quote.totalPriceLocal,
            currencySymbol: currentRegion.currencySymbol,
            description: `Direct UPI Payment: #${newJobId} (${doc.name})`,
            timestamp: Date.now(),
            jobId: newJobId,
            paymentMethod: 'UPI / PhonePe / GPay',
          },
          ...prev.transactions,
        ],
      }));
    }

    setJobs((prev) => [newJob, ...prev]);
    setActiveTab('tracker');

    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  // Handler for Wallet Top-Up
  const handleTopUp = (amountUSD: number, paymentMethod: string) => {
    const localAmount = Math.round(amountUSD * currentRegion.exchangeRateToUSD);

    setWallet((prev) => ({
      balanceUSD: Number((prev.balanceUSD + amountUSD).toFixed(2)),
      transactions: [
        {
          id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
          type: 'deposit',
          amountUSD,
          amountLocal: localAmount,
          currencySymbol: currentRegion.currencySymbol,
          description: `Instant UPI Recharge via ${paymentMethod.replace('_', ' ').toUpperCase()}`,
          timestamp: Date.now(),
          paymentMethod,
        },
        ...prev.transactions,
      ],
    }));
  };

  // Cancel and automatic refund
  const handleCancelAndRefund = (jobId: string) => {
    const targetJob = jobs.find((j) => j.id === jobId);
    if (!targetJob) return;

    const refundAmountUSD = targetJob.quote.totalPriceUSD;
    const refundAmountLocal = targetJob.quote.totalPriceLocal;

    setWallet((prev) => ({
      balanceUSD: Number((prev.balanceUSD + refundAmountUSD).toFixed(2)),
      transactions: [
        {
          id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
          type: 'refund',
          amountUSD: refundAmountUSD,
          amountLocal: refundAmountLocal,
          currencySymbol: currentRegion.currencySymbol,
          description: `Instant Refund for Cancelled Job #${jobId}`,
          timestamp: Date.now(),
          jobId,
          paymentMethod: 'Automated Wallet Credit',
        },
        ...prev.transactions,
      ],
    }));

    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: 'cancelled' as const } : j))
    );
  };

  // Prioritize job
  const handlePrioritizeJob = (jobId: string) => {
    setJobs((prev) => {
      const jobIdx = prev.findIndex((j) => j.id === jobId);
      if (jobIdx <= 0) return prev;
      const target = prev[jobIdx];
      const remaining = prev.filter((j) => j.id !== jobId);
      return [{ ...target, status: 'printing', progressPercent: 15 }, ...remaining];
    });
  };

  // Fast manual step simulation
  const handleSimulatePrintProgress = (jobId: string) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          const nextProgress = Math.min(100, job.progressPercent + 30);
          const nextStatus = nextProgress >= 100 ? ('ready_for_pickup' as const) : ('printing' as const);
          return {
            ...job,
            status: nextStatus,
            progressPercent: nextProgress,
            currentPrintingPage: Math.min(job.totalPages, Math.ceil((nextProgress / 100) * job.totalPages)),
          };
        }
        return job;
      })
    );
  };

  // Reprint completed job
  const handleReprintJob = (job: PrintJob) => {
    const reprintJob: PrintJob = {
      ...job,
      id: `JOB-${Math.floor(1000 + Math.random() * 9000)}`,
      pickupPin: String(Math.floor(1000 + Math.random() * 9000)),
      status: 'queued',
      progressPercent: 0,
      currentPrintingPage: 0,
      createdAt: Date.now(),
      feedback: undefined,
    };
    setJobs((prev) => [reprintJob, ...prev]);
    setActiveTab('tracker');
  };

  // Re-Order job from Print History
  const handleReorderJob = (
    doc: UploadedDocument,
    prefs: PrintPreferences,
    customerName: string
  ) => {
    const quote = calculateDynamicQuote(
      prefs,
      doc.totalPages,
      currentRegion,
      activeQueueCount,
      printers,
      marketplaceConfig
    );

    let targetPrinter = printers.find(
      (p) =>
        p.status !== 'offline' &&
        p.status !== 'paper_jam' &&
        (prefs.colorMode === 'bw' || p.supportsColor) &&
        (prefs.paperSize !== 'A3' || p.supportsA3)
    );
    if (!targetPrinter) {
      targetPrinter = printers[0];
    }

    const newJobId = `JOB-${Math.floor(1000 + Math.random() * 9000)}`;
    const randomPin = String(Math.floor(1000 + Math.random() * 9000));

    const newJob: PrintJob = {
      id: newJobId,
      pickupPin: randomPin,
      customerName: customerName || 'Nuzvidu Customer',
      stationId,
      regionId,
      document: doc,
      preferences: prefs,
      quote,
      status: 'queued',
      currentPrintingPage: 0,
      totalPages: doc.totalPages * (prefs.copies || 1),
      progressPercent: 0,
      assignedPrinterId: targetPrinter.id,
      assignedPrinterName: `${targetPrinter.name} (Bay ${targetPrinter.bayNumber})`,
      pickupTray: `Tray ${targetPrinter.bayNumber === 1 ? 'A' : targetPrinter.bayNumber === 2 ? 'B' : 'C'} - Station Counter`,
      estimatedWaitSeconds: 25 + activeQueueCount * 20,
      createdAt: Date.now(),
    };

    const deductionUSD = quote.totalPriceUSD;
    setWallet((prev) => ({
      balanceUSD: Number((prev.balanceUSD - deductionUSD).toFixed(2)),
      transactions: [
        {
          id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
          type: 'print_payment',
          amountUSD: -deductionUSD,
          amountLocal: -quote.totalPriceLocal,
          currencySymbol: currentRegion.currencySymbol,
          description: `Re-Order Print Job #${newJobId} (${doc.name})`,
          timestamp: Date.now(),
          jobId: newJobId,
          paymentMethod: 'Digital Wallet',
        },
        ...prev.transactions,
      ],
    }));

    setJobs((prev) => [newJob, ...prev]);
    setActiveTab('tracker');
  };

  // Refill Ink
  const handleRefillInk = (printerId: string, color: 'cyan' | 'magenta' | 'yellow' | 'black' | 'all') => {
    setPrinters((prev) =>
      prev.map((p) => {
        if (p.id === printerId) {
          return {
            ...p,
            status: p.status === 'low_toner' ? 'idle' : p.status,
            ink: {
              cyan: color === 'cyan' || color === 'all' ? 100 : p.ink.cyan,
              magenta: color === 'magenta' || color === 'all' ? 100 : p.ink.magenta,
              yellow: color === 'yellow' || color === 'all' ? 100 : p.ink.yellow,
              black: color === 'black' || color === 'all' ? 100 : p.ink.black,
            },
          };
        }
        return p;
      })
    );
  };

  // Restock Paper
  const handleRestockPaper = (printerId: string, tray: 'a4' | 'a3' | 'photo') => {
    setPrinters((prev) =>
      prev.map((p) => {
        if (p.id === printerId) {
          return {
            ...p,
            paper: {
              ...p.paper,
              [tray]: tray === 'a4' ? p.paper.a4Max : tray === 'a3' ? p.paper.a3Max : p.paper.photoMax,
            },
          };
        }
        return p;
      })
    );
  };

  // Toggle Printer Jam / Diagnostic
  const handleTogglePrinterStatus = (printerId: string) => {
    setPrinters((prev) =>
      prev.map((p) => {
        if (p.id === printerId) {
          return {
            ...p,
            status: p.status === 'paper_jam' ? 'idle' : 'paper_jam',
          };
        }
        return p;
      })
    );
  };

  // Save Printer Hardware & Network IP Changes
  const handleSavePrinterHardware = (updatedPrinter: Printer) => {
    setPrinters((prev) =>
      prev.map((p) => (p.id === updatedPrinter.id ? updatedPrinter : p))
    );
  };

  // Add New Network Printer
  const handleAddPrinter = () => {
    const nextBay = printers.length + 1;
    const newId = `printer-${Date.now()}`;
    const newPrinter: Printer = {
      id: newId,
      name: `Network Printer Bay ${nextBay}`,
      model: 'Canon imageRUNNER / HP LaserJet Pro',
      bayNumber: nextBay,
      regionId,
      status: 'idle',
      ipAddress: `192.168.1.${100 + nextBay}`,
      port: 9100,
      protocol: 'RAW_9100',
      macAddress: `00:1E:C9:8F:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}`,
      snmpCommunity: 'public',
      connectionStatus: 'connected',
      lastPingMs: 4,
      driverName: 'Generic PCL6 / PostScript Level 3',
      hardwareSerial: `CAN-IND-${Math.floor(10000 + Math.random() * 90000)}`,
      ink: {
        cyan: 100,
        magenta: 100,
        yellow: 100,
        black: 100,
      },
      paper: {
        a4: 500,
        a4Max: 500,
        a3: 250,
        a3Max: 250,
        photo: 100,
        photoMax: 100,
      },
      totalJobsPrinted: 0,
      supportsColor: true,
      supportsA3: true,
    };

    setPrinters((prev) => [...prev, newPrinter]);
    setHardwareModalPrinter(newPrinter);
  };

  // Feedback Submission
  const handleSubmitFeedback = (fb: JobFeedback) => {
    setFeedbacks((prev) => [fb, ...prev]);
    setJobs((prev) =>
      prev.map((j) => (j.id === fb.jobId ? { ...j, feedback: fb } : j))
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        walletBalanceUSD={wallet.balanceUSD}
        currentRegion={currentRegion}
        onOpenQrModal={() => setQrModalOpen(true)}
        onOpenLiveScanner={() => setCameraScannerOpen(true)}
        onOpenTopUp={() => setTopUpModalOpen(true)}
        activeJobsCount={activeQueueCount}
        stationId={stationId}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'upload' && (
          <KioskUploadView
            stationId={stationId}
            currentRegion={currentRegion}
            printers={printers}
            activeQueueCount={activeQueueCount}
            marketplaceConfig={marketplaceConfig}
            walletBalanceUSD={wallet.balanceUSD}
            onOpenTopUp={() => setTopUpModalOpen(true)}
            onOpenQrModal={() => setQrModalOpen(true)}
            onOpenLiveScanner={() => setCameraScannerOpen(true)}
            onSubmitJob={handleSubmitJob}
          />
        )}

        {activeTab === 'tracker' && (
          <JobTrackerView
            jobs={jobs}
            currentRegion={currentRegion}
            onCancelAndRefund={handleCancelAndRefund}
            onOpenFeedback={(j) => setFeedbackModalJob(j)}
            onSimulatePrintProgress={handleSimulatePrintProgress}
          />
        )}

        {activeTab === 'history' && (
          <PrintHistoryView
            jobs={jobs}
            currentRegion={currentRegion}
            walletBalanceUSD={wallet.balanceUSD}
            onReorderJob={handleReorderJob}
            onOpenFeedback={(j) => setFeedbackModalJob(j)}
            onOpenTopUp={() => setTopUpModalOpen(true)}
          />
        )}

        {activeTab === 'wallet' && (
          <WalletView
            wallet={wallet}
            currentRegion={currentRegion}
            onOpenTopUp={() => setTopUpModalOpen(true)}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboardView
            printers={printers}
            jobs={jobs}
            marketplaceConfig={marketplaceConfig}
            currentRegion={currentRegion}
            onUpdateMarketplaceConfig={setMarketplaceConfig}
            onRefillInk={handleRefillInk}
            onRestockPaper={handleRestockPaper}
            onTogglePrinterStatus={handleTogglePrinterStatus}
            onPrioritizeJob={handlePrioritizeJob}
            onCancelAndRefund={handleCancelAndRefund}
            onReprintJob={handleReprintJob}
            onEditHardware={(p) => setHardwareModalPrinter(p)}
            onOpenDeploymentGuide={() => setDeploymentGuideOpen(true)}
            onAddPrinter={handleAddPrinter}
          />
        )}

        {activeTab === 'feedback' && (
          <FeedbackView
            feedbacks={feedbacks}
            currentRegion={currentRegion}
            onOpenNewFeedback={() => {
              const lastDone = jobs.find((j) => j.status === 'ready_for_pickup' || j.status === 'completed');
              if (lastDone) {
                setFeedbackModalJob(lastDone);
              } else {
                setFeedbackModalJob(jobs[0]);
              }
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 sm:px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">SYAM NET WORLD</span>
            <span>·</span>
            <span>Nuzvidu Cyber Cafe & Digital Xerox Infrastructure</span>
            <span>·</span>
            <span className="font-mono text-emerald-600">Local Spooler Active (2ms)</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Terminal: <strong className="font-mono text-slate-800">{stationId}</strong></span>
            <span>·</span>
            <button
              onClick={() => setDeploymentGuideOpen(true)}
              className="text-emerald-700 hover:text-emerald-900 font-semibold underline cursor-pointer"
            >
              Hardware & IP Guide
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TopUpModal
        isOpen={topUpModalOpen}
        onClose={() => setTopUpModalOpen(false)}
        walletBalanceUSD={wallet.balanceUSD}
        currentRegion={currentRegion}
        onTopUp={handleTopUp}
      />

      <StationQrModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        stationId={stationId}
        onSelectStation={(st) => setStationId(st)}
        currentRegion={currentRegion}
        onOpenLiveScanner={() => {
          setQrModalOpen(false);
          setCameraScannerOpen(true);
        }}
        onOpenUploadDirectly={() => {
          setQrModalOpen(false);
          setActiveTab('upload');
        }}
      />

      <CameraQrScannerModal
        isOpen={cameraScannerOpen}
        onClose={() => setCameraScannerOpen(false)}
        onScanSuccess={(scannedStation) => {
          setStationId(scannedStation);
          setActiveTab('upload');
          confetti({
            particleCount: 50,
            spread: 60,
          });
        }}
      />

      <FeedbackModal
        job={feedbackModalJob}
        isOpen={!!feedbackModalJob}
        onClose={() => setFeedbackModalJob(null)}
        onSubmitFeedback={handleSubmitFeedback}
      />

      <PrinterHardwareModal
        printer={hardwareModalPrinter}
        isOpen={!!hardwareModalPrinter}
        onClose={() => setHardwareModalPrinter(null)}
        onSavePrinter={handleSavePrinterHardware}
      />

      <RealWorldDeploymentGuideModal
        isOpen={deploymentGuideOpen}
        onClose={() => setDeploymentGuideOpen(false)}
      />
    </div>
  );
}
