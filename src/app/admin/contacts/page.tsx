'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Phone, Loader2, MapPin, Clock, Mail, Save, Search } from 'lucide-react';
import { AdminMenu } from '@/components/SMAdmin/SMAdminMenu';
import {
  FormField,
  FormInput,
  FormTextarea,
} from '@/components/SMAdmin/SMAdminSection';
import NotFound from '../../not-found';
import { AdminAuthForm } from '@/components/SMAdmin/SMAdminAuthForm';
import { useAdminSession } from '@/hooks/useAdminSession';
import { useAlert } from '@/components/common/SMAlert/AlertProvider';
import { AdminAccessSkeleton, AdminContactsSkeleton } from '@/components/SMAdmin/SMAdminSkeleton';

interface Contacts {
  id: number;
  address: string;
  map_geo: string;
  work_hours_main: string;
  work_hours_sunday: string;
  phone_number: string;
  phone_number_sec: string | null;
  email: string;
}

export default function AdminContactsPage() {
  const { status } = useSession();
  const { sessionVerified, isLoading: sessionLoading, verifySession } = useAdminSession();
  const [hasAdminRole, setHasAdminRole] = useState<boolean | null>(null);
  const { success, error: showError } = useAlert();

  // Data states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [searchAddress, setSearchAddress] = useState('');
  const [formData, setFormData] = useState({
    address: '',
    map_geo: '',
    work_hours_main: '',
    work_hours_sunday: '',
    phone_number: '',
    phone_number_sec: '',
    email: '',
  });

  // Check admin role
  useEffect(() => {
    if (status === 'authenticated') {
      checkAdminRole();
    } else if (status === 'unauthenticated') {
      setHasAdminRole(false);
    }
  }, [status]);

  // Load data when session is verified
  useEffect(() => {
    if (sessionVerified && hasAdminRole) {
      loadData();
    }
  }, [sessionVerified, hasAdminRole]);

  const checkAdminRole = async () => {
    try {
      const res = await fetch('/api/admin/auth');
      const data = await res.json();
      setHasAdminRole(data.isAdmin);
    } catch (error) {
      setHasAdminRole(false);
    }
  };

  const handleAuthSuccess = () => {
    verifySession();
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/contacts');
      if (res.ok) {
        const data: Contacts = await res.json();
        setFormData({
          address: data.address || '',
          map_geo: data.map_geo || '',
          work_hours_main: data.work_hours_main || '',
          work_hours_sunday: data.work_hours_sunday || '',
          phone_number: data.phone_number || '',
          phone_number_sec: data.phone_number_sec || '',
          email: data.email || '',
        });
      }
    } catch (err) {
      showError('Ошибка загрузки контактов');
    } finally {
      setLoading(false);
    }
  };

  const handleGeocode = async () => {
    if (!searchAddress || searchAddress.trim().length === 0) {
      showError('Введите адрес для поиска координат');
      return;
    }

    setGeocoding(true);
    try {
      const res = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: searchAddress }),
      });

      if (res.ok) {
        const data = await res.json();
        setFormData({ ...formData, map_geo: data.coordinates });
        success(`Координаты найдены: ${data.coordinates}`);
      } else {
        const error = await res.json();
        showError(error.error || 'Адрес не найден');
      }
    } catch (err) {
      showError('Ошибка при поиске координат');
    } finally {
      setGeocoding(false);
    }
  };

  const handleSave = async () => {
    if (!formData.address || !formData.phone_number || !formData.email) {
      showError('Заполните обязательные поля');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/contacts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        success('Контакты успешно сохранены');
      } else {
        const error = await res.json();
        showError(error.error || 'Ошибка сохранения');
      }
    } catch (err) {
      showError('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (status === 'loading' || hasAdminRole === null || sessionLoading) {
    return <AdminAccessSkeleton />;
  }

  // Not admin - show 404
  if (status === 'unauthenticated' || !hasAdminRole) {
    return <NotFound />;
  }

  // Admin login form
  if (!sessionVerified) {
    return <AdminAuthForm onSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminMenu />

      <div className="flex-1 p-4 lg:p-8 overflow-auto">
        <div className="max-w-7xl">
          {loading ? (
            <AdminContactsSkeleton />
          ) : (
            <>
              {/* Header */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#18A36C]/10 rounded-xl flex items-center justify-center">
                    <Phone className="w-6 h-6 text-[#18A36C]" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">Контакты</h1>
                    <p className="text-gray-500">Редактирование контактной информации клиники</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#18A36C]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-6">
                    <MapPin className="w-5 h-5 text-[#18A36C]" />
                  </div>
                  <div className="flex-1">
                    <FormField label="Адрес" required>
                      <FormTextarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        rows={2}
                        placeholder="г. Минск, пр. Победителей, д. 119, пом. 504"
                      />
                    </FormField>
                  </div>
                </div>

                {/* Geocoding Search */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#18A36C]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-6">
                    <Search className="w-5 h-5 text-[#18A36C]" />
                  </div>
                  <div className="flex-1">
                    <FormField label="Поиск координат по адресу">
                      <div className="flex gap-2">
                        <FormInput
                          type="text"
                          value={searchAddress}
                          onChange={(e) => setSearchAddress(e.target.value)}
                          placeholder="Беларусь, Витебская область, г. Новополоцк, ул. Парковая, д. 16А"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleGeocode();
                            }
                          }}
                        />
                        <button
                          onClick={handleGeocode}
                          disabled={geocoding || !searchAddress}
                          className="px-4 py-2 bg-[#18A36C] hover:bg-[#15905f] disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
                          title="Автоматически найти координаты по введенному адресу"
                        >
                          {geocoding ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Поиск...
                            </>
                          ) : (
                            <>
                              <Search className="w-4 h-4" />
                              Найти
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Введите адрес в формате: Витебская область, Новополоцк, улица Парковая, 16А
                      </p>
                    </FormField>
                  </div>
                </div>

                {/* Map Geo */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-6">
                    <MapPin className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <FormField label="Координаты карты">
                      <FormInput
                        type="text"
                        value={formData.map_geo}
                        onChange={(e) => setFormData({ ...formData, map_geo: e.target.value })}
                        placeholder="53.9045,27.5615"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Координаты в формате: широта,долгота (автоматически заполняется при поиске)
                      </p>
                    </FormField>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-6">
                    <Clock className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Режим работы (Пн-Сб)">
                      <FormInput
                        type="text"
                        value={formData.work_hours_main}
                        onChange={(e) => setFormData({ ...formData, work_hours_main: e.target.value })}
                        placeholder="09:00-20:00"
                      />
                    </FormField>
                    <FormField label="Режим работы (Воскресенье)">
                      <FormInput
                        type="text"
                        value={formData.work_hours_sunday}
                        onChange={(e) => setFormData({ ...formData, work_hours_sunday: e.target.value })}
                        placeholder="10:00-18:00"
                      />
                    </FormField>
                  </div>
                </div>

                {/* Phones */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-6">
                    <Phone className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Основной телефон" required>
                      <FormInput
                        type="text"
                        value={formData.phone_number}
                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        placeholder="+375(29)161-01-01"
                      />
                    </FormField>
                    <FormField label="Дополнительный телефон">
                      <FormInput
                        type="text"
                        value={formData.phone_number_sec}
                        onChange={(e) => setFormData({ ...formData, phone_number_sec: e.target.value })}
                        placeholder="+375(29)162-02-02"
                      />
                    </FormField>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-6">
                    <Mail className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <FormField label="Email" required>
                      <FormInput
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="info@clinic.by"
                      />
                    </FormField>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full md:w-auto px-6 py-3 bg-[#18A36C] hover:bg-[#149259] disabled:bg-gray-300 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Сохранение...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Сохранить изменения
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
