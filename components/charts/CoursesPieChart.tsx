import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Flower2 } from 'lucide-react';
import { ChartDataPoint } from '../../hooks/useDashboardStats';

const COLORS = ['#4f46e5', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#3b82f6'];

interface CoursesPieChartProps {
  data: ChartDataPoint[];
}

const CoursesPieChart: React.FC<CoursesPieChartProps> = ({ data }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <Flower2 className="w-5 h-5 text-indigo-600" /> Events: Most Popular
      </h3>
    </div>
    <div className="h-72 flex flex-col md:flex-row items-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="w-full md:w-56 space-y-2 mt-4 md:mt-0">
        {data.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 overflow-hidden mr-2">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="text-slate-600 truncate" title={item.name}>{item.name}</span>
            </div>
            <span className="font-bold">{item.value} regs.</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default CoursesPieChart;
