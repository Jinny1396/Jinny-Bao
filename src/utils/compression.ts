import imageCompression from 'browser-image-compression';

export interface CompressionMetadata {
  originalSize: number; // in bytes
  compressedSize: number; // in bytes
  ratio: number; // percentage saved (e.g. 85%)
  timeTakenMs: number;
}

export interface CompressionResult {
  compressedFile: File;
  base64String: string;
  meta: CompressionMetadata;
}

/**
 * Compresses an image file directly in the browser.
 * Reduces 20MB+ files to specified size limits dynamically.
 * 
 * @param file The original image File object
 * @param maxSizeMB The maximum target size in Megabytes (MB)
 * @param maxWidthOrHeight The maximum resolution scaling boundary
 * @returns A promise resolving to the compressed file, Base64 string, and compression metadata
 */
export async function compressImage(
  file: File,
  maxSizeMB: number = 0.3, // Default 300KB to stay safely under Firestore 1MB limits
  maxWidthOrHeight: number = 1280
): Promise<CompressionResult> {
  const startTime = performance.now();
  
  const options = {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker: true,
    fileType: file.type || 'image/jpeg',
  };

  const compressedFile = await imageCompression(file, options);
  
  // Convert compressed File blob to Base64
  const base64String = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(compressedFile);
  });

  const endTime = performance.now();
  const originalSize = file.size;
  const compressedSize = compressedFile.size;
  const ratio = Math.round((1 - compressedSize / originalSize) * 100);

  return {
    compressedFile,
    base64String,
    meta: {
      originalSize,
      compressedSize,
      ratio: ratio > 0 ? ratio : 0,
      timeTakenMs: Math.round(endTime - startTime),
    },
  };
}

/**
 * Format bytes into human-readable strings (e.g., 2.34 MB or 412 KB)
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
