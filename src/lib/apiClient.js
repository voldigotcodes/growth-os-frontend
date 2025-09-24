const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

async function handleResponse(response) {
  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = await response.json();
      detail = body.detail || JSON.stringify(body);
    } catch (err) {
      // ignore json parse
    }
    throw new Error(detail);
  }
  return response.json();
}

export async function transcribeFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_BASE}/transcribe`, {
    method: 'POST',
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
    headers: { 'Content-Type': 'application/json' },
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

export async function runWorkflow({ id, payload }) {
  const response = await fetch(`${API_BASE}/workflows/${id}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload ?? {}),
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

export { API_BASE };
