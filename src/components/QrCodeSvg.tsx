import React from 'react';

// Deterministic matrix generator for authentic QR visual look with corners & quiet zone
export function generateQrMatrix(data: string, size = 25): boolean[][] {
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Helper to draw QR finder pattern (7x7 outer square, 5x5 white, 3x3 black inner)
  const drawFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          matrix[startY + r][startX + c] = true;
        } else {
          matrix[startY + r][startX + c] = false;
        }
      }
    }
  };

  // Top-left, top-right, bottom-left finders
  drawFinder(0, 0);
  drawFinder(size - 7, 0);
  drawFinder(0, size - 7);

  // Timing lines
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Alignment pattern
  if (size >= 25) {
    const ax = size - 7;
    const ay = size - 7;
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        if (Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0)) {
          matrix[ay + r][ax + c] = true;
        }
      }
    }
  }

  // Deterministic pseudo-hash of data to populate data cells
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = (hash << 5) - hash + data.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Skip finder zones
      const inTL = r < 8 && c < 8;
      const inTR = r < 8 && c >= size - 8;
      const inBL = r >= size - 8 && c < 8;
      const isTiming = (r === 6 && c >= 8 && c < size - 8) || (c === 6 && r >= 8 && r < size - 8);

      if (!inTL && !inTR && !inBL && !isTiming) {
        const seed = (r * 31 + c * 17 + Math.abs(hash)) % 100;
        matrix[r][c] = seed < 48;
      }
    }
  }

  return matrix;
}

interface QrCodeProps {
  value: string;
  size?: number;
  className?: string;
  fgColor?: string;
  bgColor?: string;
}

export const QrCodeSvg: React.FC<QrCodeProps> = ({
  value,
  size = 180,
  className = '',
  fgColor = '#0f172a',
  bgColor = '#ffffff',
}) => {
  const matrix = React.useMemo(() => generateQrMatrix(value, 25), [value]);
  const cellSize = 100 / matrix.length;

  return (
    <div
      className={`relative inline-flex items-center justify-center p-2 rounded-xl bg-white shadow-sm border border-slate-200 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        shapeRendering="crispEdges"
      >
        <rect width="100" height="100" fill={bgColor} />
        {matrix.map((row, rIdx) =>
          row.map((cell, cIdx) =>
            cell ? (
              <rect
                key={`${rIdx}-${cIdx}`}
                x={cIdx * cellSize}
                y={rIdx * cellSize}
                width={cellSize + 0.1}
                height={cellSize + 0.1}
                fill={fgColor}
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
};
