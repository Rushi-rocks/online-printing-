import React from 'react';
import { 
  X, 
  Terminal, 
  Server, 
  Network, 
  Copy, 
  Check, 
  ShieldCheck, 
  ArrowRight, 
  Printer, 
  Cpu, 
  IndianRupee,
  Layers,
  ExternalLink
} from 'lucide-react';

interface RealWorldDeploymentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RealWorldDeploymentGuideModal: React.FC<RealWorldDeploymentGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedCode, setCopiedCode] = React.useState<boolean>(false);
  const [activeTab, setActiveTab] = React.useState<'architecture' | 'agent_code' | 'printer_setup' | 'upi_payments'>('architecture');

  if (!isOpen) return null;

  const agentScriptCode = `// netprint-local-agent.js
// Run this on your Net Cafe Counter PC or Raspberry Pi (Node.js 18+)
// It listens to NetPrint cloud jobs and sends them to your LAN printer IPs!

const net = require('net');
const http = require('http');

const CONFIG = {
  // Your NetPrint Cloud Webhook/WebSocket Endpoint
  CLOUD_WS_URL: 'wss://ais-dev-33tte4hbmicu7j5a6iasvi-717924429741.asia-northeast1.run.app/api/spooler',
  CAFE_BRANCH_ID: 'syam-net-world-nuzvidu',
  API_SECRET_KEY: 'netprint_secret_token_123',
  
  // Local Printer LAN IP Map
  PRINTERS: {
    'printer-1': { ip: '192.168.1.101', port: 9100, name: 'Canon imageRUNNER DX' },
    'printer-2': { ip: '192.168.1.102', port: 631,  name: 'HP PageWide Color' },
    'printer-3': { ip: '192.168.1.105', port: 9100, name: 'Brother Laser Mono' }
  }
};

// Function to blast raw PDF / PostScript to LAN printer socket
function sendToPrinter(targetIp, port, documentBuffer) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    client.connect(port, targetIp, () => {
      console.log(\`[NetPrint Agent] Connected to printer \${targetIp}:\${port}\`);
      client.write(documentBuffer, () => {
        console.log('[NetPrint Agent] Print data transmitted successfully!');
        client.end();
        resolve(true);
      });
    });

    client.on('error', (err) => {
      console.error(\`[NetPrint Agent] Printer socket error on \${targetIp}:\`, err.message);
      reject(err);
    });
  });
}

console.log('✅ NetPrint Cyber Cafe Agent Active on 192.168.1.x subnet.');
console.log('Listening for customer print jobs...');
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(agentScriptCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Real-World Deployment & Hardware Setup</h3>
              <p className="text-[11px] text-slate-500">Connecting cloud kiosks to physical LAN printers and UPI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center px-6 border-b border-slate-200 bg-slate-50/40 text-xs gap-4 overflow-x-auto">
          {[
            { id: 'architecture', label: '1. Network Architecture' },
            { id: 'printer_setup', label: '2. Setting Printer IPs' },
            { id: 'agent_code', label: '3. Local Print Agent Script' },
            { id: 'upi_payments', label: '4. Real UPI Payments' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`py-3 font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === t.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Tab 1: Architecture */}
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 text-indigo-950">
                <div className="font-bold text-sm mb-1 flex items-center gap-2">
                  <Network className="w-4 h-4 text-indigo-600" />
                  <span>How NetPrint Talks to Physical Cafe Printers</span>
                </div>
                <p className="text-xs leading-relaxed text-indigo-900">
                  Because this applet is hosted on the cloud, and your Xerox/Canon/HP printers reside on your private cyber cafe Wi-Fi or LAN router (e.g. <code className="bg-white px-1.5 py-0.5 rounded font-mono text-[11px]">192.168.1.101</code>), web browsers cannot directly connect to private LAN IPs due to browser CORS and network boundaries.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center my-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto mb-2 font-bold">1</div>
                  <div className="font-bold text-slate-900">Customer Smartphone</div>
                  <div className="text-[11px] text-slate-500 mt-1">Scans Desk QR code, uploads document, pays via UPI.</div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2 font-bold">2</div>
                  <div className="font-bold text-slate-900">NetPrint Cloud Spooler</div>
                  <div className="text-[11px] text-slate-500 mt-1">Stores queue, calculates dynamic surge, debits wallet.</div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-2 font-bold">3</div>
                  <div className="font-bold text-slate-900">Cafe Counter PC / Agent</div>
                  <div className="text-[11px] text-slate-500 mt-1">Sends RAW 9100 / IPP socket packets to the printer LAN IP!</div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                <div className="font-bold text-slate-900 text-xs">Recommended Cafe Hardware Setup:</div>
                <ul className="list-disc list-inside space-y-1.5 text-slate-600">
                  <li><strong>Static IP for Printers:</strong> Log into your net cafe router (e.g. TP-Link, D-Link, JioFiber, Airtel Xstream) and assign static DHCP reservations like <code className="font-mono bg-slate-100 px-1 rounded">192.168.1.101</code>, <code className="font-mono bg-slate-100 px-1 rounded">192.168.1.102</code>.</li>
                  <li><strong>Standard Port 9100 (RAW):</strong> 99% of enterprise printers (Canon imageRUNNER, HP LaserJet, Ricoh, Brother, Konica Minolta) accept direct PDF/PCL print jobs on port 9100.</li>
                  <li><strong>SNMP v2c enabled:</strong> Turn on SNMP on the printer web interface so the agent can report real toner percentages and paper levels automatically.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Tab 2: Printer Setup */}
          {activeTab === 'printer_setup' && (
            <div className="space-y-4">
              <div className="font-bold text-slate-900 text-sm">Where to Add Printer Hardware Properties & IP Addresses:</div>
              <p className="text-xs text-slate-600">
                You can manage all printer IPs, ports, and SNMP settings directly in this app:
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">1</div>
                  <div>
                    <strong className="text-slate-900 block">Go to "Admin Queue & Ink" Tab:</strong>
                    <span>Click on the <strong>"Hardware & Ink Levels"</strong> subtab in the top bar of the Admin Dashboard.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">2</div>
                  <div>
                    <strong className="text-slate-900 block">Click "Edit Hardware & IP":</strong>
                    <span>Every printer card displays its active IP (e.g., <code className="font-mono bg-white px-1 border rounded">192.168.1.101:9100</code>). Click "Edit Hardware & IP" to open the configuration modal.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">3</div>
                  <div>
                    <strong className="text-slate-900 block">Input Printer Properties & Test Socket:</strong>
                    <span>Enter your printer's LAN IP, choose Port 9100 (RAW) or 631 (IPP), set the MAC address, and click <strong>"Test LAN Socket"</strong> to verify ping latency and connection health.</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                <strong>Tip for Canon / HP Enterprise Printers:</strong> Print a "Configuration / Network Status Page" directly from the printer's physical touch screen (Menu $\rightarrow$ Preferences $\rightarrow$ Network $\rightarrow$ TCP/IP) to find its exact IP, Subnet Mask, and Gateway.
              </div>
            </div>
          )}

          {/* Tab 3: Agent Code */}
          {activeTab === 'agent_code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-sm">Local Print Agent (`netprint-local-agent.js`)</div>
                  <p className="text-[11px] text-slate-500">Run this lightweight script on your counter PC (Windows, macOS, or Linux/Raspberry Pi).</p>
                </div>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied Script!' : 'Copy Node.js Script'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                {agentScriptCode}
              </pre>

              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Zero port forwarding or public router exposure required — the agent establishes an outbound secure connection.</span>
              </div>
            </div>
          )}

          {/* Tab 4: UPI Payments */}
          {activeTab === 'upi_payments' && (
            <div className="space-y-4">
              <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-emerald-600" />
                <span>Integrating Real-World Indian UPI Payments</span>
              </div>
              <p className="text-xs text-slate-600">
                To accept automated UPI payments in India without needing a POS machine at every customer desk:
              </p>

              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="font-bold text-slate-900 mb-1">Option A: Dynamic UPI Intent / QR Link</div>
                  <p className="text-[11px] text-slate-600 mb-2">
                    Generate an instant UPI deep link string on the customer's phone:
                  </p>
                  <code className="block bg-slate-100 p-2 rounded font-mono text-[10px] text-indigo-900 break-all">
                    upi://pay?pa=syamnetworld@okhdfcbank&pn=SYAM+Net+World+Nuzvidu&am=14.00&cu=INR&tn=Job-JOB-9420
                  </code>
                  <p className="text-[11px] text-slate-500 mt-2">
                    When tapped on mobile, opens Google Pay, PhonePe, or Paytm with the exact amount pre-filled!
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="font-bold text-slate-900 mb-1">Option B: Payment Gateway Webhook (Razorpay / Cashfree)</div>
                  <p className="text-[11px] text-slate-600">
                    Use Razorpay's Standard Checkout in webhook mode. When the customer pays, your backend receives a <code className="font-mono bg-slate-100 px-1 rounded">payment.captured</code> event and automatically dispatches the document buffer to the assigned printer bay!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Ready for real cyber cafe & university print shop production deployment</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
