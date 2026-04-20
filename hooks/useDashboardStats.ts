import { useMemo } from 'react';
import { FactTransaction } from '../types';
import { groupByDate, isTKMember, getFoodSelection, getOrderCourseName } from '../utils';

export interface DashboardStats {
  totalRevenue: number;
  projectedTotalRevenue: number;
  totalParticipants: number;
  completedCount: number;
  pendingCount: number;
  avgTicket: number;
}

export interface LogisticsStats {
  totalTK: number;
  totalSinTK: number;
  totalLunches: number;
  totalDinners: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface EvolutionDataPoint {
  dateRaw: string;
  date: string;
  value: number;
}

interface UseDashboardStatsResult {
  availableCourses: string[];
  filteredData: FactTransaction[];
  stats: DashboardStats;
  logistics: LogisticsStats;
  evolutionData: EvolutionDataPoint[];
  itemsDist: ChartDataPoint[];
  revenueByCourse: ChartDataPoint[];
}

export const useDashboardStats = (
  data: FactTransaction[],
  selectedCourse: string | null,
  memberStatus: 'all' | 'tk' | 'sintk' = 'all'
): UseDashboardStatsResult => {

  const availableCourses = useMemo(() => {
    const courses = new Set<string>();
    data.forEach(order => {
      const name = getOrderCourseName(order);
      if (name !== 'Unknown') courses.add(name);
    });
    return Array.from(courses).sort();
  }, [data]);

  const filteredData = useMemo(() => {
    let filtered = data;
    
    // Filter by Course/Event
    if (selectedCourse) {
      filtered = filtered.filter(order => getOrderCourseName(order) === selectedCourse);
    }
    
    // Filter by Membership
    if (memberStatus !== 'all') {
      filtered = filtered.filter(order => {
        const isTk = isTKMember(order);
        return memberStatus === 'tk' ? isTk : !isTk;
      });
    }

    return filtered;
  }, [data, selectedCourse, memberStatus]);

  const stats = useMemo<DashboardStats>(() => {
    let totalRevenue = 0;
    let projectedTotalRevenue = 0;
    
    filteredData.forEach(order => {
      const amount = order.total_amount || 0;
      totalRevenue += amount;

      // Projection logic: detect if it was a 26% deposit
      let is26Percent = false;
      const gfData = order.gravity_forms_data || order.raw_data;
      // 'elige_el_metodo_de_pago' is the internal field key for payment method selection
      if (gfData && gfData['elige_el_metodo_de_pago'] && String(gfData['elige_el_metodo_de_pago']).includes('26%')) {
        is26Percent = true;
      } else if (order.items_summary && order.items_summary.includes('26%')) {
        is26Percent = true; 
      }

      projectedTotalRevenue += is26Percent ? (amount / 0.26) : amount;
    });

    const completed = filteredData.filter(
      o => o.status === 'processing' || o.status === 'completed' || o.status === 'Completed'
    ).length;

    return {
      totalRevenue,
      projectedTotalRevenue,
      totalParticipants: filteredData.length,
      completedCount: completed,
      pendingCount: filteredData.length - completed,
      avgTicket: filteredData.length ? projectedTotalRevenue / filteredData.length : 0,
    };
  }, [filteredData]);

  const logistics = useMemo<LogisticsStats>(() => {
    let totalTK = 0;
    let totalSinTK = 0;
    let totalLunches = 0;
    let totalDinners = 0;

    filteredData.forEach(order => {
      if (isTKMember(order)) totalTK++; else totalSinTK++;

      const food = getFoodSelection(order);
      if (food.hasLunch) totalLunches++;
      if (food.hasDinner) totalDinners++;
    });

    return { totalTK, totalSinTK, totalLunches, totalDinners };
  }, [filteredData]);

  // Evolución temporal de ingresos
  const evolutionData = useMemo(() => {
    return groupByDate(filteredData, 'created_at', 'total_amount');
  }, [filteredData]);

  // Distribución por volumen
  const itemsDist = useMemo<ChartDataPoint[]>(() => {
    const dist: Record<string, number> = {};
    filteredData.forEach(order => {
      const name = getOrderCourseName(order);
      dist[name] = (dist[name] || 0) + 1;
    });
    return Object.entries(dist)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [filteredData]);

  // Ingresos por curso
  const revenueByCourse = useMemo<ChartDataPoint[]>(() => {
    const dist: Record<string, number> = {};
    filteredData.forEach(order => {
      const name = getOrderCourseName(order);
      dist[name] = (dist[name] || 0) + (order.total_amount || 0);
    });
    return Object.entries(dist)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [filteredData]);

  return { availableCourses, filteredData, stats, logistics, evolutionData, itemsDist, revenueByCourse };
};
