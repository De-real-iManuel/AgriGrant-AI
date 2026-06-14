import { supabase } from './supabaseClient';

const BUCKET_NAME = 'farmer-documents';

export interface UploadResult {
  success: boolean;
  path: string | null;
  error: string | null;
}

/**
 * Uploads a single document to Supabase Storage.
 * @param file The File object to upload
 * @param userId The authenticated user's ID
 * @param documentType One of: 'nin', 'cac', 'bank_statement', 'land_document'
 * @returns UploadResult with the storage path on success
 */
export async function uploadDocument(
  file: File,
  userId: string,
  documentType: string
): Promise<UploadResult> {
  try {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
    const timestamp = Date.now();
    const storagePath = `${userId}/${documentType}_${timestamp}.${ext}`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error(`Upload error for ${documentType}:`, error);
      return { success: false, path: null, error: error.message };
    }

    return { success: true, path: storagePath, error: null };
  } catch (err: any) {
    console.error(`Upload exception for ${documentType}:`, err);
    return { success: false, path: null, error: err.message || 'Upload failed' };
  }
}

/**
 * Uploads all selected documents for a farmer.
 * @param files Map of document types to File objects
 * @param userId The authenticated user's ID
 * @returns Map of document types to storage paths (only for successful uploads)
 */
export async function uploadAllDocuments(
  files: Record<string, File | undefined>,
  userId: string
): Promise<Record<string, string | null>> {
  const results: Record<string, string | null> = {
    ninDocumentPath: null,
    cacDocumentPath: null,
    bankStatementPath: null,
    landDocumentPath: null,
  };

  const uploadTasks: Promise<void>[] = [];

  const mapping: Record<string, string> = {
    ninDocument: 'ninDocumentPath',
    cacDocument: 'cacDocumentPath',
    bankStatement: 'bankStatementPath',
    landDocument: 'landDocumentPath',
  };

  const docTypeNames: Record<string, string> = {
    ninDocument: 'nin',
    cacDocument: 'cac',
    bankStatement: 'bank_statement',
    landDocument: 'land_document',
  };

  for (const [key, file] of Object.entries(files)) {
    if (file && mapping[key]) {
      uploadTasks.push(
        uploadDocument(file, userId, docTypeNames[key]).then((res) => {
          if (res.success && res.path) {
            results[mapping[key]] = res.path;
          }
        })
      );
    }
  }

  await Promise.all(uploadTasks);
  return results;
}

/**
 * Saves the farmer profile to the backend database.
 * @param profileData The full farmer profile data including document paths
 * @returns The API response
 */
export async function saveFarmerProfile(profileData: Record<string, any>): Promise<{
  success: boolean;
  message: string;
  profileId?: string;
}> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  try {
    const res = await fetch(`${backendUrl}/api/profile/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, message: err?.detail || 'Failed to save profile' };
    }
    return await res.json();
  } catch (err: any) {
    console.error('Save profile error:', err);
    return { success: false, message: err.message || 'Network error saving profile' };
  }
}
