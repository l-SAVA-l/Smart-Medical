"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, Eye, Building, Award, Clock, FileText, Calendar, Heart, Phone, Star, Users } from "lucide-react";
import { Button } from "../common/SMButton/SMButton";
import { useRouter as useSMRouter } from "../SMRouter/SMRouter";
import { useRouter } from "next/navigation";
import { ImageWithFallback } from "../SMImage/ImageWithFallback";
import homePageConfig from "@/config/homePage.json";
import { iconMap, IconName } from "@/utils/iconMapper";
import { useContacts } from "@/hooks/useContacts";
import { useFeedbacks } from "@/hooks/useFeedbacks";

// Компонент скелетона для текста
function TextSkeleton({ className = '' }: { className?: string }) {
  return <span className={`inline-block animate-pulse bg-gray-200 rounded ${className}`}>&nbsp;</span>;
}

export function SMHomePage() {
  const { navigate } = useSMRouter();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const { contacts, loading: contactsLoading } = useContacts();
  const { feedbacks, loading: feedbacksLoading } = useFeedbacks(3);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4 py-12 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl lg:text-5xl xl:text-6xl text-[#18A36C] mb-8 leading-tight">
              {homePageConfig.hero.title}
              <br />
              <span className="text-[#2E2E2E]">{homePageConfig.hero.titleHighlight}</span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              {homePageConfig.hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button
                className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white px-8 py-4 h-auto text-lg rounded-lg transition-all duration-300"
                onClick={() => router.push("/contacts")}
              >
                {homePageConfig.hero.buttons.appointment}
                <ArrowRight className="w-5 h-5 ml-[2.5px]" />
              </Button>

              <Button
                variant="outline"
                className="border-[#18A36C] text-[#18A36C] px-8 py-4 h-auto text-lg rounded-lg hover:shadow-xl hover:shadow-[#18A36C]/20"
                onClick={() => router.push("/services")}
              >
                {homePageConfig.hero.buttons.services}
                <Eye className="w-5 h-5 ml-[2.5px]" />
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {homePageConfig.stats.map((stat, index) => {
                const Icon = iconMap[stat.icon as IconName];
                return (
                  <div
                    key={index}
                    className="bg-white border border-[#E8E6E3] rounded-lg p-8 hover:border-[#18A36C] transition-all duration-300 text-center"
                  >
                    <div className="flex justify-center mb-4">
                      <Icon className="w-8 h-8 text-[#18A36C]" />
                    </div>
                    <h3 className="text-xl text-[#2E2E2E] mb-2">{stat.title}</h3>
                    <p className="text-gray-600 text-sm">{stat.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 lg:py-20 bg-white border-t border-[#E8E6E3]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl text-[#2E2E2E] mb-6">
              {homePageConfig.servicesSection.title}
            </h2>
            <p className="text-gray-600 text-lg lg:text-xl max-w-3xl mx-auto">
              {homePageConfig.servicesSection.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {homePageConfig.servicesSection.services.map((service) => {
              const Icon = iconMap[service.icon as IconName];
              return (
                <div
                  key={service.id}
                  className="group cursor-pointer"
                  onClick={() => router.push('/services')}
                >
                  <div className="bg-white border border-[#E8E6E3] rounded-lg p-8 hover:border-[#18A36C] transition-all duration-300 h-full text-center flex flex-col">
                    <div className="flex justify-center mb-6">
                      <Icon className="w-8 h-8 text-[#18A36C]" />
                    </div>

                    <h3 className="text-xl lg:text-2xl text-[#2E2E2E] mb-4">{service.name}</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed flex-grow">
                      {service.description}
                    </p>

                    <div className="flex items-center justify-center text-[#18A36C] group-hover:text-[#18A36C]/80 transition-colors">
                      <span className="mr-2">Подробнее</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <Button
              className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white px-8 py-4 h-auto text-lg rounded-lg transition-all duration-300"
              onClick={() => router.push("/services")}
            >
              {homePageConfig.servicesSection.buttonText}
              <ArrowRight className="w-5 h-5 ml-[2.5px]" />
            </Button>
          </div>
        </div>
      </section>

      {/* Clinic Section */}
      <section className="py-12 lg:py-20 bg-gray-50 border-t border-[#E8E6E3]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl text-[#2E2E2E] mb-6">
              О клинике
            </h2>
            <p className="text-gray-600 text-lg lg:text-xl max-w-3xl mx-auto">
              Современный медицинский центр с передовым оборудованием и командой профессионалов
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Clinic Info */}
            <div>
              <div className="space-y-6">
                <div className="bg-white border border-[#E8E6E3] rounded-lg p-6 hover:border-[#18A36C] transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex justify-center">
                      <Building className="w-6 h-6 text-[#18A36C]" />
                    </div>
                    <h3 className="text-xl text-[#2E2E2E]">Технологические помещения</h3>
                  </div>
                  <p className="text-gray-600">Просторные кабинеты с новейшим медицинским оборудованием экспертного класса</p>
                </div>

                <div className="bg-white border border-[#E8E6E3] rounded-lg p-6 hover:border-[#18A36C] transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex justify-center">
                      <Award className="w-6 h-6 text-[#18A36C]" />
                    </div>
                    <h3 className="text-xl text-[#2E2E2E]">Лицензии и сертификаты</h3>
                  </div>
                  <p className="text-gray-600">Все необходимые разрешения и международные стандарты качества</p>
                </div>

                <div className="bg-white border border-[#E8E6E3] rounded-lg p-6 hover:border-[#18A36C] transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex justify-center">
                      <Clock className="w-6 h-6 text-[#18A36C]" />
                    </div>
                    <h3 className="text-xl text-[#2E2E2E]">Удобный график</h3>
                  </div>
                  <p className="text-gray-600">Работаем для вас в будние дни с 08:00 до 21:00, в выходные с 09:00 до 18:00</p>
                </div>
              </div>
            </div>

            {/* Clinic Image */}
            <div>
              <div className="border border-[#E8E6E3] rounded-lg overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1758101512269-660feabf64fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBtZWRpY2FsJTIwY2xpbmljJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzU5NzU1OTc3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Интерьер клиники Doctor Family"
                  className="w-full h-64 lg:h-80 object-cover"
                />
              </div>
              <div className="text-center mt-6">
                <Button
                  variant="outline"
                  className="border-[#18A36C] text-[#18A36C] px-8 py-4 h-auto text-lg rounded-lg hover:shadow-xl hover:shadow-[#18A36C]/20"
                  onClick={() => router.push("/clinic")}
                >
                  Подробнее о клинике
                  <ArrowRight className="w-5 h-5 ml-[2.5px]" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Patient Section */}
      <section className="py-12 lg:py-20 bg-white border-t border-[#E8E6E3]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl text-[#2E2E2E] mb-6">
              Пациенту
            </h2>
            <p className="text-gray-600 text-lg lg:text-xl max-w-3xl mx-auto">
              Вся необходимая информация для комфортного посещения клиники
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-[#E8E6E3] rounded-lg p-6 text-center hover:border-[#18A36C] transition-all duration-300">
              <div className="flex justify-center mb-4">
                <FileText className="w-8 h-8 text-[#18A36C]" />
              </div>
              <h3 className="text-lg text-[#2E2E2E] mb-3">Подготовка к визиту</h3>
              <p className="text-gray-600 text-sm">Как подготовиться к приёму и какие документы взять с собой</p>
            </div>

            <div className="bg-white border border-[#E8E6E3] rounded-lg p-6 text-center hover:border-[#18A36C] transition-all duration-300">
              <div className="flex justify-center mb-4">
                <Calendar className="w-8 h-8 text-[#18A36C]" />
              </div>
              <h3 className="text-lg text-[#2E2E2E] mb-3">Услуги</h3>
              <p className="text-gray-600 text-sm">Широкий спектр медицинских услуг</p>
            </div>

            <div className="bg-white border border-[#E8E6E3] rounded-lg p-6 text-center hover:border-[#18A36C] transition-all duration-300">
              <div className="flex justify-center mb-4">
                <Heart className="w-8 h-8 text-[#18A36C]" />
              </div>
              <h3 className="text-lg text-[#2E2E2E] mb-3">Программы здоровья</h3>
              <p className="text-gray-600 text-sm">Комплексные программы профилактики и диагностики</p>
            </div>

            <div className="bg-white border border-[#E8E6E3] rounded-lg p-6 text-center hover:border-[#18A36C] transition-all duration-300">
              <div className="flex justify-center mb-4">
                <Phone className="w-8 h-8 text-[#18A36C]" />
              </div>
              <h3 className="text-lg text-[#2E2E2E] mb-3">Постоянная поддержка</h3>
              <p className="text-gray-600 text-sm">Консультации и своевременная помощь</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button
              className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white px-8 py-4 h-auto text-lg rounded-lg transition-all duration-300"
              onClick={() => router.push("/patient")}
            >
              Вся информация для пациентов
              <ArrowRight className="w-5 h-5 ml-[2.5px]" />
            </Button>
          </div>
        </div>
      </section>

      {/* Specialists Section */}
      <section className="py-12 lg:py-20 bg-gray-50 border-t border-[#E8E6E3]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl text-[#2E2E2E] mb-6">
              Наши специалисты
            </h2>
            <p className="text-gray-600 text-lg lg:text-xl max-w-3xl mx-auto">
              Команда высококвалифицированных врачей с многолетним опытом работы
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white border border-[#E8E6E3] rounded-lg p-8 text-center hover:border-[#18A36C] transition-all duration-300">
              <div className="w-20 h-20 bg-[#18A36C]/10 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-[#18A36C]" />
              </div>
              <h3 className="text-2xl text-[#2E2E2E] mb-2">15+</h3>
              <p className="text-gray-600 mb-4">Опытных врачей</p>
              <p className="text-sm text-gray-600">Высококвалифицированные специалисты с международными сертификатами</p>
            </div>

            <div className="bg-white border border-[#E8E6E3] rounded-lg p-8 text-center hover:border-[#18A36C] transition-all duration-300">
              <div className="w-20 h-20 bg-[#18A36C]/10 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Star className="w-10 h-10 text-[#18A36C]" />
              </div>
              <h3 className="text-2xl text-[#2E2E2E] mb-2">4.9</h3>
              <p className="text-gray-600 mb-4">Средний рейтинг</p>
              <p className="text-sm text-gray-600">Высокие оценки пациентов за профессионализм и внимание</p>
            </div>

            <div className="bg-white border border-[#E8E6E3] rounded-lg p-8 text-center hover:border-[#18A36C] transition-all duration-300">
              <div className="w-20 h-20 bg-[#18A36C]/10 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Award className="w-10 h-10 text-[#18A36C]" />
              </div>
              <h3 className="text-2xl text-[#2E2E2E] mb-2">20+</h3>
              <p className="text-gray-600 mb-4">Лет опыта</p>
              <p className="text-sm text-gray-600">Средний стаж работы наших ведущих специалистов</p>
            </div>
          </div>

          <div className="text-center">
            <Button
              className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white px-8 py-4 h-auto text-lg rounded-lg transition-all duration-300"
              onClick={() => router.push("/doctors")}
            >
              Познакомиться с врачами
              <ArrowRight className="w-5 h-5 ml-[2.5px]" />
            </Button>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-12 lg:py-20 bg-white border-t border-[#E8E6E3]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl text-[#2E2E2E] mb-6">
              Отзывы пациентов
            </h2>
            <p className="text-gray-600 text-lg lg:text-xl max-w-3xl mx-auto">
              Мнения тех, кто уже получил качественную медицинскую помощь в нашей клинике
            </p>
          </div>

          {feedbacksLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-[#E8E6E3] rounded-lg p-6 animate-pulse">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : feedbacks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {feedbacks.map((feedback) => (
                <div
                  key={feedback.id}
                  className="bg-white border border-[#E8E6E3] rounded-lg p-6 hover:border-[#18A36C] transition-all duration-300"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-lg mr-4 flex-shrink-0 overflow-hidden">
                      <ImageWithFallback
                        src={feedback.image_url}
                        alt={feedback.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-[#2E2E2E] font-medium">{feedback.name}</h4>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < feedback.grade
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                              }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {feedback.text}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Отзывы загружаются...</p>
            </div>
          )}

          <div className="text-center">
            <Button
              variant="outline"
              className="border-[#18A36C] text-[#18A36C] px-8 py-4 h-auto text-lg rounded-lg hover:shadow-xl hover:shadow-[#18A36C]/20"
              onClick={() => router.push("/clinic/reviews")}
            >
              Все отзывы
              <ArrowRight className="w-5 h-5 ml-[2.5px]" />
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 lg:py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-5xl text-[#2E2E2E] mb-6">
              {homePageConfig.contactSection.title}
            </h2>
            <p className="text-gray-600 text-lg lg:text-xl leading-relaxed max-w-3xl mx-auto">
              {homePageConfig.contactSection.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div className="space-y-6">
              <div className="space-y-6">
                {/* Phone */}
                <div className="bg-white border border-[#E8E6E3] rounded-lg p-6">
                  <h3 className="text-xl text-[#2E2E2E] mb-4 flex items-center gap-3">
                    {React.createElement(iconMap.Phone, { className: "w-5 h-5 text-[#18A36C]" })}
                    {homePageConfig.contactSection.contactInfo.phone.title}
                  </h3>
                  {contactsLoading || !contacts ? (
                    <p className="text-[#2E2E2E] mb-2">
                      <TextSkeleton className="w-36 h-6" />
                    </p>
                  ) : (
                    <a
                      href={`tel:${contacts.phone_number.replace(/[\s\-]/g, '')}`}
                      className="text-[#2E2E2E] hover:text-[#18A36C] transition-colors cursor-pointer block mb-2"
                    >
                      {contacts.phone_number}
                    </a>
                  )}
                  <p className="text-sm text-gray-600">
                    {homePageConfig.contactSection.contactInfo.phone.description}
                  </p>
                  {homePageConfig.contactSection.contactInfo.phone.description2 && (
                    <p className="text-sm text-gray-600">
                      {homePageConfig.contactSection.contactInfo.phone.description2}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div className="bg-white border border-[#E8E6E3] rounded-lg p-6">
                  <h3 className="text-xl text-[#2E2E2E] mb-4 flex items-center gap-3">
                    {React.createElement(iconMap.MapPin, { className: "w-5 h-5 text-[#18A36C]" })}
                    {homePageConfig.contactSection.contactInfo.address.title}
                  </h3>
                  {contactsLoading || !contacts ? (
                    <p className="text-[#2E2E2E] mb-2">
                      <TextSkeleton className="w-64 h-6" />
                    </p>
                  ) : (
                    <a
                      href={`https://yandex.ru/maps/?text=${encodeURIComponent(contacts.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2E2E2E] hover:text-[#18A36C] transition-colors cursor-pointer block mb-2"
                    >
                      {contacts.address}
                    </a>
                  )}
                  <p className="text-sm text-gray-600">
                    {homePageConfig.contactSection.contactInfo.address.description}
                  </p>
                  {homePageConfig.contactSection.contactInfo.address.description2 && (
                    <p className="text-sm text-gray-600">
                      {homePageConfig.contactSection.contactInfo.address.description2}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="bg-white border border-[#E8E6E3] rounded-lg p-6">
                  <h3 className="text-xl text-[#2E2E2E] mb-4 flex items-center gap-3">
                    {React.createElement(iconMap.Mail, { className: "w-5 h-5 text-[#18A36C]" })}
                    {homePageConfig.contactSection.contactInfo.email.title}
                  </h3>
                  {contactsLoading || !contacts ? (
                    <p className="text-[#2E2E2E] mb-2">
                      <TextSkeleton className="w-48 h-6" />
                    </p>
                  ) : (
                    <a
                      href={`mailto:${contacts.email}`}
                      className="text-[#2E2E2E] hover:text-[#18A36C] transition-colors cursor-pointer block mb-2"
                    >
                      {contacts.email}
                    </a>
                  )}
                  <p className="text-sm text-gray-600">
                    {homePageConfig.contactSection.contactInfo.email.description}
                  </p>
                </div>
              </div>
              <div className="text-center lg:text-left">
                <Button
                  className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white px-8 py-4 h-auto text-lg rounded-lg transition-all duration-300"
                  onClick={() => router.push("/contacts")}
                >
                  {homePageConfig.contactSection.buttonText}
                  <ArrowRight className="w-5 h-5 ml-[2.5px]" />
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border border-[#E8E6E3] rounded-lg overflow-hidden">
                <ImageWithFallback
                  src={homePageConfig.contactSection.image}
                  alt={homePageConfig.contactSection.imageAlt}
                  className="w-full h-64 lg:h-72 object-cover"
                />
              </div>

              <div className="bg-white border border-[#E8E6E3] rounded-lg p-8 text-center">
                <div className="flex justify-center mb-4">
                  {React.createElement(iconMap.MapPin, {
                    className: "w-12 h-12 text-[#18A36C]",
                  })}
                </div>
                <h4 className="text-lg text-[#2E2E2E] mb-2">
                  {homePageConfig.contactSection.location.title}
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  {homePageConfig.contactSection.location.description}
                </p>
                <Button
                  variant="outline"
                  className="border-[#18A36C] text-[#18A36C] px-8 py-4 h-auto text-lg rounded-lg hover:shadow-xl hover:shadow-[#18A36C]/20 cursor-pointer"
                  onClick={() => window.open("https://maps.google.com", "_blank")}
                >
                  {homePageConfig.contactSection.location.mapButtonText}
                  <ArrowRight className="w-5 h-5 ml-[2.5px]" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
