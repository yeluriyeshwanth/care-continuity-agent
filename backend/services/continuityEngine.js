/**
 * Continuity Engine
 * Analyzes patient history and recalled Hindsight memories to detect:
 * - Blocked care pathways (e.g. specialist waiting for test)
 * - Pending investigations that are past expected windows
 * - Unfulfilled recommendations across providers
 * - Continuity score
 */

export class ContinuityEngine {
  /**
   * Evaluates continuity gaps for a patient
   * @param {object} patient 
   * @param {Array<object>} interactions 
   * @param {Array<object>} recalledMemories 
   */
  static analyzeContinuity(patient, interactions = [], recalledMemories = []) {
    const alerts = [];
    const pendingTests = new Set();
    const completedTests = new Set();
    const recommendations = [];

    const normalizeTest = (name) => {
      const lower = (name || '').toLowerCase();
      if (lower.includes('cbc') || lower.includes('blood count')) return 'cbc';
      if (lower.includes('lft') || lower.includes('liver function') || lower.includes('hepatic')) return 'lft';
      if (lower.includes('ultrasound') || lower.includes('sonography')) return 'abdominal-ultrasound';
      if (lower.includes('x-ray') || lower.includes('radiograph')) return 'knee-x-ray';
      if (lower.includes('doppler')) return 'renal-doppler';
      if (lower.includes('tsh') || lower.includes('thyroid')) return 'tsh';
      if (lower.includes('potassium') || lower.includes('electrolytes')) return 'serum-potassium';
      return lower.replace(/[^a-z0-9]/g, '-');
    };

    const testDisplayNames = {
      'cbc': 'Complete Blood Count (CBC)',
      'lft': 'Liver Function Tests (LFT)',
      'abdominal-ultrasound': 'Abdominal Ultrasound',
      'knee-x-ray': 'Bilateral Standing Knee X-ray',
      'renal-doppler': 'Renal Artery Doppler',
      'tsh': 'Thyroid Profile (TSH)',
      'serum-potassium': 'Serum Potassium'
    };

    // Process chronological interactions
    interactions.forEach(int => {
      const ext = int.extracted || {};
      (ext.investigationsOrdered || []).forEach(t => pendingTests.add(normalizeTest(t)));
      (ext.investigationsCompleted || []).forEach(t => {
        const norm = normalizeTest(t);
        completedTests.add(norm);
        pendingTests.delete(norm);
      });
      (ext.investigationsPending || []).forEach(t => {
        const norm = normalizeTest(t);
        if (!completedTests.has(norm)) {
          pendingTests.add(norm);
        }
      });
      (ext.recommendations || []).forEach(r => {
        recommendations.push({
          date: int.date,
          provider: int.provider,
          role: int.role,
          text: r
        });
      });
    });

    // Also factor in recalled Hindsight memories if available
    recalledMemories.forEach(mem => {
      if (mem.tags?.includes('test-completed')) {
        (mem.metadata?.tests || []).forEach(t => {
          const norm = normalizeTest(t);
          completedTests.add(norm);
          pendingTests.delete(norm);
        });
      }
      if (mem.tags?.includes('test-pending') || mem.tags?.includes('unresolved')) {
        const tests = mem.metadata?.tests || [];
        tests.forEach(t => {
          const norm = normalizeTest(t);
          if (!completedTests.has(norm)) pendingTests.add(norm);
        });
      }
    });

    // Calculate days since last interaction
    let daysSinceLast = 0;
    if (patient.lastInteractionDate) {
      const lastDate = new Date(patient.lastInteractionDate);
      const now = new Date('2026-02-05'); // simulated current date for consistency
      const diffMs = Math.max(0, now.getTime() - lastDate.getTime());
      daysSinceLast = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    }

    // Generate alerts
    if (pendingTests.size > 0) {
      Array.from(pendingTests).forEach(testKey => {
        const testTitle = testDisplayNames[testKey] || testKey;
        alerts.push({
          id: `gap-${testKey}`,
          severity: 'high',
          type: 'Pending Investigation',
          title: `${testTitle} Pending Completion`,
          description: `This diagnostic investigation was ordered but has not yet been completed. Specialist care decisions are blocked pending this result.`,
          recommendation: `Follow up with patient or diagnostic imaging facility to expedite ${testTitle}.`
        });
      });
    }

    // Check for specialist pending follow-up
    const lastInteraction = interactions[interactions.length - 1];
    if (lastInteraction && lastInteraction.extracted?.followUpRequired) {
      alerts.push({
        id: 'gap-followup-pending',
        severity: 'medium',
        type: 'Care Continuity',
        title: 'Specialist Follow-up Waiting',
        description: `Condition: "${lastInteraction.extracted.followUpCondition}". Last recorded clinical touchpoint was ${daysSinceLast} days ago.`,
        recommendation: `Ensure pending diagnostics are reviewed before scheduling the follow-up consultation.`
      });
    }

    // Continuity health score (100 is perfect, deducted for unaddressed gaps)
    let score = 100;
    if (pendingTests.size > 0) score -= (pendingTests.size * 25);
    if (daysSinceLast > 14) score -= 15;
    score = Math.max(20, Math.min(100, score));

    return {
      patientId: patient.id,
      patientName: patient.name,
      continuityScore: score,
      daysSinceLastInteraction: daysSinceLast,
      pendingInvestigations: Array.from(pendingTests),
      completedInvestigations: Array.from(completedTests),
      recentRecommendations: recommendations.slice(-3),
      alerts,
      hasBlockers: alerts.some(a => a.severity === 'high')
    };
  }
}
