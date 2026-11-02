/**
 * Enhanced download utilities with Firebase Auth and Firestore logging
 * for workflow outputs
 */

import { auth } from '../firebase/firebaseConfig.js';
import { logActivity } from '../firebase/firestoreService.js';
import { API_BASE } from '../lib/apiClient.js';
import { fetchDownloadBlob, generateOutputFilename, getFileExtension, getOutputUrl, isDownloadableOutput, resolveDownloadUrl } from './workflowOutputs.js';
export { generateOutputFilename, getFileExtension, getOutputUrl, isDownloadableOutput, getDownloadableOutputs } from './workflowOutputs.js';

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
      'X-User-ID': user.uid
    };
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return {
      'X-User-ID': user.uid
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
    const resolvedUrl = resolveDownloadUrl(url, API_BASE);
    const isBackend = new URL(resolvedUrl, window.location.origin).origin === new URL(API_BASE, window.location.origin).origin;
    if (includeAuth && isBackend) {
      try {
        Object.assign(headers, await getAuthHeaders());
      } catch (authError) {
        if (debug) {
          console.warn('Auth failed, proceeding without auth headers:', authError);
        }
        // Continue without auth headers for public files
      }
    }

    const blob = await fetchDownloadBlob(url, API_BASE, { headers, onProgress });

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
      setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 1000);
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
 * Enhanced download with toast notifications
 */
export async function downloadOutputWithNotification(output, addToast, debug = false) {
  if (!isDownloadableOutput(output)) {
    addToast('Output has no downloadable URL', 'error');
    return;
  }

  const url = getOutputUrl(output);
  const filename = generateOutputFilename(output);

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