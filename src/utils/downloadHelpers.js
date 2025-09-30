/**
 * Enhanced download utilities with Firebase Auth and Firestore logging
 * for workflow outputs
 */

import { auth } from '../firebase/firebaseConfig.js';
import { logActivity, updateOutputDownload } from '../firebase/firestoreService.js';

// Get user headers for authenticated downloads using Firebase Auth
async function getAuthHeaders() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
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

/**
 * Enhanced file download with debugging and error handling
 */
export async function downloadFile(url, filename, options = {}) {
  const {
    debug = false,
    includeAuth = true,
    onProgress = null
  } = options;

  if (debug) {
    console.log('🔍 Download Debug Info:');
    console.log('URL:', url);
    console.log('Filename:', filename);
    console.log('Include Auth:', includeAuth);
  }

  try {
    // Validate URL
    if (!url || typeof url !== 'string') {
      throw new Error('Invalid URL provided');
    }

    // Prepare headers
    const headers = {};
    if (includeAuth) {
      try {
        Object.assign(headers, await getAuthHeaders());
      } catch (authError) {
        if (debug) {
          console.warn('Auth failed, proceeding without auth headers:', authError);
        }
        // Continue without auth headers for public files
      }
    }

    if (debug) {
      console.log('Request headers:', headers);
    }

    // Make the request
    const response = await fetch(url, { headers });

    if (debug) {
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      console.log('Content-Type:', response.headers.get('Content-Type'));
      console.log('Content-Length:', response.headers.get('Content-Length'));
    }

    if (!response.ok) {
      // Check if we got an HTML error page
      const contentType = response.headers.get('Content-Type') || '';
      if (contentType.includes('text/html')) {
        const htmlContent = await response.text();
        if (debug) {
          console.log('HTML Error Response:', htmlContent.substring(0, 500));
        }

        // Try to extract meaningful error from HTML
        const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)</i);
        const errorTitle = titleMatch ? titleMatch[1] : 'Unknown error';

        throw new Error(`Server returned HTML error page: ${errorTitle} (Status: ${response.status})`);
      }

      throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }

    // Check content type
    const contentType = response.headers.get('Content-Type') || '';
    if (contentType.includes('text/html') && !filename.endsWith('.html')) {
      if (debug) {
        const htmlPreview = await response.clone().text();
        console.log('WARNING: Got HTML instead of expected file type');
        console.log('HTML preview:', htmlPreview.substring(0, 500));
      }
      throw new Error('Server returned HTML page instead of file. This usually means the URL is incorrect or requires authentication.');
    }

    // Create blob from response
    const blob = await response.blob();

    if (debug) {
      console.log('Blob created:', blob.type, blob.size, 'bytes');
    }

    // Validate blob
    if (!blob || blob.size === 0) {
      throw new Error('Downloaded file is empty');
    }

    // Create download URL and trigger download
    const downloadUrl = window.URL.createObjectURL(blob);

    try {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';

      // Add to DOM temporarily to ensure download works in all browsers
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (debug) {
        console.log('✅ Download triggered successfully');
      }

      // Log download activity to Firestore
      try {
        const user = auth.currentUser;
        if (user) {
          await logActivity(user.uid, {
            type: 'download',
            action: 'complete',
            metadata: {
              filename: filename,
              size: blob.size,
              url: url,
              contentType: blob.type
            }
          });
        }
      } catch (logError) {
        if (debug) {
          console.warn('Failed to log download activity:', logError);
        }
        // Don't fail the download if logging fails
      }

      return { success: true, filename: filename, size: blob.size };

    } finally {
      // Clean up the blob URL
      window.URL.revokeObjectURL(downloadUrl);
    }

  } catch (error) {
    if (debug) {
      console.error('❌ Download failed:', error);
      console.error('Stack:', error.stack);
    }

    throw new Error(`Download failed: ${error.message}`);
  }
}

/**
 * Get file extension from URL
 */
export function getFileExtension(url) {
  try {
    const pathname = new URL(url).pathname;
    const extension = pathname.split('.').pop();
    return extension && extension !== pathname ? `.${extension}` : '';
  } catch {
    return '';
  }
}

/**
 * Generate filename for output
 */
export function generateOutputFilename(output) {
  // Use provided filename first
  if (output?.filename) {
    return output.filename;
  }

  // Use label if available
  if (output?.label) {
  const extension = getFileExtension(output?.file_url || output?.url || output?.value?.url || '');    return `${output.label}${extension}`;
  }

  // Generate from node/port info
  const nodeId = output?.node_id ? output.node_id.replace(/^node-/, '') : 'output';
  const portId = output?.port_id || 'result';
const extension = getFileExtension(output?.file_url || output?.url || output?.value?.url || '');
  return `${nodeId}-${portId}${extension}`;
}

/**
 * Validate output has downloadable URL
 */
export function isDownloadableOutput(output) {
  const url = output?.file_url || output?.url || output?.value?.url;
return url && typeof url === 'string' && url.trim().length > 0;
}

/**
 * Enhanced download with toast notifications
 */
export async function downloadOutputWithNotification(output, addToast, debug = false) {
  if (!isDownloadableOutput(output)) {
    addToast('Output has no downloadable URL', 'error');
    return;
  }

const url = output?.file_url || output?.url || output?.value?.url;  const filename = generateOutputFilename(output);

  try {
    if (debug) {
      addToast(`Starting debug download for: ${filename}`, 'info');
    }

    const result = await downloadFile(url, filename, {
      debug,
      includeAuth: true
    });

    addToast(`Downloaded: ${result.filename} (${(result.size / 1024).toFixed(1)}KB)`, 'success');

  } catch (error) {
    console.error('Download error:', error);
    addToast(`Download failed: ${error.message}`, 'error');

    if (debug) {
      // Show additional debug info in console
      console.log('Failed output object:', output);
      console.log('Attempted URL:', url);
      console.log('Attempted filename:', filename);
    }
  }
}

export default {
  downloadFile,
  getFileExtension,
  generateOutputFilename,
  isDownloadableOutput,
  downloadOutputWithNotification
};