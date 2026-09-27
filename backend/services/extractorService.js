/**
 * Extractor Service
 * Deconstructs raw clinical notes and encounter events into structured memories for Hindsight.
 * Captures:
 * 1. Encounter Summary
 * 2. Investigations (Ordered, Completed, Pending)
 * 3. Recommendations & Directives
 * 4. Follow-up Conditions
 * 5. Continuity Gaps / Unresolved Items
 */

export class ExtractorService {
  /**
   * Transforms an encounter into discrete memory items for Hindsight retention
   * @param {object} encounter 
   */
  static extractMemoriesForHindsight(encounter) {
    const memories = [];
    const date = encounter.date || new Date().toISOString().split('T')[0];
    const provider = encounter.provider || 'Clinical Provider';
    const role = encounter.role || 'Clinician';
    const notes = encounter.notes || '';
    const extracted = encounter.extracted || {};

    // 1. Encounter & Clinical Context Memory
    memories.push({
      content: `On ${date}, patient had ${encounter.type || 'a consultation'} with ${provider} (${role}). Reason/Concern: ${extracted.concern || notes.slice(0, 150)}...`,
      tags: ['encounter', 'consultation', role.toLowerCase().replace(/\s+/g, '-')],
      metadata: {
        category: 'encounter',
        date,
        provider,
        role,
        encounterType: encounter.type
      }
    });

    // 2. Investigation Memories (Completed vs Pending)
    if (extracted.investigationsCompleted && extracted.investigationsCompleted.length > 0) {
      memories.push({
        content: `Diagnostic tests completed by ${date}: ${extracted.investigationsCompleted.join(', ')}. Results reviewed in clinical context.`,
        tags: ['investigation', 'test-completed', 'laboratory'],
        metadata: {
          category: 'investigation',
          status: 'completed',
          tests: extracted.investigationsCompleted,
          date
        }
      });
    }

    if (extracted.investigationsPending && extracted.investigationsPending.length > 0) {
      memories.push({
        content: `WARNING - Pending investigations as of ${date}: ${extracted.investigationsPending.join(', ')}. Clinical decisions depend on these results.`,
        tags: ['investigation', 'test-pending', 'unresolved', 'continuity-blocker'],
        metadata: {
          category: 'unresolved',
          status: 'pending',
          tests: extracted.investigationsPending,
          date
        }
      });
    }

    // 3. Clinical Recommendations & Directives
    if (extracted.recommendations && extracted.recommendations.length > 0) {
      extracted.recommendations.forEach(rec => {
        memories.push({
          content: `Clinical recommendation from ${provider} (${role}) on ${date}: "${rec}".`,
          tags: ['recommendation', 'clinical-directive'],
          metadata: {
            category: 'recommendation',
            provider,
            recommendation: rec,
            date
          }
        });
      });
    }

    // 4. Follow-up and Care Continuity Commitments
    if (extracted.followUpRequired) {
      memories.push({
        content: `Follow-up requirement established on ${date} by ${provider}: ${extracted.followUpCondition || 'Clinical review required'}. Status: Pending completion.`,
        tags: ['followup', 'care-plan', 'pending'],
        metadata: {
          category: 'followup',
          condition: extracted.followUpCondition,
          date
        }
      });
    }

    // 5. Explicit Unresolved Gaps
    if (extracted.unresolvedGaps && extracted.unresolvedGaps.length > 0) {
      extracted.unresolvedGaps.forEach(gap => {
        memories.push({
          content: `Continuity gap flagged on ${date}: ${gap}`,
          tags: ['unresolved', 'continuity-gap', 'alert'],
          metadata: {
            category: 'unresolved',
            gap,
            date
          }
        });
      });
    }

    return memories;
  }

  /**
   * Lightweight rule-based entity extractor for user-submitted raw encounter notes
   * (Runs before/in-lieu-of full LLM parsing)
   * @param {string} text 
   */
  static parseRawNotes(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const lower = text.toLowerCase();

    const investigationsOrdered = [];
    const investigationsCompleted = [];
    const investigationsPending = [];
    const recommendations = [];

    // Simple robust heuristics
    if (lower.includes('ultrasound')) {
      if (lower.includes('ultrasound completed') || lower.includes('ultrasound result') || lower.includes('ultrasound showed')) {
        investigationsCompleted.push('Abdominal Ultrasound');
      } else {
        investigationsPending.push('Abdominal Ultrasound');
      }
    }
    if (lower.includes('blood test') || lower.includes('lft') || lower.includes('cbc')) {
      if (lower.includes('completed') || lower.includes('result') || lower.includes('reviewed')) {
        investigationsCompleted.push('Blood Test / LFT');
      } else {
        investigationsOrdered.push('Blood Test');
      }
    }
    if (lower.includes('x-ray') || lower.includes('radiograph')) {
      if (lower.includes('completed') || lower.includes('reviewed')) {
        investigationsCompleted.push('Knee X-ray');
      } else {
        investigationsPending.push('Knee X-ray');
      }
    }

    // Extract recommendations
    lines.forEach(line => {
      const l = line.toLowerCase();
      if (l.includes('recommend') || l.includes('advised') || l.includes('instructed') || l.includes('plan:')) {
        recommendations.push(line.replace(/^(plan:|recommendation:|advised:)/i, '').trim());
      }
    });

    if (recommendations.length === 0) {
      recommendations.push(lines[lines.length - 1] || text.slice(0, 100));
    }

    const followUpRequired = lower.includes('follow') || lower.includes('return') || lower.includes('review') || lower.includes('pending');

    return {
      concern: lines[0] || 'Clinical encounter',
      investigationsOrdered,
      investigationsCompleted,
      investigationsPending,
      recommendations,
      followUpRequired,
      followUpCondition: followUpRequired ? 'Review after pending investigations or scheduled interval' : 'None specified',
      unresolvedGaps: investigationsPending.map(t => `${t} pending completion`)
    };
  }
}
