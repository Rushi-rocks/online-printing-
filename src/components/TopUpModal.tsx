import React from 'react';
import { Region } from '../types';
import { formatCurrency } from '../services/dynamicPricing';
import { X, Wallet, CreditCard, Sparkles, CheckCircle2, ShieldCheck, QrCode, IndianRupee } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletBalanceUSD: number;
  currentRegion: Region;
  onTopUp: (amountUSD: number, paymentMethod: string) => void;
}

export const TopUpModal: React.FC<TopUpModalProps> = ({
  isOpen,
  onClose,
  walletBalanceUSD,
  currentRegion,
  onTopUp,
}) => {
  const isINR = currentRegion.currencyCode === 'INR';

  // Indian Rupee presets vs USD presets
  const inrPresets = [50, 100, 200, 500, 1000];
  const usdPresets = [5, 10, 15, 25, 50];

  const [selectedLocal, setSelectedLocal] = React.useState<number>(isINR ? 100 : 15);
  const [customAmount, setCustomAmount] = React.useState<string>('');
  const [isCustom, setIsCustom] = React.useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = React.useState<string>(isINR ? 'upi_intent' : 'apple_pay');
  const [processing, setProcessing] = React.useState<boolean>(false);
  const [success, setSuccess] = React.useState<boolean>(false);

  React.useEffect(() => {
    setSelectedLocal(isINR ? 100 : 15);
    setPaymentMethod(isINR ? 'upi_intent' : 'apple_pay');
  }, [isINR]);

  if (!isOpen) return null;

  const currentLocalAmount = isCustom ? (parseFloat(customAmount) || 0) : selectedLocal;
  const currentAmountUSD = isINR
    ? currentLocalAmount / currentRegion.exchangeRateToUSD
    : currentLocalAmount;

  const handleConfirm = () => {
    if (currentAmountUSD <= 0) return;
    setProcessing(true);

    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);

      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });

      onTopUp(currentAmountUSD, paymentMethod);

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1400);
    }, 600);
  };

  const presetList = isINR ? inrPresets : usdPresets;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              {isINR ? <IndianRupee className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">
                {isINR ? 'Recharge Net Cafe Wallet (UPI / INR)' : 'Recharge Digital Wallet'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isINR ? 'Instant print credits via PhonePe, GPay, Paytm' : 'Instant balance for rapid cafe printing'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
              <div className="text-lg font-bold text-slate-900">Wallet Recharged!</div>
              <p className="text-xs text-slate-500">
                Added {formatCurrency(currentAmountUSD, currentRegion)} to your net cafe wallet.
              </p>
            </div>
          ) : (
            <>
              {/* Current Balance Overview */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 mb-5">
                <span className="text-xs text-slate-500 font-medium">Available Balance</span>
                <span className="font-mono text-base font-bold text-slate-900 tabular-nums">
                  {formatCurrency(walletBalanceUSD, currentRegion)}
                </span>
              </div>

              {/* Amount Selector */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-slate-700 block mb-2">
                  Select Recharge Amount
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2.5">
                  {presetList.map((amt) => {
                    const isSelected = !isCustom && selectedLocal === amt;
                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setSelectedLocal(amt);
                          setIsCustom(false);
                        }}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-600/20 font-bold'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div className="font-mono font-bold text-sm tabular-nums">
                          {currentRegion.currencySymbol}{amt.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {isINR ? `${Math.round(amt / currentRegion.baseA4BWPrice)} B&W pages` : 'Instant credit'}
                        </div>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setIsCustom(true)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      isCustom
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-600/20 font-bold'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="font-semibold text-xs text-slate-700">Custom</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Other amount</div>
                  </button>
                </div>

                {isCustom && (
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-2.5 text-xs font-mono font-bold text-slate-500">
                      {currentRegion.currencySymbol}
                    </span>
                    <input
                      type="number"
                      min="10"
                      max="10000"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder={isINR ? 'Enter amount in ₹ (e.g. 150)' : 'Enter amount (e.g. 20)'}
                      className="w-full pl-8 pr-3 py-2 text-xs font-mono border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      autoFocus
                    />
                  </div>
                )}
              </div>

              {/* Payment Methods */}
              <div className="mb-5">
                <label className="text-xs font-semibold text-slate-700 block mb-2">
                  Payment Method
                </label>
                <div className="space-y-1.5">
                  {isINR ? (
                    <>
                      {[
                        { id: 'upi_intent', name: 'Google Pay / PhonePe / Paytm UPI', subtitle: '1-tap instant mobile UPI debit' },
                        { id: 'upi_qr', name: 'Scan UPI QR Code (BHIM)', subtitle: 'Scan from any UPI banking app' },
                        { id: 'rupay_card', name: 'Debit / Credit Card (RuPay, Visa, MC)', subtitle: 'All Indian bank cards' },
                        { id: 'netbanking', name: 'Net Banking (SBI, HDFC, ICICI, Axis)', subtitle: 'Direct bank transfer' },
                        { id: 'counter_cash', name: 'Cash at Cafe Counter / Receptionist', subtitle: 'Pay cash to xerox operator' },
                      ].map((pm) => (
                        <label
                          key={pm.id}
                          onClick={() => setPaymentMethod(pm.id)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-colors ${
                            paymentMethod === pm.id
                              ? 'border-emerald-600 bg-emerald-50/50 text-slate-900'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="radio"
                              name="payment_method"
                              checked={paymentMethod === pm.id}
                              onChange={() => setPaymentMethod(pm.id)}
                              className="text-emerald-600 focus:ring-emerald-500"
                            />
                            <div>
                              <div className="text-xs font-medium">{pm.name}</div>
                              <div className="text-[10px] text-slate-500">{pm.subtitle}</div>
                            </div>
                          </div>
                          <CreditCard className="w-4 h-4 text-slate-400" />
                        </label>
                      ))}
                    </>
                  ) : (
                    <>
                      {[
                        { id: 'apple_pay', name: 'Apple Pay / Google Pay', subtitle: '1-touch instant debit' },
                        { id: 'card', name: 'Credit / Debit Card', subtitle: 'Visa, Mastercard, Amex, JCB' },
                        { id: 'counter_cash', name: 'Net Cafe Counter Cash', subtitle: 'Pay cash to receptionist' },
                      ].map((pm) => (
                        <label
                          key={pm.id}
                          onClick={() => setPaymentMethod(pm.id)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-colors ${
                            paymentMethod === pm.id
                              ? 'border-indigo-600 bg-indigo-50/40 text-slate-900'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="radio"
                              name="payment_method"
                              checked={paymentMethod === pm.id}
                              onChange={() => setPaymentMethod(pm.id)}
                              className="text-indigo-600 focus:ring-indigo-500"
                            />
                            <div>
                              <div className="text-xs font-medium">{pm.name}</div>
                              <div className="text-[10px] text-slate-500">{pm.subtitle}</div>
                            </div>
                          </div>
                          <CreditCard className="w-4 h-4 text-slate-400" />
                        </label>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Safe & Secure note */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  {isINR ? 'NPCI UPI & RBI Compliant · Instant refund on unprinted jobs' : 'Encrypted PCI-DSS checkout · Instant refund protection'}
                </span>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleConfirm}
                disabled={processing || currentLocalAmount <= 0}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {processing ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>
                      Add {formatCurrency(currentAmountUSD, currentRegion)} to Wallet
                    </span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
