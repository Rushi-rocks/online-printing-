import { PrintPreferences, DynamicPricingQuote, Region, Printer, MarketplaceConfig } from '../types';

export function parsePageCount(pageRangeType: 'all' | 'custom', customRangeStr: string | undefined, totalDocPages: number): number {
  if (pageRangeType === 'all' || !customRangeStr || customRangeStr.trim() === '') {
    return Math.max(1, totalDocPages);
  }

  try {
    const parts = customRangeStr.split(',').map((p) => p.trim());
    const pageSet = new Set<number>();

    for (const part of parts) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-').map((s) => s.trim());
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let i = Math.max(1, start); i <= Math.min(totalDocPages, end); i++) {
            pageSet.add(i);
          }
        }
      } else {
        const page = parseInt(part, 10);
        if (!isNaN(page) && page >= 1 && page <= totalDocPages) {
          pageSet.add(page);
        }
      }
    }

    return pageSet.size > 0 ? pageSet.size : totalDocPages;
  } catch {
    return totalDocPages;
  }
}

export function calculateDynamicQuote(
  preferences: PrintPreferences,
  totalDocPages: number,
  region: Region,
  activeQueueJobsCount: number,
  printers: Printer[],
  marketplaceConfig: MarketplaceConfig
): DynamicPricingQuote {
  const pagesToPrintPerCopy = parsePageCount(preferences.pageRange, preferences.customPages, totalDocPages);
  const totalSheetsRequired = pagesToPrintPerCopy * Math.max(1, preferences.copies);

  // 1. Base per sheet derived authentically from regional base prices
  const baseLocal = preferences.colorMode === 'color' ? region.baseA4ColorPrice : region.baseA4BWPrice;
  const baseUSD = baseLocal / region.exchangeRateToUSD;

  // 2. Paper Multiplier
  let paperMultiplier = 1.0;
  if (preferences.paperSize === 'A3') paperMultiplier = 2.1;
  else if (preferences.paperSize === 'Legal') paperMultiplier = 1.25;
  else if (preferences.paperSize === 'Photo_4x6') paperMultiplier = 1.75;
  else if (preferences.paperSize === 'Letter') paperMultiplier = 1.0;

  // 3. Color Multiplier
  const colorMultiplier = 1.0; // Handled by baseLocal

  // 4. Duplex Discount (uses fewer physical paper sheets, incentivizes green printing)
  const duplexDiscountRatio = preferences.duplex !== 'single' ? 0.85 : 1.0; // 15% discount for duplex

  // 5. Quality Multiplier
  let qualityMultiplier = 1.0;
  if (preferences.quality === 'draft') qualityMultiplier = 0.90;
  else if (preferences.quality === 'high_res') qualityMultiplier = 1.25;

  // 6. Dynamic Demand Surge Factor
  let demandSurgeMultiplier = 1.0;
  if (marketplaceConfig.autoSurgeEnabled) {
    if (activeQueueJobsCount >= 7) {
      demandSurgeMultiplier = marketplaceConfig.surgeSensitivity === 'aggressive' ? 1.45 : 1.35;
    } else if (activeQueueJobsCount >= 4) {
      demandSurgeMultiplier = marketplaceConfig.surgeSensitivity === 'aggressive' ? 1.28 : 1.20;
    } else if (activeQueueJobsCount >= 2) {
      demandSurgeMultiplier = 1.10;
    } else {
      demandSurgeMultiplier = 1.0;
    }
  } else {
    demandSurgeMultiplier = marketplaceConfig.manualSurgeMultiplier;
  }

  // 7. Supply Scarcity Factor (Ink & Paper levels)
  let supplySurgeMultiplier = 1.0;
  const reasons: string[] = [];

  if (preferences.colorMode === 'color') {
    const avgColorToner = printers.reduce((acc, p) => acc + (p.ink.cyan + p.ink.magenta + p.ink.yellow) / 3, 0) / (printers.length || 1);
    if (avgColorToner < 30) {
      supplySurgeMultiplier += 0.10;
      reasons.push('Low color toner inventory surcharge (+10%)');
    }
  }

  // Check paper tray
  if (preferences.paperSize === 'A3') {
    const totalA3 = printers.reduce((acc, p) => acc + p.paper.a3, 0);
    if (totalA3 < 100) {
      supplySurgeMultiplier += 0.08;
      reasons.push('A3 specialty paper limited stock (+8%)');
    }
  } else if (preferences.paperSize === 'Photo_4x6') {
    const totalPhoto = printers.reduce((acc, p) => acc + p.paper.photo, 0);
    if (totalPhoto < 40) {
      supplySurgeMultiplier += 0.12;
      reasons.push('Glossy photo paper limited inventory (+12%)');
    }
  }

  // 8. Off-Peak / Happy Hour Discount
  const offPeakDiscountMultiplier = marketplaceConfig.offPeakHappyHour ? 0.85 : 1.0;

  if (demandSurgeMultiplier > 1.0) {
    const pct = Math.round((demandSurgeMultiplier - 1) * 100);
    reasons.push(`Cafe peak rush surge (+${pct}% for ${activeQueueJobsCount} active jobs in queue)`);
  } else if (demandSurgeMultiplier < 1.0) {
    const pct = Math.round((1 - demandSurgeMultiplier) * 100);
    reasons.push(`Low queue traffic discount (-${pct}%)`);
  }

  if (duplexDiscountRatio < 1.0) {
    reasons.push('Eco two-sided printing discount (-15% paper saving)');
  }

  if (qualityMultiplier < 1.0) {
    reasons.push('Eco toner draft mode (-10%)');
  } else if (qualityMultiplier > 1.0) {
    reasons.push('High-DPI multi-pass HD photo mode (+25%)');
  }

  if (marketplaceConfig.offPeakHappyHour) {
    reasons.push('Off-peak green happy hour discount (-15%)');
  }

  if (reasons.length === 0) {
    reasons.push('Standard balanced marketplace rate');
  }

  // Calculate final unit rate and total
  const ratePerUnitUSD =
    baseUSD *
    paperMultiplier *
    colorMultiplier *
    duplexDiscountRatio *
    qualityMultiplier *
    demandSurgeMultiplier *
    supplySurgeMultiplier *
    offPeakDiscountMultiplier;

  const totalPriceUSD = Number((ratePerUnitUSD * totalSheetsRequired).toFixed(2));
  const converted = totalPriceUSD * region.exchangeRateToUSD;
  const totalPriceLocal =
    region.currencyCode === 'INR' || region.currencyCode === 'JPY'
      ? Math.max(1, Math.round(converted))
      : Math.max(0.10, Number(converted.toFixed(2)));

  return {
    basePerSheet: baseUSD,
    colorMultiplier,
    paperMultiplier,
    duplexDiscountRatio,
    qualityMultiplier,
    demandSurgeMultiplier,
    supplySurgeMultiplier,
    offPeakDiscountMultiplier,
    totalPriceUSD: Math.max(0.02, totalPriceUSD),
    totalPriceLocal,
    currencySymbol: region.currencySymbol,
    currencyCode: region.currencyCode,
    priceBreakdownReasons: reasons,
  };
}

export function formatCurrency(amountUSD: number, region: Region): string {
  const local = amountUSD * region.exchangeRateToUSD;
  if (region.currencyCode === 'INR') {
    return `₹${Math.round(local).toLocaleString('en-IN')}`;
  }
  if (region.currencyCode === 'JPY') {
    return `¥${Math.round(local).toLocaleString()}`;
  }
  if (region.currencyCode === 'GBP') {
    return `£${local.toFixed(2)}`;
  }
  return `$${local.toFixed(2)}`;
}
