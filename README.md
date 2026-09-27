# CareContinuity — A Memory-Powered Patient Journey Assistant

> **Core Value Proposition:**  
> *"An AI agent that remembers a patient's care journey across interactions and gives healthcare staff the context they need for the next step."*

---

## 1. The Core Problem
In healthcare, patient data doesn't fail because it isn't documented—it fails because the **next person handling the case lacks the right context at the right time**.

```
Visit 1 (GP) ──> Blood Test ──> Lab Result ──> Specialist ──> Follow-up (Different Clinician)
```

Across multiple doctors, labs, and outpatient visits, critical directives get lost in unstructured notes. Clinicians waste valuable time reconstructing past timelines, and unperformed diagnostic tests go unnoticed.

### What We Are NOT Building
- ❌ Disease diagnosis
- ❌ Prescription generation
- ❌ Autonomous medical treatment decisions

### What We ARE Building
- ✅ Longitudinal care journey memory
- ✅ Cross-clinician directives & recommendations tracking
- ✅ Pending vs. completed investigation resolution
- ✅ Continuity gap & blocker detection (e.g. *"Ultrasound pending for 16 days"*)
- ✅ Instant clinical briefing for attending staff

---

## 2. Why Hindsight is Mandatory (25% Judging Weight)

Traditional chat buffers and stateless LLMs suffer from complete amnesia between clinical visits. If you remove Hindsight, the agent degrades to asking clinicians to re-explain the patient's entire medical history every time.

```
WITHOUT HINDSIGHT:
Session 1 ──> Stateless LLM ──> Memory Reset (0 Context) ──> Session 2 (Fails with amnesia)

WITH HINDSIGHT:
Visit 1 ──> Retain (Typed Facts) ──> Multi-Strategy Recall ──> Visit 4 (Recalls pending test from 2 weeks ago)
```

### The Difference in Practice:
- **Without Memory:** *"I do not have enough context. Please provide the patient's history, lab results, and previous consultation notes."*
- **With Hindsight:** *"Ravi Kumar initially presented with abdominal discomfort. Blood work completed on Jan 14 showed elevated transaminases (ALT 68, AST 54). On Jan 20, Gastroenterologist Dr. Sameer Mehta recommended an abdominal ultrasound and instructed the patient to return after imaging. The ultrasound remains PENDING and is currently blocking the specialist review."*

---

## 3. Architecture

```
                    CARE CONTINUITY AGENT
                           │
                           ▼
                    ┌──────────────┐
                    │ Healthcare   │
                    │ Staff / Desk │
                    └──────┬───────┘
                           │
                    "Record Encounter"
                           │
                           ▼
                    ┌──────────────┐
                    │     LLM      │
                    │ Fact Extract │
                    └──────┬───────┘
                           │
                ┌──────────┴──────────┐
                ▼                     ▼
        ┌──────────────┐      ┌──────────────┐
        │  Structured  │      │  Hindsight   │
        │ Patient DB   │      │ Long-Term    │
        │ (Audit Log)  │      │ Memory Bank  │
        └──────┬───────┘      └──────┬───────┘
               │                     │
               └──────────┬──────────┘
                          ▼
                     Future Visit
                    "What happened?"
                          │
                          ▼
                      Hindsight
                  Multi-Strategy Recall
                 (Semantic + BM25 + Graph)
                          │
                          ▼
                         LLM
                          │
                          ▼
             ┌─────────────────────────┐
             │ Patient Journey Summary │
             │ ✓ Completed Actions     │
             │ ⚠️ Active Blockers      │
             │ → Specialist Directives │
             │ → Recommended Next Step │
             └─────────────────────────┘
```

### Structured DB vs. Hindsight Memory
| Capability | Structured DB (MongoDB / JSON Store) | Hindsight Agent Memory |
| :--- | :--- | :--- |
| **Primary Question** | *"What static records exist?"* | *"What does the agent remember and learn from previous interactions?"* |
| **Data Nature** | Tabular demographics, timestamps, audit IDs | Associative facts, directives, conditional dependencies |
| **Retrieval Mode** | Exact primary key queries | Semantic + BM25 + Entity graph traversal + Temporal weighting |

---

## 4. The 60-Second Judge Demo Storyboard

1. **0:00 - 0:15 (The Cohort):**  
   Open Dashboard at `http://localhost:3000`. Show synthetic patient cohort. Point out the active **"Hindsight Memory: Active"** status badge in the navbar.
2. **0:15 - 0:30 (Ravi Kumar's Journey):**  
   Click **Ravi Kumar (P001)**. Open **Journey Timeline** showing Jan 10 (GP), Jan 14 (Lab results: elevated transaminases), and Jan 20 (Specialist Dr. Mehta).
3. **0:30 - 0:45 (The Recall Moment):**  
   Switch to **Care Continuity Agent** tab and click *"What are we waiting for?"*. The agent uses Hindsight recall to pinpoint that the **Abdominal Ultrasound** is still pending, blocking Dr. Mehta's care plan.
4. **0:45 - 0:55 (Before vs After Memory):**  
   Switch to **Before vs After Memory** tab. Show the stark contrast: the stateless LLM has complete amnesia, while Hindsight recalls 29 structured memories.
5. **0:55 - 1:00 (Transparent Memory Bank):**  
   Click **Memory Explorer** in the navbar to expose the live Hindsight memory bank, category distribution, and similarity scores.

---

## 5. Quickstart & Local Development

### Prerequisites
- Node.js v18+ (tested on v22)
- npm v9+

### 1. Run the Backend
```bash
cd backend
npm install
npm start
```
*Backend runs on `http://localhost:5001`.*

### 2. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000` (automatically proxies `/api` requests to backend).*

### Configuration (.env)
The backend comes with an out-of-the-box biomimetic local memory engine that replicates Hindsight's retain, multi-strategy recall, and bank inspection with zero cloud credentials required.

To connect to live **Hindsight Cloud** or a self-hosted instance, simply copy `.env.example` to `.env`:
```env
PORT=5001
HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io
HINDSIGHT_API_KEY=your_hindsight_api_key_here
HINDSIGHT_TENANT=default

# Optional LLM API Key (Groq or OpenAI)
LLM_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

---

## 6. Content Submission Deliverables

Per the official Hackathon Content Submission Guide, all required materials are prepared in the `content/` folder:

1. **[`content/article.md`](content/article.md)**:  
   Full 1,400-word engineering write-up ready to publish on Medium, Dev.to, or Substack. Features real code snippets, architecture breakdown, Before vs. After contrast, lessons learned, and required SEO-optimized links. *(Zero mentions of "hackathon" per instructions)*.
2. **[`content/social_post.md`](content/social_post.md)**:  
   LinkedIn & X post written in the style of Andrej Karpathy (under 800 characters, high-impact hook, technical cheat sheet, and first comment link).
3. **[`content/video_script.md`](content/video_script.md)**:  
   3-minute screen-recorded demo script with timestamped visual cues, 5 high-performing YouTube titles, and a 16:9 thumbnail generation prompt for Google Nano Banana.

---

## 7. API Endpoints Reference

- `GET /api/health` — System status, Hindsight connection state, LLM provider.
- `GET /api/patients` — List all patient profiles enriched with continuity scores.
- `GET /api/patients/:id` — Get single patient details, journey timeline, and memory bank size.
- `POST /api/interactions` — Ingest new encounter note, trigger fact extraction, and retain to Hindsight.
- `POST /api/agent/query` — Query agent with Hindsight multi-strategy recall.
- `POST /api/agent/compare` — Compare query response With vs. Without memory side-by-side.
- `GET /api/agent/memory/:patientId` — Inspect Hindsight memory bank for Memory Explorer.
- `POST /api/agent/memory/:patientId/clear` — Reset memory bank for live amnesia demos.
