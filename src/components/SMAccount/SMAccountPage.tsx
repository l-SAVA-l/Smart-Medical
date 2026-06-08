"use client";

import { motion } from "framer-motion";
import {
  User,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "../common/SMButton/SMButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../common/SMTabs/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../common/SMCard/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../common/SMDialog/SMDialog";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface UserData {
  id: number;
  login: string;
  email: string;
  name: string;
  phone: string;
  registration_date: string;
}

export function SMAccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (status === "authenticated" && session) {
      fetchUserData();
    }
  }, [status, session, router]);

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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

  const appointments = [
    {
      id: 1,
      doctor: "Петрова Анна Сергеевна",
      specialty: "Терапевт",
      date: "2025-11-05",
      time: "10:00",
      status: "confirmed",
    },
    {
      id: 2,
      doctor: "Сидоров Петр Иванович",
      specialty: "Кардиолог",
      date: "2025-10-25",
      time: "14:30",
      status: "completed",
    },
  ];

  const documents = [
    {
      id: 1,
      name: "Результаты анализа крови",
      date: "2025-10-20",
      type: "Анализ",
    },
    {
      id: 2,
      name: "Заключение терапевта",
      date: "2025-10-15",
      type: "Заключение",
    },
  ];

  if (isLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#18A36C] mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка данных...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12 max-w-7xl">
      <motion.div
        className="bg-[#18A36C] rounded-lg p-8 lg:p-12 mb-10 lg:mb-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-20 h-20 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-6">
          <User className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl lg:text-4xl text-white mb-4">Личный кабинет</h1>
        <p className="text-white/90 leading-relaxed text-base lg:text-lg max-w-3xl mx-auto">
          Управляйте своими записями, просматривайте документы и историю посещений
        </p>
      </motion.div>

      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-2 bg-white rounded-lg gap-2">
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-[#18A36C] data-[state=active]:text-white data-[state=active]:border-[#18A36C] data-[state=inactive]:text-[#2E2E2E] data-[state=inactive]:hover:text-[#18A36C] data-[state=inactive]:hover:bg-[#18A36C]/5 data-[state=inactive]:hover:border-[#18A36C] data-[state=inactive]:border-2 data-[state=inactive]:border-gray-300 transition-all duration-300 rounded-lg py-3 px-4"
          >
            Профиль
            <User className="w-5 h-5 ml-[2.5px]" />
          </TabsTrigger>
          <TabsTrigger
            value="appointments"
            className="data-[state=active]:bg-[#18A36C] data-[state=active]:text-white data-[state=active]:border-[#18A36C] data-[state=inactive]:text-[#2E2E2E] data-[state=inactive]:hover:text-[#18A36C] data-[state=inactive]:hover:bg-[#18A36C]/5 data-[state=inactive]:hover:border-[#18A36C] data-[state=inactive]:border-2 data-[state=inactive]:border-gray-300 transition-all duration-300 rounded-lg py-3 px-4"
          >
            Записи
            <Calendar className="w-5 h-5 ml-[2.5px]" />
          </TabsTrigger>
          <TabsTrigger
            value="documents"
            className="data-[state=active]:bg-[#18A36C] data-[state=active]:text-white data-[state=active]:border-[#18A36C] data-[state=inactive]:text-[#2E2E2E] data-[state=inactive]:hover:text-[#18A36C] data-[state=inactive]:hover:bg-[#18A36C]/5 data-[state=inactive]:hover:border-[#18A36C] data-[state=inactive]:border-2 data-[state=inactive]:border-gray-300 transition-all duration-300 rounded-lg py-3 px-4"
          >
            Документы
            <FileText className="w-5 h-5 ml-[2.5px]" />
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-[#18A36C] data-[state=active]:text-white data-[state=active]:border-[#18A36C] data-[state=inactive]:text-[#2E2E2E] data-[state=inactive]:hover:text-[#18A36C] data-[state=inactive]:hover:bg-[#18A36C]/5 data-[state=inactive]:hover:border-[#18A36C] data-[state=inactive]:border-2 data-[state=inactive]:border-gray-300 transition-all duration-300 rounded-lg py-3 px-4"
          >
            Настройки
            <Settings className="w-5 h-5 ml-[2.5px]" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border border-gray-200 rounded-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-[#2E2E2E] text-2xl">
                  <User className="w-6 h-6 text-[#18A36C]" />
                  Личная информация
                </CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  Ваши персональные данные
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="w-4 h-4 text-[#18A36C]" />
                      <span className="text-sm">ФИО</span>
                    </div>
                    <p className="text-[#2E2E2E] text-lg">{user.name || "Не указано"}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4 text-[#18A36C]" />
                      <span className="text-sm">Дата регистрации</span>
                    </div>
                    <p className="text-[#2E2E2E] text-lg">
                      {user.registration_date ? formatDate(user.registration_date) : "Не указано"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4 text-[#18A36C]" />
                      <span className="text-sm">Телефон</span>
                    </div>
                    <p className="text-[#2E2E2E] text-lg">{user.phone || "Не указано"}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4 text-[#18A36C]" />
                      <span className="text-sm">Email</span>
                    </div>
                    <p className="text-[#2E2E2E] text-lg">{user.email || "Не указано"}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="w-4 h-4 text-[#18A36C]" />
                      <span className="text-sm">Логин</span>
                    </div>
                    <p className="text-[#2E2E2E] text-lg">{user.login || "Не указано"}</p>
                  </div>
                </div>
                <Button className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white cursor-pointer">
                  Редактировать профиль
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {appointments.map((appointment) => (
              <Card key={appointment.id} className="border border-gray-200 rounded-lg">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="space-y-3">
                      <h3 className="text-xl text-[#2E2E2E] font-medium">
                        {appointment.doctor}
                      </h3>
                      <p className="text-gray-600">{appointment.specialty}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#18A36C]" />
                          <span>{appointment.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#18A36C]" />
                          <span>{appointment.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {appointment.status === "confirmed" ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg">
                          <CheckCircle className="w-4 h-4" />
                          <span>Подтверждено</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg">
                          <CheckCircle className="w-4 h-4" />
                          <span>Завершено</span>
                        </div>
                      )}
                      {appointment.status === "confirmed" && (
                        <Button
                          variant="outline"
                          className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white cursor-pointer"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Отменить
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button
              onClick={() => router.push('/contacts')}
              className="w-full bg-[#18A36C] hover:bg-[#18A36C]/90 text-white cursor-pointer"
            >
              Связаться с нами
            </Button>
          </motion.div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {documents.map((document) => (
              <Card key={document.id} className="border border-gray-200 rounded-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#18A36C]/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-[#18A36C]" />
                      </div>
                      <div>
                        <h3 className="text-lg text-[#2E2E2E] font-medium">
                          {document.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {document.type} • {document.date}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="border-[#18A36C] text-[#18A36C] cursor-pointer"
                    >
                      Скачать
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border border-gray-200 rounded-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-[#2E2E2E] text-2xl">
                  <Settings className="w-6 h-6 text-[#18A36C]" />
                  Настройки аккаунта
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-gray-300 text-[#2E2E2E] hover:border-[#18A36C] hover:text-[#18A36C] cursor-pointer"
                  >
                    Изменить пароль
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-gray-300 text-[#2E2E2E] hover:border-[#18A36C] hover:text-[#18A36C] cursor-pointer"
                  >
                    Настройки уведомлений
                  </Button>
                  <Button
                    onClick={handleLogoutClick}
                    variant="outline"
                    className="w-full justify-start border-red-300 text-red-600 hover:bg-red-50 hover:border-red-500 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Выйти из аккаунта
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

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
              className="w-full sm:w-auto border-gray-300 text-[#2E2E2E] hover:bg-gray-50"
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
    </div>
  );
}
