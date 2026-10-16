import React from 'react';
import QRCode from 'qrcode';

interface QrCodeProps {
  value: string;
  size?: number;
  className?: string;
  fgColor?: string;
  bgColor?: string;
  includeMargin?: boolean;
}

export const QrCodeSvg: React.FC<QrCodeProps> = ({
  value,
  size = 180,
  className = '',
  fgColor = '#0f172a',
  bgColor = '#ffffff',
  includeMargin = true,
}) => {
  const [dataUrl, setDataUrl] = React.useState<string>('');
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    // Generate genuine standard ISO/IEC 18004 scannable QR Code as DataURL
    QRCode.toDataURL(value, {
      width: size * 2, // render at 2x resolution for retina sharpness on phone cameras
      margin: includeMargin ? 2 : 1,
      color: {
        dark: fgColor,
        light: bgColor,
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (isMounted) {
          setDataUrl(url);
          setError(null);
        }
      })
      .catch((err) => {
        console.error('Failed to generate real QR code:', err);
        if (isMounted) {
          setError('Failed to render QR code');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [value, size, fgColor, bgColor, includeMargin]);

  if (error) {
    return (
      <div 
        className={`inline-flex items-center justify-center p-3 rounded-xl bg-red-50 text-red-600 text-xs border border-red-200 ${className}`}
        style={{ width: size, height: size }}
      >
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center p-2 rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      {dataUrl ? (
        <img
          src={dataUrl}
          alt={`Scannable QR code for: ${value}`}
          className="w-full h-full object-contain select-none"
          loading="eager"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-400">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-emerald-600 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};
