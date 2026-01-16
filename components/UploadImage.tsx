'use client';

import { useState, useRef } from 'react';
import { uploadImage } from '@/lib/storage';

interface UploadImageProps {
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: string) => void;
  className?: string;
}

export default function UploadImage({ onUploadSuccess, onUploadError, className = '' }: UploadImageProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Preview da imagem
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const result = await uploadImage(file);
      if (result.success && result.url) {
        onUploadSuccess?.(result.url);
      } else {
        onUploadError?.(result.error || 'Erro desconhecido');
      }
    } catch (error) {
      onUploadError?.('Erro inesperado');
    } finally {
      setUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`upload-image ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <button
        onClick={handleClick}
        disabled={uploading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {uploading ? 'Enviando...' : 'Selecionar Imagem'}
      </button>
      {preview && (
        <div className="mt-4">
          <img src={preview} alt="Preview" className="max-w-xs max-h-48 object-contain border rounded" />
        </div>
      )}
    </div>
  );
}