'use client';

import { useState, useCallback } from 'react';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning';
}

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    title: '',
    message: '',
  });
  const [resolver, setResolver] = useState<{
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);
    setLoading(false);

    return new Promise((resolve) => {
      setResolver({ resolve });
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    if (resolver) {
      setLoading(true);
      // Даем время на анимацию
      await new Promise(resolve => setTimeout(resolve, 300));
      resolver.resolve(true);
      setIsOpen(false);
      setLoading(false);
      setResolver(null);
    }
  }, [resolver]);

  const handleCancel = useCallback(() => {
    if (resolver) {
      resolver.resolve(false);
      setIsOpen(false);
      setLoading(false);
      setResolver(null);
    }
  }, [resolver]);

  return {
    confirm,
    isOpen,
    loading,
    options,
    handleConfirm,
    handleCancel,
  };
}
