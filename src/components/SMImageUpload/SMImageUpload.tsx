'use client';

import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Video, Loader2 } from 'lucide-react';
import { Button } from '../common/SMButton/SMButton';
import { useAlert } from '../common/SMAlert/AlertProvider';

interface UploadedFile {
  public_id: string;
  url: string;
  format: string;
  width?: number;
  height?: number;
  resource_type: string;
}

interface ImageUploadProps {
  onUpload: (file: UploadedFile) => void;
  onRemove?: (publicId: string) => void;
  folder?: string;
  resourceType?: 'image' | 'video';
  multiple?: boolean;
  maxFiles?: number;
  currentImages?: string[];
  className?: string;
}

export function ImageUpload({
  onUpload,
  onRemove,
  folder = 'smartmedical',
  resourceType = 'image',
  multiple = false,
  maxFiles = 5,
  currentImages = [],
  className = '',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const alert = useAlert();

  const handleUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const filesToUpload = multiple
      ? Array.from(files).slice(0, maxFiles - currentImages.length)
      : [files[0]];

    setUploading(true);

    try {
      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);
        formData.append('resourceType', resourceType);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Ошибка загрузки');
        }

        const result = await response.json();
        onUpload(result.data);
      }

      alert.success(
        filesToUpload.length === 1
          ? 'Файл успешно загружен!'
          : `Загружено файлов: ${filesToUpload.length}`,
        'Успешная загрузка'
      );
    } catch (err) {
      alert.error(
        err instanceof Error ? err.message : 'Ошибка загрузки файла',
        'Ошибка загрузки'
      );
    } finally {
      setUploading(false);
    }
  }, [folder, resourceType, multiple, maxFiles, currentImages.length, onUpload, alert]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleUpload(e.dataTransfer.files);
  }, [handleUpload]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleUpload(e.target.files);
    e.target.value = '';
  }, [handleUpload]);

  const Icon = resourceType === 'video' ? Video : ImageIcon;
  const acceptTypes = resourceType === 'video'
    ? 'video/mp4,video/webm,video/quicktime'
    : 'image/jpeg,image/png,image/webp,image/gif';

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-[#18A36C] bg-[#18A36C]/5'
            : 'border-gray-300 hover:border-[#18A36C]'
        } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={acceptTypes}
          multiple={multiple}
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />

        <div className="space-y-3">
          {uploading ? (
            <Loader2 className="w-12 h-12 mx-auto text-[#18A36C] animate-spin" />
          ) : (
            <div className="w-12 h-12 mx-auto bg-[#18A36C]/10 rounded-lg flex items-center justify-center">
              <Icon className="w-6 h-6 text-[#18A36C]" />
            </div>
          )}

          <div>
            <p className="text-sm text-gray-600">
              {uploading ? 'Загрузка...' : (
                <>
                  <span className="text-[#18A36C] font-medium">Нажмите для загрузки</span>
                  {' '}или перетащите файл сюда
                </>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {resourceType === 'video'
                ? 'MP4, WebM, MOV до 100MB'
                : 'PNG, JPG, WebP до 10MB'
              }
            </p>
          </div>
        </div>
      </div>

      {currentImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {currentImages.map((url, index) => (
            <div key={index} className="relative group aspect-square">
              <img
                src={url}
                alt={`Uploaded ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              {onRemove && (
                <button
                  onClick={() => onRemove(url)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
