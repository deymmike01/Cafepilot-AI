import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Health / Status endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Advisor endpoint
app.post('/api/advisor', async (req, res) => {
  try {
    const { prompt, context } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({
        success: false,
        isConfigured: false,
        message: 'GEMINI_API_KEY is not configured. Falling back to local deterministic advice.',
      });
    }

    const ai = new GoogleGenAI();

    const systemInstruction = `You are "CaféPilot Advisor", an expert F&B operations and recipe costing consultant for independent specialty coffee shops, milk tea stalls, and beverage kiosks in the Philippines.
Currency is Philippine Pesos (₱ / PHP).

STRICT OPERATIONAL & FINANCIAL RULES:
1. Always base your advice strictly on the business data provided in the context (recipes, ingredients, costs, selling prices, margins).
2. Financial calculations provided in context are deterministic facts. Do not fabricate, hallucinate, or alter these numbers.
3. Clearly distinguish calculated mathematical facts from strategic suggestions.
4. Crucial disclaimer: Gross profit (Selling Price minus Total Direct Costs) is NOT Net Profit. Always remind the owner that operating expenses like rent, staff labor, utilities, packaging wastage, shrinkage, and local business taxes have not yet been deducted.
5. Provide actionable, practical advice suited for small café owners with tight budgets (e.g., portion control, dial-in purge reduction, alternative milk yield, syrup pumping calibration, seasonal upselling, bundle pricing).
6. Be concise, structured, professional, and encouraging. Use bullet points and clear sections.`;

    const fullPrompt = `${systemInstruction}

CURRENT CAFÉ DATA & CONTEXT:
${JSON.stringify(context || {}, null, 2)}

USER INQUIRY:
${prompt}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: fullPrompt,
    });

    res.json({
      success: true,
      isConfigured: true,
      text: response.text,
    });
  } catch (error: any) {
    console.error('Advisor error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Internal advisor error',
    });
  }
});

// Start Server with Vite
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CaféPilot AI running on port ${PORT}`);
  });
}

startServer();
