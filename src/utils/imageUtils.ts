/**
 * Image utility functions for photo upload
 */

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

/**
 * Compress an image file to reduce size while maintaining quality
 */
export const compressImage = async (
  file: File,
  options: ImageCompressionOptions = {}
): Promise<string> => {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
    format = 'jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      // Set canvas size
      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      const mimeType = format === 'png' ? 'image/png' : 
                      format === 'webp' ? 'image/webp' : 'image/jpeg';
      
      const compressedDataUrl = canvas.toDataURL(mimeType, quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Validate image file before upload
 */
export const validateImageFile = (file: File): string | null => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return `Type de fichier non supporté. Types acceptés: ${allowedTypes.join(', ')}`;
  }

  if (file.size > maxSize) {
    return `Fichier trop volumineux. Taille maximale: ${Math.round(maxSize / (1024 * 1024))}MB`;
  }

  return null;
};

/**
 * Convert file to base64 with compression
 */
export const fileToBase64WithCompression = async (
  file: File,
  compressionOptions?: ImageCompressionOptions
): Promise<string> => {
  // Validate file first
  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  // For small files, just convert without compression
  if (file.size < 500 * 1024) { // 500KB
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Compress larger files
  return compressImage(file, compressionOptions);
};

/**
 * Get image dimensions from base64 data URL
 */
export const getImageDimensions = (base64: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = base64;
  });
};

/**
 * Create a thumbnail from base64 image
 */
export const createThumbnail = async (
  base64: string,
  maxSize: number = 150
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const { width, height } = img;
      const ratio = Math.min(maxSize / width, maxSize / height);
      
      canvas.width = width * ratio;
      canvas.height = height * ratio;

      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };

    img.onerror = reject;
    img.src = base64;
  });
};
