import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface SalesChartProps {
  data: {
    date: string;
    displayDate: string;
    amount: number;
  }[];
}

export const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  const [selectedRange, setSelectedRange] = useState("This Month");
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; data: any } | null>(null);

  // SVG viewport dimensions
  const width = 600;
  const height = 280;
  const paddingLeft = 50;
  const paddingRight = 25;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxAmount = 200000; // 2 Lakhs

  // Map data points to SVG coordinates
  const points = data.map((item, index) => {
    const x = paddingLeft + (index / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (item.amount / maxAmount) * chartHeight;
    return { x, y, item };
  });

  // Generate smooth cubic bezier SVG path
  const createSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 >= pts.length ? pts.length - 1 : i + 2];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const linePath = createSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

  const yLabels = [
    { value: 200000, label: "2L" },
    { value: 150000, label: "1.5L" },
    { value: 100000, label: "1L" },
    { value: 50000, label: "50K" },
    { value: 0, label: "0" }
  ];

  return (
    <div className="bg-white rounded-xl p-5 sm:p-6 border border-zinc-200 shadow-xs flex flex-col justify-between">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-zinc-900 tracking-tight">Sales Overview</h2>
        <div className="relative">
          <select
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
            className="appearance-none text-xs font-medium text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 pr-7 hover:bg-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#76B900] cursor-pointer"
          >
            <option>This Month</option>
            <option>Last Month</option>
            <option>Last 90 Days</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-2 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* SVG Chart Graphic */}
      <div className="relative w-full aspect-16/9 sm:aspect-2/1 flex items-center justify-center">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            {/* Smooth Green Gradient matching reference image */}
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#76B900" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#76B900" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#76B900" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines */}
          {yLabels.map((yl) => {
            const y = paddingTop + chartHeight - (yl.value / maxAmount) * chartHeight;
            return (
              <g key={yl.label}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#F1F5F9"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[11px] font-medium fill-zinc-400 select-none"
                >
                  {yl.label}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaPath} fill="url(#salesGradient)" />

          {/* Spline Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#76B900"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* X Axis Labels */}
          {points.map((pt, idx) => (
            <text
              key={idx}
              x={pt.x}
              y={height - 12}
              textAnchor="middle"
              className="text-[11px] font-medium fill-zinc-400 select-none"
            >
              {pt.item.displayDate}
            </text>
          ))}

          {/* Hover interactive points */}
          {points.map((pt, idx) => (
            <g
              key={`dot-${idx}`}
              onMouseEnter={() => setHoveredPoint({ x: pt.x, y: pt.y, data: pt.item })}
              onMouseLeave={() => setHoveredPoint(null)}
              className="cursor-pointer"
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r="6"
                fill="#76B900"
                className="opacity-0 hover:opacity-100 transition-opacity"
              />
              <circle
                cx={pt.x}
                cy={pt.y}
                r="3"
                fill="#ffffff"
                className="opacity-0 hover:opacity-100 transition-opacity"
              />
              {/* Invisible larger hover area */}
              <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />
            </g>
          ))}
        </svg>

        {/* Dynamic Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none bg-zinc-900 text-white text-xs px-2.5 py-1.5 rounded-md shadow-lg border border-zinc-700 transform -translate-x-1/2 -translate-y-full mb-2"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100}%`
            }}
          >
            <div className="font-semibold text-[#76B900]">
              ₹ {hoveredPoint.data.amount.toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-zinc-400">{hoveredPoint.data.displayDate}</div>
          </div>
        )}
      </div>
    </div>
  );
};
