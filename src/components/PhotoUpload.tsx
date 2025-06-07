import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { fileToBase64WithCompression, validateImageFile } from '@/utils/imageUtils';

interface PhotoUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  acceptedTypes?: string[];
  maxSizeBytes?: number;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  maxSizeBytes = 5 * 1024 * 1024 // 5MB default
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const convertFileToBase64 = async (file: File): Promise<string> => {
    return fileToBase64WithCompression(file, {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.85,
      format: 'jpeg'
    });
  };

  const validateFile = (file: File): string | null => {
    return validateImageFile(file);
  };
  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;
    
    setUploadError(null);
    setIsProcessing(true);
    const fileArray = Array.from(files);
    
    // Check if adding these files would exceed the limit
    if (images.length + fileArray.length > maxImages) {
      setUploadError(`Vous ne pouvez ajouter que ${maxImages} images maximum`);
      setIsProcessing(false);
      return;
    }

    try {
      const newImages: string[] = [];
      
      for (const file of fileArray) {
        const validationError = validateFile(file);
        if (validationError) {
          setUploadError(validationError);
          setIsProcessing(false);
          return;
        }
        
        const base64 = await convertFileToBase64(file);
        newImages.push(base64);
      }
      
      onImagesChange([...images, ...newImages]);
    } catch (error) {
      setUploadError('Erreur lors du traitement des images');
      console.error('Error uploading images:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}      <Card 
        className={`border-2 border-dashed cursor-pointer transition-colors ${
          isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : isProcessing
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onClick={!isProcessing ? triggerFileSelect : undefined}
        onDrop={!isProcessing ? handleDrop : undefined}
        onDragOver={!isProcessing ? handleDragOver : undefined}
        onDragLeave={!isProcessing ? handleDragLeave : undefined}
      >
        <CardContent className="p-6 text-center">
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-sm text-gray-600 mb-2">Traitement des images...</p>
            </>
          ) : (
            <>
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                Cliquez ou glissez-déposez vos images ici
              </p>
            </>
          )}
          <p className="text-xs text-gray-500">
            Formats acceptés: JPG, PNG, WebP • Taille max: {Math.round(maxSizeBytes / (1024 * 1024))}MB
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Maximum {maxImages} images ({images.length}/{maxImages})
          </p>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Error Message */}
      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{uploadError}</p>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <Card className="overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={image}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {index === 0 && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        Principal
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}      {/* Upload More Button */}
      {images.length > 0 && images.length < maxImages && !isProcessing && (
        <Button 
          variant="outline" 
          onClick={triggerFileSelect}
          className="w-full"
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          Ajouter plus d'images ({images.length}/{maxImages})
        </Button>
      )}
    </div>
  );
};

export default PhotoUpload;
