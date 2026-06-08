"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, X, Loader2, CheckCircle, RefreshCw } from "lucide-react";
import { useAlert } from "@/components/common/SMAlert/AlertProvider";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  placeholder?: string;
  className?: string;
  maxSizeMB?: number;
}

export function ImageUploader({
  value,
  onChange,
  folder = "smartmedical",
  placeholder = "Загрузить фото",
  className = "",
  maxSizeMB = 10,
}: ImageUploaderProps) {
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [preview, setPreview] = useState<string>(value || "");
  const inputRef = useRef<HTMLInputElement>(null);
  const { success, error } = useAlert();

  // Sync preview with value prop
  useEffect(() => {
    if (value !== undefined) {
      setPreview(value);
    }
  }, [value]);

  const handleUpload = useCallback(async (file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      error("Только JPG, PNG, WebP, GIF");
      setStatus("error");
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      error(`Максимальный размер: ${maxSizeMB}MB`);
      setStatus("error");
      return;
    }

    setStatus("uploading");

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка загрузки");
      }

      setPreview(data.data.url);
      onChange(data.data.url);
      setStatus("success");
      success("Изображение успешно загружено");
      setTimeout(() => setStatus("idle"), 2000);

    } catch (err) {
      error(err instanceof Error ? err.message : "Ошибка загрузки");
      setStatus("error");
      setPreview(value || "");
    } finally {
      URL.revokeObjectURL(localPreview);
    }
  }, [folder, maxSizeMB, onChange, value, success, error]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleRemove = () => {
    setPreview("");
    onChange("");
    setStatus("idle");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Preview Card - 192x192 (w-48 h-48) */}
      <div className="relative justify-start items-start">
        {preview ? (
          <div
            onClick={() => status !== "uploading" && inputRef.current?.click()}
            className="relative w-48 h-48 rounded-2xl overflow-hidden bg-gray-100 shadow-sm border border-gray-200 cursor-pointer group"
          >
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* Hover overlay with replace hint */}
            {status !== "uploading" && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 text-white mx-auto mb-2" />
                  <span className="text-white text-sm font-medium">Заменить фото</span>
                </div>
              </div>
            )}

            {/* Loading overlay */}
            {status === "uploading" && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </div>
            )}

            {/* Success indicator */}
            {status === "success" && (
              <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        ) : (
          <div
            onClick={() => status !== "uploading" && inputRef.current?.click()}
            className="w-48 h-48 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#18A36C] hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-10 h-10 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500 text-center px-4">
              Нажмите для загрузки
            </span>
          </div>
        )}

        {/* Remove button - positioned OUTSIDE the card */}
        {preview && status !== "uploading" && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg transition-colors z-10 cursor-pointer"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        )}
      </div>
    </div>
  );
}
