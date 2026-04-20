import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { EvolutionDataPoint } from '../../hooks/useDashboardStats';

interface RevenueAreaChartProps {
  data: EvolutionDataPoint[];
}

const RevenueAreaChart: React.FC<RevenueAreaChartProps> = ({ data }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-indigo-600" /> Revenue Evolution
      </h3>
      <span className="text-xs font-medium text-slate-400">Historical Performance</span>
    </div>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} tickFormatter={(val) => `€${val}`} />
          <Tooltip
            cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '3 3' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#6366f1"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorValue)"
            name="Sales Revenue"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default RevenueAreaChart;
