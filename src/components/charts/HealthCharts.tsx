import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface AdherenceChartProps {
  currentAdherence?: number;
}

export const AdherenceChart: React.FC<AdherenceChartProps> = ({ currentAdherence = 90 }) => {
  // Generate 7-day trend relative to current adherence
  const adherenceData = [
    { day: 'Mon', adherence: Math.min(100, Math.max(60, currentAdherence + 5)) },
    { day: 'Tue', adherence: Math.min(100, Math.max(60, currentAdherence - 10)) },
    { day: 'Wed', adherence: Math.min(100, Math.max(60, currentAdherence + 2)) },
    { day: 'Thu', adherence: Math.min(100, Math.max(60, currentAdherence - 5)) },
    { day: 'Fri', adherence: Math.min(100, Math.max(60, currentAdherence + 8)) },
    { day: 'Sat', adherence: Math.min(100, Math.max(60, currentAdherence - 2)) },
    { day: 'Today', adherence: currentAdherence },
  ];

  return (
    <div className="w-full h-56 sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={adherenceData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="colorAdherence" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
          <YAxis domain={[50, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              fontSize: '12px',
              fontWeight: '600',
            }}
            formatter={(val: number) => [`${val}% Adherence`, 'Compliance']}
          />
          <Area
            type="monotone"
            dataKey="adherence"
            stroke="#2563eb"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorAdherence)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

interface DosageBreakdownChartProps {
  categories?: { name: string; value: number; count: number; color: string }[];
}

const defaultCategoryData = [
  { name: 'Cardiovascular', value: 35, count: 2, color: '#2563eb' },
  { name: 'Antibiotics', value: 25, count: 1, color: '#f59e0b' },
  { name: 'Diabetes', value: 20, count: 1, color: '#8b5cf6' },
  { name: 'Respiratory', value: 20, count: 1, color: '#10b981' },
];

export const DosageBreakdownChart: React.FC<DosageBreakdownChartProps> = ({ categories }) => {
  const data = categories && categories.length > 0 ? categories : defaultCategoryData;

  return (
    <div className="w-full h-56 flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="75%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={70}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              fontSize: '12px',
            }}
            formatter={(val: number, name: string, item: any) => [
              `${val}% (${item.payload.count || 0} Meds)`,
              item.payload.name,
            ]}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] pt-1">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5 font-medium text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span className="truncate max-w-[100px]">{item.name}</span>
            <span className="font-bold text-slate-900">({item.count})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

