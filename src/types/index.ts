export type RegionId = 'syam_nuzvidu';

export interface Region {
  id: RegionId;
  name: string;
  city: string;
  country: string;
  currencySymbol: string;
  currencyCode: string;
  exchangeRateToUSD: number; // 1 USD = X local
  baseA4BWPrice: number;
  baseA4ColorPrice: number;
  edgeNode: string;
  latencyMs: number;
}

export type ColorMode = 'bw' | 'color';
export type PaperSize = 'A4' | 'A3' | 'Letter' | 'Legal' | 'Photo_4x6';
export type DuplexMode = 'single' | 'duplex_long' | 'duplex_short';
export type PrintQuality = 'draft' | 'standard' | 'high_res';

export interface PrintPreferences {
  colorMode: ColorMode;
  paperSize: PaperSize;
  duplex: DuplexMode;
  copies: number;
  pageRange: 'all' | 'custom';
  customPages?: string;
  orientation: 'portrait' | 'landscape';
  quality: PrintQuality;
  stapling: boolean;
  collate: boolean;
}

export interface UploadedDocument {
  id: string;
  name: string;
  sizeBytes: number;
  type: string;
  totalPages: number;
  previewSnippet: string;
  uploadedAt: number;
}

export interface DynamicPricingQuote {
  basePerSheet: number;
  colorMultiplier: number;
  paperMultiplier: number;
  duplexDiscountRatio: number;
  qualityMultiplier: number;
  demandSurgeMultiplier: number; // e.g. 1.25x if queue busy
  supplySurgeMultiplier: number; // e.g. 1.15x if toner/paper low
  offPeakDiscountMultiplier: number; // e.g. 0.90x
  totalPriceUSD: number;
  totalPriceLocal: number;
  currencySymbol: string;
  currencyCode: string;
  priceBreakdownReasons: string[];
}

export type JobStatus = 
  | 'uploaded'
  | 'payment_pending'
  | 'queued'
  | 'printing'
  | 'ready_for_pickup'
  | 'completed'
  | 'cancelled';

export interface PrintJob {
  id: string;
  pickupPin: string;
  customerName: string;
  stationId: string;
  regionId: RegionId;
  document: UploadedDocument;
  preferences: PrintPreferences;
  quote: DynamicPricingQuote;
  status: JobStatus;
  currentPrintingPage: number;
  totalPages: number;
  progressPercent: number;
  assignedPrinterId: string;
  assignedPrinterName: string;
  pickupTray: string;
  estimatedWaitSeconds: number;
  createdAt: number;
  completedAt?: number;
  feedback?: JobFeedback;
}

export interface JobFeedback {
  jobId: string;
  rating: number; // 1 to 5
  tags: string[];
  comment: string;
  customerName: string;
  submittedAt: number;
}

export interface PrinterConsumables {
  cyan: number; // 0 - 100
  magenta: number;
  yellow: number;
  black: number;
  paperTrays: {
    a4: number; // sheets (e.g. max 500)
    a4Max: number;
    a3: number; // sheets (e.g. max 250)
    a3Max: number;
    photo: number; // sheets (e.g. max 100)
    photoMax: number;
  };
}

export type PrinterStatus = 'idle' | 'printing' | 'low_toner' | 'paper_jam' | 'offline';
export type PrinterProtocol = 'RAW_9100' | 'IPP_631' | 'LPR_515';
export type ConnectionStatus = 'connected' | 'unreachable' | 'offline';

export interface Printer {
  id: string;
  name: string;
  model: string;
  bayNumber: number;
  regionId: RegionId;
  status: PrinterStatus;
  
  // Real-world hardware & network properties
  ipAddress: string;
  port: number;
  protocol: PrinterProtocol;
  macAddress: string;
  snmpCommunity: string;
  connectionStatus: ConnectionStatus;
  lastPingMs: number;
  driverName: string;
  hardwareSerial: string;

  ink: {
    cyan: number;
    magenta: number;
    yellow: number;
    black: number;
  };
  paper: {
    a4: number;
    a4Max: number;
    a3: number;
    a3Max: number;
    photo: number;
    photoMax: number;
  };
  totalJobsPrinted: number;
  supportsColor: boolean;
  supportsA3: boolean;
}

export interface WalletTransaction {
  id: string;
  type: 'deposit' | 'print_payment' | 'refund';
  amountUSD: number;
  amountLocal: number;
  currencySymbol: string;
  description: string;
  timestamp: number;
  jobId?: string;
  paymentMethod?: string;
}

export interface WalletAccount {
  balanceUSD: number;
  transactions: WalletTransaction[];
}

export interface MarketplaceConfig {
  autoSurgeEnabled: boolean;
  manualSurgeMultiplier: number;
  surgeSensitivity: 'low' | 'balanced' | 'aggressive';
  offPeakHappyHour: boolean;
}
