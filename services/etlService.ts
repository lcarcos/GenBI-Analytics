
import { RawOrder, ProcessedOrder, LogisticsItem } from '../types';

// Helper para converter qualquer string suja em número válido
const parseSafeFloat = (val: any): number => {
  if (val === null || val === undefined) return 0;
  // Remove símbolos de moeda, espaços e converte vírgula decimal em ponto
  const clean = val.toString()
    .replace(/[^\d,.-]/g, '') 
    .replace(',', '.');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
};

export const parseCSVData = (rawData: RawOrder[]): ProcessedOrder[] => {
  const uniqueOrders = new Map<string, RawOrder>();
  
  rawData.forEach(row => {
    const id = row["Número de pedido"];
    if (id && !uniqueOrders.has(id)) uniqueOrders.set(id, row);
  });

  return Array.from(uniqueOrders.values()).map(order => {
    const extra = order["Otros campos de formulario"] || "";
    const notes = order["Nota del cliente"] || "";
    
    const isMember = extra.toLowerCase().includes("tengo tarjeta tk");

    // Parser de Datas
    const daysMatch = extra.match(/Elige los días:\s*([^|]+)/i);
    const eventFullMatch = extra.toLowerCase().includes("evento completo");
    
    let targetDays: string[] = [];
    if (eventFullMatch) {
      targetDays = ["9 de enero", "10 de enero", "11 de enero", "12 de enero", "13 de enero", "14 de enero", "15 de enero"];
    } else if (daysMatch) {
      targetDays = daysMatch[1].split(',').map(d => d.trim().toLowerCase());
    }

    const logistics: LogisticsItem[] = targetDays.map(dayLabel => {
      const mealRegex = new RegExp(`${dayLabel}:\\s*([^|(]+)`, 'i');
      const mealMatch = extra.match(mealRegex);
      
      const hasLunch = mealMatch ? mealMatch[1].toLowerCase().includes("comida") : false;
      const hasDinner = mealMatch ? mealMatch[1].toLowerCase().includes("cena") : false;

      const accPriceRegex = new RegExp(`${dayLabel}\\s*\\((\\d+,?\\d*)\\s*€\\)`, 'i');
      const accPriceMatch = extra.match(accPriceRegex);
      const price = accPriceMatch ? parseSafeFloat(accPriceMatch[1]) : 0;

      let accType = "Sin Alojamiento";
      if (extra.includes("Habitación Estándar")) accType = "Estándar";
      else if (extra.includes("Habitación Premium")) accType = "Premium";
      else if (price > 0) accType = "Alojamento Geral";

      return {
        date: dayLabel,
        lunch: hasLunch,
        dinner: hasDinner,
        accommodationType: accType,
        accommodationPrice: price
      };
    });

    return {
      id: order["Número de pedido"],
      fullName: `${order.Nombre || ''} ${order.Apellidos || ''}`.trim(),
      email: order["Correo electrónico"] || "N/A",
      phone: order["Teléfono"] || "N/A",
      city: order.Ciudad || "N/A",
      status: order["Estado del pedido"] || "Desconhecido",
      isMember,
      totalAmount: parseSafeFloat(order["Importe total"]),
      dietaryNotes: notes || "Nenhuma",
      items: logistics
    };
  });
};
