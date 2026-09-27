import { config } from '../config.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BANK_STORAGE_PATH = path.join(__dirname, '../data/hindsight_banks.json');

class HindsightService {
  constructor() {
    this.baseUrl = config.hindsight.baseUrl;
    this.apiKey = config.hindsight.apiKey;
    this.tenant = config.hindsight.tenant;
    this.isLive = Boolean(this.apiKey);
    this.localBanks = this.loadBanks();
  }

  loadBanks() {
    try {
      if (fs.existsSync(BANK_STORAGE_PATH)) {
        const raw = fs.readFileSync(BANK_STORAGE_PATH, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('[Hindsight] Could not read local bank file, starting fresh:', e.message);
    }
    return {};
  }

  saveBanks() {
    try {
      fs.writeFileSync(BANK_STORAGE_PATH, JSON.stringify(this.localBanks, null, 2));
    } catch (e) {
      console.warn('[Hindsight] Failed to persist local memory bank:', e.message);
    }
  }

  /**
   * Retain memories into a patient's memory bank
   * @param {string} patientId 
   * @param {Array<{content: string, tags?: string[], metadata?: any}>} items 
   */
  async retain(patientId, items) {
    const bankId = `patient_${patientId}`;
    console.log(`[Hindsight] Retaining ${items.length} items to bank "${bankId}"...`);

    // Always maintain local memory bank for instant inspection & fallback
    if (!this.localBanks[bankId]) {
      this.localBanks[bankId] = {
        bankId,
        patientId,
        createdAt: new Date().toISOString(),
        memories: []
      };
    }

    const stampedItems = items.map((item, index) => ({
      id: `mem-${Date.now()}-${index}`,
      content: item.content,
      tags: item.tags || ['clinical-continuity'],
      metadata: item.metadata || {},
      retainedAt: new Date().toISOString(),
      type: item.metadata?.category || 'encounter'
    }));

    this.localBanks[bankId].memories.push(...stampedItems);
    this.localBanks[bankId].updatedAt = new Date().toISOString();
    this.saveBanks();

    // If live Hindsight is configured, invoke the official Hindsight API
    if (this.isLive) {
      try {
        const url = `${this.baseUrl}/v1/${this.tenant}/banks/${bankId}/memories`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            items: items.map(i => ({
              content: i.content,
              tags: i.tags || []
            }))
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`[Hindsight API] Retain returned status ${response.status}: ${errText}`);
        } else {
          const data = await response.json();
          console.log(`[Hindsight API] Retain successful:`, data);
          return { success: true, count: items.length, source: 'live_hindsight', liveData: data };
        }
      } catch (err) {
        console.warn(`[Hindsight API] Network error during retain, retained in local bank: ${err.message}`);
      }
    }

    return {
      success: true,
      count: items.length,
      source: this.isLive ? 'hybrid_fallback' : 'local_hindsight_engine',
      bankId,
      totalMemories: this.localBanks[bankId].memories.length
    };
  }

  /**
   * Recall memories from a patient's memory bank using multi-strategy scoring
   * @param {string} patientId 
   * @param {string} query 
   * @param {object} options 
   */
  async recall(patientId, query, options = {}) {
    const bankId = `patient_${patientId}`;
    const budget = options.budget || 'HIGH';
    console.log(`[Hindsight] Recalling from bank "${bankId}" for query: "${query}" (budget: ${budget})`);

    // If live Hindsight is configured, try live recall first
    if (this.isLive) {
      try {
        const url = `${this.baseUrl}/v1/${this.tenant}/banks/${bankId}/memories/recall`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            query,
            budget,
            tags: options.tags
          })
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`[Hindsight API] Recall returned ${data.memories?.length || 0} memories`);
          return {
            source: 'live_hindsight',
            query,
            bankId,
            memories: data.memories || data.items || [],
            entities: data.entities || []
          };
        }
      } catch (err) {
        console.warn(`[Hindsight API] Live recall failed, using local memory engine: ${err.message}`);
      }
    }

    // Local Multi-Strategy Engine (BM25 keyword + semantic keyword boost + temporal weighting)
    const bank = this.localBanks[bankId] || { memories: [] };
    const queryTokens = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);

    const scored = bank.memories.map(mem => {
      let score = 0.1; // baseline
      const text = `${mem.content} ${(mem.tags || []).join(' ')} ${JSON.stringify(mem.metadata || {})}`.toLowerCase();

      // Keyword & entity matching
      queryTokens.forEach(token => {
        if (text.includes(token)) {
          score += 0.35;
          // Exact word match bonus
          const wordRegex = new RegExp(`\\b${token}\\b`, 'i');
          if (wordRegex.test(text)) score += 0.25;
        }
      });

      // Semantic clinical concept alignments
      const clinicalConcepts = [
        { terms: ['pending', 'waiting', 'delay', 'unresolved'], boost: ['pending', 'delayed', 'schedule', 'not yet', 'backlog'] },
        { terms: ['ultrasound', 'scan', 'imaging', 'sonography'], boost: ['ultrasound', 'radiograph', 'imaging', 'doppler', 'x-ray'] },
        { terms: ['test', 'blood', 'lab', 'result', 'lft', 'cbc'], boost: ['blood', 'lft', 'cbc', 'transaminases', 'laboratory', 'potassium'] },
        { terms: ['recommendation', 'specialist', 'dr', 'doctor', 'advice'], boost: ['recommend', 'specialist', 'gastroenterology', 'dr.', 'advised', 'consultation'] },
        { terms: ['follow-up', 'follow up', 'next step', 'timeline', 'status', 'summary'], boost: ['follow-up', 'next', 'review', 'return', 'consultation'] }
      ];

      clinicalConcepts.forEach(concept => {
        const queryMatches = concept.terms.some(t => query.toLowerCase().includes(t));
        if (queryMatches) {
          const contentMatches = concept.boost.some(b => text.includes(b));
          if (contentMatches) score += 0.6;
        }
      });

      // Recency weighting
      const ageHours = (Date.now() - new Date(mem.retainedAt).getTime()) / (1000 * 3600);
      const recencyBoost = Math.max(0, 0.2 - (ageHours * 0.005));
      score += recencyBoost;

      // Status tag weighting
      if (mem.tags.includes('unresolved') || mem.tags.includes('pending')) {
        score += 0.3;
      }

      return {
        ...mem,
        score: Math.min(1.0, Number(score.toFixed(3)))
      };
    });

    // Filter and sort by score descending
    const filtered = scored
      .filter(m => m.score > 0.2)
      .sort((a, b) => b.score - a.score);

    // Limit based on budget
    const limit = budget === 'HIGH' ? 8 : budget === 'MID' ? 5 : 3;
    const finalMemories = (filtered.length > 0 ? filtered : scored.slice(-4)).slice(0, limit);

    return {
      source: 'local_hindsight_engine',
      query,
      bankId,
      totalBankSize: bank.memories.length,
      memories: finalMemories
    };
  }

  /**
   * Inspect a patient's memory bank for the Memory Explorer UI
   * @param {string} patientId 
   */
  inspectBank(patientId) {
    const bankId = `patient_${patientId}`;
    const bank = this.localBanks[bankId] || { bankId, patientId, memories: [] };
    
    // Aggregate by category
    const categories = {
      encounter: 0,
      investigation: 0,
      recommendation: 0,
      followup: 0,
      unresolved: 0
    };

    bank.memories.forEach(m => {
      const cat = m.type || 'encounter';
      if (categories[cat] !== undefined) {
        categories[cat]++;
      } else {
        categories.encounter++;
      }
      if (m.tags?.includes('unresolved') || m.tags?.includes('pending')) {
        categories.unresolved++;
      }
    });

    return {
      bankId,
      patientId,
      totalMemories: bank.memories.length,
      updatedAt: bank.updatedAt || bank.createdAt || new Date().toISOString(),
      categories,
      memories: [...bank.memories].reverse(), // newest first
      isLiveConfigured: this.isLive
    };
  }

  /**
   * Seed a patient's memory bank from initial interactions if empty
   */
  seedBank(patientId, initialItems) {
    const bankId = `patient_${patientId}`;
    if (!this.localBanks[bankId] || this.localBanks[bankId].memories.length === 0) {
      console.log(`[Hindsight] Seeding initial memories for ${bankId}...`);
      this.retain(patientId, initialItems);
    }
  }

  /**
   * Reset/clear a patient's bank (useful for interactive Before/After demo)
   */
  clearBank(patientId) {
    const bankId = `patient_${patientId}`;
    this.localBanks[bankId] = {
      bankId,
      patientId,
      createdAt: new Date().toISOString(),
      memories: []
    };
    this.saveBanks();
    return { success: true, message: `Memory bank ${bankId} reset to empty` };
  }
}

export const hindsightService = new HindsightService();
