import { GoogleGenAI } from "@google/genai";
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

const buildStats = (data: FactTransaction[]) => {
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

  return {
    totalOrders: data.length,
    totalRevenueReal,
    totalRevenueProjected,
    totalTK,
    totalLunches,
    totalDinners,
  };
};

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// ─── DEV MODE: Call Gemini directly (VITE_GEMINI_API_KEY in .env.local) ───────
const queryGenBIDev = async (
  messages: Message[],
  data: FactTransaction[],
  onChunk: (chunk: string) => void
): Promise<void> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    onChunk("⚠️ Dev mode: VITE_GEMINI_API_KEY not found in .env.local.");
    return;
  }

  const ai = new GoogleGenAI({ apiKey });
  const stats = buildStats(data);
  const contextData = buildAnonymizedContext(data);

  const geminiContents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const systemInstruction = `
    You are GenBI, an assistant specialized in business data analysis and event logistics.
    ALWAYS respond in English, in an analytical, mathematical, and professional manner.
    
    DASHBOARD GLOBAL METRICS:
    - Total Orders: ${stats.totalOrders}
    - Paid Revenue: ${stats.totalRevenueReal.toFixed(2)} €
    - Projected Revenue (100%): ${stats.totalRevenueProjected.toFixed(2)} €
    - Premium Members: ${stats.totalTK} (${stats.totalOrders > 0 ? ((stats.totalTK / stats.totalOrders) * 100).toFixed(1) : 0}%)
    - Catering: ${stats.totalLunches} Lunches, ${stats.totalDinners} Dinners
    
    INSTRUCTIONS:
    - Use Markdown tables or bullet points for comparisons.
    - Customer data is ANONYMIZED (GDPR): do not invent names or emails.
    
    DATASET CONTEXT (${contextData.length} records):
    ${JSON.stringify(contextData)}
  `;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-2.0-flash",
      contents: geminiContents,
      config: { systemInstruction, temperature: 0.1 },
    });

    for await (const chunk of responseStream) {
      if (chunk.text) onChunk(chunk.text);
    }
  } catch (error) {
    console.error("[GenBI Dev] Gemini error:", error);
    onChunk("❌ Error connecting to Gemini API. Check your VITE_GEMINI_API_KEY.");
  }
};

// ─── PROD MODE: Call secure Vercel Edge Function /api/chat ───────────────────
const queryGenBIProd = async (
  messages: Message[],
  data: FactTransaction[],
  onChunk: (chunk: string) => void
): Promise<void> => {
  const stats = buildStats(data);
  const contextData = buildAnonymizedContext(data);

  try {
    const response = await fetch(`/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, globalStats: stats, contextData }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[GenBI Prod] Vercel API Error:", errorText);
      onChunk("❌ Error connecting to the AI engine. Make sure GEMINI_API_KEY is set in Vercel Environment Variables.");
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
      if (value) onChunk(decoder.decode(value, { stream: !done }));
    }
  } catch (error) {
    console.error("[GenBI Prod] Stream error:", error);
    onChunk("\n❌ Communication interrupted.");
  }
};

/**
 * Main entry point — automatically picks Dev or Prod mode based on Vite's env flag.
 * - DEV  (npm run dev): Calls Gemini directly using VITE_GEMINI_API_KEY from .env.local
 * - PROD (Vercel):      Routes through the secure /api/chat Edge Function using GEMINI_API_KEY
 */
export const queryGenBIStream = async (
  messages: Message[],
  data: FactTransaction[],
  onChunk: (chunk: string) => void
): Promise<void> => {
  if (import.meta.env.DEV) {
    return queryGenBIDev(messages, data, onChunk);
  }
  return queryGenBIProd(messages, data, onChunk);
};
