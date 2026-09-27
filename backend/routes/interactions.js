import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { hindsightService } from '../services/hindsightService.js';
import { ExtractorService } from '../services/extractorService.js';
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

// POST new interaction (Clinical Encounter Ingestion Pipeline)
router.post('/', async (req, res) => {
  try {
    const { patientId, provider, role, type, notes, date } = req.body;

    if (!patientId || !notes) {
      return res.status(400).json({ error: 'patientId and clinical notes are required' });
    }

    const patients = getPatients();
    const patientIndex = patients.findIndex(p => p.id.toUpperCase() === patientId.toUpperCase());
    if (patientIndex === -1) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const encounterDate = date || new Date().toISOString().split('T')[0];
    const interactions = getInteractions();
    const newId = `INT-${String(interactions.length + 1).padStart(3, '0')}`;

    // 1. Rule & heuristic extraction
    const extractedData = ExtractorService.parseRawNotes(notes);

    const newInteraction = {
      id: newId,
      patientId: patients[patientIndex].id,
      date: encounterDate,
      provider: provider || 'Attending Physician',
      role: role || 'Clinical Staff',
      type: type || 'Consultation Review',
      notes,
      extracted: extractedData
    };

    // 2. Retain to Hindsight
    const hindsightMemories = ExtractorService.extractMemoriesForHindsight(newInteraction);
    const retainReceipt = await hindsightService.retain(patients[patientIndex].id, hindsightMemories);

    // 3. Persist to structured database
    interactions.push(newInteraction);
    fs.writeFileSync(INTERACTIONS_FILE, JSON.stringify(interactions, null, 2));

    // 4. Update patient last interaction & status
    patients[patientIndex].lastInteractionDate = encounterDate;
    if (extractedData.investigationsPending.length > 0) {
      patients[patientIndex].status = 'Test Result Pending';
      patients[patientIndex].statusSeverity = 'warning';
      patients[patientIndex].pendingAction = `${extractedData.investigationsPending.join(', ')} pending`;
    } else if (extractedData.followUpRequired) {
      patients[patientIndex].status = 'Follow-up Pending';
      patients[patientIndex].statusSeverity = 'warning';
      patients[patientIndex].pendingAction = extractedData.followUpCondition;
    } else {
      patients[patientIndex].status = 'Active Care';
      patients[patientIndex].statusSeverity = 'success';
      patients[patientIndex].pendingAction = 'Routine follow-up';
    }
    fs.writeFileSync(PATIENTS_FILE, JSON.stringify(patients, null, 2));

    // 5. Compute fresh continuity analysis
    const pInteractions = interactions.filter(i => i.patientId === patients[patientIndex].id);
    const continuity = ContinuityEngine.analyzeContinuity(patients[patientIndex], pInteractions);

    res.status(201).json({
      success: true,
      interaction: newInteraction,
      hindsightRetained: {
        count: hindsightMemories.length,
        memories: hindsightMemories,
        receipt: retainReceipt
      },
      continuity
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
