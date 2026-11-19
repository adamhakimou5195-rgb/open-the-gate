const API_BASE = typeof window !== 'undefined'
  ? `${window.location.origin}/api/v1`
  : (import.meta.env.VITE_API_BASE || 'http://localhost:5000/api/v1');

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Erreur serveur (${response.status})`);
  }

  return response.json();
}

// Student Test Flow
export const startSession = (studentData) => 
  apiRequest('/sessions/start', {
    method: 'POST',
    body: JSON.stringify(studentData)
  });

export const recordAnswer = (sessionId, questionId, selectedOptionId) =>
  apiRequest(`/sessions/${sessionId}/answer`, {
    method: 'POST',
    body: JSON.stringify({ questionId, selectedOptionId })
  });

export const submitTest = (sessionId) =>
  apiRequest(`/sessions/${sessionId}/submit`, {
    method: 'POST'
  });

export const getSessionResult = (sessionId) =>
  apiRequest(`/sessions/${sessionId}/result`);

export const getCertificatePdfUrl = (sessionId) =>
  `${API_BASE}/sessions/${sessionId}/certificate.pdf`;

// Admin APIs
export const adminLogin = (email, password) =>
  apiRequest('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });

export const getAdminAnalytics = (token) =>
  apiRequest('/admin/analytics', {
    headers: { Authorization: `Bearer ${token}` }
  });

export const getAdminSessions = (token, { level = 'ALL', search = '' } = {}) => {
  const query = new URLSearchParams();
  if (level && level !== 'ALL') query.append('level', level);
  if (search) query.append('search', search);
  return apiRequest(`/admin/sessions?${query.toString()}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const getAdminQuestions = (token, { skill = 'ALL', level = 'ALL' } = {}) => {
  const query = new URLSearchParams();
  if (skill && skill !== 'ALL') query.append('skill', skill);
  if (level && level !== 'ALL') query.append('level', level);
  return apiRequest(`/admin/questions?${query.toString()}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const createQuestion = (token, questionData) =>
  apiRequest('/admin/questions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(questionData)
  });

export const updateQuestion = (token, id, questionData) =>
  apiRequest(`/admin/questions/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(questionData)
  });

export const deleteQuestion = (token, id) =>
  apiRequest(`/admin/questions/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });

export const getExportCsvUrl = (token) =>
  `${API_BASE}/admin/export-csv?token=${encodeURIComponent(token)}`;
