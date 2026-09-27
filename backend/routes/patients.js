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

// GET all patients
router.get('/', (req, res) => {
  try {
    const patients = getPatients();
    const interactions = getInteractions();

    const enriched = patients.map(p => {
      const pInteractions = interactions.filter(i => i.patientId === p.id);
      const continuity = ContinuityEngine.analyzeContinuity(p, pInteractions);
      return {
        ...p,
        interactionCount: pInteractions.length,
        continuityScore: continuity.continuityScore,
        pendingInvestigations: continuity.pendingInvestigations,
        hasBlockers: continuity.hasBlockers
      };
    });

    res.json({ patients: enriched });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single patient with journey timeline & continuity status
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const patients = getPatients();
    const patient = patients.find(p => p.id.toUpperCase() === id.toUpperCase());

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const interactions = getInteractions().filter(i => i.patientId.toUpperCase() === id.toUpperCase());
    const continuity = ContinuityEngine.analyzeContinuity(patient, interactions);
    const memoryInspection = hindsightService.inspectBank(patient.id);

    res.json({
      patient,
      timeline: interactions,
      continuity,
      memoryBank: {
        totalMemories: memoryInspection.totalMemories,
        categories: memoryInspection.categories,
        updatedAt: memoryInspection.updatedAt
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new patient
router.post('/', (req, res) => {
  try {
    const { name, age, gender, contact, bloodGroup, primaryConcern } = req.body;
    if (!name || !primaryConcern) {
      return res.status(400).json({ error: 'Name and primary concern are required' });
    }

    const patients = getPatients();
    const newId = `P00${patients.length + 1}`;
    const newPatient = {
      id: newId,
      name,
      age: Number(age) || 40,
      gender: gender || 'Unspecified',
      contact: contact || '',
      bloodGroup: bloodGroup || 'O+',
      primaryConcern,
      status: 'Initial Assessment',
      statusSeverity: 'info',
      pendingAction: 'Initial consultation workup',
      lastInteractionDate: new Date().toISOString().split('T')[0],
      assignedPhysician: 'Attending Clinician'
    };

    patients.push(newPatient);
    fs.writeFileSync(PATIENTS_FILE, JSON.stringify(patients, null, 2));

    res.status(201).json({ patient: newPatient });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Seed Hindsight memory bank for a patient
router.post('/:id/seed-memory', async (req, res) => {
  try {
    const { id } = req.params;
    const interactions = getInteractions().filter(i => i.patientId.toUpperCase() === id.toUpperCase());
    
    let allItems = [];
    interactions.forEach(int => {
      const items = ExtractorService.extractMemoriesForHindsight(int);
      allItems.push(...items);
    });

    const result = await hindsightService.retain(id, allItems);
    res.json({ success: true, seededCount: allItems.length, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
