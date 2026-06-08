'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '../common/SMButton/SMButton';
import { Input } from '../common/SMInput/SMInput';
import { Label } from '../common/SMLabel/SMLabel';
import { Eye, EyeOff, Lock, Shield, CheckCircle2, X } from 'lucide-react';
import { useAlert } from '../common/SMAlert/AlertProvider';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const alert = useAlert();

  const resetForm = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = (): boolean => {
    if (!oldPassword.trim()) {
      alert.error('Введите текущий пароль', 'Ошибка валидации');
      return false;
    }

    if (!newPassword.trim()) {
      alert.error('Введите новый пароль', 'Ошибка валидации');
      return false;
    }

    if (newPassword.length < 6) {
      alert.error('Новый пароль должен содержать минимум 6 символов', 'Слишком короткий пароль');
      return false;
    }

    if (newPassword !== confirmPassword) {
      alert.error('Пароли не совпадают', 'Ошибка валидации');
      return false;
    }

    if (oldPassword === newPassword) {
      alert.warning('Новый пароль должен отличаться от текущего', 'Одинаковые пароли');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert.error(data.error || 'Ошибка при смене пароля', 'Ошибка');
        return;
      }

      alert.success('Пароль успешно изменен!', 'Успешно');
      handleClose();
    } catch (error) {
      alert.error('Ошибка при смене пароля. Попробуйте позже.', 'Ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = (password: string): { strength: number; text: string; color: string } => {
    if (!password) return { strength: 0, text: '', color: '' };

    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    if (strength <= 1) return { strength: 20, text: 'Слабый', color: 'bg-red-500' };
    if (strength <= 2) return { strength: 40, text: 'Средний', color: 'bg-orange-500' };
    if (strength <= 3) return { strength: 60, text: 'Хороший', color: 'bg-yellow-500' };
    if (strength <= 4) return { strength: 80, text: 'Сильный', color: 'bg-green-500' };
    return { strength: 100, text: 'Очень сильный', color: 'bg-emerald-500' };
  };

  const strength = passwordStrength(newPassword);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="bg-[#18A36C] px-6 py-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-white" />
                  <h2 className="text-xl font-semibold text-white">Смена пароля</h2>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="p-1.5 hover:bg-white/20 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-5">
          {/* Old Password */}
          <div className="space-y-2">
            <Label htmlFor="oldPassword" className="text-[#2E2E2E]">
              Текущий пароль
            </Label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#18A36C] transition-colors" />
              <Input
                id="oldPassword"
                type={showOldPassword ? 'text' : 'password'}
                placeholder="Введите текущий пароль"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="pl-12 pr-12 h-12 border-gray-300 focus:border-[#18A36C] transition-all duration-200 rounded-lg"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#18A36C] transition-colors"
              >
                {showOldPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-[#2E2E2E]">
              Новый пароль
            </Label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#18A36C] transition-colors" />
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Введите новый пароль"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-12 pr-12 h-12 border-gray-300 focus:border-[#18A36C] transition-all duration-200 rounded-lg"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#18A36C] transition-colors"
              >
                {showNewPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {newPassword && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Надежность пароля</span>
                  <span className={`font-medium ${strength.color.replace('bg-', 'text-')}`}>
                    {strength.text}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${strength.strength}%` }}
                    transition={{ duration: 0.3 }}
                    className={`h-full ${strength.color} rounded-full`}
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-[#2E2E2E]">
              Подтверждение пароля
            </Label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#18A36C] transition-colors" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Повторите новый пароль"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-12 pr-12 h-12 border-gray-300 focus:border-[#18A36C] transition-all duration-200 rounded-lg"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#18A36C] transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Match Indicator */}
            {confirmPassword && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                {newPassword === confirmPassword ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-600">Пароли совпадают</span>
                  </>
                ) : (
                  <span className="text-xs text-red-600">Пароли не совпадают</span>
                )}
              </motion.div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 h-12 border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !oldPassword || !newPassword || !confirmPassword}
              className="flex-1 h-12 bg-[#18A36C] hover:bg-[#18A36C]/90 text-white"
            >
              {isLoading ? 'Изменение...' : 'Изменить пароль'}
            </Button>
          </div>

                {/* Security Note */}
                <div className="text-center text-xs text-gray-600 mt-4 p-3 bg-[#F4F4F4] rounded-lg">
                  <Shield className="w-4 h-4 inline mr-1" />
                  Для безопасности используйте пароль длиной минимум 8 символов с буквами и цифрами
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
