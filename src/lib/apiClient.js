const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

// Initialize user session
function getUserHeaders() {
  let userId = localStorage.getItem('growth-os-user-id');
  let sessionId = localStorage.getItem('growth-os-session-id');

  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('growth-os-user-id', userId);
  }

  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('growth-os-session-id', sessionId);

    // Start analytics session
    startAnalyticsSession();
  }

  return {
    'X-User-ID': userId,
    'X-Session-ID': sessionId
  };
}

// Start analytics session
async function startAnalyticsSession() {
  try {
    const response = await fetch(`${API_BASE}/analytics/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...getUserHeaders()
      }
    });
    return response.ok;
  } catch (error) {
    console.warn('Failed to start analytics session:', error);
    return false;
  }
}

async function handleResponse(response) {
  if (!response.ok) {
    let detail = response.statusText;
    let errorData = null;

    try {
      const body = await response.json();
      errorData = body;

      // Handle structured error responses (especially 402 Payment Required)
      if (body.detail && typeof body.detail === 'object') {
        const errorDetail = body.detail;
        if (errorDetail.error === 'Insufficient credits') {
          detail = `${errorDetail.message}${errorDetail.upgrade_suggestion ? '\n\n' + errorDetail.upgrade_suggestion : ''}`;
        } else if (errorDetail.message) {
          detail = errorDetail.message;
        } else {
          detail = errorDetail.error || JSON.stringify(errorDetail);
        }
      } else {
        detail = body.detail || body.message || JSON.stringify(body);
      }
    } catch (err) {
      // ignore json parse errors
    }

    const error = new Error(detail);
    error.response = response;
    error.data = errorData;
    throw error;
  }
  return response.json();
}

export async function transcribeFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_BASE}/transcribe`, {
    method: 'POST',
    headers: getUserHeaders(),
    body: formData,
  });
  return handleResponse(response);
}

export async function modifyTranscript({ transcript, instruction, version = 'txt' }) {
  const formData = new FormData();
  formData.append('transcript', transcript);
  formData.append('instruction', instruction);
  formData.append('version', version);
  const response = await fetch(`${API_BASE}/modify`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse(response);
}

export async function generateTTS({
  text,
  voice = 'alloy',
  draft = false,
  use_elevenlabs = false,
  title = '',
  tags = '',
  toWorkspace = false,
}) {
  const formData = new FormData();
  formData.append('text', text);
  formData.append('voice', voice);
  formData.append('draft', String(draft));
  formData.append('use_elevenlabs', String(use_elevenlabs));
  formData.append('title', title);
  formData.append('tags', tags);
  formData.append('to_workspace', String(toWorkspace));
  const response = await fetch(`${API_BASE}/tts`, {
    method: 'POST',
    headers: getUserHeaders(),
    body: formData,
  });
  return handleResponse(response);
}

export async function downloadMedia({ url, format = 'mp4' }) {
  const formData = new FormData();
  formData.append('url', url);
  formData.append('format', format);
  const response = await fetch(`${API_BASE}/download`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse(response);
}

export async function saveDownloadEntry({ url, format = 'mp4', tags = '', fileUrl = '', title = '', toWorkspace = false }) {
  const formData = new FormData();
  formData.append('url', url);
  formData.append('format', format);
  formData.append('tags', tags);
  formData.append('file_url', fileUrl);
  formData.append('title', title);
  formData.append('to_workspace', String(toWorkspace));
  const response = await fetch(`${API_BASE}/downloads/save`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse(response);
}

export async function fetchSavedDownloads() {
  const response = await fetch(`${API_BASE}/downloads/saved`);
  return handleResponse(response);
}

export async function fetchDownloadHistory() {
  const response = await fetch(`${API_BASE}/downloads/history`);
  return handleResponse(response);
}

export async function clearDownloadHistory() {
  const response = await fetch(`${API_BASE}/downloads/history`, {
    method: 'DELETE',
  });
  return handleResponse(response);
}

export async function deleteSavedDownload(id) {
  const response = await fetch(`${API_BASE}/downloads/saved/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
}

export async function saveWorkspaceScript({ script, title = '', tags = '', sourceUrl = '' }) {
  const formData = new FormData();
  formData.append('script', script);
  formData.append('title', title);
  formData.append('tags', tags);
  formData.append('source_url', sourceUrl);
  const response = await fetch(`${API_BASE}/workspace/scripts`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse(response);
}

export async function updateWorkspaceScript({ id, script, title, tags, sourceUrl }) {
  const formData = new FormData();
  formData.append('script', script);
  if (title !== undefined) {
    formData.append('title', title);
  }
  if (tags !== undefined) {
    formData.append('tags', tags);
  }
  if (sourceUrl !== undefined) {
    formData.append('source_url', sourceUrl);
  }
  const response = await fetch(`${API_BASE}/workspace/scripts/${id}`, {
    method: 'PUT',
    body: formData,
  });
  return handleResponse(response);
}

export async function fetchWorkspace() {
  const response = await fetch(`${API_BASE}/workspace`);
  return handleResponse(response);
}

export async function deleteWorkspaceEntry(id) {
  const response = await fetch(`${API_BASE}/workspace/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
}

export async function fetchWorkflowTools() {
  const response = await fetch(`${API_BASE}/workflows/tools`);
  return handleResponse(response);
}

export async function fetchWorkflows() {
  const response = await fetch(`${API_BASE}/workflows`);
  return handleResponse(response);
}

export async function createWorkflow({ name, nodes, edges, notes = '', layout = {} }) {
  const response = await fetch(`${API_BASE}/workflows`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getUserHeaders()
    },
    body: JSON.stringify({ name, nodes, edges, notes, layout }),
  });
  return handleResponse(response);
}

export async function updateWorkflow({ id, name, nodes, edges, notes, layout }) {
  const response = await fetch(`${API_BASE}/workflows/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, nodes, edges, notes, layout }),
  });
  return handleResponse(response);
}

export async function deleteWorkflow(id) {
  const response = await fetch(`${API_BASE}/workflows/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
}

export async function clearWorkflows() {
  const response = await fetch(`${API_BASE}/workflows`, {
    method: 'DELETE',
  });
  return handleResponse(response);
}

export async function runWorkflow({ id, payload }) {
  const response = await fetch(`${API_BASE}/workflows/${id}/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getUserHeaders()
    },
    body: JSON.stringify(payload ?? {}),
  });
  return handleResponse(response);
}

export async function deleteWorkflowRun(id) {
  const response = await fetch(`${API_BASE}/workflows/runs/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
}

export async function clearWorkflowRuns() {
  const response = await fetch(`${API_BASE}/workflows/runs`, {
    method: 'DELETE',
  });
  return handleResponse(response);
}

export async function fetchWorkflowRuns() {
  const response = await fetch(`${API_BASE}/workflows/runs`, {
    headers: getUserHeaders()
  });
  return handleResponse(response);
}

export async function fetchKnowledge() {
  const response = await fetch(`${API_BASE}/knowledge`);
  return handleResponse(response);
}

export async function updateKnowledge(content) {
  const response = await fetch(`${API_BASE}/knowledge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  return handleResponse(response);
}

export async function fetchVoices() {
  const response = await fetch(`${API_BASE}/voices`);
  return handleResponse(response);
}

// Analytics functions
export async function trackEvent(eventType, metadata = {}) {
  const formData = new FormData();
  formData.append('event_type', eventType);
  formData.append('metadata', JSON.stringify(metadata));

  try {
    const response = await fetch(`${API_BASE}/analytics/track`, {
      method: 'POST',
      headers: getUserHeaders(),
      body: formData,
    });
    return handleResponse(response);
  } catch (error) {
    console.warn('Failed to track event:', error);
    return null;
  }
}

export async function fetchUserInsights() {
  const response = await fetch(`${API_BASE}/analytics/user`, {
    method: 'GET',
    headers: getUserHeaders()
  });
  return handleResponse(response);
}

export async function fetchAnalyticsDashboard() {
  const response = await fetch(`${API_BASE}/analytics/dashboard`);
  return handleResponse(response);
}

// Credits functions
export async function fetchUserQuota() {
  const response = await fetch(`${API_BASE}/credits/quota`, {
    method: 'GET',
    headers: getUserHeaders()
  });
  return handleResponse(response);
}

export async function fetchPricingTiers() {
  const response = await fetch(`${API_BASE}/credits/pricing`);
  return handleResponse(response);
}

export async function upgradeSubscription(tier) {
  const formData = new FormData();
  formData.append('tier', tier);

  const response = await fetch(`${API_BASE}/credits/upgrade`, {
    method: 'POST',
    headers: getUserHeaders(),
    body: formData,
  });
  return handleResponse(response);
}

// Workflow templates functions
export async function fetchWorkflowTemplates() {
  const response = await fetch(`${API_BASE}/workflows/templates`, {
    method: 'GET',
    headers: getUserHeaders()
  });
  return handleResponse(response);
}

export async function getWorkflowTemplate(templateId) {
  const response = await fetch(`${API_BASE}/workflows/templates/${templateId}`, {
    method: 'GET',
    headers: getUserHeaders()
  });
  return handleResponse(response);
}

export async function useWorkflowTemplate(templateId, workflowName) {
  const formData = new FormData();
  formData.append('workflow_name', workflowName);

  const response = await fetch(`${API_BASE}/workflows/templates/${templateId}/use`, {
    method: 'POST',
    headers: getUserHeaders(),
    body: formData,
  });
  return handleResponse(response);
}

export { API_BASE };
