
export interface RawOrder {
  "Número de pedido": string;
  "Estado del pedido": string;
  "Fecha del pedido": string;
  "Nota del cliente"?: string;
  "Nombre": string;
  "Apellidos": string;
  "Ciudad": string;
  "Correo electrónico": string;
  "Teléfono": string;
  "Método de pago"?: string;
  "Subtotal": string;
  "Importe total": string;
  "Otros campos de formulario": string;
}

export interface LogisticsItem {
  date: string;
  lunch: boolean;
  dinner: boolean;
  accommodationType: string;
  accommodationPrice: number;
}

export interface ProcessedOrder {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  status: string;
  isMember: boolean;
  totalAmount: number;
  dietaryNotes: string;
  items: LogisticsItem[];
}

export interface FactTransactionItem {
  product_name?: string;
  name?: string;
  quantity?: number;
  price?: number;
  [key: string]: any; 
}

export interface FactTransaction {
  transaction_id: string;
  original_id: string;
  source_platform: string;
  business_unit: string;
  customer_email: string;
  first_name: string;
  last_name: string;
  total_amount: number;
  currency: string;
  status: string;
  payment_method: string;
  items: FactTransactionItem[]; 
  items_summary?: string; 
  gravity_forms_data?: any; 
  raw_data?: any; 
  created_at: string;
  updated_at: string;
}
