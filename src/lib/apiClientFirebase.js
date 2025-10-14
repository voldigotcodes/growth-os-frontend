import { auth } from '../firebase/firebaseConfig.js';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

// Get authentication headers using Firebase Auth
async function getAuthHeaders() {
  const user = auth.currentUser;

  if (!user) {
    console.warn('No authenticated user for API call');
    return {};
  }

  try {
    // Get Firebase ID token (automatically refreshed by Firebase)
    const idToken = await user.getIdToken();

    return {
      'Authorization': `Bearer ${idToken}`,
      'X-User-ID': user.uid,
      'Content-Type': 'application/json'
    };
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return {
      'X-User-ID': user.uid,
      'Content-Type': 'application/json'
    };
  }
}

// Enhanced response handler with authentication error handling
async function handleResponse(response) {
  if (!response.ok) {
    let detail = response.statusText;
    let errorData = null;

    try {
      const body = await response.json();
      errorData = body;

      // Handle authentication errors
      if (response.status === 401) {
        console.error('Authentication failed - user may need to sign in again');
        detail = 'Authentication required. Please sign in again.';

        // Optionally trigger re-authentication
        if (auth.currentUser) {
          try {
            await auth.currentUser.getIdToken(true); // Force refresh
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
          }
        }
      }
      // Handle structured error responses (especially 402 Payment Required)
      else if (body.detail && typeof body.detail === 'object') {
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
    error.isAuthError = response.status === 401;
    throw error;
  }
  return response.json();
}

// Helper to make authenticated requests
async function makeRequest(url, options = {}) {
  const headers = await getAuthHeaders();

  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  });
}

// Helper for FormData requests (removes Content-Type to let browser set it)
async function makeFormDataRequest(url, formData, options = {}) {
  const headers = await getAuthHeaders();
  delete headers['Content-Type']; // Let browser set Content-Type for FormData

  return fetch(url, {
    method: 'POST',
    ...options,
    headers: {
      ...headers,
      ...options.headers
    },
    body: formData
  });
}

// Start analytics session (called automatically on auth state change)
export async function startAnalyticsSession() {
  try {
    const response = await makeRequest(`${API_BASE}/analytics/session`, {
      method: 'POST'
    });
    return response.ok;
  } catch (error) {
    console.warn('Failed to start analytics session:', error);
    return false;
  }
}

// Transcription API
export async function transcribeFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await makeFormDataRequest(`${API_BASE}/transcribe`, formData);
  return handleResponse(response);
}

export async function modifyTranscript({ transcript, instruction, version = 'txt' }) {
  const formData = new FormData();
  formData.append('transcript', transcript);
  formData.append('instruction', instruction);
  formData.append('version', version);

  const response = await makeFormDataRequest(`${API_BASE}/modify`, formData);
  return handleResponse(response);
}

// TTS API
export async function generateTTS({
  text,
  voice = 'alloy',
  draft = false,
  use_elevenlabs = false,
  title = '',
  tags = '',
}) {
  const formData = new FormData();
  formData.append('text', text);
  formData.append('voice', voice);
  formData.append('draft', String(draft));
  formData.append('use_elevenlabs', String(use_elevenlabs));
  formData.append('title', title);
  formData.append('tags', tags);

  const response = await makeFormDataRequest(`${API_BASE}/tts`, formData);
  return handleResponse(response);
}

export async function saveVoiceToWorkspace({ fileUrl, voice, provider = 'openai', title = '', tags = '' }) {
  const formData = new FormData();
  formData.append('audio_url', fileUrl);
  formData.append('voice', voice);
  formData.append('provider', provider);
  formData.append('title', title);
  formData.append('tags', tags);

  const response = await makeFormDataRequest(`${API_BASE}/workspace/voices`, formData);
  return handleResponse(response);
}

// Download API
export async function downloadMedia({ url, format = 'mp4' }) {
  const formData = new FormData();
  formData.append('url', url);
  formData.append('format', format);

  const response = await makeFormDataRequest(`${API_BASE}/download`, formData);
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

  const response = await makeFormDataRequest(`${API_BASE}/downloads/save`, formData);
  return handleResponse(response);
}

export async function fetchSavedDownloads() {
  const response = await makeRequest(`${API_BASE}/downloads/saved`);
  return handleResponse(response);
}

export async function fetchDownloadHistory() {
  const response = await makeRequest(`${API_BASE}/downloads/history`);
  return handleResponse(response);
}

export async function clearDownloadHistory() {
  const response = await makeRequest(`${API_BASE}/downloads/history`, {
    method: 'DELETE'
  });
  return handleResponse(response);
}

export async function deleteSavedDownload(id) {
  const response = await makeRequest(`${API_BASE}/downloads/saved/${id}`, {
    method: 'DELETE'
  });
  return handleResponse(response);
}

// Workspace API
export async function saveWorkspaceScript({ script, title = '', tags = '', sourceUrl = '' }) {
  const formData = new FormData();
  formData.append('script', script);
  formData.append('title', title);
  formData.append('tags', tags);
  formData.append('source_url', sourceUrl);

  const response = await makeFormDataRequest(`${API_BASE}/workspace/scripts`, formData);
  return handleResponse(response);
}

export async function updateWorkspaceScript({ id, script, title, tags, sourceUrl }) {
  const formData = new FormData();
  formData.append('script', script);
  if (title !== undefined) formData.append('title', title);
  if (tags !== undefined) formData.append('tags', tags);
  if (sourceUrl !== undefined) formData.append('source_url', sourceUrl);

  const response = await makeFormDataRequest(`${API_BASE}/workspace/scripts/${id}`, formData, {
    method: 'PUT'
  });
  return handleResponse(response);
}

export async function fetchWorkspace() {
  const response = await makeRequest(`${API_BASE}/workspace`);
  return handleResponse(response);
}

export async function deleteWorkspaceEntry(id) {
  const response = await makeRequest(`${API_BASE}/workspace/${id}`, {
    method: 'DELETE'
  });
  return handleResponse(response);
}

// Workflow API
export async function fetchWorkflowTools() {
  const response = await makeRequest(`${API_BASE}/workflows/tools`);
  return handleResponse(response);
}

export async function fetchWorkflows() {
  const response = await makeRequest(`${API_BASE}/workflows`);
  return handleResponse(response);
}

export async function createWorkflow({ name, nodes, edges, notes = '', layout = {} }) {
  const response = await makeRequest(`${API_BASE}/workflows`, {
    method: 'POST',
    body: JSON.stringify({ name, nodes, edges, notes, layout })
  });
  return handleResponse(response);
}

export async function updateWorkflow({ id, name, nodes, edges, notes, layout }) {
  const response = await makeRequest(`${API_BASE}/workflows/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name, nodes, edges, notes, layout })
  });
  return handleResponse(response);
}

export async function deleteWorkflow(id) {
  const response = await makeRequest(`${API_BASE}/workflows/${id}`, {
    method: 'DELETE'
  });
  return handleResponse(response);
}

export async function clearWorkflows() {
  const response = await makeRequest(`${API_BASE}/workflows`, {
    method: 'DELETE'
  });
  return handleResponse(response);
}

export async function runWorkflow({ id, payload }) {
  const response = await makeRequest(`${API_BASE}/workflows/${id}/run`, {
    method: 'POST',
    body: JSON.stringify(payload ?? {})
  });
  return handleResponse(response);
}

export async function deleteWorkflowRun(id) {
  const response = await makeRequest(`${API_BASE}/workflows/runs/${id}`, {
    method: 'DELETE'
  });
  return handleResponse(response);
}

export async function clearWorkflowRuns() {
  const response = await makeRequest(`${API_BASE}/workflows/runs`, {
    method: 'DELETE'
  });
  return handleResponse(response);
}

export async function fetchWorkflowRuns() {
  const response = await makeRequest(`${API_BASE}/workflows/runs`);
  return handleResponse(response);
}

// Knowledge API
export async function fetchKnowledge() {
  const response = await makeRequest(`${API_BASE}/knowledge`);
  return handleResponse(response);
}

export async function updateKnowledge(content) {
  const response = await makeRequest(`${API_BASE}/knowledge`, {
    method: 'POST',
    body: JSON.stringify({ content })
  });
  return handleResponse(response);
}

// Voices API
export async function fetchVoices() {
  const response = await makeRequest(`${API_BASE}/voices`);
  return handleResponse(response);
}

// Analytics API
export async function trackEvent(eventType, metadata = {}) {
  try {
    const formData = new FormData();
    formData.append('event_type', eventType);
    formData.append('metadata', JSON.stringify(metadata));

    const response = await makeFormDataRequest(`${API_BASE}/analytics/track`, formData);
    return handleResponse(response);
  } catch (error) {
    console.warn('Failed to track event:', error);
    return null;
  }
}

export async function fetchUserInsights() {
  const response = await makeRequest(`${API_BASE}/analytics/user`);
  return handleResponse(response);
}

export async function fetchAnalyticsDashboard() {
  const response = await makeRequest(`${API_BASE}/analytics/dashboard`);
  return handleResponse(response);
}

// Credits API
export async function fetchUserQuota() {
  const response = await makeRequest(`${API_BASE}/credits/quota`);
  return handleResponse(response);
}

export async function fetchPricingTiers() {
  const response = await makeRequest(`${API_BASE}/credits/pricing`);
  return handleResponse(response);
}

export async function upgradeSubscription(tier) {
  const formData = new FormData();
  formData.append('tier', tier);

  const response = await makeFormDataRequest(`${API_BASE}/credits/upgrade`, formData);
  return handleResponse(response);
}

// Workflow Templates API
export async function fetchWorkflowTemplates() {
  const response = await makeRequest(`${API_BASE}/workflows/templates`);
  return handleResponse(response);
}

export async function getWorkflowTemplate(templateId) {
  const response = await makeRequest(`${API_BASE}/workflows/templates/${templateId}`);
  return handleResponse(response);
}

export async function useWorkflowTemplate(templateId, workflowName) {
  const formData = new FormData();
  formData.append('workflow_name', workflowName);

  const response = await makeFormDataRequest(`${API_BASE}/workflows/templates/${templateId}/use`, formData);
  return handleResponse(response);
}

export { API_BASE };

// Auth state change listener to start analytics session
if (typeof window !== 'undefined') {
  import('../firebase/auth.js').then(({ onAuthStateChange }) => {
    onAuthStateChange((user) => {
      if (user) {
        // Start analytics session when user signs in
        startAnalyticsSession().catch(error => {
          console.warn('Failed to start analytics session on auth:', error);
        });
      }
    });
  });
}
