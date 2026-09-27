import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { hindsightService } from '../services/hindsightService.js';
import { llmService } from '../services/llmService.js';
import { ContinuityEngine } from '../services/continuityEngine.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PATIENTS_FILE = path.join(__dirname, '../data/patients.json');
const INTERACTIONS_FILE = path.join(__dirname, '../data/interactions.json');

function getPatients() {
  return JSON.parse(fs.readFileSync(PATIENTS_FILE, 'utf-8'));
}

function getInteractions() {
  return JSON.parse(fs.readFileSync(INTERACTIONS_FILE, 'utf-8'));
}

// POST query the CareContinuity Agent
router.post('/query', async (req, res) => {
  try {
    const { patientId, query, withoutMemory = false, budget = 'HIGH' } = req.body;

    if (!patientId || !query) {
      return res.status(400).json({ error: 'patientId and query are required' });
    }

    const patients = getPatients();
    const patient = patients.find(p => p.id.toUpperCase() === patientId.toUpperCase());
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // 1. Recall from Hindsight Memory (if not in withoutMemory test mode)
    let recallResult = { memories: [] };
    if (!withoutMemory) {
      recallResult = await hindsightService.recall(patient.id, query, { budget });
    }

    // 2. Synthesize Continuity Response via LLM
    const response = await llmService.generateContinuityResponse({
      patient,
      query,
      recalledMemories: recallResult.memories,
      withoutMemory
    });

    // 3. Continuity metadata
    const interactions = getInteractions().filter(i => i.patientId === patient.id);
    const continuity = ContinuityEngine.analyzeContinuity(patient, interactions, recallResult.memories);

    res.json({
      patientId: patient.id,
      patientName: patient.name,
      query,
      withoutMemory,
      answer: response.text,
      provider: response.provider,
      model: response.model,
      recalledMemories: recallResult.memories || [],
      retrievalSource: recallResult.source || 'none',
      continuityScore: continuity.continuityScore,
      hasBlockers: continuity.hasBlockers,
      alerts: continuity.alerts
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST compare With Memory vs Without Memory side-by-side
router.post('/compare', async (req, res) => {
  try {
    const { patientId, query = "What has happened with this patient so far and what are we waiting for?" } = req.body;

    if (!patientId) {
      return res.status(400).json({ error: 'patientId is required' });
    }

    const patients = getPatients();
    const patient = patients.find(p => p.id.toUpperCase() === patientId.toUpperCase());
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Recall with Hindsight
    const recallResult = await hindsightService.recall(patient.id, query, { budget: 'HIGH' });

    // Generate both answers simultaneously
    const [withMemoryRes, withoutMemoryRes] = await Promise.all([
      llmService.generateContinuityResponse({
        patient,
        query,
        recalledMemories: recallResult.memories,
        withoutMemory: false
      }),
      llmService.generateContinuityResponse({
        patient,
        query,
        recalledMemories: [],
        withoutMemory: true
      })
    ]);

    res.json({
      patient,
      query,
      withMemory: {
        answer: withMemoryRes.text,
        recalledCount: recallResult.memories.length,
        memories: recallResult.memories,
        source: recallResult.source
      },
      withoutMemory: {
        answer: withoutMemoryRes.text,
        recalledCount: 0,
        memories: []
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET inspect Hindsight Memory Bank
router.get('/memory/:patientId', (req, res) => {
  try {
    const { patientId } = req.params;
    const inspection = hindsightService.inspectBank(patientId);
    res.json(inspection);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST reset Hindsight Memory Bank
router.post('/memory/:patientId/clear', (req, res) => {
  try {
    const { patientId } = req.params;
    const result = hindsightService.clearBank(patientId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
