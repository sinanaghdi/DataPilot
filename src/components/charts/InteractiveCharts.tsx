import React, { useState } from 'react';
import { formatCompactToman, formatPercent, formatToman, toPersianDigits } from '../../lib/persianUtils';
import { CategorySummary, CitySummary, TimeSeriesPoint } from '../../types';

// Area & Line Trend Chart
export const TrendAreaChart: React.FC<{ data: TimeSeriesPoint[]; height?: number }> = ({ data, height = 260 }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-slate-400">
        داده‌ای برای نمایش نمودار وجود ندارد.
      </div>
    );
  }

  const padding = { top: 20, right: 25, bottom: 40, left: 25 };
  const width = 650;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1000);
  const minRevenue = 0;

  // Calculate coordinates
  const points = data.map((d, i) => {
    const x = padding.left + (i / Math.max(1, data.length - 1)) * chartWidth;
    const y = padding.top + chartHeight - ((d.revenue - minRevenue) / (maxRevenue - minRevenue)) * chartHeight;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

  return (
    <div className="relative w-full overflow-hidden select-none">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = padding.top + chartHeight * (1 - ratio);
          return (
            <g key={idx}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#E2E8F0" strokeDasharray="3 3" />
              <text x={padding.left - 4} y={y + 3} textAnchor="end" className="text-[10px] fill-slate-400">
                {formatCompactToman(maxRevenue * ratio)}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaD} fill="url(#areaGradient)" />

        {/* Line stroke */}
        <path d={pathD} fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Hover points & triggers */}
        {points.map((p, idx) => (
          <g key={idx}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hoverIndex === idx ? 5 : 3}
              className={`transition-all duration-150 ${
                hoverIndex === idx ? 'fill-emerald-600 stroke-white stroke-2' : 'fill-emerald-500'
              }`}
            />
            {/* Transparent hover bar */}
            <rect
              x={p.x - chartWidth / (data.length * 2)}
              y={padding.top}
              width={chartWidth / data.length}
              height={chartHeight}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoverIndex(idx)}
              onMouseLeave={() => setHoverIndex(null)}
            />
          </g>
        ))}

        {/* X Axis labels */}
        {points.map((p, idx) => {
          if (data.length > 10 && idx % Math.ceil(data.length / 6) !== 0 && idx !== data.length - 1) {
            return null;
          }
          return (
            <text
              key={idx}
              x={p.x}
              y={height - 12}
              textAnchor="middle"
              className="text-[10px] fill-slate-500 font-sans"
            >
              {p.jalaliDate.split(' ').slice(0, 2).join(' ')}
            </text>
          );
        })}
      </svg>

      {/* Floating Tooltip */}
      {hoverIndex !== null && points[hoverIndex] && (
        <div
          className="pointer-events-none absolute z-20 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm transition-all"
          style={{
            right: `${100 - (points[hoverIndex].x / width) * 100}%`,
            top: `${Math.max(10, points[hoverIndex].y - 65)}px`,
            transform: 'translateX(50%)',
          }}
        >
          <div className="text-xs font-semibold text-slate-800">{points[hoverIndex].jalaliDate}</div>
          <div className="mt-1 flex items-center gap-2 text-xs text-emerald-700">
            <span>درآمد:</span>
            <span className="font-bold">{formatToman(points[hoverIndex].revenue)}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-600">
            <span>تعداد سفارش:</span>
            <span className="font-medium">{toPersianDigits(points[hoverIndex].orderCount)} عدد</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Horizontal Ranking Bar Chart
export const RankingBarChart: React.FC<{
  data: (CategorySummary | CitySummary)[];
  labelKey: 'category' | 'city';
  maxItems?: number;
}> = ({ data, labelKey, maxItems = 5 }) => {
  const displayData = data.slice(0, maxItems);
  const maxRevenue = Math.max(...displayData.map((d) => d.revenue), 1);

  if (displayData.length === 0) {
    return <div className="p-4 text-center text-sm text-slate-400">داده‌ای یافت نشد.</div>;
  }

  return (
    <div className="space-y-3">
      {displayData.map((item, idx) => {
        const label = (item as any)[labelKey];
        const pctOfMax = (item.revenue / maxRevenue) * 100;
        return (
          <div key={idx} className="group">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-slate-800">{label}</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-[11px]">{toPersianDigits(item.orderCount)} سفارش</span>
                <span className="font-bold text-slate-900">{formatCompactToman(item.revenue)}</span>
                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                  {formatPercent(item.percentage)}
                </span>
              </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-l from-emerald-500 to-teal-600 transition-all duration-500 group-hover:from-emerald-400 group-hover:to-teal-500"
                style={{ width: `${pctOfMax}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Interactive Donut Chart
export const DonutChart: React.FC<{ data: CategorySummary[] }> = ({ data }) => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="p-4 text-center text-sm text-slate-400">داده‌ای یافت نشد.</div>;
  }

  const total = data.reduce((sum, d) => sum + d.revenue, 0);
  const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#64748B'];

  let accumulatedPercent = 0;
  const slices = data.map((d, i) => {
    const percent = total > 0 ? d.revenue / total : 0;
    const startAngle = accumulatedPercent * 2 * Math.PI;
    accumulatedPercent += percent;
    const endAngle = accumulatedPercent * 2 * Math.PI;

    return {
      category: d.category,
      revenue: d.revenue,
      percent: d.percentage,
      color: colors[i % colors.length],
      startAngle,
      endAngle,
    };
  });

  const size = 180;
  const center = size / 2;
  const radius = 68;
  const innerRadius = 46;

  return (
    <div className="flex flex-col items-center sm:flex-row gap-6">
      <div className="relative shrink-0">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {slices.map((slice, idx) => {
            const isLargeArc = slice.endAngle - slice.startAngle > Math.PI ? 1 : 0;
            const x1 = center + radius * Math.cos(slice.startAngle - Math.PI / 2);
            const y1 = center + radius * Math.sin(slice.startAngle - Math.PI / 2);
            const x2 = center + radius * Math.cos(slice.endAngle - Math.PI / 2);
            const y2 = center + radius * Math.sin(slice.endAngle - Math.PI / 2);

            const x3 = center + innerRadius * Math.cos(slice.endAngle - Math.PI / 2);
            const y3 = center + innerRadius * Math.sin(slice.endAngle - Math.PI / 2);
            const x4 = center + innerRadius * Math.cos(slice.startAngle - Math.PI / 2);
            const y4 = center + innerRadius * Math.sin(slice.startAngle - Math.PI / 2);

            const d = `M ${x1} ${y1} A ${radius} ${radius} 0 ${isLargeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${isLargeArc} 0 ${x4} ${y4} Z`;

            return (
              <path
                key={idx}
                d={d}
                fill={slice.color}
                className="cursor-pointer transition-opacity duration-200"
                opacity={activeIdx === null || activeIdx === idx ? 1 : 0.4}
                onMouseEnter={() => setActiveIdx(idx)}
                onMouseLeave={() => setActiveIdx(null)}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-slate-500">
            {activeIdx !== null ? slices[activeIdx].category : 'کل سهم'}
          </span>
          <span className="text-xs font-bold text-slate-800">
            {activeIdx !== null
              ? formatPercent(slices[activeIdx].percent)
              : formatCompactToman(total)}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-1.5 w-full">
        {slices.map((s, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-between rounded-lg p-1.5 text-xs cursor-pointer transition-colors ${
              activeIdx === idx ? 'bg-slate-100 font-semibold' : 'hover:bg-slate-50'
            }`}
            onMouseEnter={() => setActiveIdx(idx)}
            onMouseLeave={() => setActiveIdx(null)}
          >
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-slate-700">{s.category}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-mono text-[11px]">{formatPercent(s.percent)}</span>
              <span className="font-medium text-slate-900">{formatCompactToman(s.revenue)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
