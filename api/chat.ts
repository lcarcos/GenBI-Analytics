import { GoogleGenAI } from '@google/genai';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200 });
  }

  try {
    // No Vercel, as chaves do painel (ou do .env.local) ficam em process.env
    // mas no runtime Edge, process.env já funciona perfeitamente assim.
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in Vercel.");
    }

    const { messages, globalStats, contextData } = await req.json();

    const ai = new GoogleGenAI({ apiKey });

    // Map frontend messages to Gemini format
    const geminiContents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const systemInstruction = `
      You are GenBI, an assistant specialized in business data analysis and event logistics.
      ALWAYS respond in English, in an analytical, mathematical, and professional manner.
      
      DASHBOARD GLOBAL METRICS:
      - Total Orders: ${globalStats.totalOrders}
      - Paid Revenue: ${globalStats.totalRevenueReal.toFixed(2)} €
      - Projected Revenue (100%): ${globalStats.totalRevenueProjected.toFixed(2)} €
      - Premium Members: ${globalStats.totalTK} (${((globalStats.totalTK/globalStats.totalOrders)*100).toFixed(1)}%)
      - Catering Logistics: ${globalStats.totalLunches} Lunches, ${globalStats.totalDinners} Dinners
      
      INSTRUCTIONS:
      - Use Markdown tables or bullet points for comparisons.
      - Customer data is ANONYMIZED (GDPR): do not invent names or emails.
      
      DATASET CONTEXT (${contextData.length} records):
      ${JSON.stringify(contextData)}
    `;

    const responseStream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: geminiContents,
      config: {
        systemInstruction,
        temperature: 0.1,
      },
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of responseStream) {
            if (chunk.text) {
              controller.enqueue(encoder.encode(chunk.text));
            }
          }
        } catch (e: any) {
          console.error("Streaming error:", e);
          controller.enqueue(encoder.encode("\\n\\n[Error generating response stream]"));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain" },
    });

  } catch (error: any) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
