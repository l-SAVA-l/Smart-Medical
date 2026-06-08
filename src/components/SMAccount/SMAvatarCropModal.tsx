'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../common/SMDialog/SMDialog';
import { Button } from '../common/SMButton/SMButton';
import { Slider } from '../common/SMSlider/SMSlider';
import { ZoomIn, ZoomOut, RotateCw, Upload } from 'lucide-react';

interface AvatarCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (croppedImageBlob: Blob) => void;
  imageFile: File | null;
}

export function AvatarCropModal({ isOpen, onClose, onSave, imageFile }: AvatarCropModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);

  // Размер области обрезки
  const cropSize = 200;
  const canvasSize = 300;

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImageUrl(url);
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });

      // Загружаем изображение
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        drawImage();
      };
      img.src = url;

      return () => URL.revokeObjectURL(url);
    }
  }, [imageFile]);

  useEffect(() => {
    if (imageRef.current) {
      drawImage();
    }
  }, [scale, rotation, position]);

  const drawImage = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imageRef.current;

    if (!canvas || !ctx || !img) return;

    // Очищаем canvas белым фоном
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Сохраняем состояние контекста
    ctx.save();

    // Создаем круглую маску для отображения
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, cropSize / 2, 0, Math.PI * 2);
    ctx.clip();

    // Перемещаем центр canvas
    ctx.translate(canvas.width / 2 + position.x, canvas.height / 2 + position.y);

    // Вращаем
    ctx.rotate((rotation * Math.PI) / 180);

    // Масштабируем
    ctx.scale(scale, scale);

    // Рисуем изображение по центру
    const aspectRatio = img.width / img.height;
    let drawWidth, drawHeight;

    if (aspectRatio > 1) {
      drawHeight = cropSize;
      drawWidth = cropSize * aspectRatio;
    } else {
      drawWidth = cropSize;
      drawHeight = cropSize / aspectRatio;
    }

    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

    // Восстанавливаем состояние контекста
    ctx.restore();

    // Рисуем границу круга
    ctx.strokeStyle = '#18A36C';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, cropSize / 2, 0, Math.PI * 2);
    ctx.stroke();

    // Рисуем внешнюю границу для визуального эффекта
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, cropSize / 2 + 4, 0, Math.PI * 2);
    ctx.stroke();
  }, [scale, rotation, position, cropSize]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;

    if (!canvas || !img) return;

    setIsLoading(true);

    // Создаем временный canvas для обрезанного изображения
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = cropSize;
    outputCanvas.height = cropSize;
    const outputCtx = outputCanvas.getContext('2d');

    if (!outputCtx) {
      setIsLoading(false);
      return;
    }

    // Рисуем круглую область
    outputCtx.beginPath();
    outputCtx.arc(cropSize / 2, cropSize / 2, cropSize / 2, 0, Math.PI * 2);
    outputCtx.closePath();
    outputCtx.clip();

    // Перемещаем и трансформируем изображение
    outputCtx.translate(cropSize / 2 + position.x, cropSize / 2 + position.y);
    outputCtx.rotate((rotation * Math.PI) / 180);
    outputCtx.scale(scale, scale);

    // Рисуем изображение
    const aspectRatio = img.width / img.height;
    let drawWidth, drawHeight;

    if (aspectRatio > 1) {
      drawHeight = cropSize;
      drawWidth = cropSize * aspectRatio;
    } else {
      drawWidth = cropSize;
      drawHeight = cropSize / aspectRatio;
    }

    outputCtx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

    // Конвертируем в blob
    outputCanvas.toBlob(
      (blob) => {
        if (blob) {
          onSave(blob);
        }
        setIsLoading(false);
      },
      'image/png',
      1
    );
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl text-[#2E2E2E]">
            Настройка аватара
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Перетащите изображение для позиционирования и используйте ползунок для масштабирования
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {imageUrl && (
            <>
              <canvas
                ref={canvasRef}
                width={300}
                height={300}
                className="border border-gray-200 rounded-lg cursor-move bg-gray-100"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />

              <div className="w-full space-y-4">
                <div className="flex items-center gap-4">
                  <ZoomOut className="w-4 h-4 text-gray-500" />
                  <Slider
                    value={[scale]}
                    min={0.5}
                    max={3}
                    step={0.1}
                    onValueChange={(value) => setScale(value[0])}
                    className="flex-1"
                  />
                  <ZoomIn className="w-4 h-4 text-gray-500" />
                </div>

                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRotate}
                    className="border-gray-300"
                  >
                    <RotateCw className="w-4 h-4 mr-2" />
                    Повернуть
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto border-gray-300"
          >
            Отмена
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || !imageUrl}
            className="w-full sm:w-auto bg-[#18A36C] hover:bg-[#18A36C]/90 text-white"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Сохранение...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Сохранить
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
