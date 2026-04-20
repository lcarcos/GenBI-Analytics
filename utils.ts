// utils.ts
export const formatCurrency = (value: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(value);
};

export const formatDate = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
};

export const translateDataTerm = (term: string): string => {
    const mapping: Record<string, string> = {
        'Completado': 'Completed',
        'Procesando': 'Processing',
        'Cancelado': 'Cancelled',
        'Pendente': 'Pending',
        'Curso Intensivo de LLMs': 'Intensive LLM Course',
        'Ingresso Standard': 'Standard Ticket',
        'Ingresso VIP': 'VIP Ticket',
        'Ingresso VIP + Workshop React': 'VIP Ticket + React Workshop',
        'Pacote Full Pass (Hotel Incluído)': 'Full Pass Package (Hotel Included)',
        'Workshop de Métricas (Sábado)': 'Metrics Workshop (Saturday)',
        'Acesso Online Early Bird': 'Online Access Early Bird',
        'Workshop IA Generativa': 'Generative AI Workshop',
        'Generative AI Workshop': 'Generative AI Workshop',
        'Cartão de Crédito': 'Credit Card',
        'Transferência': 'Bank Transfer',
        'Almuerzo': 'Lunch',
        'Cena': 'Dinner'
    };
    
    return mapping[term] || term;
};

export const getOrderCourseName = (order: any): string => {
    let itemName = order.items_summary || "";
    if (!itemName && Array.isArray(order.items) && order.items.length > 0) {
        itemName = order.items[0].name || order.items[0].product_name || "";
    }
    
    if (typeof itemName === 'string') {
        // Remove quantity suffixes like "(x1)", "(x 2)", etc.
        itemName = itemName.replace(/\s*\(x\s*\d+\)/gi, '');
        // Replace multiple consecutive spaces with a single space and trim
        itemName = itemName.replace(/\s+/g, ' ').trim();
    }
    
    return translateDataTerm(itemName || "Unknown");
};

export const groupByDate = (data: any[], dateField: string, valueField: string) => {
    const result: Record<string, number> = {};

    data.forEach(item => {
        if (!item[dateField]) return;

        // Simplify ISO to get just YYYY-MM-DD
        const dateKey = item[dateField].split('T')[0];
        const val = Number(item[valueField]) || 0;

        result[dateKey] = (result[dateKey] || 0) + val;
    });

    // Transform object into an array sorted by date and format it
    return Object.keys(result)
        .sort() // Chronological order
        .map(key => {
            const parts = key.split('-');
            // Ex: 2026-03-03 -> "03 Mar"
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const formatted = `${parts[2]} ${months[parseInt(parts[1]) - 1]}`;

            return {
                dateRaw: key,
                date: formatted,
                value: result[key]
            };
        });
};

// Check if user is a member based on item string or metadata
export const isTKMember = (order: any): boolean => {
    if (!order) return false;
    
    // Check in gravity_forms_data or raw_data first
    const gfData = order.gravity_forms_data || order.raw_data;
    if (gfData) {
        // Look through values for explicit "tengo tarjeta tk" vs "no tengo tarjeta tk"
        const valuesString = JSON.stringify(gfData).toLowerCase();
        
        // If it explicitly says "no tengo" (no), then it's false
        if (valuesString.includes('no tengo tarjeta tk') || 
            valuesString.includes('sin tk') ||
            valuesString.includes('no member') ||
            valuesString.includes('standard member')) {
            return false;
        }
        
        // If it says they have it
        if (valuesString.includes('tengo tarjeta tk') || 
            valuesString.includes('con tk') ||
            valuesString.includes('is member') ||
            valuesString.includes('premium member')) {
            return true;
        }
    }

    // Fallback to items summary
    const str = JSON.stringify(order.items_summary || order.items || '').toLowerCase();
    
    if (str.includes('no tengo') || str.includes('sin tk') || str.includes('no member')) return false;

    return str.includes('tk') || 
           str.includes('tarjeta kadampa') || 
           str.includes('miembro') || 
           str.includes('member') ||
           str.includes('premium');
};

// Extract food and accommodation data
export const getFoodSelection = (order: any): { hasLunch: boolean, hasDinner: boolean, count: number } => {
    if (!order) return { hasLunch: false, hasDinner: false, count: 0 };
    
    const gfData = order.gravity_forms_data || order.raw_data;
    const str = JSON.stringify(gfData || order.items_summary || order.items || '').toLowerCase();

    const hasLunch = str.includes('almuerzo') || str.includes('comida') || str.includes('lunch');
    const hasDinner = str.includes('cena') || str.includes('dinner');
    
    // Roughly count the quantity of meals found
    let count = 0;
    if (hasLunch) count++;
    if (hasDinner) count++;

    return { hasLunch, hasDinner, count };
};
