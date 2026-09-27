import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import patientsRouter from './routes/patients.js';
import interactionsRouter from './routes/interactions.js';
import agentRouter from './routes/agent.js';
import { ExtractorService } from './services/extractorService.js';
import { hindsightService } from './services/hindsightService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/patients', patientsRouter);
app.use('/api/interactions', interactionsRouter);
app.use('/api/agent', agentRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'CareContinuity Backend',
    version: '1.0.0',
    hindsight: {
      isLiveConfigured: hindsightService.isLive,
      baseUrl: config.hindsight.baseUrl,
      tenant: config.hindsight.tenant
    },
    llm: {
      provider: config.llm.provider,
      hasGroq: Boolean(config.llm.groqApiKey),
      hasOpenAI: Boolean(config.llm.openaiApiKey)
    }
  });
});

// Serve production frontend bundle if built
const distPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

/**
 * Initialize and auto-seed Hindsight memory banks on startup
 */
async function initializeMemoryBanks() {
  try {
    const interactionsPath = path.join(__dirname, 'data/interactions.json');
    if (fs.existsSync(interactionsPath)) {
      const interactions = JSON.parse(fs.readFileSync(interactionsPath, 'utf-8'));
      const byPatient = {};

      interactions.forEach(int => {
        if (!byPatient[int.patientId]) byPatient[int.patientId] = [];
        byPatient[int.patientId].push(...ExtractorService.extractMemoriesForHindsight(int));
      });

      for (const [patientId, items] of Object.entries(byPatient)) {
        hindsightService.seedBank(patientId, items);
      }
      console.log(`[CareContinuity] Memory banks initialized for ${Object.keys(byPatient).length} patients.`);
    }
  } catch (err) {
    console.warn('[CareContinuity] Notice initializing memory banks:', err.message);
  }
}

// Start server
app.listen(config.port, async () => {
  console.log(`=======================================================`);
  console.log(`🚀 CareContinuity Backend running on http://localhost:${config.port}`);
  console.log(`🧠 Hindsight Status: ${hindsightService.isLive ? 'Connected (Live API)' : 'Active (Local Memory Engine)'}`);
  console.log(`🤖 LLM Provider: ${config.llm.provider}`);
  console.log(`=======================================================`);
  await initializeMemoryBanks();
});
