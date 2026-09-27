const API_BASE = (typeof window !== 'undefined' && window.location.port === '3000') 
  ? 'http://localhost:5001/api' 
  : '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchPatients() {
  const res = await fetch(`${API_BASE}/patients`);
  return res.json();
}

export async function fetchPatient(id) {
  const res = await fetch(`${API_BASE}/patients/${id}`);
  return res.json();
}

export async function queryAgent(patientId, query, withoutMemory = false, budget = 'HIGH') {
  const res = await fetch(`${API_BASE}/agent/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientId, query, withoutMemory, budget })
  });
  return res.json();
}

export async function compareAgent(patientId, query) {
  const res = await fetch(`${API_BASE}/agent/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientId, query })
  });
  return res.json();
}

export async function fetchMemoryBank(patientId) {
  const res = await fetch(`${API_BASE}/agent/memory/${patientId}`);
  return res.json();
}

export async function clearMemoryBank(patientId) {
  const res = await fetch(`${API_BASE}/agent/memory/${patientId}/clear`, {
    method: 'POST'
  });
  return res.json();
}

export async function seedMemoryBank(patientId) {
  const res = await fetch(`${API_BASE}/patients/${patientId}/seed-memory`, {
    method: 'POST'
  });
  return res.json();
}

export async function recordInteraction(data) {
  const res = await fetch(`${API_BASE}/interactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}
