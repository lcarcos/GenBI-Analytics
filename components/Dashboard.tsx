import React, { useState } from 'react';
import { TrendingUp, Users, Presentation, Filter, Search } from 'lucide-react';
import { FactTransaction } from '../types';
import { formatCurrency, isTKMember, translateDataTerm } from '../utils';
import { useDashboardStats } from '../hooks/useDashboardStats';
import RevenueAreaChart from './charts/RevenueAreaChart';
import CoursesPieChart from './charts/CoursesPieChart';
import RevenueBarChart from './charts/RevenueBarChart';

interface DashboardProps {
  data: FactTransaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [memberStatus, setMemberStatus] = useState<'all' | 'tk' | 'sintk'>('all');

  const { 
    availableCourses, 
    filteredData, 
    stats, 
    logistics, 
    evolutionData, 
    itemsDist, 
    revenueByCourse 
  } = useDashboardStats(data, selectedCourse, memberStatus);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
          Performance Dashboard
        </h2>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <Filter className="text-slate-400 w-5 h-5 hidden sm:block" />
          
          <select
            className="w-full sm:w-48 px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            value={memberStatus}
            onChange={(e) => setMemberStatus(e.target.value as any)}
          >
            <option value="all">All Members</option>
            <option value="tk">Premium Member (VIP)</option>
            <option value="sintk">Standard (Non-Member)</option>
          </select>

          <select
            className="w-full sm:w-64 px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            value={selectedCourse || ''}
            onChange={(e) => setSelectedCourse(e.target.value === '' ? null : e.target.value)}
          >
            <option value="">All events</option>
            {availableCourses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Revenue (Paid 26%)" 
          value={formatCurrency(stats.totalRevenue)} 
          icon={<TrendingUp className="text-emerald-600" />} 
          color="bg-emerald-50" 
        />
        <StatCard 
          title="Projected Total (100%)" 
          value={formatCurrency(stats.projectedTotalRevenue)} 
          icon={<TrendingUp className="text-indigo-600" />} 
          color="bg-indigo-50" 
        />
        <StatCard 
          title="Total Orders" 
          value={stats.totalParticipants} 
          icon={<Users className="text-blue-600" />} 
          color="bg-blue-50" 
        />
        <StatCard 
          title="Average Ticket" 
          value={formatCurrency(stats.avgTicket)} 
          icon={<Presentation className="text-amber-600" />} 
          color="bg-amber-50" 
        />
      </div>

      {/* Event Logistics (Only if a course is selected) */}
      {selectedCourse && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top duration-300">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm col-span-1 md:col-span-2 flex items-center justify-around">
             <div className="text-center">
                <p className="text-xs font-bold text-slate-500 uppercase">Premium Members</p>
                <p className="text-2xl font-black text-indigo-700">{logistics.totalTK}</p>
             </div>
             <div className="h-10 w-px bg-slate-200 hidden sm:block"></div>
             <div className="text-center">
                <p className="text-xs font-bold text-slate-500 uppercase">Standard Members</p>
                <p className="text-2xl font-black text-slate-700">{logistics.totalSinTK}</p>
             </div>
             <div className="h-10 w-px bg-slate-200 hidden sm:block"></div>
             <div className="text-center">
                <p className="text-xs font-bold text-slate-500 uppercase">% Members</p>
                <p className="text-2xl font-black text-emerald-600">
                  {stats.totalParticipants > 0 ? Math.round((logistics.totalTK / stats.totalParticipants) * 100) : 0}%
                </p>
             </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
             <p className="text-xs font-bold text-slate-500 uppercase mb-2 text-center">Meals Requested</p>
             <div className="flex gap-4">
                <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-bold">🍕 {logistics.totalLunches} Lunches</span>
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-bold">🍔 {logistics.totalDinners} Dinners</span>
             </div>
          </div>
        </div>
      )}

      {/* Revenue Evolution */}
      <RevenueAreaChart data={evolutionData} />

      {/* Course Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CoursesPieChart data={itemsDist} />
        <RevenueBarChart data={revenueByCourse} />
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2 text-slate-800">
            <Users className="w-5 h-5 text-slate-400" /> Student and Participant List
          </h3>
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search student..."
              className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 w-64 outline-none"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Retreat / Course</th>
                <th className="px-6 py-4 hidden sm:table-cell">Booking Date</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map(order => {
                const itemName = order.items_summary
                  || (Array.isArray(order.items) && order.items.length > 0
                    ? order.items[0].name || order.items[0].product_name
                    : null)
                  || 'Unknown';

                return (
                  <tr key={order.transaction_id || order.original_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{order.first_name} {order.last_name}</div>
                      <div className="text-xs text-slate-400">{order.customer_email} <span className="mx-1">•</span> ID: {order.original_id}</div>
                    </td>
                    <td className="px-6 py-4 max-w-[200px]">
                      <span className="inline-block px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium truncate w-full" title={itemName}>
                        {itemName}
                      </span>
                      {isTKMember(order) && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md text-[10px] font-bold">
                          ★ TK Member
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 hidden sm:table-cell">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('en-US') : '--/--/----'}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-slate-700 whitespace-nowrap">
                      {formatCurrency(order.total_amount, order.currency || 'EUR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        ['completed', 'processing', 'Completado', 'Procesando'].includes(order.status)
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}>
                        {translateDataTerm(order.status)}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                    No records found with the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</span>
      <div className={`p-2.5 rounded-xl ${color}`}>{icon}</div>
    </div>
    <div className="text-2xl font-black text-slate-900">{value}</div>
  </div>
);

export default Dashboard;
