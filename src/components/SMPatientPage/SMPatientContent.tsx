"use client"
import { motion } from "framer-motion";
import { 
  Calendar, 
  FileText, 
  Shield, 
  CreditCard, 
  Clock, 
  User, 
  Baby, 
  Users, 
  AlertCircle,
  CheckCircle,
  Phone,
  Download,
  ExternalLink,
  Heart,
  TestTube,
  Activity,
  Zap,
  ArrowRight
} from "lucide-react";
import { Button } from "../common/SMButton/SMButton";
import { useRouter } from "../SMRouter/SMRouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../common/SMTabs/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../common/SMCard/card";
import { Alert, AlertDescription } from "../common/SMAlert/alert";

export function SMPatientContent() {
  const { navigate } = useRouter();

  const appointmentSteps = [
    {
      icon: Phone,
      title: "Позвоните нам",
      description: "Свяжитесь с нами по телефону +375-29-161-01-01 или другим удобным способом"
    },
    {
      icon: Calendar,
      title: "Выберите время",
      description: "Администратор подберет удобное время для записи к нужному специалисту"
    },
    {
      icon: User,
      title: "Подготовьтесь к визиту",
      description: "Возьмите с собой необходимые документы и следуйте рекомендациям"
    },
    {
      icon: Heart,
      title: "Придите на приём",
      description: "Приходите за 10-15 минут до назначенного времени"
    }
  ];

  const documents = [
    "Паспорт или документ, удостоверяющий личность",
    "Медицинская страховка (при наличии)",
    "Направление от врача (если есть)",
    "Результаты предыдущих обследований",
    "Выписки из медицинской карты",
    "Список принимаемых лекарств"
  ];

  const childrenRules = [
    "Дети до 14 лет проходят осмотр только в присутствии родителей или законных представителей",
    "При себе иметь свидетельство о рождении ребенка",
    "Для подростков 14-18 лет необходимо согласие родителей на медицинское вмешательство",
    "Рекомендуется взять с собой любимую игрушку для успокоения ребенка"
  ];

  const elderlyRules = [
    "При необходимости можете прийти с сопровождающим",
    "Обязательно принесите полный список принимаемых лекарств",
    "Сообщите о всех хронических заболеваниях",
    "При проблемах с передвижением предупредите администратора заранее"
  ];

  const firstVisitTips = [
    "Приходите за 15 минут до назначенного времени для оформления документов",
    "Подготовьте краткий рассказ о своих жалобах и симптомах",
    "Вспомните, когда начались проблемы со здоровьем",
    "Возьмите все медицинские документы, которые у вас есть",
    "Не стесняйтесь задавать вопросы врачу"
  ];

  const bloodTestRules = [
    {
      title: "За 8-12 часов до анализа",
      rules: ["Не принимать пищу", "Можно пить только чистую воду", "Исключить алкоголь"]
    },
    {
      title: "В день анализа",
      rules: ["Не курить", "Избегать физических нагрузок", "Не принимать лекарства (кроме жизненно важных)"]
    }
  ];

  const urineTestRules = [
    "Собирать утреннюю среднюю порцию мочи",
    "Предварительно провести гигиену половых органов",
    "Использовать стерильную емкость",
    "Доставить в лабораторию в течение 2 часов"
  ];

  const ultrasoundRules = [
    {
      type: "УЗИ органов брюшной полости",
      preparation: ["За 3 дня исключить газообразующие продукты", "За 8 часов не принимать пищу", "За 1 час выпить 1 литр воды"]
    },
    {
      type: "УЗИ малого таза",
      preparation: ["За 1 час выпить 1 литр воды", "Не мочиться до исследования", "При трансвагинальном УЗИ подготовка не требуется"]
    }
  ];

  const paymentMethods = [
    {
      icon: CreditCard,
      title: "Банковские карты",
      description: "Visa, Mastercard, МИР, Белкарт"
    },
    {
      icon: CreditCard,
      title: "Наличные",
      description: "Оплата в кассе клиники"
    },
    {
      icon: Shield,
      title: "Страховые программы",
      description: "Работаем со страховыми компаниями"
    },
    {
      icon: Clock,
      title: "Рассрочка",
      description: "Возможность оплаты в рассрочку"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12 max-w-7xl">
      {/* Page Header */}
      <motion.div 
        className="bg-[#18A36C] rounded-lg p-8 lg:p-12 mb-10 lg:mb-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-20 h-20 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-6">
          <User className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl lg:text-4xl text-white mb-4">Пациенту</h1>
        <p className="text-white/90 leading-relaxed text-base lg:text-lg max-w-3xl mx-auto">
          Вся необходимая информация для подготовки к визиту в нашу клинику. 
          Ознакомьтесь с правилами, требованиями и рекомендациями.
        </p>
      </motion.div>

      <Tabs defaultValue="appointment" className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-2 bg-white rounded-lg gap-2">
          <TabsTrigger 
            value="appointment" 
            className="data-[state=active]:bg-[#18A36C] data-[state=active]:text-white data-[state=active]:border-[#18A36C] data-[state=inactive]:text-[#2E2E2E] data-[state=inactive]:hover:text-[#18A36C] data-[state=inactive]:hover:bg-[#18A36C]/5 data-[state=inactive]:hover:border-[#18A36C] data-[state=inactive]:border-2 data-[state=inactive]:border-gray-300 transition-all duration-300 rounded-lg py-3 px-4"
          >
            <span className="hidden sm:inline">Запись на приём</span>
            <span className="sm:hidden">Запись</span>
            <Calendar className="w-5 h-5 ml-[2.5px]" />
          </TabsTrigger>
          <TabsTrigger 
            value="preparation" 
            className="data-[state=active]:bg-[#18A36C] data-[state=active]:text-white data-[state=active]:border-[#18A36C] data-[state=inactive]:text-[#2E2E2E] data-[state=inactive]:hover:text-[#18A36C] data-[state=inactive]:hover:bg-[#18A36C]/5 data-[state=inactive]:hover:border-[#18A36C] data-[state=inactive]:border-2 data-[state=inactive]:border-gray-300 transition-all duration-300 rounded-lg py-3 px-4"
          >
            <span className="hidden sm:inline">Подготовка</span>
            <span className="sm:hidden">Анализы</span>
            <TestTube className="w-5 h-5 ml-[2.5px]" />
          </TabsTrigger>
          <TabsTrigger 
            value="documents" 
            className="data-[state=active]:bg-[#18A36C] data-[state=active]:text-white data-[state=active]:border-[#18A36C] data-[state=inactive]:text-[#2E2E2E] data-[state=inactive]:hover:text-[#18A36C] data-[state=inactive]:hover:bg-[#18A36C]/5 data-[state=inactive]:hover:border-[#18A36C] data-[state=inactive]:border-2 data-[state=inactive]:border-gray-300 transition-all duration-300 rounded-lg py-3 px-4"
          >
            <span className="hidden sm:inline">Документы</span>
            <span className="sm:hidden">Док-ты</span>
            <FileText className="w-5 h-5 ml-[2.5px]" />
          </TabsTrigger>
          <TabsTrigger 
            value="payment" 
            className="data-[state=active]:bg-[#18A36C] data-[state=active]:text-white data-[state=active]:border-[#18A36C] data-[state=inactive]:text-[#2E2E2E] data-[state=inactive]:hover:text-[#18A36C] data-[state=inactive]:hover:bg-[#18A36C]/5 data-[state=inactive]:hover:border-[#18A36C] data-[state=inactive]:border-2 data-[state=inactive]:border-gray-300 transition-all duration-300 rounded-lg py-3 px-4"
          >
            Оплата
            <CreditCard className="w-5 h-5 ml-[2.5px]" />
          </TabsTrigger>
        </TabsList>

        {/* Запись на приём */}
        <TabsContent value="appointment" className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <Card className="border border-gray-200 rounded-lg">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-[#2E2E2E] text-2xl">
                  <Calendar className="w-6 h-6 text-[#18A36C]" />
                  Как записаться на приём
                </CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  Следуйте простым шагам для записи к нужному специалисту
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {appointmentSteps.map((step, index) => (
                    <div key={index} className="text-center">
                      <div className="w-20 h-20 bg-[#18A36C] rounded-lg flex items-center justify-center mx-auto mb-5">
                        <step.icon className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-lg text-[#2E2E2E] mb-3">{step.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{step.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Правила посещения */}
              <Card className="border border-gray-200 rounded-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-[#2E2E2E] text-xl">
                    <CheckCircle className="w-6 h-6 text-[#18A36C]" />
                    Правила посещения
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <h4 className="text-[#2E2E2E] mb-4 text-lg">Что взять с собой:</h4>
                    <ul className="space-y-3">
                      {documents.map((doc, index) => (
                        <li key={index} className="flex items-start gap-3 text-gray-600 leading-relaxed">
                          <CheckCircle className="w-5 h-5 text-[#18A36C] mt-0.5 flex-shrink-0" />
                          {doc}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Первый визит */}
              <Card className="border border-gray-200 rounded-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-[#2E2E2E] text-xl">
                    <Heart className="w-6 h-6 text-[#18A36C]" />
                    Памятка для первого визита
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {firstVisitTips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-600 leading-relaxed">
                        <AlertCircle className="w-5 h-5 text-[#18A36C] mt-0.5 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Особенности для детей */}
              <Card className="border border-gray-200 rounded-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-[#2E2E2E] text-xl">
                    <Baby className="w-6 h-6 text-[#18A36C]" />
                    Особенности для детей
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {childrenRules.map((rule, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-600 leading-relaxed">
                        <Baby className="w-5 h-5 text-[#18A36C] mt-0.5 flex-shrink-0" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Особенности для пожилых */}
              <Card className="border border-gray-200 rounded-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-[#2E2E2E] text-xl">
                    <Users className="w-6 h-6 text-[#18A36C]" />
                    Особенности для пожилых пациентов
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {elderlyRules.map((rule, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-600 leading-relaxed">
                        <Users className="w-5 h-5 text-[#18A36C] mt-0.5 flex-shrink-0" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Call to Action */}
            <Card className="border-2 border-gray-200 rounded-lg bg-white text-center">
              <CardContent className="p-8 lg:p-10">
                <h3 className="text-2xl text-[#2E2E2E] mb-4">Готовы записаться на приём?</h3>
                <p className="text-gray-600 mb-8 text-lg">Позвоните нам или воспользуйтесь онлайн-записью</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white px-8 py-4 h-auto text-lg rounded-lg transition-all duration-300"
                    onClick={() => window.open('tel:+375291610101')}
                  >
                    Позвонить
                    <Phone className="w-5 h-5 ml-[2.5px]" />
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-2 border-[#18A36C] text-[#18A36C] hover:bg-[#18A36C] hover:text-white px-8 py-4 h-auto text-lg rounded-lg transition-all duration-300"
                  >
                    Онлайн запись
                    <ArrowRight className="w-5 h-5 ml-[2.5px]" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Подготовка к анализам */}
        <TabsContent value="preparation" className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Анализ крови */}
              <Card className="border border-gray-200 rounded-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-[#2E2E2E] text-xl">
                    <TestTube className="w-6 h-6 text-[#18A36C]" />
                    Анализ крови
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    Правила подготовки к сдаче крови
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {bloodTestRules.map((period, index) => (
                    <div key={index}>
                      <h4 className="text-[#2E2E2E] mb-3 text-lg">{period.title}:</h4>
                      <ul className="space-y-2">
                        {period.rules.map((rule, ruleIndex) => (
                          <li key={ruleIndex} className="flex items-start gap-3 text-gray-600 leading-relaxed">
                            <CheckCircle className="w-5 h-5 text-[#18A36C] mt-0.5 flex-shrink-0" />
                            {rule}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Анализ мочи */}
              <Card className="border border-gray-200 rounded-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-[#2E2E2E] text-xl">
                    <TestTube className="w-6 h-6 text-[#18A36C]" />
                    Анализ мочи
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    Правила сбора и доставки мочи
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {urineTestRules.map((rule, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-600 leading-relaxed">
                        <CheckCircle className="w-5 h-5 text-[#18A36C] mt-0.5 flex-shrink-0" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* ЭКГ */}
              <Card className="border border-gray-200 rounded-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-[#2E2E2E] text-xl">
                    <Activity className="w-6 h-6 text-[#18A36C]" />
                    ЭКГ (Электрокардиография)
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    Подготовка к электрокардиографии
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3 text-gray-600 leading-relaxed">
                      <CheckCircle className="w-5 h-5 text-[#18A36C] mt-0.5 flex-shrink-0" />
                      Исключить физические нагрузки за 1 час до процедуры
                    </li>
                    <li className="flex items-start gap-3 text-gray-600 leading-relaxed">
                      <CheckCircle className="w-5 h-5 text-[#18A36C] mt-0.5 flex-shrink-0" />
                      Не курить за 2 часа до ЭКГ
                    </li>
                    <li className="flex items-start gap-3 text-gray-600 leading-relaxed">
                      <CheckCircle className="w-5 h-5 text-[#18A36C] mt-0.5 flex-shrink-0" />
                      Избегать стресса и волнения
                    </li>
                    <li className="flex items-start gap-3 text-gray-600 leading-relaxed">
                      <CheckCircle className="w-5 h-5 text-[#18A36C] mt-0.5 flex-shrink-0" />
                      Снять металлические украшения
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* УЗИ */}
              <Card className="border border-gray-200 rounded-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-[#2E2E2E] text-xl">
                    <Zap className="w-6 h-6 text-[#18A36C]" />
                    УЗИ исследования
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    Подготовка к ультразвуковым исследованиям
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {ultrasoundRules.map((exam, index) => (
                    <div key={index}>
                      <h4 className="text-[#2E2E2E] mb-3 text-lg">{exam.type}:</h4>
                      <ul className="space-y-2">
                        {exam.preparation.map((rule, ruleIndex) => (
                          <li key={ruleIndex} className="flex items-start gap-3 text-gray-600 leading-relaxed">
                            <CheckCircle className="w-5 h-5 text-[#18A36C] mt-0.5 flex-shrink-0" />
                            {rule}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Alert className="border-gray-200 rounded-lg p-6">
              <AlertCircle className="h-5 w-5 text-[#18A36C]" />
              <AlertDescription className="text-gray-600 text-base leading-relaxed ml-2">
                <strong>Важно:</strong> Если вы принимаете постоянные лекарства, обязательно сообщите об этом врачу. 
                Некоторые препараты могут влиять на результаты анализов.
              </AlertDescription>
            </Alert>
          </motion.div>
        </TabsContent>

        {/* Документы */}
        <TabsContent value="documents" className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border border-gray-200 rounded-lg flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-[#2E2E2E] text-xl">
                    <FileText className="w-6 h-6 text-[#18A36C]" />
                    Договор на оказание услуг
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    Образец договора для ознакомления
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 flex flex-col flex-1">
                  <p className="text-gray-600 leading-relaxed">
                    Договор на оказание медицинских услуг заключается при первом обращении в клинику. 
                    Вы можете ознакомиться с образцом договора заранее.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full border-2 border-[#18A36C] text-[#18A36C] hover:bg-[#18A36C] hover:text-white px-8 py-4 h-auto text-lg rounded-lg transition-all duration-300 mt-auto"
                  >
                    Скачать образец договора
                    <Download className="w-5 h-5 ml-[2.5px]" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 rounded-lg flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-[#2E2E2E] text-xl">
                    <Shield className="w-6 h-6 text-[#18A36C]" />
                    Политика конфиденциальности
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    Защита персональных данных
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 flex flex-col flex-1">
                  <p className="text-gray-600 leading-relaxed">
                    Мы гарантируем полную конфиденциальность ваших персональных данных и медицинской информации 
                    в соответствии с законодательством.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full border-2 border-[#18A36C] text-[#18A36C] hover:bg-[#18A36C] hover:text-white px-8 py-4 h-auto text-lg rounded-lg transition-all duration-300 mt-auto"
                  >
                    Ознакомиться с политикой
                    <ExternalLink className="w-5 h-5 ml-[2.5px]" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 rounded-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-[#2E2E2E] text-xl">
                    <Shield className="w-6 h-6 text-[#18A36C]" />
                    Защита персональных данных
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    Информация о обработке персональных данных
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-3 leading-relaxed">
                      <CheckCircle className="w-5 h-5 text-[#18A36C] mt-0.5 flex-shrink-0" />
                      Сбор данных только с вашего согласия
                    </li>
                    <li className="flex items-start gap-3 leading-relaxed">
                      <CheckCircle className="w-5 h-5 text-[#18A36C] mt-0.5 flex-shrink-0" />
                      Использование данных исключительно для медицинских целей
                    </li>
                    <li className="flex items-start gap-3 leading-relaxed">
                      <CheckCircle className="w-5 h-5 text-[#18A36C] mt-0.5 flex-shrink-0" />
                      Защищенное хранение информации
                    </li>
                    <li className="flex items-start gap-3 leading-relaxed">
                      <CheckCircle className="w-5 h-5 text-[#18A36C] mt-0.5 flex-shrink-0" />
                      Право на удаление данных по запросу
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 rounded-lg flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-[#2E2E2E] text-xl">
                    <FileText className="w-6 h-6 text-[#18A36C]" />
                    Согласие на обработку данных
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    Форма согласия на обработку персональных данных
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 flex flex-col flex-1">
                  <p className="text-gray-600 leading-relaxed">
                    Форма согласия на обработку персональных данных, которую необходимо подписать 
                    при первом обращении в клинику.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full border-2 border-[#18A36C] text-[#18A36C] hover:bg-[#18A36C] hover:text-white px-8 py-4 h-auto text-lg rounded-lg transition-all duration-300 mt-auto"
                  >
                    Скачать форму согласия
                    <Download className="w-5 h-5 ml-[2.5px]" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </TabsContent>

        {/* Способы оплаты */}
        <TabsContent value="payment" className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <Card className="border border-gray-200 rounded-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-[#2E2E2E] text-2xl">
                  <CreditCard className="w-6 h-6 text-[#18A36C]" />
                  Способы оплаты
                </CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  Выберите удобный для вас способ оплаты медицинских услуг
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {paymentMethods.map((method, index) => (
                    <div key={index} className="text-center p-6 bg-white border border-gray-200 rounded-lg hover:border-[#18A36C] transition-all duration-300">
                      <div className="w-20 h-20 bg-[#18A36C] rounded-lg flex items-center justify-center mx-auto mb-5">
                        <method.icon className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-lg text-[#2E2E2E] mb-3">{method.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{method.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border border-gray-200 rounded-lg flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-[#2E2E2E] text-xl">
                    <CreditCard className="w-6 h-6 text-[#18A36C]" />
                    Актуальные цены
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    Ознакомьтесь с полным прайс-листом услуг
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 flex flex-col flex-1">
                  <p className="text-gray-600 leading-relaxed">
                    Все цены на медицинские услуги вы можете найти в разделе "Цены". 
                    Стоимость услуг может изменяться, актуальную информацию уточняйте у администратора.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full border-2 border-[#18A36C] text-[#18A36C] hover:bg-[#18A36C] hover:text-white px-8 py-4 h-auto text-lg rounded-lg transition-all duration-300 mt-auto"
                    onClick={() => navigate('/prices')}
                  >
                    Посмотреть цены
                    <ArrowRight className="w-5 h-5 ml-[2.5px]" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 rounded-lg flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-[#2E2E2E] text-xl">
                    <Shield className="w-6 h-6 text-[#18A36C]" />
                    Страховые программы
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    Работаем с ведущими страховыми компаниями
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 flex flex-col flex-1">
                  <p className="text-gray-600 leading-relaxed">
                    Мы сотрудничаем с крупнейшими страховыми компаниями Беларуси. 
                    Уточните возможность оплаты по страховке у администратора.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full border-2 border-[#18A36C] text-[#18A36C] hover:bg-[#18A36C] hover:text-white px-8 py-4 h-auto text-lg rounded-lg transition-all duration-300 mt-auto"
                    onClick={() => navigate('/clinic/partners/insurance')}
                  >
                    Наши партнёры
                    <ArrowRight className="w-5 h-5 ml-[2.5px]" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
