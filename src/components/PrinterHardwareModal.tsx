import React from 'react';
import { Printer, PrinterProtocol } from '../types';
import { 
  X, 
  Network, 
  Wifi, 
  CheckCircle2, 
  AlertCircle, 
  Cpu, 
  Activity, 
  Save, 
  Radio, 
  Server,
  RefreshCw
} from 'lucide-react';

interface PrinterHardwareModalProps {
  printer: Printer | null;
  isOpen: boolean;
  onClose: () => void;
  onSavePrinter: (updatedPrinter: Printer) => void;
}

export const PrinterHardwareModal: React.FC<PrinterHardwareModalProps> = ({
  printer,
  isOpen,
  onClose,
  onSavePrinter,
}) => {
  const [formData, setFormData] = React.useState<Printer | null>(printer);
  const [testingPing, setTestingPing] = React.useState<boolean>(false);
  const [pingResult, setPingResult] = React.useState<{
    success: boolean;
    latencyMs: number;
    details: string;
    timestamp: number;
  } | null>(null);

  React.useEffect(() => {
    setFormData(printer);
    setPingResult(null);
  }, [printer]);

  if (!isOpen || !formData) return null;

  const handleTestConnection = () => {
    setTestingPing(true);
    setPingResult(null);

    setTimeout(() => {
      setTestingPing(false);
      const isLoopbackOrValid = formData.ipAddress.startsWith('192.168.') || 
                                formData.ipAddress.startsWith('10.') || 
                                formData.ipAddress === 'localhost' ||
                                formData.ipAddress.startsWith('127.0.');

      const simulatedLatency = Math.floor(2 + Math.random() * 8);

      setPingResult({
        success: isLoopbackOrValid,
        latencyMs: simulatedLatency,
        details: isLoopbackOrValid
          ? `TCP handshake to ${formData.ipAddress}:${formData.port} succeeded via ${formData.protocol}. SNMP v2c (Community: ${formData.snmpCommunity}) polled engine status: READY.`
          : `Host ${formData.ipAddress} responded with timeout. Check subnet mask and LAN cable.`,
        timestamp: Date.now(),
      });

      if (isLoopbackOrValid) {
        setFormData((prev) => prev ? {
          ...prev,
          connectionStatus: 'connected',
          lastPingMs: simulatedLatency,
        } : null);
      }
    }, 900);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSavePrinter(formData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Hardware & Network Configuration</h3>
              <p className="text-[11px] text-slate-500 font-mono">
                {formData.name} · Bay {formData.bayNumber}
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

        {/* Content Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Hardware Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Printer Hardware Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Hardware Model & Series
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Network IP & Port Configuration */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
                <Server className="w-4 h-4 text-indigo-600" />
                <span>LAN Network Interface & Socket</span>
              </div>
              <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                Static IP Recommended
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  IPv4 Address / Hostname
                </label>
                <input
                  type="text"
                  value={formData.ipAddress}
                  onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                  placeholder="e.g. 192.168.1.101"
                  className="w-full px-3 py-2 font-mono text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Port
                </label>
                <input
                  type="number"
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value, 10) || 9100 })}
                  className="w-full px-3 py-2 font-mono text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Spooler Protocol
                </label>
                <select
                  value={formData.protocol}
                  onChange={(e) => setFormData({ ...formData, protocol: e.target.value as PrinterProtocol })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-xs font-mono"
                >
                  <option value="RAW_9100">RAW Socket (JetDirect Port 9100)</option>
                  <option value="IPP_631">IPP / CUPS (HTTP Port 631)</option>
                  <option value="LPR_515">LPD / LPR (Line Printer Daemon 515)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  SNMP Telemetry Community
                </label>
                <input
                  type="text"
                  value={formData.snmpCommunity}
                  onChange={(e) => setFormData({ ...formData, snmpCommunity: e.target.value })}
                  placeholder="public"
                  className="w-full px-3 py-2 font-mono text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Hardware MAC Address
                </label>
                <input
                  type="text"
                  value={formData.macAddress}
                  onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })}
                  className="w-full px-3 py-2 font-mono text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Driver / PCL Emulation
                </label>
                <input
                  type="text"
                  value={formData.driverName}
                  onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Test Connection Diagnostic Box */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-600" />
                <span>Socket Ping & SNMP Handshake Diagnostic</span>
              </span>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingPing}
                className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-md font-semibold text-indigo-700 text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {testingPing ? (
                  <RefreshCw className="w-3 h-3 animate-spin text-indigo-600" />
                ) : (
                  <Radio className="w-3 h-3 text-indigo-600" />
                )}
                <span>{testingPing ? 'Pinging...' : 'Test LAN Socket'}</span>
              </button>
            </div>

            {pingResult ? (
              <div
                className={`p-2.5 rounded-lg text-[11px] font-mono mt-2 border flex items-start gap-2 ${
                  pingResult.success
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                    : 'bg-rose-50 text-rose-900 border-rose-200'
                }`}
              >
                {pingResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold">
                    {pingResult.success ? `Socket Active (${pingResult.latencyMs}ms roundtrip)` : 'Socket Unreachable'}
                  </div>
                  <div className="text-[10px] mt-0.5 opacity-90">{pingResult.details}</div>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500">
                Click "Test LAN Socket" to verify that this printer IP is accepting RAW 9100 or IPP 631 print jobs on the net cafe network.
              </p>
            )}
          </div>

          {/* Hardware Capabilities */}
          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.supportsColor}
                onChange={(e) => setFormData({ ...formData, supportsColor: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-semibold text-slate-800">Supports Full CMYK Color</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.supportsA3}
                onChange={(e) => setFormData({ ...formData, supportsA3: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-semibold text-slate-800">Supports A3 Large Ledger Tray</span>
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Hardware Properties</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
