"use client"
import { useState, useEffect } from "react";
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
  ArrowRight,
  Eye
} from "lucide-react";
import { Button } from "../common/SMButton/SMButton";
import { useRouter as useSMRouter } from "../SMRouter/SMRouter";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../common/SMTabs/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../common/SMCard/card";
import { Alert, AlertDescription } from "../common/SMAlert/alert";
import patientContentConfig from "@/config/patientContent.json";
import { DocumentModal } from "./SMDocumentModal";

interface ContactData {
  phone_number: string;
  phone_number_sec?: string;
  email: string;
  address: string;
  map_geo: string;
  work_hours_main: string;
  work_hours_sunday: string;
}

export function SMPatientContent() {
  const { navigate } = useSMRouter();
  const router = useRouter();
  const [contacts, setContacts] = useState<ContactData | null>(null);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [documentModal, setDocumentModal] = useState<{
    isOpen: boolean;
    type: 'contract' | 'privacy' | 'consent' | null;
  }>({ isOpen: false, type: null });

  // Load contacts from API
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch('/api/contacts');
        if (response.ok) {
          const data = await response.json();
          setContacts(data);
        } else {
        }
      } catch (error) {
      } finally {
        setIsLoadingContacts(false);
      }
    };

    fetchContacts();
  }, []);

  const appointmentSteps = [
    { icon: Phone },
    { icon: Calendar },
    { icon: User },
    { icon: Heart }
  ];

  const paymentMethodIcons = [
    { icon: CreditCard },
    { icon: CreditCard },
    { icon: Shield },
    { icon: Clock }
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
        <h1 className="text-3xl lg:text-4xl text-white mb-4">{patientContentConfig.pageHeader.title}</h1>
        <p className="text-white/90 leading-relaxed text-base lg:text-lg max-w-3xl mx-auto">
          {patientContentConfig.pageHeader.subtitle}
        </p>
      </motion.div>

      <Tabs defaultValue="appointment" className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-2 bg-white rounded-lg gap-2">
          <TabsTrigger
            value="appointment"
            className="data-[state=active]:bg-[#18A36C] data-[state=active]:text-white data-[state=active]:border-[#18A36C] data-[state=inactive]:text-[#2E2E2E] data-[state=inactive]:hover:text-[#18A36C] data-[state=inactive]:hover:bg-[#18A36C]/5 data-[state=inactive]:hover:border-[#18A36C] data-[state=inactive]:border-2 data-[state=inactive]:border-gray-300 data-[state=inactive]:cursor-pointer transition-all duration-300 rounded-lg py-3 px-4"
          >
            <span className="hidden sm:inline">{patientContentConfig.tabs.appointment.label}</span>
            <span className="sm:hidden">{patientContentConfig.tabs.appointment.labelShort}</span>
            <Calendar className="w-5 h-5 ml-[2.5px]" />
          </TabsTrigger>
          <TabsTrigger
            value="preparation"
            className="data-[state=active]:bg-[#18A36C] data-[state=active]:text-white data-[state=active]:border-[#18A36C] data-[state=inactive]:text-[#2E2E2E] data-[state=inactive]:hover:text-[#18A36C] data-[state=inactive]:hover:bg-[#18A36C]/5 data-[state=inactive]:hover:border-[#18A36C] data-[state=inactive]:border-2 data-[state=inactive]:border-gray-300 data-[state=inactive]:cursor-pointer transition-all duration-300 rounded-lg py-3 px-4"
          >
            <span className="hidden sm:inline">{patientContentConfig.tabs.preparation.label}</span>
            <span className="sm:hidden">{patientContentConfig.tabs.preparation.labelShort}</span>
            <TestTube className="w-5 h-5 ml-[2.5px]" />
          </TabsTrigger>
          <TabsTrigger
            value="documents"
            className="data-[state=active]:bg-[#18A36C] data-[state=active]:text-white data-[state=active]:border-[#18A36C] data-[state=inactive]:text-[#2E2E2E] data-[state=inactive]:hover:text-[#18A36C] data-[state=inactive]:hover:bg-[#18A36C]/5 data-[state=inactive]:hover:border-[#18A36C] data-[state=inactive]:border-2 data-[state=inactive]:border-gray-300 data-[state=inactive]:cursor-pointer transition-all duration-300 rounded-lg py-3 px-4"
          >
            <span className="hidden sm:inline">{patientContentConfig.tabs.documents.label}</span>
            <span className="sm:hidden">{patientContentConfig.tabs.documents.labelShort}</span>
            <FileText className="w-5 h-5 ml-[2.5px]" />
          </TabsTrigger>
          <TabsTrigger
            value="payment"
            className="data-[state=active]:bg-[#18A36C] data-[state=active]:text-white data-[state=active]:border-[#18A36C] data-[state=inactive]:text-[#2E2E2E] data-[state=inactive]:hover:text-[#18A36C] data-[state=inactive]:hover:bg-[#18A36C]/5 data-[state=inactive]:hover:border-[#18A36C] data-[state=inactive]:border-2 data-[state=inactive]:border-gray-300 data-[state=inactive]:cursor-pointer transition-all duration-300 rounded-lg py-3 px-4"
          >
            {patientContentConfig.tabs.payment.label}
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
                  {patientContentConfig.appointment.howToBookTitle}
                </CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  {patientContentConfig.appointment.howToBookSubtitle}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {patientContentConfig.appointment.steps.map((step, index) => {
                    const IconComponent = appointmentSteps[index].icon;
                    // Для первого шага (Позвоните нам) используем ТОЛЬКО данные из БД
                    let stepDescription = step.description;
                    if (index === 0) {
                      if (isLoadingContacts) {
                        stepDescription = "Загрузка номера телефона...";
                      } else if (contacts?.phone_number) {
                        stepDescription = `Свяжитесь с нами по телефону ${contacts.phone_number} или другим удобным способом`;
                      } else {
                        stepDescription = "Номер телефона недоступен";
                      }
                    }

                    return (
                      <div key={index} className="text-center">
                        <div className="w-20 h-20 bg-[#18A36C] rounded-lg flex items-center justify-center mx-auto mb-5">
                          <IconComponent className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-lg text-[#2E2E2E] mb-3">{step.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{stepDescription}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Правила посещения */}
              <Card className="border border-gray-200 rounded-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-[#2E2E2E] text-xl">
                    <CheckCircle className="w-6 h-6 text-[#18A36C]" />
                    {patientContentConfig.appointment.visitRulesTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <h4 className="text-[#2E2E2E] mb-4 text-lg">{patientContentConfig.appointment.whatToBringTitle}</h4>
                    <ul className="space-y-3">
                      {patientContentConfig.appointment.documents.map((doc, index) => (
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
                    {patientContentConfig.appointment.firstVisitTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {patientContentConfig.appointment.firstVisitTips.map((tip, index) => (
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
                    {patientContentConfig.appointment.childrenTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {patientContentConfig.appointment.childrenRules.map((rule, index) => (
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
                    {patientContentConfig.appointment.elderlyTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {patientContentConfig.appointment.elderlyRules.map((rule, index) => (
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
                <h3 className="text-2xl text-[#2E2E2E] mb-4">{patientContentConfig.appointment.ctaTitle}</h3>
                <p className="text-gray-600 mb-8 text-lg">{patientContentConfig.appointment.ctaSubtitle}</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    className="bg-[#18A36C] hover:bg-[#15905f] text-white px-8 py-4 h-auto text-lg rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    onClick={() => {
                      if (contacts?.phone_number) {
                        const phoneNumber = contacts.phone_number.replace(/[\s\-()]/g, '');
                        window.open(`tel:${phoneNumber}`);
                      }
                    }}
                    disabled={isLoadingContacts || !contacts?.phone_number}
                  >
                    {isLoadingContacts ? 'Загрузка...' : patientContentConfig.appointment.callButton}
                    <Phone className="w-5 h-5 ml-[2.5px]" />
                  </Button>
                  <Button
                    onClick={() => router.push('/contacts')}
                    variant="outline"
                    className="border-[#18A36C] text-[#18A36C] px-8 py-4 h-auto text-lg rounded-lg hover:shadow-xl hover:shadow-[#18A36C]/20"
                  >
                    {patientContentConfig.appointment.onlineBookingButton}
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
                    {patientContentConfig.preparation.bloodTestTitle}
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    {patientContentConfig.preparation.bloodTestSubtitle}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {patientContentConfig.preparation.bloodTestPeriods.map((period, index) => (
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
                    {patientContentConfig.preparation.urineTestTitle}
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    {patientContentConfig.preparation.urineTestSubtitle}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {patientContentConfig.preparation.urineTestRules.map((rule, index) => (
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
                    {patientContentConfig.preparation.ecgTitle}
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    {patientContentConfig.preparation.ecgSubtitle}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {patientContentConfig.preparation.ecgRules.map((rule, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-600 leading-relaxed">
                        <CheckCircle className="w-5 h-5 text-[#18A36C] mt-0.5 flex-shrink-0" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* УЗИ */}
              <Card className="border border-gray-200 rounded-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-[#2E2E2E] text-xl">
                    <Zap className="w-6 h-6 text-[#18A36C]" />
                    {patientContentConfig.preparation.ultrasoundTitle}
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    {patientContentConfig.preparation.ultrasoundSubtitle}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {patientContentConfig.preparation.ultrasoundExams.map((exam, index) => (
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
                <strong>Важно:</strong> {patientContentConfig.preparation.importantNotice}
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
                    {patientContentConfig.documentsTab.contractTitle}
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    {patientContentConfig.documentsTab.contractDescription}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 flex flex-col flex-1">
                  <p className="text-gray-600 leading-relaxed">
                    {patientContentConfig.documentsTab.contractText}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full border-[#18A36C] text-[#18A36C] px-8 py-4 h-auto text-lg rounded-lg hover:shadow-xl hover:shadow-[#18A36C]/20 mt-auto"
                    onClick={() => setDocumentModal({ isOpen: true, type: 'contract' })}
                  >
                    {patientContentConfig.documentsTab.contractButton}
                    <Eye className="w-5 h-5 ml-[2.5px]" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 rounded-lg flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-[#2E2E2E] text-xl">
                    <Shield className="w-6 h-6 text-[#18A36C]" />
                    {patientContentConfig.documentsTab.privacyPolicyTitle}
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    {patientContentConfig.documentsTab.privacyPolicyDescription}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 flex flex-col flex-1">
                  <p className="text-gray-600 leading-relaxed">
                    {patientContentConfig.documentsTab.privacyPolicyText}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full border-[#18A36C] text-[#18A36C] px-8 py-4 h-auto text-lg rounded-lg hover:shadow-xl hover:shadow-[#18A36C]/20 mt-auto"
                    onClick={() => setDocumentModal({ isOpen: true, type: 'privacy' })}
                  >
                    {patientContentConfig.documentsTab.privacyPolicyButton}
                    <Eye className="w-5 h-5 ml-[2.5px]" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 rounded-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-[#2E2E2E] text-xl">
                    <Shield className="w-6 h-6 text-[#18A36C]" />
                    {patientContentConfig.documentsTab.dataProtectionTitle}
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    {patientContentConfig.documentsTab.dataProtectionDescription}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3 text-gray-600">
                    {patientContentConfig.documentsTab.dataProtectionRules.map((rule, index) => (
                      <li key={index} className="flex items-start gap-3 leading-relaxed">
                        <CheckCircle className="w-5 h-5 text-[#18A36C] mt-0.5 flex-shrink-0" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 rounded-lg flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-[#2E2E2E] text-xl">
                    <FileText className="w-6 h-6 text-[#18A36C]" />
                    {patientContentConfig.documentsTab.consentTitle}
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    {patientContentConfig.documentsTab.consentDescription}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 flex flex-col flex-1">
                  <p className="text-gray-600 leading-relaxed">
                    {patientContentConfig.documentsTab.consentText}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full border-[#18A36C] text-[#18A36C] px-8 py-4 h-auto text-lg rounded-lg hover:shadow-xl hover:shadow-[#18A36C]/20 mt-auto"
                    onClick={() => setDocumentModal({ isOpen: true, type: 'consent' })}
                  >
                    {patientContentConfig.documentsTab.consentButton}
                    <Eye className="w-5 h-5 ml-[2.5px]" />
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
                  {patientContentConfig.payment.title}
                </CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  {patientContentConfig.payment.subtitle}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {patientContentConfig.payment.methods.map((method, index) => {
                    const IconComponent = paymentMethodIcons[index].icon;
                    return (
                      <div key={index} className="text-center p-6 bg-white border border-gray-200 rounded-lg hover:border-[#18A36C] transition-all duration-300">
                        <div className="w-20 h-20 bg-[#18A36C] rounded-lg flex items-center justify-center mx-auto mb-5">
                          <IconComponent className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-lg text-[#2E2E2E] mb-3">{method.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{method.description}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border border-gray-200 rounded-lg flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-[#2E2E2E] text-xl">
                    <CreditCard className="w-6 h-6 text-[#18A36C]" />
                    {patientContentConfig.payment.pricesTitle}
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    {patientContentConfig.payment.pricesDescription}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 flex flex-col flex-1">
                  <p className="text-gray-600 leading-relaxed">
                    {patientContentConfig.payment.pricesText}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full border-[#18A36C] text-[#18A36C] px-8 py-4 h-auto text-lg rounded-lg hover:shadow-xl hover:shadow-[#18A36C]/20 mt-auto"
                    onClick={() => router.push('/services')}
                  >
                    {patientContentConfig.payment.pricesButton}
                    <ArrowRight className="w-5 h-5 ml-[2.5px]" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 rounded-lg flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-[#2E2E2E] text-xl">
                    <Shield className="w-6 h-6 text-[#18A36C]" />
                    {patientContentConfig.payment.insuranceTitle}
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    {patientContentConfig.payment.insuranceDescription}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 flex flex-col flex-1">
                  <p className="text-gray-600 leading-relaxed">
                    {patientContentConfig.payment.insuranceText}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full border-[#18A36C] text-[#18A36C] px-8 py-4 h-auto text-lg rounded-lg hover:shadow-xl hover:shadow-[#18A36C]/20 mt-auto"
                    onClick={() => router.push('/clinic/partners/insurance')}
                  >
                    {patientContentConfig.payment.insuranceButton}
                    <ArrowRight className="w-5 h-5 ml-[2.5px]" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Document Modal */}
      {documentModal.type && (
        <DocumentModal
          isOpen={documentModal.isOpen}
          onClose={() => setDocumentModal({ isOpen: false, type: null })}
          documentType={documentModal.type}
        />
      )}
    </div>
  );
}
