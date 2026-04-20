import { FactTransaction } from "../types";
import { isTKMember, getFoodSelection, getOrderCourseName } from "../utils";

// Record limit sent to the LLM context — the rest is available via global stats
const LLM_CONTEXT_LIMIT = 150;

/**
 * Builds an anonymized and enriched summary of transactions for the LLM.
 * NEVER includes client PII (names/emails) for GDPR compliance.
 */
const buildAnonymizedContext = (data: FactTransaction[]) => {
  return data.slice(0, LLM_CONTEXT_LIMIT).map(o => {
    const amount = o.total_amount || 0;
    
    // Projection logic (26% vs 100%)
    let is26Percent = false;
    const gfData = o.gravity_forms_data || o.raw_data;
    if (gfData && gfData['elige_el_metodo_de_pago']) {
       if (String(gfData['elige_el_metodo_de_pago']).includes('26%')) is26Percent = true;
    } else if (o.items_summary && o.items_summary.includes('26%')) {
       is26Percent = true; 
    }
    const expectedAmount = is26Percent ? (amount / 0.26) : amount;
    
    const food = getFoodSelection(o);
    
    return {
      id: o.original_id,
      event: getOrderCourseName(o),
      paid: amount,
      expected: Number(expectedAmount.toFixed(2)),
      currency: o.currency || 'EUR',
      status: o.status,
      isPremium: isTKMember(o) ? "Yes" : "No",
      catering: food.count > 0 
        ? (food.hasLunch && food.hasDinner ? "Lunch and Dinner" : (food.hasLunch ? "Lunch Only" : "Dinner Only")) 
        : "None",
      date: o.created_at ? o.created_at.split('T')[0] : '',
    };
  });
};

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Communicates with the Vercel API Route to get a streaming response from GenBI.
 * @param messages The full conversation history.
 * @param data The transaction data available in the dashboard.
 * @param onChunk Callback to receive parts of the generated text as they stream in.
 */
export const queryGenBIStream = async (
  messages: Message[],
  data: FactTransaction[],
  onChunk: (chunk: string) => void
): Promise<void> => {
  
  // Aggregate global metrics
  let totalRevenueReal = 0;
  let totalRevenueProjected = 0;
  let totalTK = 0;
  let totalLunches = 0;
  let totalDinners = 0;

  data.forEach(o => {
    const amount = o.total_amount || 0;
    totalRevenueReal += amount;

    let is26Percent = false;
    const gfData = o.gravity_forms_data || o.raw_data;
    if (gfData && gfData['elige_el_metodo_de_pago'] && String(gfData['elige_el_metodo_de_pago']).includes('26%')) {
      is26Percent = true;
    } else if (o.items_summary && o.items_summary.includes('26%')) {
      is26Percent = true;
    }
    
    totalRevenueProjected += is26Percent ? (amount / 0.26) : amount;
    if (isTKMember(o)) totalTK++;
    const food = getFoodSelection(o);
    if (food.hasLunch) totalLunches++;
    if (food.hasDinner) totalDinners++;
  });

  const globalStats = {
    totalOrders: data.length,
    totalRevenueReal,
    totalRevenueProjected,
    totalTK,
    totalLunches,
    totalDinners
  };

  const contextData = buildAnonymizedContext(data);

  try {
    const response = await fetch(`/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
        globalStats,
        contextData
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[GenBI] Vercel API Error:", errorText);
      onChunk("❌ Error connecting to the AI engine on the backend. Make sure the Vercel API is running.");
      return;
    }

    if (!response.body) {
      throw new Error("ReadableStream not supported in this browser.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        onChunk(decoder.decode(value, { stream: !done }));
      }
    }
  } catch (error) {
    console.error("[GenBI] Stream reading error:", error);
    onChunk("\\n❌ Communication interrupted.");
  }
};
