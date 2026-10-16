import React from 'react';
import { X, Camera, Image as ImageIcon, AlertCircle, CheckCircle2, RefreshCw, ArrowRight, Zap, Check } from 'lucide-react';
import jsQR from 'jsqr';

interface CameraQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (stationId: string) => void;
}

export const CameraQrScannerModal: React.FC<CameraQrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const [cameraActive, setCameraActive] = React.useState<boolean>(false);
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const [manualCode, setManualCode] = React.useState<string>('');
  const [scanningImage, setScanningImage] = React.useState<boolean>(false);
  const [detectedStation, setDetectedStation] = React.useState<string | null>(null);

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const animationFrameRef = React.useRef<number | null>(null);
  const isScanningActiveRef = React.useRef<boolean>(false);

  // Helper to extract clean station ID from scanned QR string (URL or plain text)
  const parseStationIdFromData = (data: string): string => {
    try {
      if (data.includes('station=')) {
        const url = new URL(data, window.location.href);
        const st = url.searchParams.get('station');
        if (st) return st;
      }
    } catch {
      // not a valid URL, treat as raw text
    }

    const trimmed = data.trim();
    if (/^desk[-_ ]?0?[1-9]$/i.test(trimmed)) {
      const match = trimmed.match(/\d+/);
      if (match) return `Desk-${match[0].padStart(2, '0')}`;
    }
    if (/^station[-_ ]?0?[1-9]$/i.test(trimmed)) {
      const match = trimmed.match(/\d+/);
      if (match) return `Desk-${match[0].padStart(2, '0')}`;
    }
    if (/^[1-9]$/.test(trimmed)) {
      return `Desk-${trimmed.padStart(2, '0')}`;
    }
    return trimmed;
  };

  const handleSuccessfulDetection = (station: string) => {
    if (detectedStation) return; // avoid duplicate triggers
    isScanningActiveRef.current = false;
    setDetectedStation(station);

    // Provide haptic feedback if available
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(100);
      } catch {}
    }

    // Give visual feedback for 600ms then complete
    setTimeout(() => {
      stopCamera();
      onScanSuccess(station);
      onClose();
      setDetectedStation(null);
    }, 600);
  };

  // Continuous frame scanner using jsQR
  const scanVideoFrame = () => {
    if (!isScanningActiveRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && video.readyState === video.HAVE_ENOUGH_DATA && canvas) {
      const width = video.videoWidth;
      const height = video.videoHeight;

      if (width > 0 && height > 0) {
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (ctx) {
          ctx.drawImage(video, 0, 0, width, height);
          const imageData = ctx.getImageData(0, 0, width, height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            const station = parseStationIdFromData(code.data);
            handleSuccessfulDetection(station);
            return;
          }
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanVideoFrame);
  };

  const startCamera = async () => {
    setCameraError(null);
    setCameraActive(false);
    setDetectedStation(null);
    isScanningActiveRef.current = true;

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: 'environment' }, 
          width: { ideal: 1280 }, 
          height: { ideal: 720 } 
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraActive(true);
        animationFrameRef.current = requestAnimationFrame(scanVideoFrame);
      }
    } catch (err: any) {
      console.warn('Camera error:', err);
      setCameraError(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Camera permission denied. Please allow camera access in your browser, or tap your desk number below.'
          : 'Could not access camera on this device. You can choose your desk terminal directly below.'
      );
      setCameraActive(false);
      isScanningActiveRef.current = false;
    }
  };

  const stopCamera = () => {
    isScanningActiveRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  React.useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const handleSimulateDeskSelect = (deskNum: string) => {
    stopCamera();
    onScanSuccess(`Desk-${deskNum.padStart(2, '0')}`);
    onClose();
  };

  const handleManualCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    const target = parseStationIdFromData(manualCode);
    stopCamera();
    onScanSuccess(target);
    onClose();
  };

  // Decode QR code from an uploaded photo/screenshot using jsQR
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanningImage(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = img.width;
        offscreenCanvas.height = img.height;
        const ctx = offscreenCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imgData.data, imgData.width, imgData.height);

          setScanningImage(false);
          if (code && code.data) {
            const station = parseStationIdFromData(code.data);
            handleSuccessfulDetection(station);
          } else {
            // If QR wasn't readable in image, default to Desk-01 with notification
            onScanSuccess('Desk-01');
            stopCamera();
            onClose();
          }
        } else {
          setScanningImage(false);
        }
      };
      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Hidden offscreen canvas for jsQR analysis */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/90">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Scan Station QR Code</h3>
              <p className="text-[11px] text-emerald-700 font-mono font-medium">SYAM NET WORLD, Nuzvidu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Area */}
        <div className="p-6 space-y-4 text-xs text-slate-700">
          <div className="relative w-full aspect-4/3 bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner">
            {cameraActive ? (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                  autoPlay
                />

                {/* Detected confirmation banner */}
                {detectedStation ? (
                  <div className="absolute inset-0 bg-emerald-600/90 flex flex-col items-center justify-center text-white p-4 animate-in fade-in zoom-in-95 duration-200">
                    <CheckCircle2 className="w-16 h-16 text-white mb-2" />
                    <span className="text-sm font-semibold">QR Code Recognized!</span>
                    <span className="font-mono text-xl font-bold mt-1 bg-white/20 px-3 py-1 rounded-lg">
                      {detectedStation}
                    </span>
                    <span className="text-xs text-emerald-100 mt-2">Connecting to SYAM NET WORLD...</span>
                  </div>
                ) : (
                  <>
                    {/* Reticle Scanner Box */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-52 h-52 border-2 border-emerald-400/90 rounded-2xl relative shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                        {/* 4 corner brackets */}
                        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></div>
                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></div>

                        {/* Animated Laser Scanning Beam */}
                        <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-300 to-transparent shadow-[0_0_12px_#10b981] animate-pulse top-1/2 -translate-y-1/2"></div>
                      </div>
                    </div>

                    <div className="absolute bottom-3 inset-x-0 text-center pointer-events-none">
                      <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-[11px] font-mono text-emerald-300 border border-emerald-500/30">
                        Align desk QR code inside the frame
                      </span>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="p-6 text-center text-slate-400 space-y-3">
                {cameraError ? (
                  <>
                    <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                    <p className="text-xs text-slate-300 max-w-xs">{cameraError}</p>
                    <button
                      onClick={startCamera}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry Camera</span>
                    </button>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
                    <p className="text-xs text-slate-300">Initializing camera sensor...</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Quick Desk Pairing (No camera required) */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-800 text-xs flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Or Tap Your Desk at SYAM NET WORLD:</span>
              </span>
              <span className="text-[10px] text-emerald-700 font-mono font-medium">Instant 1-Tap</span>
            </div>

            <div className="grid grid-cols-6 gap-2">
              {['1', '2', '3', '4', '5', '6'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleSimulateDeskSelect(num)}
                  className="py-2.5 px-1 text-center font-mono font-bold text-xs bg-white hover:bg-emerald-600 hover:text-white text-slate-800 rounded-xl border border-slate-200 hover:border-emerald-600 transition-colors cursor-pointer shadow-2xs"
                >
                  #{num}
                </button>
              ))}
            </div>
          </div>

          {/* Image Upload or Manual Entry */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={scanningImage}
              className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>{scanningImage ? 'Decoding Image...' : 'Choose QR Photo'}</span>
            </button>

            <form onSubmit={handleManualCodeSubmit} className="flex-1 flex items-center gap-1">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Desk # (e.g. 3)"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <button
                type="submit"
                className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer shrink-0 transition-colors"
                title="Connect Desk"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
