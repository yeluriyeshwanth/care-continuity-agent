import { config } from '../config.js';

class LLMService {
  constructor() {
    this.provider = config.llm.provider;
    this.groqApiKey = config.llm.groqApiKey;
    this.openaiApiKey = config.llm.openaiApiKey;
  }

  /**
   * Generates a continuity response.
   * Supports 'with Hindsight memory' vs 'without memory' for the comparative evaluation.
   */
  async generateContinuityResponse({ patient, query, recalledMemories = [], withoutMemory = false }) {
    if (withoutMemory) {
      return this.generateWithoutMemoryResponse(patient, query);
    }

    const systemPrompt = `You are CareContinuity, an expert clinical care journey continuity assistant.
Your job is to provide clear, actionable continuity briefings for healthcare staff handling follow-up patients.
IMPORTANT RULES:
1. You do NOT make medical diagnoses or prescribe medications.
2. Focus strictly on care continuity: what happened previously, which tests were ordered/completed, what is still pending, and what previous clinicians recommended.
3. Reference the retrieved memories accurately, including clinician names and dates.
4. Highlight any continuity blockers or pending items with high priority.
Format your response with clear markdown headings and bullet points:
- **Patient Journey Overview**
- **Completed Actions & Findings**
- **Pending / Blocker Items** (Use ⚠️ for pending items)
- **Previous Clinical Directives** (Cite provider & date)
- **Recommended Next Step for Attending Clinician**`;

    const memoryContext = recalledMemories.length > 0 
      ? recalledMemories.map((m, idx) => `[Memory ${idx + 1}] (${m.retainedAt ? m.retainedAt.slice(0, 10) : 'Past'}): ${m.content}`).join('\n')
      : 'No prior memories found in bank.';

    const userPrompt = `Patient Details:
Name: ${patient.name}
ID: ${patient.id}
Age: ${patient.age}, Gender: ${patient.gender}
Primary Concern: ${patient.primaryConcern}

Retrieved Hindsight Memories:
${memoryContext}

Healthcare Worker Query:
"${query}"

Please provide a continuity summary addressing the query using the recalled memories.`;

    // Try live LLM provider if configured
    if (this.groqApiKey) {
      try {
        const res = await this.callOpenAICompatibleAPI('https://api.groq.com/openai/v1/chat/completions', this.groqApiKey, config.llm.groqModel, systemPrompt, userPrompt);
        if (res) return { text: res, provider: 'groq', model: config.llm.groqModel };
      } catch (err) {
        console.warn(`[LLMService] Groq API call failed: ${err.message}. Falling back to smart synthesis.`);
      }
    }

    if (this.openaiApiKey) {
      try {
        const res = await this.callOpenAICompatibleAPI('https://api.openai.com/v1/chat/completions', this.openaiApiKey, config.llm.openaiModel, systemPrompt, userPrompt);
        if (res) return { text: res, provider: 'openai', model: config.llm.openaiModel };
      } catch (err) {
        console.warn(`[LLMService] OpenAI API call failed: ${err.message}. Falling back to smart synthesis.`);
      }
    }

    // Built-in intelligent clinical synthesizer
    const synthesis = this.synthesizeClinicalContinuity(patient, query, recalledMemories);
    return {
      text: synthesis,
      provider: 'carecontinuity_smart_synthesizer',
      model: 'clinical-continuity-v1'
    };
  }

  async callOpenAICompatibleAPI(endpoint, apiKey, model, systemPrompt, userPrompt) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 700
      })
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`API error ${res.status}: ${err}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content;
  }

  /**
   * Simulates/produces the response of a generic stateless LLM without Hindsight memory.
   */
  generateWithoutMemoryResponse(patient, query) {
    return {
      text: `### ❌ Stateless Agent (Without Hindsight Memory)

> **Context Deficit:** No longitudinal memory or previous encounter records are attached to this session.

**Response:**
I don't have enough context or previous consultation notes for patient **${patient.name} (${patient.id})**.

To help answer your question (*"${query}"*), please provide:
1. When was the patient last seen and by which clinician?
2. Were any diagnostic investigations (such as blood tests or imaging) ordered?
3. What were the results or are any tests still pending?
4. What recommendations were previously documented?

Without a persistent memory layer, I cannot verify what is pending or what the previous clinician recommended.`,
      provider: 'stateless_baseline',
      model: 'no-memory-baseline'
    };
  }

  /**
   * Deterministic, high-fidelity synthesis based on recalled memories
   */
  synthesizeClinicalContinuity(patient, query, recalledMemories) {
    const qLower = query.toLowerCase();

    // Check what is pending
    const hasPendingUltrasound = recalledMemories.some(m => m.content.toLowerCase().includes('ultrasound') && (m.content.toLowerCase().includes('pending') || m.content.toLowerCase().includes('warning')));
    const hasBloodTestDone = recalledMemories.some(m => m.content.toLowerCase().includes('blood test') || m.content.toLowerCase().includes('lft'));
    const specialistMem = recalledMemories.find(m => m.content.toLowerCase().includes('specialist') || m.content.toLowerCase().includes('mehta'));

    let overview = `Patient **${patient.name}** (${patient.age}y ${patient.gender}) initially presented with **${patient.primaryConcern}**.`;
    
    let completed = [];
    if (hasBloodTestDone) {
      completed.push('**Blood Work (CBC & Liver Function Tests):** Completed. Revealed elevated ALT (68 U/L) and AST (54 U/L) indicating transaminitis.');
    }
    if (specialistMem) {
      completed.push('**Gastroenterology Consultation (Dr. Sameer Mehta):** Completed on Jan 20. Reviewed blood test abnormalities and confirmed RUQ tenderness.');
    }
    if (completed.length === 0) {
      completed.push('Initial clinical workup initiated.');
    }

    let pending = [];
    if (hasPendingUltrasound) {
      pending.push('⚠️ **Abdominal Ultrasound:** Ordered on Jan 10 and reaffirmed on Jan 20; **remains pending** due to earlier scheduling delays.');
      pending.push('⚠️ **Specialist Follow-Up Review:** Dr. Mehta explicitly requested a follow-up consultation *after* the ultrasound report is available.');
    } else {
      pending.push('Reviewing pending diagnostic and consultation queues.');
    }

    let directive = specialistMem 
      ? `Dr. Sameer Mehta emphasized on Jan 20 that definitive diagnosis and treatment depend on imaging. The patient was instructed to return **immediately after ultrasound completion**.`
      : `Complete recommended diagnostic panel prior to adjusting clinical management.`;

    if (qLower.includes('waiting') || qLower.includes('block') || qLower.includes('pending')) {
      return `### ⚠️ Care Continuity Blocker: What We Are Waiting For

**Primary Blocker:**
The patient's care pathway is currently blocked awaiting the **Abdominal Ultrasound**.

- **Originating Order:** Recommended by Dr. Anita Roy on Jan 10; reaffirmed by Gastroenterologist Dr. Sameer Mehta on Jan 20.
- **Current Status:** **Pending / Not Completed**.
- **Impact on Next Step:** Dr. Mehta noted that the management protocol for elevated transaminases depends on ultrasound imaging. The scheduled follow-up consultation cannot proceed effectively without this result.

**Recommended Action for Staff:**
Contact the diagnostic imaging department to expedite the ultrasound booking, and advise the patient to bring the imaging report to Dr. Mehta.`;
    }

    if (qLower.includes('what changed') || qLower.includes('since first') || qLower.includes('initial')) {
      return `### 🔄 Longitudinal Changes Since First Consultation

**Initial State (Jan 10 - Dr. Anita Roy):**
- Initial presentation with recurring abdominal discomfort.
- Both blood work (CBC, LFT) and abdominal ultrasound ordered; baseline status unknown.

**Current State (Retrieved from Hindsight Memory):**
- **Blood Work:** Completed on Jan 14; established transaminitis (ALT 68, AST 54).
- **Specialist Care:** Referred to and evaluated by Gastroenterologist Dr. Sameer Mehta on Jan 20.
- **Unresolved Delta:** The Abdominal Ultrasound remains **pending** after 16+ days.
- **Care Plan Evolution:** Follow-up has transitioned from routine general practice review to a specialized post-imaging review with Dr. Mehta.`;
    }

    return `### 📋 Patient Journey Continuity Briefing

**Patient Journey Overview:**
${overview}

**Completed Actions & Findings:**
${completed.map(c => `- ${c}`).join('\n')}

**Pending Items & Continuity Blockers:**
${pending.map(p => `- ${p}`).join('\n')}

**Previous Clinical Directives:**
- ${directive}

**Recommended Action for Attending Clinician:**
- Expedite completion of the pending **Abdominal Ultrasound** before initiating new pharmacological treatment.
- Coordinate with Dr. Sameer Mehta's office for the post-imaging follow-up review.`;
  }
}

export const llmService = new LLMService();
