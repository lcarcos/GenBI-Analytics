import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer
} from 'recharts';
import { BookOpen } from 'lucide-react';
import { ChartDataPoint } from '../../hooks/useDashboardStats';

const COLORS = ['#4f46e5', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#3b82f6'];

interface RevenueBarChartProps {
  data: ChartDataPoint[];
}

const RevenueBarChart: React.FC<RevenueBarChartProps> = ({ data }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
      <BookOpen className="w-5 h-5 text-indigo-600" /> Events: Revenue (EUR)
    </h3>
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -20, bottom: -10 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10 }}
            tickFormatter={(val) => val.length > 15 ? val.substring(0, 15) + '...' : val}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
          <Tooltip
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
            formatter={(value: number) => [`€ ${value.toFixed(2)}`, 'Revenue']}
          />
          <Bar dataKey="value" name="Revenue" fill="#ec4899" radius={[6, 6, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default RevenueBarChart;
