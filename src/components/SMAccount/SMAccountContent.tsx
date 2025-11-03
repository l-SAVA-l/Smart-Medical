import { useState, useEffect } from "react";
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
  CalendarDays,
  Mail,
  Settings2,
  FileText,
  MessageSquare,
  CheckCircle,
  ChevronRight,
  LogOut,
  User,
} from "lucide-react";
import {
  accountData,
  subscriptionCategories,
  mockUser,
} from "@/data/SMAccountData/SMAccountData";
import { ImageWithFallback } from "../SMImage/ImageWithFallback";
import { useRouter } from "../SMRouter/SMRouter";

export function AccountContent() {
  const { navigate, currentRoute } = useRouter();
  const pathParts = currentRoute.replace(/^\/+|\/+$/g, '').split('/');
  
  let sectionFromUrl = '';
  if (pathParts[0] === 'account') {
    sectionFromUrl = pathParts[1] || '';
  }

  const [activeSection, setActiveSection] = useState<string>(
    sectionFromUrl && ['subscriptions', 'materials', 'contact'].includes(sectionFromUrl)
      ? sectionFromUrl
      : ''
  );
  
  const [subscriptionSettings, setSubscriptionSettings] =
    useState(accountData.subscriptions.settings);
  const [selectedYear, setSelectedYear] =
    useState<string>("all");
  const [contactForm, setContactForm] = useState(
    accountData.contact.form,
  );
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  useEffect(() => {
    if (sectionFromUrl && ['subscriptions', 'materials', 'contact'].includes(sectionFromUrl)) {
      setActiveSection(sectionFromUrl);
    } else {
      setActiveSection('');
    }
  }, [sectionFromUrl]);

  const handleSubscriptionSubmit = () => {
    console.log("Subscription settings:", subscriptionSettings);
    setSubmitStatus("success");
    setTimeout(() => setSubmitStatus("idle"), 3000);
  };

  const handleReset = () => {
    setSubscriptionSettings(accountData.subscriptions.settings);
  };

  const handleContactSubmit = () => {
    console.log("Contact form:", contactForm);
    setSubmitStatus("success");
    setContactForm({ name: "", subject: "", message: "" });
    setTimeout(() => setSubmitStatus("idle"), 3000);
  };

  const filteredMaterials =
    selectedYear === "all"
      ? accountData.materials.items
      : accountData.materials.items.filter(
          (item) => item.year.toString() === selectedYear,
        );

  const renderSubscriptions = () => (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6" >
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-[#18A36C] rounded-lg flex items-center justify-center">
            <Settings2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl text-gray-800 mb-1">
              Настройки подписки
            </h2>
            <p className="text-gray-600">
              Управляйте вашими подписками и уведомлениями
            </p>
          </div>
        </div>
      </div>

      <Card className="border border-gray-200">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700">
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
            <Label className="text-gray-700">
              Рубрики подписки
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
            <Label className="text-gray-700">
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

          <div className="flex gap-4">
            <Button
              onClick={handleSubscriptionSubmit}
              disabled={!subscriptionSettings.agreed}
              className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white"
            >
              Добавить
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
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

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
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
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-[#18A36C] rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl text-gray-800 mb-1">
              Материалы
            </h2>
            <p className="text-gray-600">
              Специальные предложения и материалы для
              подписчиков
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <Label className="text-gray-700">Период:</Label>
        <Select
          value={selectedYear}
          onValueChange={setSelectedYear}
        >
          <SelectTrigger className="w-48 border-gray-300">
            <SelectValue placeholder="Выберите период" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">За все время</SelectItem>
            <SelectItem value="2025">2025</SelectItem>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2023">2023</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((item) => (
          <Card
            key={item.id}
            className="group hover:shadow-lg transition-all duration-300 border border-gray-200"
          >
            <div className="relative overflow-hidden rounded-t-lg">
              <ImageWithFallback
                src={item.image}
                alt={item.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-4 left-4">
                <Badge className="bg-[#18A36C] text-white">
                  Специальное предложение
                </Badge>
              </div>
            </div>
            <CardContent className="p-6">
              <h3 className="text-lg text-gray-800 mb-2 group-hover:text-[#18A36C] transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {item.content}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CalendarDays className="w-4 h-4" />
                <span>{item.date}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg text-gray-800 mb-2">
            Материалы не найдены
          </h3>
          <p className="text-gray-600">
            В выбранном периоде нет доступных материалов
          </p>
        </div>
      )}
    </div>
  );

  const renderContact = () => (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-[#18A36C] rounded-lg flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl text-gray-800 mb-1">
              Написать глав.врачу
            </h2>
            <p className="text-gray-600">
              Свяжитесь с руководством клиники
            </p>
          </div>
        </div>
      </div>

      <Card className="border border-gray-200">
        <CardContent className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              {accountData.contact.description}
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">
                Ваше имя
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Введите ваше имя"
                value={contactForm.name}
                onChange={(e) =>
                  setContactForm({
                    ...contactForm,
                    name: e.target.value,
                  })
                }
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="subject"
                className="text-gray-700"
              >
                Тема
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
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="message"
                className="text-gray-700"
              >
                Сообщение
              </Label>
              <Textarea
                id="message"
                placeholder="Ваше сообщение"
                rows={6}
                value={contactForm.message}
                onChange={(e) =>
                  setContactForm({
                    ...contactForm,
                    message: e.target.value,
                  })
                }
                className="border-gray-300"
              />
            </div>
          </div>

          <Button
            onClick={handleContactSubmit}
            className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white"
            disabled={
              !contactForm.name ||
              !contactForm.subject ||
              !contactForm.message
            }
          >
            Отправить
          </Button>

          {submitStatus === "success" && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">
                Сообщение успешно отправлено!
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Modern Welcome Dashboard
  const renderWelcomeDashboard = () => (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
      {/* Welcome Hero Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-8 lg:p-12 mb-12">
        <div className="text-center lg:text-left">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Avatar and Welcome Text */}
            <div className="flex-1">
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
                <div className="w-20 h-20 lg:w-24 lg:h-24 bg-[#18A36C] rounded-full flex items-center justify-center">
                  <span className="text-3xl text-white">
                    {mockUser.firstName?.[0] || ""}
                    {mockUser.lastName?.[0] || ""}
                  </span>
                </div>

                <div className="text-center lg:text-left">
                  <h1 className="text-3xl lg:text-4xl text-gray-800 mb-2">
                    Добро пожаловать, {mockUser.firstName}!
                  </h1>
                  <p className="text-gray-600 text-lg mb-6">
                    Ваш персональный медицинский помощник
                  </p>
                  <div className="flex flex-col sm:flex-row gap-[5px] justify-center lg:justify-start">
                    <Button
                      onClick={() => navigate("/account/subscriptions")}
                      className="bg-[#18A36C] text-white hover:bg-[#18A36C]/90 transition-all duration-300"
                    >
                      Настройки
                      <Settings2 className="w-4 h-4 ml-[2.5px]" />
                    </Button>
                    <Button
                      onClick={() => navigate("/account/contact")}
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300"
                    >
                      Связаться с врачом
                      <MessageSquare className="w-4 h-4 ml-[2.5px]" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="text-2xl text-gray-800 mb-1">
                    {subscriptionSettings.categories.length}
                  </div>
                  <div className="text-sm text-gray-600 text-center">
                    Подписок
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="text-2xl text-gray-800 mb-1">
                    {accountData.materials.items.length}
                  </div>
                  <div className="text-sm text-gray-600 text-center">
                    Материалов
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card
          className="group cursor-pointer hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-[#18A36C]"
          onClick={() => navigate("/account/subscriptions")}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-[#18A36C] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Settings2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg text-gray-800 mb-1">
                  Подписки
                </h3>
                <p className="text-sm text-gray-600">
                  Настройки уведомлений
                </p>
              </div>
            </div>
            <div className="flex items-center text-sm text-[#18A36C]">
              <span>Управление подписками</span>
              <ChevronRight className="w-4 h-4 ml-[2.5px] group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="group cursor-pointer hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-[#18A36C]"
          onClick={() => navigate("/account/materials")}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-[#18A36C] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg text-gray-800 mb-1">
                  Материалы
                </h3>
                <p className="text-sm text-gray-600">
                  Специальные предложения
                </p>
              </div>
            </div>
            <div className="flex items-center text-sm text-[#18A36C]">
              <span>Просмотреть материалы</span>
              <ChevronRight className="w-4 h-4 ml-[2.5px] group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="group cursor-pointer hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-[#18A36C]"
          onClick={() => navigate("/account/contact")}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-[#18A36C] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg text-gray-800 mb-1">
                  Связь с врачом
                </h3>
                <p className="text-sm text-gray-600">
                  Написать главврачу
                </p>
              </div>
            </div>
            <div className="flex items-center text-sm text-[#18A36C]">
              <span>Отправить сообщение</span>
              <ChevronRight className="w-4 h-4 ml-[2.5px] group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Materials Preview */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl text-gray-800">
            Последние материалы
          </h2>
          <Button
            variant="outline"
            onClick={() => navigate("/account/materials")}
            className="text-[#18A36C] border-[#18A36C] hover:bg-[#18A36C] hover:text-white"
          >
            Смотреть все
            <ChevronRight className="w-4 h-4 ml-[2.5px]" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accountData.materials.items
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
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-[#18A36C] text-white">
                      Новое
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg text-gray-800 mb-2 group-hover:text-[#18A36C] transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {item.content}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CalendarDays className="w-3 h-3" />
                    <span>{item.date}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Profile Management */}
      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#18A36C] rounded-full flex items-center justify-center text-white text-xl">
                {mockUser.firstName?.[0] || ""}
                {mockUser.lastName?.[0] || ""}
              </div>
              <div>
                <h3 className="text-xl text-gray-800 mb-1">
                  {mockUser.name}
                </h3>
                <p className="text-gray-600 mb-1">
                  {mockUser.email}
                </p>
                <p className="text-sm text-gray-500">
                  Участник с 2025 года
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                <Settings2 className="w-4 h-4 mr-[2.5px]" />
                Редактировать профиль
              </Button>
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-[2.5px]" />
                Выйти
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render based on activeSection
  if (activeSection === "subscriptions") {
    return renderSubscriptions();
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