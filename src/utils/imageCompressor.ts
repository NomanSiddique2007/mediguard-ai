/**
 * Client-Side Image Compression & Optimization Utility
 * Compress JPG, JPEG, PNG, WEBP images before storage upload.
 */

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  reductionPercentage: number;
  dataUrl: string;
  width?: number;
  height?: number;
}

export async function compressPrescriptionImage(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.8
): Promise<CompressionResult> {
  const originalSize = file.size;

  // If file is PDF or non-image, return file directly with base64/URL representation
  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    const dataUrl = await fileToDataUrl(file);
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      reductionPercentage: 0,
      dataUrl,
    };
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio scaling
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to create 2D canvas context for image compression'));
          return;
        }

        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to blob with specified quality
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas to Blob compression failed'));
              return;
            }

            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            const compressedSize = compressedFile.size;
            const reductionPercentage = Math.max(
              0,
              Math.round(((originalSize - compressedSize) / originalSize) * 100)
            );

            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

            resolve({
              file: compressedFile,
              originalSize,
              compressedSize,
              reductionPercentage,
              dataUrl: compressedDataUrl,
              width,
              height,
            });
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = (err) => {
        reject(new Error('Failed to load image for compression. File may be corrupted.'));
      };
    };

    reader.onerror = (err) => {
      reject(new Error('Failed to read prescription file.'));
    };
  });
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
