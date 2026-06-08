'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '../common/SMButton/SMButton';
import { Card } from '../common/SMCard/SMCard';

interface AdminAuthFormProps {
  onSuccess: () => void;
}

export function AdminAuthForm({ onSuccess }: AdminAuthFormProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok) {
        onSuccess();
      } else {
        setAuthError(data.error || 'Ошибка авторизации');
      }
    } catch (error) {
      setAuthError('Ошибка сервера');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-gray-50 to-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <Card className="p-8 shadow-xl border-0">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-[#18A36C] to-[#15905f] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#18A36C]/30">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Админ-панель</h1>
            <p className="text-gray-500">Введите пароль для доступа</p>
          </div>

          <form onSubmit={handleAdminAuth} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Пароль</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#18A36C]/20 focus:border-[#18A36C] transition-all"
                  placeholder="Введите пароль"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {authError && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl"
              >
                {authError}
              </motion.p>
            )}

            <Button
              type="submit"
              disabled={authLoading || !password}
              className="w-full bg-gradient-to-r from-[#18A36C] to-[#15905f] hover:from-[#15905f] hover:to-[#128a54] text-white py-3.5 rounded-xl shadow-lg shadow-[#18A36C]/20 transition-all hover:shadow-xl"
            >
              {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Войти'}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
