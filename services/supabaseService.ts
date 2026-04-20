import { supabase } from './supabase';
import { FactTransaction } from '../types';

// Safety limit per page — respecting PostgREST default
const PAGE_LIMIT = 1000;

// Maximum total records to protect memory and LLM context
const MAX_RECORDS = 5000;

export interface FetchResult {
  data: FactTransaction[];
  error: string | null;
  totalFetched: number;
  truncated: boolean;
}

const MOCK_DATA: FactTransaction[] = [
  {
    transaction_id: '1',
    original_id: 'MOCK-001',
    source_platform: 'Mock System',
    business_unit: 'Tech Conference 2024',
    customer_email: 'demo@example.com',
    first_name: 'Guest',
    last_name: 'Visitor',
    total_amount: 150.00,
    currency: 'EUR',
    status: 'Completed',
    payment_method: 'Credit Card',
    items: [],
    items_summary: 'VIP Ticket (Local Demo Only)',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    transaction_id: '2',
    original_id: 'MOCK-002',
    source_platform: 'Mock System',
    business_unit: 'AI Workshop',
    customer_email: 'tester@example.com',
    first_name: 'Ana',
    last_name: 'Tester',
    total_amount: 200.00,
    currency: 'EUR',
    status: 'Completed',
    payment_method: 'PayPal',
    items: [],
    items_summary: 'Intensive Course (Local Demo Only)',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString()
  }
];

/**
 * Fetches all transactions from the fact_transactions table in a paginated way.
 * Returns an object with data, possible errors, and pagination metadata.
 */
export const fetchTransactions = async (): Promise<FetchResult> => {
  // If no Supabase URL is found, return mock data immediately
  if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes("placeholder")) {
    console.info('[GenBI] Using MOCK data (Environment not configured)');
    return { data: MOCK_DATA, error: null, totalFetched: MOCK_DATA.length, truncated: false };
  }

  let allData: FactTransaction[] = [];
  let start = 0;
  let hasMore = true;
  let truncated = false;

  try {
    while (hasMore) {
      // Safety check — prevents browser memory exhaustion
      if (allData.length >= MAX_RECORDS) {
        console.warn(
          `[GenBI] Safety limit reached: ${MAX_RECORDS} records. ` +
          'Implement date filters to load smaller sets.'
        );
        truncated = true;
        break;
      }

      const { data, error } = await supabase
        .from('fact_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .range(start, start + PAGE_LIMIT - 1);

      if (error) {
        console.error('[GenBI] Error querying fact_transactions:', error.message);
        return {
          data: allData,
          error: `Database error: ${error.message}`,
          totalFetched: allData.length,
          truncated,
        };
      }

      if (data && data.length > 0) {
        allData = [...allData, ...(data as FactTransaction[])];
        start += PAGE_LIMIT;

        // If the returned page is shorter than the limit, we reached the end
        if (data.length < PAGE_LIMIT) {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    }

    return { data: allData, error: null, totalFetched: allData.length, truncated };

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[GenBI] Unexpected exception fetching transactions:', message);
    return { data: [], error: message, totalFetched: 0, truncated: false };
  }
};
