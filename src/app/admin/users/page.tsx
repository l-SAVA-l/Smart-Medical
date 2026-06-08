'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { AnimatePresence, motion } from 'framer-motion';
import { UserCog, Loader2, Calendar, Shield, User, X, Eye, EyeOff, Lock, CheckCircle, AlertCircle, Headphones } from 'lucide-react';
import { Pagination } from '@/components/common/SMPagination/SMPagination';
import { AdminMenu } from '@/components/SMAdmin/SMAdminMenu';
import { useServerPagination } from '@/hooks/useServerPagination';
import {
  AdminSection,
  EmptyState,
  ItemCard,
  Badge,
} from '@/components/SMAdmin/SMAdminSection';
import NotFound from '../../not-found';
import { AdminAuthForm } from '@/components/SMAdmin/SMAdminAuthForm';
import { useAdminSession } from '@/hooks/useAdminSession';
import { AdminAccessSkeleton } from '@/components/SMAdmin/SMAdminSkeleton';
import { ConfirmDialog } from '@/components/SMAdmin/SMConfirmDialog';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useAlert } from '@/components/common/SMAlert';

interface UserData {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  login: string;
  role: 'USER' | 'OPERATOR' | 'ADMIN';
  avatar_url: string | null;
  registration_date: string;
  is_messages_blocked: boolean;
}

export default function AdminUsersPage() {
  const { status } = useSession();
  const { sessionVerified, isLoading: sessionLoading, verifySession } = useAdminSession();
  const [isChiefDoctor, setIsChiefDoctor] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const confirmDialog = useConfirmDialog();
  const { success, error: showError } = useAlert();

  // Pagination hook
  const { currentPage, setPage, buildApiUrl } = useServerPagination(12);

  // Data states
  const [users, setUsers] = useState<UserData[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [adminsCount, setAdminsCount] = useState(0);
  const [operatorsCount, setOperatorsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'operator'>('all');

  // Password confirmation modal
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordModalUser, setPasswordModalUser] = useState<UserData | null>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Check admin role
  useEffect(() => {
    if (status === 'authenticated') {
      checkAdminRole();
    } else if (status === 'unauthenticated') {
      setIsChiefDoctor(false);
    }
  }, [status]);

  // Load data when session is verified or page/search/filter changes
  useEffect(() => {
    if (sessionVerified && (isChiefDoctor || isAdmin)) {
      loadData();
    }
  }, [sessionVerified, isChiefDoctor, isAdmin, currentPage, searchQuery, filterRole]); // eslint-disable-line react-hooks/exhaustive-deps

  const checkAdminRole = async () => {
    try {
      const res = await fetch('/api/admin/auth');
      const data = await res.json();
      setIsChiefDoctor(data.isChiefDoctor === true);
      setIsAdmin(data.isAdmin === true);
    } catch (error) {
      setIsChiefDoctor(false);
      setIsAdmin(false);
    }
  };

  const handleAuthSuccess = () => {
    verifySession();
  };

  const loadCounts = async () => {
    try {
      // Fetch counts for both roles
      const [adminsRes, operatorsRes] = await Promise.all([
        fetch('/api/admin/users?page=1&limit=1&role=admin'),
        fetch('/api/admin/users?page=1&limit=1&role=operator'),
      ]);

      if (adminsRes.ok) {
        const data = await adminsRes.json();
        setAdminsCount(data.totalCount || 0);
      }

      if (operatorsRes.ok) {
        const data = await operatorsRes.json();
        setOperatorsCount(data.totalCount || 0);
      }
    } catch (error) {
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const apiUrl = buildApiUrl('/api/admin/users', searchQuery) + (filterRole !== 'all' ? `&role=${filterRole}` : '');

      const [res] = await Promise.all([
        fetch(apiUrl),
        loadCounts(), // Load counts in parallel
      ]);

      if (res.ok) {
        const response = await res.json();
        setUsers(response.data || []);
        setTotalPages(response.totalPages || 1);
        setTotalCount(response.totalCount || 0);
      }
    } catch (error) {
      showError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  // Reset page when search or filter changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery, filterRole]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle role change
  const handleChangeRole = async (user: UserData, newRole: 'USER' | 'OPERATOR' | 'ADMIN') => {
    // If promoting to admin - show password confirmation modal (only chief doctor can do this)
    if (newRole === 'ADMIN') {
      if (!isChiefDoctor) {
        showError('Только главный врач может назначать администраторов');
        return;
      }
      setPasswordModalUser(user);
      setAdminPassword('');
      setPasswordError(null);
      setPasswordModalOpen(true);
      return;
    }

    // If promoting to operator - show confirm dialog
    if (newRole === 'OPERATOR') {
      const confirmed = await confirmDialog.confirm({
        title: 'Назначить оператором',
        message: `Вы уверены, что хотите назначить пользователя "${getFullName(user)}" оператором?`,
        confirmText: 'Назначить',
        cancelText: 'Отмена',
      });

      if (!confirmed) return;
      await updateUserRole(user.id, newRole);
      return;
    }

    // If demoting from admin - show confirm dialog (only chief doctor can do this)
    if (user.role === 'ADMIN') {
      if (!isChiefDoctor) {
        showError('Только главный врач может снимать права администратора');
        return;
      }
      const confirmed = await confirmDialog.confirm({
        title: 'Снять права администратора',
        message: `Вы уверены, что хотите снять права администратора с пользователя "${getFullName(user)}"?`,
        confirmText: 'Подтвердить',
        cancelText: 'Отмена',
        variant: 'danger',
      });

      if (!confirmed) return;
      await updateUserRole(user.id, newRole);
      return;
    }

    // If demoting from operator - show confirm dialog
    if (user.role === 'OPERATOR') {
      const confirmed = await confirmDialog.confirm({
        title: 'Снять права оператора',
        message: `Вы уверены, что хотите снять права оператора с пользователя "${getFullName(user)}"?`,
        confirmText: 'Подтвердить',
        cancelText: 'Отмена',
        variant: 'warning',
      });

      if (!confirmed) return;
      await updateUserRole(user.id, newRole);
      return;
    }
  };

  const updateUserRole = async (userId: number, newRole: 'USER' | 'OPERATOR' | 'ADMIN', password?: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          newRole,
          adminPassword: password,
        }),
      });

      if (res.ok) {
        await loadData();
        const messages = {
          ADMIN: 'Администратор назначен',
          OPERATOR: 'Оператор назначен',
          USER: 'Роль изменена на пользователя',
        };
        success(messages[newRole] || 'Роль изменена');
        return true;
      } else {
        const error = await res.json();
        throw new Error(error.error || 'Ошибка изменения роли');
      }
    } catch (error: any) {
      showError(error.message || 'Ошибка изменения роли');
      return false;
    }
  };

  const handlePasswordConfirm = async () => {
    if (!passwordModalUser || !adminPassword) return;

    setPasswordLoading(true);
    setPasswordError(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: passwordModalUser.id,
          newRole: 'ADMIN',
          adminPassword,
        }),
      });

      if (res.ok) {
        await loadData();
        success('Администратор назначен');
        setPasswordModalOpen(false);
        setPasswordModalUser(null);
        setAdminPassword('');
      } else {
        const error = await res.json();
        setPasswordError(error.error || 'Ошибка назначения администратора');
      }
    } catch (error) {
      setPasswordError('Ошибка назначения администратора');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Get full name
  const getFullName = (user: UserData) => {
    return user.name || user.login;
  };

  // Get initials
  const getInitials = (user: UserData) => {
    const nameParts = user.name.trim().split(/\s+/);
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    return user.name.slice(0, 2).toUpperCase();
  };

  // Loading state
  if (status === 'loading' || isChiefDoctor === null || isAdmin === null || sessionLoading) {
    return <AdminAccessSkeleton />;
  }

  // Not chief doctor or admin - show 404
  if (status === 'unauthenticated' || (!isChiefDoctor && !isAdmin)) {
    return <NotFound />;
  }

  // Admin login form (only if session not verified)
  if (!sessionVerified) {
    return <AdminAuthForm onSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminMenu />

      <div className="flex-1 p-4 lg:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <AdminSection
            title="Пользователи"
            icon={UserCog}
            count={totalCount}
            loading={loading}
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
          >
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <button
                onClick={() => setFilterRole('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${filterRole === 'all'
                    ? 'bg-gray-700 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
              >
                <UserCog className="w-4 h-4" />
                Все пользователи
              </button>
              <button
                onClick={() => setFilterRole('admin')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${filterRole === 'admin'
                    ? 'bg-[#18A36C] text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
              >
                <Shield className="w-4 h-4" />
                Администраторы
                {adminsCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${filterRole === 'admin'
                      ? 'bg-white/20 text-white'
                      : 'bg-[#18A36C]/10 text-[#18A36C]'
                    }`}>
                    {adminsCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setFilterRole('operator')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${filterRole === 'operator'
                    ? 'bg-[#18A36C] text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
              >
                <Headphones className="w-4 h-4" />
                Операторы
                {operatorsCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${filterRole === 'operator'
                      ? 'bg-white/20 text-white'
                      : 'bg-[#18A36C]/10 text-[#18A36C]'
                    }`}>
                    {operatorsCount}
                  </span>
                )}
              </button>
            </div>

            {users.length === 0 ? (
              <EmptyState
                icon={UserCog}
                title="Пользователи не найдены"
                description={searchQuery ? 'Попробуйте изменить поисковый запрос' : 'Пока нет пользователей'}
              />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {users.map((user) => (
                      <ItemCard key={user.id}>
                        <div className="flex gap-4">
                          {/* Avatar */}
                          <div className={`w-12 h-12 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center ${
                            user.role === 'ADMIN' ? 'bg-[#18A36C]' : user.role === 'OPERATOR' ? 'bg-[#18A36C]' : 'bg-gray-500'
                          }`}>
                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt={getFullName(user)}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-semibold text-white">
                                {getInitials(user)}
                              </span>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-800 truncate">{getFullName(user)}</h3>
                            <p className="text-sm text-gray-500 truncate">@{user.login}</p>
                            {user.email && (
                              <p className="text-xs text-gray-400 truncate">{user.email}</p>
                            )}
                          </div>
                        </div>

                        {/* Phone */}
                        {user.phone && (
                          <p className="text-sm text-gray-500 mt-2">{user.phone}</p>
                        )}

                        {/* Date and Role */}
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(user.registration_date).toLocaleDateString('ru-RU')}
                          </p>
                          {user.role === 'ADMIN' ? (
                            <Badge variant="success">Администратор</Badge>
                          ) : user.role === 'OPERATOR' ? (
                            <Badge variant="primary">Оператор</Badge>
                          ) : (
                            <Badge variant="secondary">Пользователь</Badge>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                          {user.role === 'USER' ? (
                            <>
                              <button
                                onClick={() => handleChangeRole(user, 'OPERATOR')}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#18A36C] text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-[#15905f] transition-colors cursor-pointer"
                              >
                                <Headphones className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">Оператор</span>
                              </button>
                              {isChiefDoctor && (
                                <button
                                  onClick={() => handleChangeRole(user, 'ADMIN')}
                                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#18A36C] text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-[#15905f] transition-colors cursor-pointer"
                                >
                                  <Shield className="w-4 h-4 flex-shrink-0" />
                                  <span className="truncate">Админ</span>
                                </button>
                              )}
                            </>
                          ) : user.role === 'OPERATOR' ? (
                            <button
                              onClick={() => handleChangeRole(user, 'USER')}
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-500 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
                            >
                              <X className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">Снять оператора</span>
                            </button>
                          ) : user.role === 'ADMIN' && isChiefDoctor ? (
                            <button
                              onClick={() => handleChangeRole(user, 'USER')}
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
                            >
                              <X className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">Снять админа</span>
                            </button>
                          ) : null}
                        </div>
                      </ItemCard>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    className="mt-6"
                  />
                )}
              </>
            )}
          </AdminSection>

          {/* Password Confirmation Modal */}
          <AnimatePresence>
            {passwordModalOpen && passwordModalUser && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => !passwordLoading && setPasswordModalOpen(false)}
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                >
                  {/* Header */}
                  <div className="bg-[#18A36C] px-6 py-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        Подтверждение
                      </h2>
                      <button
                        onClick={() => !passwordLoading && setPasswordModalOpen(false)}
                        className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-[#18A36C] flex items-center justify-center">
                        {passwordModalUser.avatar_url ? (
                          <img
                            src={passwordModalUser.avatar_url}
                            alt={getFullName(passwordModalUser)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-white">
                            {getInitials(passwordModalUser)}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{getFullName(passwordModalUser)}</h3>
                        <p className="text-sm text-gray-500">@{passwordModalUser.login}</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
                      Для назначения администратора введите ваш пароль:
                    </p>

                    {passwordError && (
                      <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {passwordError}
                      </div>
                    )}

                    <form autoComplete="off" onSubmit={(e) => { e.preventDefault(); handlePasswordConfirm(); }}>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="admin-confirmation-password"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          placeholder="Введите ваш пароль"
                          autoComplete="off"
                          className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18A36C]/20 focus:border-[#18A36C] transition-all"
                          disabled={passwordLoading}
                          onKeyDown={(e) => e.key === 'Enter' && handlePasswordConfirm()}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 p-6 pt-0">
                    <button
                      onClick={() => setPasswordModalOpen(false)}
                      disabled={passwordLoading}
                      className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      Отмена
                    </button>
                    <button
                      onClick={handlePasswordConfirm}
                      disabled={passwordLoading || !adminPassword}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#18A36C] text-white font-medium rounded-xl hover:bg-[#15905f] transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {passwordLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Подтвердить
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Confirm Dialog */}
          <ConfirmDialog
            isOpen={confirmDialog.isOpen}
            onClose={confirmDialog.handleCancel}
            onConfirm={confirmDialog.handleConfirm}
            title={confirmDialog.options.title}
            message={confirmDialog.options.message}
            confirmText={confirmDialog.options.confirmText}
            cancelText={confirmDialog.options.cancelText}
            variant={confirmDialog.options.variant}
            loading={confirmDialog.loading}
          />
        </div>
      </div>
    </div>
  );
}
