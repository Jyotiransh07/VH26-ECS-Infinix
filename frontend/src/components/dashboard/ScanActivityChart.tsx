import React, { useState } from 'react';

interface ChartDataPoint {
  time: string;
  scans: number;
  leaks: number;
}

interface ScanActivityChartProps {
  data: ChartDataPoint[];
  timeRange: '24H' | '7D' | '30D' | '90D';
  onTimeRangeChange: (range: '24H' | '7D' | '30D' | '90D') => void;
}

export const ScanActivityChart: React.FC<ScanActivityChartProps> = ({
  data,
  timeRange,
  onTimeRangeChange
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxVal = Math.max(...data.map(d => Math.max(d.scans, d.leaks, 10)), 15);
  const height = 220;
  const width = 600;
  const padding = 30;

  // Convert points to SVG coordinates
  const getCoordinates = (values: number[]) => {
    return values.map((val, idx) => {
      const x = padding + (idx / (values.length - 1)) * (width - 2 * padding);
      const y = height - padding - (val / maxVal) * (height - 2 * padding);
      return { x, y };
    });
  };

  const scanCoords = getCoordinates(data.map(d => d.scans));
  const leakCoords = getCoordinates(data.map(d => d.leaks));

  const generatePath = (coords: { x: number; y: number }[]) => {
    if (coords.length === 0) return '';
    return coords.reduce((acc, curr, i, arr) => {
      if (i === 0) return `M ${curr.x} ${curr.y}`;
      const prev = arr[i - 1];
      const cp1x = prev.x + (curr.x - prev.x) / 2;
      const cp1y = prev.y;
      const cp2x = prev.x + (curr.x - prev.x) / 2;
      const cp2y = curr.y;
      return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }, '');
  };

  const scanPath = generatePath(scanCoords);
  const leakPath = generatePath(leakCoords);

  const scanAreaPath = scanCoords.length > 0
    ? `${scanPath} L ${scanCoords[scanCoords.length - 1].x} ${height - padding} L ${scanCoords[0].x} ${height - padding} Z`
    : '';

  const leakAreaPath = leakCoords.length > 0
    ? `${leakPath} L ${leakCoords[leakCoords.length - 1].x} ${height - padding} L ${leakCoords[0].x} ${height - padding} Z`
    : '';

  const hoveredData = hoveredIdx !== null ? data[hoveredIdx] : null;

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Scan Activity & Discoveries</h3>
          <p className="text-xs text-zinc-400">Continuous static analysis telemetry and leak discovery rate</p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0f121a] border border-white/5">
          {(['24H', '7D', '30D', '90D'] as const).map((r) => (
            <button
              key={r}
              onClick={() => onTimeRangeChange(r)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                timeRange === r 
                  ? 'bg-primary text-white shadow-glow' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Legend & Tooltip Banner */}
      <div className="flex items-center justify-between text-xs px-2 pt-1">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" /> Scans Executed
          </span>
          <span className="flex items-center gap-1.5 text-rose-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Leaks Flagged
          </span>
        </div>

        {hoveredData && (
          <div className="font-mono text-xs text-primary-light bg-primary/10 px-2.5 py-0.5 rounded-md border border-primary/20">
            {hoveredData.time}: {hoveredData.scans} Scans • {hoveredData.leaks} Leaks
          </div>
        )}
      </div>

      {/* Interactive SVG Chart Canvas */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-[#0a0c12] p-2 border border-white/5">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56 select-none overflow-visible">
          <defs>
            <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="leakGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.33, 0.66, 1].map((ratio, i) => {
            const y = padding + ratio * (height - 2 * padding);
            return (
              <line
                key={i}
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="rgba(255,255,255,0.05)"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Area Fills */}
          <path d={scanAreaPath} fill="url(#scanGrad)" />
          <path d={leakAreaPath} fill="url(#leakGrad)" />

          {/* Stroke Lines */}
          <path d={scanPath} fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" />
          <path d={leakPath} fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />

          {/* Points and Interaction Hitboxes */}
          {scanCoords.map((pt, idx) => (
            <g key={idx} onMouseEnter={() => setHoveredIdx(idx)} onMouseLeave={() => setHoveredIdx(null)}>
              {/* Vertical crosshair on hover */}
              {hoveredIdx === idx && (
                <line
                  x1={pt.x}
                  y1={padding}
                  x2={pt.x}
                  y2={height - padding}
                  stroke="rgba(255,255,255,0.2)"
                  strokeDasharray="2 2"
                />
              )}
              {/* Scan point dot */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredIdx === idx ? 6 : 4}
                fill="#8b5cf6"
                stroke="#0b0d13"
                strokeWidth="2"
                className="transition-all cursor-pointer"
              />
              {/* Leak point dot */}
              <circle
                cx={leakCoords[idx].x}
                cy={leakCoords[idx].y}
                r={hoveredIdx === idx ? 6 : 4}
                fill="#f43f5e"
                stroke="#0b0d13"
                strokeWidth="2"
                className="transition-all cursor-pointer"
              />
              {/* Bottom Label */}
              <text
                x={pt.x}
                y={height - 8}
                fontSize="10"
                fill="#71717a"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {data[idx].time}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};
