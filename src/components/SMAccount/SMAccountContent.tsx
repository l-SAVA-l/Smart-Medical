import { useState, useEffect, useCallback } from "react";
import { useAppointmentsRealtime } from "@/hooks/useAppointmentsRealtime";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SMAppointmentCard, type AppointmentCardData } from './SMAppointmentCard';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../common/SMCard/SMCard";
import { Button } from "../common/SMButton/SMButton";
import { Input } from "../common/SMInput/SMInput";
import { Label } from "../common/SMLabel/SMLabel";
import { Checkbox } from "../common/SMCheckBox/SMCheckBox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../common/SMSelect/SMSelect";
import { Textarea } from "../common/SMTextarea/SMTextarea";
import { Badge } from "../common/SMBadge/SMBadge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../common/SMDialog/SMDialog";
import {
  CalendarDays,
  Mail,
  Settings2,
  FileText,
  MessageSquare,
  CheckCircle,
  ChevronRight,
  LogOut,
  User,
  Phone,
  Lock,
  AtSign,
  Edit3,
  Eye,
  Shield,
  Send,
  Clock,
  Loader2,
  ChevronDown,
  ChevronUp,
  Ban,
  Calendar,
} from "lucide-react";
import {
  accountData,
  subscriptionCategories,
} from "@/data/SMAccountData/SMAccountData";
import { ImageWithFallback } from "../SMImage/ImageWithFallback";
import { useRouter } from "../SMRouter/SMRouter";
import { useSession, signOut } from "next-auth/react";
import { ChangePasswordModal } from "./SMChangePasswordModal";
import { EditProfileModal } from "./SMEditProfileModal";
import { MaterialDetailModal, isNewMaterial } from "./SMMaterialDetailModal";
import { useAlert } from "../common/SMAlert/AlertProvider";
import { Pagination } from "../common/SMPagination/SMPagination";
import { useUrlPagination } from "@/hooks/useUrlPagination";
import {
  WelcomeDashboardSkeleton,
  MaterialsPageSkeleton,
  ContactSkeleton,
} from "./SMAccountSkeleton";
import { validateLetter } from "@/utils/validation";
import { openBookingModal } from "@/components/SMBookingModal/BookingModalProvider";

interface UserData {
  id: number;
  login: string;
  email: string;
  name: string;
  phone: string;
  registration_date: string;
  avatar_url?: string | null;
  role?: 'USER' | 'ADMIN';
  is_messages_blocked?: boolean;
}

interface Material {
  id: string;
  title: string;
  content: string;
  detailed_content?: string | null;
  image: string;
  date: string;
  dateRaw?: string;
  year: number;
}

interface LetterMessage {
  id: number;
  sender_type: 'patient' | 'chief_doctor';
  content: string;
  created_at: string;
  is_read: boolean;
}

interface Letter {
  id: number;
  subject: string;
  content: string;
  created_at: string;
  reply: string | null;
  replied_at: string | null;
  is_read: boolean;
  is_reply_read: boolean;
  has_new_patient_message?: boolean;
  messages?: LetterMessage[];
}

const MATERIALS_PER_PAGE = 6;

export function AccountContent() {
  const { navigate, currentRoute } = useRouter();
  const { data: session, status } = useSession();
  const alert = useAlert();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showMaterialDetailModal, setShowMaterialDetailModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialsTotal, setMaterialsTotal] = useState(0);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const pathParts = currentRoute.replace(/^\/+|\/+$/g, '').split('/');

  let sectionFromUrl = '';
  if (pathParts[0] === 'account') {
    sectionFromUrl = pathParts[1] || '';
  }

  const [activeSection, setActiveSection] = useState<string>(
    sectionFromUrl && ['appointments', 'materials', 'contact'].includes(sectionFromUrl)
      ? sectionFromUrl
      : ''
  );

  const [subscriptionSettings, setSubscriptionSettings] =
    useState(accountData.subscriptions.settings);
  const { currentPage: materialsPage, setPage: setMaterialsPage } = useUrlPagination(MATERIALS_PER_PAGE);
  const [contactForm, setContactForm] = useState(
    accountData.contact.form,
  );
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  // Letters state
  const [letters, setLetters] = useState<Letter[]>([]);
  const [lettersLoading, setLettersLoading] = useState(false);
  const [sendingLetter, setSendingLetter] = useState(false);
  const [expandedLetterId, setExpandedLetterId] = useState<number | null>(null);
  const [letterErrors, setLetterErrors] = useState<Record<string, string>>({});
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Appointments state
  type AppointmentItem = AppointmentCardData;
  const [appointmentsList, setAppointmentsList] = useState<AppointmentItem[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [cancellingAppointmentId, setCancellingAppointmentId] = useState<number | null>(null);
  const [sendingTalonEmailId, setSendingTalonEmailId] = useState<number | null>(null);
  const [emailConfigured, setEmailConfigured] = useState(true);

  const loadAppointments = useCallback(async (silent = false) => {
    if (!silent) setAppointmentsLoading(true);
    try {
      const res = await fetch('/api/appointments');
      if (res.ok) {
        const data = await res.json();
        setAppointmentsList(data.appointments || []);
      } else if (!silent) {
        setAppointmentsList([]);
      }
    } catch {
      if (!silent) setAppointmentsList([]);
    } finally {
      if (!silent) setAppointmentsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeSection === 'appointments' && session) {
      loadAppointments();
      fetch('/api/email/status')
        .then((r) => r.json())
        .then((d) => setEmailConfigured(Boolean(d.configured)))
        .catch(() => setEmailConfigured(false));
    }
  }, [activeSection, session, loadAppointments]);

  useAppointmentsRealtime({
    enabled: activeSection === 'appointments' && Boolean(session),
    mode: 'patient',
    onUpdate: () => loadAppointments(true),
  });

  // Validate letter field
  const validateLetterField = (field: 'subject' | 'content', value: string) => {
    const data = {
      subject: field === 'subject' ? value : contactForm.subject,
      content: field === 'content' ? value : contactForm.message,
    };

    if (field === 'subject') {
      if (!value || value.trim().length < 3) {
        setLetterErrors(prev => ({ ...prev, subject: 'Тема должна содержать минимум 3 символа' }));
        return false;
      } else if (value.length > 200) {
        setLetterErrors(prev => ({ ...prev, subject: 'Тема не должна превышать 200 символов' }));
        return false;
      }
    } else if (field === 'content') {
      if (!value || value.trim().length < 10) {
        setLetterErrors(prev => ({ ...prev, content: 'Сообщение должно содержать минимум 10 символов' }));
        return false;
      } else if (value.length > 5000) {
        setLetterErrors(prev => ({ ...prev, content: 'Сообщение не должно превышать 5000 символов' }));
        return false;
      }
    }

    setLetterErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
    return true;
  };

  // Load letters when contact section is active
  const loadLetters = async () => {
    setLettersLoading(true);
    try {
      const response = await fetch('/api/letters');
      if (response.ok) {
        const data = await response.json();
        setLetters(data);
      }
    } catch (error) {
    } finally {
      setLettersLoading(false);
    }
  };

  const sendTalonEmail = async (appointmentId: number, email: string) => {
    setSendingTalonEmailId(appointmentId);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/send-talon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        alert.success(data.message || `Талон отправлен на ${data.sentTo}`, 'Почта');
      } else {
        alert.error(data.error || 'Не удалось отправить талон', 'Ошибка');
      }
    } catch {
      alert.error('Ошибка отправки на почту', 'Ошибка');
    } finally {
      setSendingTalonEmailId(null);
    }
  };

  const downloadTalon = async (a: AppointmentItem) => {
    // Создаем временный элемент для рендеринга талона
    const element = document.createElement('div');
    element.style.padding = '40px';
    element.style.width = '400px';
    element.style.background = '#fff';
    element.style.position = 'absolute';
    element.style.left = '-9999px'; // Прячем за экран
  
    // Верстка талона (шаблон)
    element.innerHTML = `
      <div style="font-family: Arial, sans-serif; border: 2px solid #18A36C; padding: 20px; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #18A36C; margin: 0;">ТАЛОН НА ПРИЕМ</h1>
          <p style="color: #666;">Номер записи: #${a.id}</p>
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong style="color: #888; text-transform: uppercase; font-size: 12px;">Специалист</strong>
          <div style="font-size: 18px; font-weight: bold;">${a.specialist.name}</div>
          <div style="color: #444;">${a.specialist.specialization}</div>
        </div>
  
        <div style="margin-bottom: 15px;">
          <strong style="color: #888; text-transform: uppercase; font-size: 12px;">Услуга</strong>
          <div style="font-size: 16px;">${a.service?.title || 'Консультация'}</div>
        </div>
  
        <div style="display: flex; justify-content: space-between; border-top: 1px solid #eee; pt: 15px; margin-top: 20px; padding-top: 15px;">
          <div>
            <strong style="color: #888; text-transform: uppercase; font-size: 12px;">Дата</strong>
            <div style="font-size: 16px; font-weight: bold;">
              ${new Date(a.scheduled_at).toLocaleDateString('ru-RU')}
            </div>
          </div>
          <div>
            <strong style="color: #888; text-transform: uppercase; font-size: 12px;">Время</strong>
            <div style="font-size: 16px; font-weight: bold;">
              ${new Date(a.scheduled_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
  
        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #999;">
          <p>Пожалуйста, предъявите данный талон при посещении.<br/>Приходите за 10 минут до начала приема.</p>
        </div>
        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #999;">
          <p>Г.Минск, ул. Пушкина, 123</p>
        </div>
      </div>
    `;
  
    document.body.appendChild(element);
  
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });
  
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`Talon_${a.id}_${a.specialist.name.replace(/\s/g, '_')}.pdf`);
    } catch (error) {
      console.error('Ошибка при генерации PDF:', error);
    } finally {
      document.body.removeChild(element); // Удаляем временный элемент
    }
  };

  useEffect(() => {
    if (activeSection === 'contact' && session) {
      loadLetters();
    }
  }, [activeSection, session]);

  // Mark reply as read when letter is expanded
  const markReplyAsRead = async (letterId: number) => {
    try {
      await fetch(`/api/letters/${letterId}`, { method: 'PATCH' });
      setLetters(prev => prev.map(l =>
        l.id === letterId ? { ...l, is_reply_read: true } : l
      ));

      // Очищаем уведомление из localStorage после прочтения
      const { clearLetterNotification } = await import('@/utils/letterNotifications');
      clearLetterNotification(letterId);
    } catch (error) {
    }
  };

  // Send reply message in thread
  const sendReplyMessage = async (letterId: number) => {
    if (!replyMessage.trim() || replyMessage.trim().length < 10) {
      alert.error('Сообщение должно содержать минимум 10 символов', 'Ошибка');
      return;
    }

    setSendingReply(true);
    try {
      const response = await fetch(`/api/letters/${letterId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyMessage }),
      });

      if (response.ok) {
        alert.success('Сообщение отправлено', 'Успех');
        setReplyMessage('');
        await loadLetters(); // Reload to get updated messages
      } else {
        const data = await response.json();
        alert.error(data.error || 'Ошибка при отправке сообщения', 'Ошибка');
      }
    } catch (error) {
      alert.error('Ошибка при отправке сообщения', 'Ошибка');
    } finally {
      setSendingReply(false);
    }
  };

  // Обновляем email в настройках подписки, когда загружаются данные пользователя
  useEffect(() => {
    if (user?.email) {
      setSubscriptionSettings(prev => ({
        ...prev,
        email: user.email,
      }));
    }
  }, [user]);

  // Загружаем материалы из API
  useEffect(() => {
    const fetchMaterials = async () => {
      setMaterialsLoading(true);
      try {
        const params = new URLSearchParams({
          page: materialsPage.toString(),
          limit: MATERIALS_PER_PAGE.toString(),
        });
        const response = await fetch(`/api/materials?${params}`);
        if (response.ok) {
          const data = await response.json();
          setMaterials(data.materials);
          setMaterialsTotal(data.pagination?.total || 0);
          // Smooth scroll to top on page change
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          alert.error("Не удалось загрузить материалы", "Ошибка загрузки");
        }
      } catch (error) {
        alert.error("Произошла ошибка при загрузке материалов", "Ошибка");
      } finally {
        setMaterialsLoading(false);
      }
    };

    fetchMaterials();
  }, [materialsPage, alert]);

  useEffect(() => {
    if (sectionFromUrl && ['appointments', 'materials', 'contact'].includes(sectionFromUrl)) {
      setActiveSection(sectionFromUrl);
    } else {
      setActiveSection('');
    }
  }, [sectionFromUrl]);

  useEffect(() => {
    if (status === "authenticated" && session) {
      fetchUserData();
    } else if (status === "unauthenticated") {
      setIsLoading(false);
    }
  }, [status, session]);

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      // Silently handle error - user data is optional
    } finally {
      setIsLoading(false);
    }
  };

  // Получаем имя пользователя из данных пользователя
  // Формат имени в БД: "Фамилия Имя Отчество"
  const getUserName = () => {
    // Если пользователь загружен и есть имя
    if (user?.name && user.name.trim()) {
      const nameParts = user.name.trim().split(" ").filter(part => part.length > 0);
      // Фамилия Имя Отчество -> lastName firstName middleName
      const lastName = nameParts[0] || "";
      const firstName = nameParts[1] || "";
      const middleName = nameParts[2] || "";

      return {
        firstName: firstName || lastName, // Если имени нет, используем фамилию
        lastName: lastName,
        middleName: middleName,
        fullName: user.name,
        name: user.name,
        email: user.email || "",
        avatarUrl: user.avatar_url || null,
      };
    }

    // Если пользователь загружен, но имени нет - используем логин или email
    if (user) {
      const displayName = user.login || user.email || "Пользователь";
      return {
        firstName: displayName,
        lastName: "",
        middleName: "",
        fullName: displayName,
        name: displayName,
        email: user.email || "",
        avatarUrl: user.avatar_url || null,
      };
    }

    // Если пользователь еще не загружен - возвращаем пустые значения
    return {
      firstName: "",
      lastName: "",
      middleName: "",
      fullName: "",
      name: "",
      email: "",
      avatarUrl: null,
    };
  };

  const displayUser = getUserName();

  // Получаем инициалы для аватара (первая буква имени + первая буква фамилии)
  const getInitials = () => {
    // В формате "Фамилия Имя Отчество": firstName = Имя, lastName = Фамилия
    // Отображаем: первая буква Имени + первая буква Фамилии
    if (displayUser.firstName && displayUser.lastName) {
      return `${displayUser.firstName[0]}${displayUser.lastName[0]}`.toUpperCase();
    }
    if (displayUser.firstName) {
      return displayUser.firstName[0].toUpperCase();
    }
    if (displayUser.lastName) {
      return displayUser.lastName[0].toUpperCase();
    }
    return "U";
  };

  // Обработчик обновления профиля
  const handleProfileUpdate = (updatedUser: UserData) => {
    setUser(updatedUser);
  };

  // Обработчик открытия деталей материала
  const handleMaterialClick = (material: Material) => {
    setSelectedMaterial(material);
    setShowMaterialDetailModal(true);
  };

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutDialog(false);
    await signOut({
      callbackUrl: "/",
      redirect: true
    });
  };

  const handleSubscriptionSubmit = () => {
    setSubmitStatus("success");
    setTimeout(() => setSubmitStatus("idle"), 3000);
  };

  const handleReset = () => {
    setSubscriptionSettings(accountData.subscriptions.settings);
  };

  const handleContactSubmit = async () => {
    setSendingLetter(true);
    try {
      const response = await fetch('/api/letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: contactForm.subject,
          content: contactForm.message,
        }),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setContactForm({ name: "", subject: "", message: "" });
        await loadLetters(); // Reload letters to show the new one
        alert.success('Письмо успешно отправлено главному врачу', 'Отправлено');
        setTimeout(() => setSubmitStatus("idle"), 3000);
      } else {
        const error = await response.json();
        alert.error(error.error || 'Ошибка при отправке письма', 'Ошибка');
        setSubmitStatus("error");
      }
    } catch (error) {
      alert.error('Произошла ошибка при отправке письма', 'Ошибка');
      setSubmitStatus("error");
    } finally {
      setSendingLetter(false);
    }
  };

  const filteredMaterials = materials;

  const renderSubscriptions = () => (
    <div className="p-3 sm:p-4 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6" >
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#18A36C] rounded-lg flex items-center justify-center flex-shrink-0">
            <Settings2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl text-gray-800">
              Настройки подписки
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Управляйте вашими подписками и уведомлениями
            </p>
          </div>
        </div>
      </div>

      <Card className="border border-gray-200">
        <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 text-sm sm:text-base">
              Ваша почта
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="Введите email"
                value={subscriptionSettings.email}
                onChange={(e) =>
                  setSubscriptionSettings({
                    ...subscriptionSettings,
                    email: e.target.value,
                  })
                }
                className="pl-10 border-gray-300"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-gray-700 text-sm sm:text-base">
              Рубрики подписки
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {subscriptionCategories.map((category) => (
                <div
                  key={category}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={category}
                    checked={subscriptionSettings.categories.includes(
                      category,
                    )}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSubscriptionSettings({
                          ...subscriptionSettings,
                          categories: [
                            ...subscriptionSettings.categories,
                            category,
                          ],
                        });
                      } else {
                        setSubscriptionSettings({
                          ...subscriptionSettings,
                          categories:
                            subscriptionSettings.categories.filter(
                              (c) => c !== category,
                            ),
                        });
                      }
                    }}
                  />
                  <Label
                    htmlFor={category}
                    className="text-sm text-gray-700"
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700 text-sm sm:text-base">
              Предпочтительный формат
            </Label>
            <Select
              value={subscriptionSettings.format}
              onValueChange={(value: "text" | "html") =>
                setSubscriptionSettings({
                  ...subscriptionSettings,
                  format: value,
                })
              }
            >
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Выберите формат" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Текст</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="agreement"
              checked={subscriptionSettings.agreed}
              onCheckedChange={(checked) =>
                setSubscriptionSettings({
                  ...subscriptionSettings,
                  agreed: checked === true,
                })
              }
            />
            <Label
              htmlFor="agreement"
              className="text-sm text-gray-700"
            >
              Я согласен на обработку персональных данных
            </Label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              onClick={handleSubscriptionSubmit}
              disabled={!subscriptionSettings.agreed}
              className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white w-full sm:w-auto"
            >
              Добавить
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="border-gray-300 text-gray-700 w-full sm:w-auto"
            >
              Сброс
            </Button>
          </div>

          {submitStatus === "success" && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">
                Настройки успешно сохранены!
              </span>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-600">
              После добавления или изменения адреса подписки вам
              будет выслан код подтверждения. Подписка будет не
              активной до ввода кода подтверждения.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMaterials = () => (
    <div className="p-3 sm:p-4 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#18A36C] rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl text-gray-800">
              Материалы
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Полезные материалы и информация для пациентов
            </p>
          </div>
        </div>
      </div>

      {materialsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border border-gray-200">
              {/* Image skeleton */}
              <div className="w-full h-40 sm:h-48 bg-gray-200 animate-pulse rounded-t-lg" />

              <CardContent className="p-4 sm:p-6">
                {/* Title skeleton */}
                <div className="h-5 sm:h-6 bg-gray-200 rounded animate-pulse mb-2 w-3/4" />

                {/* Content skeleton */}
                <div className="space-y-2 mb-3 sm:mb-4">
                  <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-full" />
                  <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-5/6" />
                  <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-4/6" />
                </div>

                {/* Footer skeleton */}
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredMaterials.map((item) => (
                <Card
                  key={item.id}
                  className="group hover:shadow-lg transition-all duration-300 border border-gray-200"
                >
                  <div className="relative overflow-hidden rounded-t-lg">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.title}
                      className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {isNewMaterial(item.dateRaw) && (
                      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex flex-wrap gap-1 sm:gap-2">
                        <Badge className="bg-orange-500 text-white text-xs">
                          Новое
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg text-gray-800 mb-2 group-hover:text-[#18A36C] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-3">
                      {item.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500">
                        <CalendarDays className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{item.date}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMaterialClick(item)}
                        className="text-[#18A36C] hover:text-[#18A36C]/80 hover:bg-[#18A36C]/10 text-xs sm:text-sm px-2 sm:px-3"
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        Подробнее
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {/* Pagination for materials */}
          {materialsTotal > MATERIALS_PER_PAGE && (
            <Pagination
              currentPage={materialsPage}
              totalPages={Math.ceil(materialsTotal / MATERIALS_PER_PAGE)}
              onPageChange={setMaterialsPage}
              className="mt-8"
            />
          )}
        </>
      )}

      {!materialsLoading && filteredMaterials.length === 0 && (
        <div className="text-center py-12 sm:py-16 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
          </div>
          <h3 className="text-lg sm:text-xl text-gray-800 mb-2">
            {materials.length === 0 ? 'Материалы отсутствуют' : 'Материалы не найдены'}
          </h3>
          <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto">
            {materials.length === 0
              ? 'В данный момент нет доступных материалов. Они появятся здесь, как только будут опубликованы.'
              : 'В выбранном периоде нет доступных материалов. Попробуйте выбрать другой период.'}
          </p>
        </div>
      )}

      {/* Material Detail Modal */}
      <MaterialDetailModal
        isOpen={showMaterialDetailModal}
        onClose={() => {
          setShowMaterialDetailModal(false);
          setSelectedMaterial(null);
        }}
        material={selectedMaterial}
      />
    </div>
  );

  const renderContact = () => (
    <div className="p-3 sm:p-4 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#18A36C] rounded-lg flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl text-gray-800">
              Написать глав.врачу
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Свяжитесь с руководством клиники
            </p>
          </div>
        </div>
      </div>

      {/* Blocked user warning */}
      {user?.is_messages_blocked && (
        <Card className="border border-red-200 bg-red-50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Ban className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-red-800 font-medium text-sm sm:text-base">Отправка сообщений заблокирована</h3>
                <p className="text-red-600 text-xs sm:text-sm">
                  Вы не можете отправлять письма главному врачу. Если вы считаете, что это ошибка, обратитесь в клинику по телефону.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Send new letter form */}
      {!user?.is_messages_blocked && (
        <Card className="border border-gray-200">
          <CardContent className="p-6 space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                {accountData.contact.description}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="subject"
                  className="text-gray-700"
                >
                  Тема письма <span className="text-gray-400 text-xs">(мин. 3 символа)</span>
                </Label>
                <Input
                  id="subject"
                  type="text"
                  placeholder="Тема сообщения"
                  value={contactForm.subject}
                  onChange={(e) =>
                    setContactForm({
                      ...contactForm,
                      subject: e.target.value,
                    })
                  }
                  onBlur={() => validateLetterField('subject', contactForm.subject)}
                  className={`border-gray-300 ${letterErrors.subject ? 'border-red-500' : ''}`}
                />
                {letterErrors.subject && (
                  <p className="text-red-500 text-xs">{letterErrors.subject}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="message"
                  className="text-gray-700"
                >
                  Сообщение <span className="text-gray-400 text-xs">(мин. 10 символов)</span>
                </Label>
                <Textarea
                  id="message"
                  placeholder="Ваше сообщение главному врачу..."
                  rows={6}
                  value={contactForm.message}
                  onChange={(e) =>
                    setContactForm({
                      ...contactForm,
                      message: e.target.value,
                    })
                  }
                  onBlur={() => validateLetterField('content', contactForm.message)}
                  className={`border-gray-200 focus:border-[#18A36C] focus:ring-[#18A36C] focus:border-1${letterErrors.content ? 'border-red-500' : ''}`}
                />
                {letterErrors.content && (
                  <p className="text-red-500 text-xs">{letterErrors.content}</p>
                )}
                <p className="text-xs text-gray-400 text-right">
                  {contactForm.message.length}/5000
                </p>
              </div>
            </div>

            <Button
              onClick={handleContactSubmit}
              className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white cursor-pointer"
              disabled={
                sendingLetter ||
                !contactForm.subject ||
                !contactForm.message ||
                contactForm.subject.trim().length < 3 ||
                contactForm.message.trim().length < 10 ||
                Object.keys(letterErrors).length > 0
              }
            >
              {sendingLetter ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Отправка...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Отправить письмо
                </>
              )}
            </Button>

            {submitStatus === "success" && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">
                  Письмо успешно отправлено!
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Letters history */}
      <div className="space-y-3 sm:space-y-4">
        <h3 className="text-base sm:text-lg text-gray-800 font-medium flex flex-wrap items-center gap-2">
          <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#18A36C]" />
          Мои письма
          {letters.filter(l => l.reply && !l.is_reply_read).length > 0 && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
              {letters.filter(l => l.reply && !l.is_reply_read).length} новых
            </span>
          )}
        </h3>

        {lettersLoading ? (
          <div className="text-center py-6 sm:py-8">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-[#18A36C] mx-auto" />
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Загрузка писем...</p>
          </div>
        ) : letters.length === 0 ? (
          <Card className="border border-gray-200">
            <CardContent className="p-6 sm:p-8 text-center">
              <Mail className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm sm:text-base">У вас пока нет отправленных писем</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {letters.map((letter) => (
              <Card
                key={letter.id}
                className={`border transition-all duration-200 ${letter.reply && !letter.is_reply_read
                  ? 'border-[#18A36C] bg-[#18A36C]/5'
                  : 'border-gray-200'
                  }`}
              >
                <CardContent className="p-3 sm:p-4">
                  {/* Letter header */}
                  <div
                    className="flex items-start sm:items-center justify-between cursor-pointer gap-2"
                    onClick={() => {
                      if (expandedLetterId === letter.id) {
                        setExpandedLetterId(null);
                      } else {
                        setExpandedLetterId(letter.id);
                        if (letter.reply && !letter.is_reply_read) {
                          markReplyAsRead(letter.id);
                        }
                      }
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                        <h4 className="font-medium text-gray-800 text-sm sm:text-base truncate max-w-[150px] sm:max-w-none">
                          {letter.subject}
                        </h4>
                        {letter.reply ? (
                          <Badge className="bg-[#18A36C] text-white text-xs">
                            Ответ
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500 text-white text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span className="hidden sm:inline">Ожидает</span>
                          </Badge>
                        )}
                        {letter.reply && !letter.is_reply_read && (
                          <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {new Date(letter.created_at).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="p-1 sm:p-2 flex-shrink-0">
                      {expandedLetterId === letter.id ? (
                        <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      )}
                    </Button>
                  </div>

                  {/* Expanded content */}
                  {expandedLetterId === letter.id && (
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 space-y-3 sm:space-y-4">
                      {/* Original message */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1 sm:mb-2 font-medium">Ваше письмо:</p>
                        <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                          <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap">
                            {letter.content}
                          </p>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(letter.created_at).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      {/* First reply from chief doctor - always show if exists */}
                      {letter.reply && (
                        <div>
                          <p className="text-xs text-[#18A36C] mb-1 sm:mb-2 font-medium flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Ответ главного врача
                          </p>
                          <div className="bg-[#18A36C]/10 rounded-lg p-2 sm:p-3 border border-[#18A36C]/20">
                            <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap">
                              {letter.reply}
                            </p>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {letter.replied_at && new Date(letter.replied_at).toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      )}

                      {/* Thread messages */}
                      {letter.messages && letter.messages.map((msg) => (
                        <div key={msg.id}>
                          <p className={`text-xs mb-1 sm:mb-2 font-medium flex items-center gap-1 ${msg.sender_type === 'chief_doctor' ? 'text-[#18A36C]' : 'text-gray-500'}`}>
                            {msg.sender_type === 'chief_doctor' ? (
                              <>
                                <CheckCircle className="w-3 h-3" />
                                Ответ главного врача
                              </>
                            ) : (
                              'Ваше сообщение'
                            )}
                          </p>
                          <div className={`rounded-lg p-2 sm:p-3 ${msg.sender_type === 'chief_doctor' ? 'bg-[#18A36C]/10 border border-[#18A36C]/20' : 'bg-gray-50'}`}>
                            <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap">
                              {msg.content}
                            </p>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(msg.created_at).toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      ))}

                      {/* Reply form - only if chief doctor has responded and user is not blocked */}
                      {letter.reply && !user?.is_messages_blocked && (
                        <div className="pt-3 sm:pt-4 border-t border-gray-200">
                          <p className="text-xs text-gray-500 mb-1 sm:mb-2 font-medium">Продолжить переписку:</p>
                          <Textarea
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            placeholder="Напишите ваш ответ..."
                            className="min-h-[70px] sm:min-h-[80px] text-xs sm:text-sm border-gray-200 focus:border-[#18A36C] focus:ring-[#18A36C] focus:border-1"
                          />
                          <div className="flex justify-end mt-2">
                            <Button
                              onClick={() => sendReplyMessage(letter.id)}
                              disabled={sendingReply || !replyMessage.trim()}
                              className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white w-full sm:w-auto text-sm"
                            >
                              {sendingReply ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Отправка...
                                </>
                              ) : (
                                <>
                                  <Send className="w-4 h-4 mr-2" />
                                  Отправить
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                      {/* Show blocked message in thread if user is blocked */}
                      {letter.reply && user?.is_messages_blocked && (
                        <div className="pt-3 sm:pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-2 sm:p-3 rounded-lg">
                            <Ban className="w-4 h-4 flex-shrink-0" />
                            <span className="text-xs sm:text-sm">Отправка сообщений заблокирована</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div className="p-3 sm:p-4 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      <div className="bg-gradient-to-br from-[#18A36C]/15 via-white to-white border border-[#18A36C]/20 rounded-xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#18A36C] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-[#18A36C]/25">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Мои записи</h2>
              <p className="text-sm sm:text-base text-gray-600">
                {appointmentsLoading
                  ? 'Загрузка…'
                  : appointmentsList.length > 0
                    ? `${appointmentsList.length} ${appointmentsList.length === 1 ? 'запись' : appointmentsList.length < 5 ? 'записи' : 'записей'}`
                    : 'Записи на приём к специалистам'}
              </p>
            </div>
          </div>
          <Button
            onClick={openBookingModal}
            className="w-full sm:w-auto bg-[#18A36C] hover:bg-[#18A36C]/90 text-white rounded-xl shadow-sm"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Новая запись
          </Button>
        </div>
      </div>

      {appointmentsLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#18A36C]" />
          <p className="text-gray-600 mt-2">Загрузка записей...</p>
        </div>
      ) : appointmentsList.length === 0 ? (
        <Card className="border border-dashed border-[#18A36C]/30 bg-gradient-to-br from-[#18A36C]/5 to-white rounded-xl">
          <CardContent className="p-8 sm:p-10 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[#18A36C]/10 flex items-center justify-center">
              <Calendar className="w-7 h-7 text-[#18A36C]" />
            </div>
            <p className="text-gray-700 font-medium mb-1">Пока нет записей</p>
            <p className="text-gray-500 text-sm mb-5">Запишитесь к специалисту онлайн за пару минут</p>
            <Button onClick={openBookingModal} className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white rounded-xl">
              Записаться
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {appointmentsList.map((a) => (
            <SMAppointmentCard
              key={a.id}
              appointment={a}
              cancelling={cancellingAppointmentId === a.id}
              sendingEmail={sendingTalonEmailId === a.id}
              emailEnabled={emailConfigured}
              accountEmail={user?.email || session?.user?.email || ''}
              onDownloadTalon={downloadTalon}
              onSendTalonEmail={sendTalonEmail}
              onCancel={async (id) => {
                if (!confirm('Отменить запись?')) return;
                setCancellingAppointmentId(id);
                try {
                  const res = await fetch(`/api/appointments/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'cancelled' }),
                  });
                  if (res.ok) {
                    alert.success('Запись отменена', 'Успех');
                    await loadAppointments();
                  } else {
                    const d = await res.json();
                    alert.error(d.error || 'Ошибка отмены', 'Ошибка');
                  }
                } catch {
                  alert.error('Ошибка отмены записи', 'Ошибка');
                } finally {
                  setCancellingAppointmentId(null);
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );

  // Modern Welcome Dashboard
  const renderWelcomeDashboard = () => (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
      {/* Welcome Hero Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-8 lg:p-12 mb-6 sm:mb-12">
        <div className="text-center lg:text-left">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Avatar and Welcome Text */}
            <div className="flex-1">
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
                <div className="w-20 h-20 lg:w-24 lg:h-24 aspect-square bg-[#18A36C] rounded-full flex items-center justify-center overflow-hidden border-4 border-gray-100 shadow-lg flex-shrink-0">
                  {displayUser.avatarUrl ? (
                    <img
                      src={displayUser.avatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-3xl text-white font-medium">
                      {getInitials()}
                    </span>
                  )}
                </div>

                <div className="text-center lg:text-left">
                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2 sm:gap-3 mb-2">
                    <h1 className="text-xl sm:text-2xl lg:text-4xl text-gray-800">
                      Добро пожаловать, {displayUser.firstName || "Пользователь"}!
                    </h1>
                    {user?.role === 'ADMIN' && (
                      <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-[#18A36C] text-white text-xs sm:text-sm rounded-full">
                        <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                        Админ
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                    Ваш персональный медицинский помощник
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Information Section */}
      <div className="mb-12">
        <Card className="border border-gray-200">
          <CardHeader className="border-b border-gray-200 bg-gray-50 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#18A36C] rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl text-gray-800">
                    Информация профиля
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 hidden sm:block">
                    Ваши личные данные и настройки безопасности
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowEditProfileModal(true)}
                variant="outline"
                size="sm"
                className="border-[#18A36C] text-[#18A36C] w-full sm:w-auto hover:shadow-lg hover:shadow-[#18A36C]/20"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Редактировать
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Login */}
              <div className="space-y-2">
                <Label className="text-gray-600 text-sm flex items-center gap-2">
                  <AtSign className="w-4 h-4 text-[#18A36C]" />
                  Логин
                </Label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-800 font-medium">
                    {user?.login || 'Не указан'}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="text-gray-600 text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#18A36C]" />
                  Email
                </Label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-800 font-medium">
                    {user?.email || 'Не указан'}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label className="text-gray-600 text-sm flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#18A36C]" />
                  Телефон
                </Label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-800 font-medium">
                    {user?.phone || 'Не указан'}
                  </p>
                </div>
              </div>

              {/* Registration Date */}
              <div className="space-y-2">
                <Label className="text-gray-600 text-sm flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-[#18A36C]" />
                  Дата регистрации
                </Label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-800 font-medium">
                    {user?.registration_date
                      ? new Date(user.registration_date).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                      : 'Не указана'
                    }
                  </p>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-gray-600 text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-[#18A36C]" />
                  Полное имя
                </Label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-800 font-medium">
                    {user?.name || 'Не указано'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
        <Card
          className="group cursor-pointer hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-[#18A36C]"
          onClick={() => navigate("/account/appointments")}
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#18A36C] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg text-gray-800 mb-0.5 sm:mb-1">
                  Записи
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Мои записи на приём
                </p>
              </div>
            </div>
            <div className="flex items-center text-xs sm:text-sm text-[#18A36C]">
              <span>Перейти к записям</span>
              <ChevronRight className="w-4 h-4 ml-[2.5px] group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="group cursor-pointer hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-[#18A36C]"
          onClick={() => navigate("/account/materials")}
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#18A36C] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg text-gray-800 mb-0.5 sm:mb-1">
                  Материалы
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Специальные предложения
                </p>
              </div>
            </div>
            <div className="flex items-center text-xs sm:text-sm text-[#18A36C]">
              <span>Просмотреть материалы</span>
              <ChevronRight className="w-4 h-4 ml-[2.5px] group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="group cursor-pointer hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-[#18A36C]"
          onClick={() => navigate("/account/contact")}
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#18A36C] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg text-gray-800 mb-0.5 sm:mb-1">
                  Связаться с главным врачом
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Написать главврачу
                </p>
              </div>
            </div>
            <div className="flex items-center text-xs sm:text-sm text-[#18A36C]">
              <span>Отправить сообщение</span>
              <ChevronRight className="w-4 h-4 ml-[2.5px] group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Materials Preview */}
      <div className="mb-8 sm:mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl lg:text-2xl text-gray-800">
            Последние материалы
          </h2>
          {materials.length > 0 && (
            <Button
              variant="outline"
              onClick={() => navigate("/account/materials")}
              className="text-[#18A36C] border-[#18A36C] hover:bg-[#18A36C] hover:text-white w-full sm:w-auto hover:shadow-lg hover:shadow-[#18A36C]/20"
            >
              Смотреть все
              <ChevronRight className="w-4 h-4 ml-[2.5px]" />
            </Button>
          )}
        </div>

        {materials.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl text-gray-800 mb-2">
              Материалы отсутствуют
            </h3>
            <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto">
              В данный момент нет доступных материалов. Они появятся здесь, как только будут опубликованы.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {materials
              .slice(0, 3)
              .map((item) => (
              <Card
                key={item.id}
                className="group hover:shadow-lg transition-all duration-300 border border-gray-200"
              >
                <div className="relative overflow-hidden rounded-t-lg">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.title}
                    className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex gap-1 sm:gap-2">
                    {isNewMaterial(item.dateRaw) && (
                      <Badge className="bg-orange-500 text-white text-xs">
                        Новое
                      </Badge>
                    )}
                  </div>
                </div>
                <CardContent className="p-3 sm:p-4">
                  <h3 className="text-base sm:text-lg text-gray-800 mb-2 group-hover:text-[#18A36C] transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2">
                    {item.content}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-500">
                      <CalendarDays className="w-3 h-3" />
                      <span>{item.date}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMaterialClick(item)}
                      className="text-[#18A36C] hover:text-[#18A36C]/80 hover:bg-[#18A36C]/10 p-1 sm:p-2 text-xs sm:text-sm"
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Подробнее
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Profile Management */}
      <Card className="border border-gray-200">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left w-full lg:w-auto">
              <div className="w-14 h-14 sm:w-16 sm:h-16 aspect-square bg-[#18A36C] rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-100 shadow-md flex-shrink-0">
                {displayUser.avatarUrl ? (
                  <img
                    src={displayUser.avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-lg sm:text-xl text-white font-medium">
                    {getInitials()}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-base sm:text-xl text-gray-800 mb-0.5 sm:mb-1">
                  {displayUser.fullName || displayUser.name || "Пользователь"}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-0.5 sm:mb-1">
                  {displayUser.email || "Email не указан"}
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  {user?.registration_date
                    ? `Участник с ${new Date(user.registration_date).getFullYear()} года`
                    : "Участник"}
                </p>
              </div>
            </div>
            <div className="flex flex-col w-full sm:w-auto sm:flex-row gap-2 sm:gap-3">
              <Button
                onClick={() => setShowEditProfileModal(true)}
                variant="outline"
                className="text-gray-700 border-gray-300 w-full sm:w-auto text-sm"
              >
                <Edit3 className="w-4 h-4 mr-[2.5px]" />
                Редактировать
              </Button>
              <Button
                onClick={() => setShowChangePasswordModal(true)}
                variant="outline"
                className="text-[#18A36C] border-[#18A36C] hover:bg-[#18A36C] hover:text-white w-full sm:w-auto text-sm hover:shadow-lg hover:shadow-[#18A36C]/20"
              >
                <Lock className="w-4 h-4 mr-[2.5px]" />
                Пароль
              </Button>
              <Button
                onClick={handleLogoutClick}
                variant="outline"
                className="text-red-600 border-red-300 w-full sm:w-auto text-sm"
              >
                <LogOut className="w-4 h-4 mr-[2.5px]" />
                Выйти
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-md border-0">
          <DialogHeader>
            <DialogTitle className="text-xl text-[#2E2E2E]">
              Подтверждение выхода
            </DialogTitle>
            <DialogDescription className="text-gray-600 pt-2">
              Вы уверены, что хотите выйти из аккаунта?
              <br />
              Вам потребуется войти снова для доступа к личному кабинету.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
              className="w-full sm:w-auto border-gray-300 text-[#2E2E2E]"
            >
              Отмена
            </Button>
            <Button
              onClick={handleLogoutConfirm}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Выйти
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        user={user}
        onProfileUpdate={handleProfileUpdate}
      />

      {/* Material Detail Modal */}
      <MaterialDetailModal
        isOpen={showMaterialDetailModal}
        onClose={() => {
          setShowMaterialDetailModal(false);
          setSelectedMaterial(null);
        }}
        material={selectedMaterial}
      />
    </div>
  );

  // Show skeleton during initial loading
  if (isLoading) {
    if (activeSection === "materials") {
      return <MaterialsPageSkeleton />;
    }
    if (activeSection === "contact") {
      return <ContactSkeleton />;
    }
    return <WelcomeDashboardSkeleton />;
  }

  // Render based on activeSection
  if (activeSection === "appointments") {
    return renderAppointments();
  }
  if (activeSection === "materials") {
    return renderMaterials();
  }
  if (activeSection === "contact") {
    return renderContact();
  }
  // Default: show welcome dashboard
  return renderWelcomeDashboard();
}