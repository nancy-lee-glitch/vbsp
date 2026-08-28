import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy Gemini client getter
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AVA AI Virtual Assistant & Live ThriftLine Rep Gemini API endpoint
app.post('/api/ava/chat', async (req, res) => {
  try {
    const { messages, userContext, mode } = req.body;
    const client = getGeminiClient();

    const systemPrompt = `You are AVA (Automated Virtual Assistant), the official Thrift Savings Plan (TSP.gov) 24/7 Virtual Assistant and expert federal retirement counselor.
Mode: ${mode || 'public'} (${mode === 'participant' ? 'Authenticated Participant Mode' : mode === 'thriftline' ? 'Live ThriftLine Representative Mode' : 'Public Guidance Mode'}).
${userContext ? `Participant context: Name: ${userContext.name || 'Participant'}, Account Type: ${userContext.serviceType || 'FERS'}, Current Balance: $${userContext.balance || '342,850.12'}, Funds: ${userContext.funds || 'L 2050 (60%), C Fund (25%), S Fund (15%)'}` : ''}

Key Knowledge & Federal Rules to adhere to:
1. Contribution Limits for 2026: Elective deferral limit is $23,500. Age 50+ catch-up is $7,500. Under SECURE 2.0, special higher catch-up for ages 60, 61, 62, and 63 is $11,250.
2. Individual Funds:
   - G Fund (Government Securities Investment Fund): Preserves capital, guaranteed return backed by US Gov.
   - F Fund (Fixed Income Index Investment Fund): Tracks Bloomberg U.S. Aggregate Bond Index.
   - C Fund (Common Stock Index Investment Fund): Tracks S&P 500 large-cap US stocks.
   - S Fund (Small Capitalization Stock Index Investment Fund): Tracks Dow Jones U.S. Completion TSM Index (mid/small-cap).
   - I Fund (International Stock Index Investment Fund): Tracks MSCI ACWI ex-USA Index.
   - L Funds (Lifecycle Funds): Target-date funds ranging from L Income to L 2065+ that automatically rebalance.
3. Actions: Interfund transfers (IFT) allow reallocating current balance. Contribution allocations dictate where future agency and employee contributions go.
4. Loans & Distributions: General purpose (1-5 yrs) and Primary Residence (1-15 yrs) loans. In-service withdrawals (Age 59½ or financial hardship). Post-separation options (installment payments, single withdrawal, life annuity).
5. Tone: Highly professional, reassuring, clear, official .gov compliance, security-minded, concise, formatted with clear markdown bullets where helpful.

Answer the user's inquiry accurately, referencing official TSP guidelines. Never ask for full SSN or bank account passwords.`;

    if (!client) {
      // Intelligent fallback if no Gemini key is provided in environment
      const lastUserMsg = (messages && messages[messages.length - 1]?.content) || '';
      let reply = "Hello! I am AVA, your 24/7 Thrift Savings Plan assistant. ";
      
      const q = lastUserMsg.toLowerCase();
      if (q.includes('limit') || q.includes('contribute') || q.includes('maximum')) {
        reply += "For 2026, the regular TSP elective deferral limit is **$23,500**. If you are age 50 or older, you can make an additional catch-up contribution of **$7,500**. Under SECURE 2.0, participants aged 60–63 are eligible for a higher catch-up limit of **$11,250**.";
      } else if (q.includes('c fund') || q.includes('g fund') || q.includes('fund') || q.includes('investment')) {
        reply += "The TSP offers 5 individual core funds (G, F, C, S, and I Funds) as well as target-date **Lifecycle (L) Funds** (e.g., L 2050, L 2065, L Income). You can manage your holdings via an **Interfund Transfer (IFT)** to move existing money, or adjust your **Contribution Allocation** for future payroll deductions.";
      } else if (q.includes('loan') || q.includes('borrow')) {
        reply += "The TSP offers two types of loans: **General Purpose Loans** (1 to 5-year repayment term) and **Primary Residence Loans** (1 to 15-year repayment term). The maximum loan amount is the lesser of 50% of your vested balance or $50,000 (minus your highest outstanding loan balance in the prior 12 months).";
      } else if (q.includes('withdraw') || q.includes('distribution') || q.includes('retire')) {
        reply += "You have several withdrawal options: In-service withdrawals (if you reach age 59½ or experience a certified financial hardship) and post-separation distributions including installment payments (monthly, quarterly, or annual), single partial/full withdrawals, or purchasing a lifetime annuity.";
      } else if (q.includes('transfer') || q.includes('rollover') || q.includes('roth')) {
        reply += "You can roll over eligible 401(k), 403(b), or traditional IRA funds into your TSP account. You can also request an in-plan Roth conversion within your Participant My Account portal.";
      } else {
        reply += "I can help you navigate contribution limits, fund performance (G, F, C, S, I, L), loan requests, beneficiary designations, roll-overs, or withdrawal rules. How can I assist your retirement planning today?";
      }

      return res.json({ reply });
    }

    // Call Gemini 3.7 Flash
    const formattedHistory = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await client.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: formattedHistory,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.3,
      },
    });

    const reply = response.text || "I apologize, I could not process your request at this moment. Please try asking in a different way or contact the ThriftLine at 1-877-968-3778.";
    return res.json({ reply });
  } catch (error: any) {
    console.error('AVA Chat Error:', error);
    res.status(500).json({
      error: 'Failed to process request with AVA.',
      reply: "I am temporarily experiencing higher than usual volume. You can also review our educational guides or visit the 'Plan details at a glance' section.",
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TSP Federal Portal Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
