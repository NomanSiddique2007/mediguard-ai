import { supabase, isSupabaseConfigured } from '../lib/supabase/client';

export interface UploadMetadata {
  fileName: string;
  originalSize: number;
  compressedSize: number;
  reductionPercentage: number;
  fileType: string;
  storagePath: string;
  publicUrl: string;
  uploadedAt: string;
}

export const storageService = {
  /**
   * Uploads prescription file to Supabase Storage 'prescriptions' bucket
   */
  async uploadPrescriptionFile(
    file: File,
    userId: string,
    metadataInfo: {
      originalSize: number;
      compressedSize: number;
      reductionPercentage: number;
      dataUrl: string;
    },
    onProgress?: (progress: number) => void
  ): Promise<UploadMetadata> {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const fileName = `${userId || 'guest'}_${timestamp}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const filePath = `prescriptions/${fileName}`;

    const uploadedAt = new Date().toISOString();

    // If Supabase is not configured, return local dataUrl safely
    if (!isSupabaseConfigured()) {
      if (onProgress) onProgress(100);
      return {
        fileName: file.name,
        originalSize: metadataInfo.originalSize,
        compressedSize: metadataInfo.compressedSize,
        reductionPercentage: metadataInfo.reductionPercentage,
        fileType: file.type || 'image/jpeg',
        storagePath: filePath,
        publicUrl: metadataInfo.dataUrl,
        uploadedAt,
      };
    }

    try {
      if (onProgress) onProgress(40);

      // Attempt upload to 'prescriptions' storage bucket
      const { data, error } = await supabase.storage
        .from('prescriptions')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || 'image/jpeg',
        });

      if (onProgress) onProgress(80);

      if (error) {
        console.warn('Supabase Storage upload warning (fallback to local Data URL):', error.message);
        // Fallback to compressed Data URL if bucket isn't pre-created or permissions are restrictive
        return {
          fileName: file.name,
          originalSize: metadataInfo.originalSize,
          compressedSize: metadataInfo.compressedSize,
          reductionPercentage: metadataInfo.reductionPercentage,
          fileType: file.type || 'image/jpeg',
          storagePath: filePath,
          publicUrl: metadataInfo.dataUrl,
          uploadedAt,
        };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('prescriptions')
        .getPublicUrl(filePath);

      if (onProgress) onProgress(100);

      const publicUrl = urlData?.publicUrl || metadataInfo.dataUrl;

      return {
        fileName: file.name,
        originalSize: metadataInfo.originalSize,
        compressedSize: metadataInfo.compressedSize,
        reductionPercentage: metadataInfo.reductionPercentage,
        fileType: file.type || 'image/jpeg',
        storagePath: filePath,
        publicUrl,
        uploadedAt,
      };
    } catch (err: any) {
      console.error('Storage service upload exception:', err);
      if (onProgress) onProgress(100);
      return {
        fileName: file.name,
        originalSize: metadataInfo.originalSize,
        compressedSize: metadataInfo.compressedSize,
        reductionPercentage: metadataInfo.reductionPercentage,
        fileType: file.type || 'image/jpeg',
        storagePath: filePath,
        publicUrl: metadataInfo.dataUrl,
        uploadedAt,
      };
    }
  },
};
