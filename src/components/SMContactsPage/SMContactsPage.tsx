"use client"
import { MapPin, Phone, Clock, Mail, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../common/SMButton/SMButton";
import { useRouter } from "../SMRouter/SMRouter";

export function SMContactsPage() {
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
          <MapPin className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl lg:text-4xl text-white mb-4">Контакты</h1>
        <p className="text-white/90 leading-relaxed text-base lg:text-lg max-w-3xl mx-auto">
          Свяжитесь с нами удобным для вас способом. Мы работаем без выходных и готовы ответить на все ваши вопросы.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Contact Information */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Address */}
          <div className="bg-white rounded-lg p-6 border border-[#E8E6E3] hover:border-[#18A36C] transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#18A36C] rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg text-[#2E2E2E] mb-2">Адрес</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Минск, пр. Победителей, д. 119
                </p>
                <p className="text-[#2E2E2E] text-sm mt-1">
                  Ст. метро "Пушкинская"
                </p>
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="bg-white rounded-lg p-6 border border-[#E8E6E3] hover:border-[#18A36C] transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#18A36C] rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg text-[#2E2E2E] mb-3">Время работы</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center gap-6">
                    <span className="text-gray-600">Понедельник - Суббота</span>
                    <span className="text-[#2E2E2E]">09:00 - 21:00</span>
                  </div>
                  <div className="flex justify-between items-center gap-6">
                    <span className="text-gray-600">Воскресенье</span>
                    <span className="text-[#2E2E2E]">10:00 - 18:00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Phone Numbers */}
          <div className="bg-white rounded-lg p-6 border border-[#E8E6E3] hover:border-[#18A36C] transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#18A36C] rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg text-[#2E2E2E] mb-3">Телефоны</h3>
                <div className="space-y-2">
                  <a href="tel:+375291610101" className="block text-[#2E2E2E] hover:text-[#18A36C] transition-colors text-sm">
                    +375-29-161-01-01
                  </a>
                  <a href="tel:+375336111000" className="block text-[#2E2E2E] hover:text-[#18A36C] transition-colors text-sm">
                    +375-33-611-10-00
                  </a>
                  <a href="tel:+375291610808" className="block text-[#2E2E2E] hover:text-[#18A36C] transition-colors text-sm">
                    +375-29-161-08-08
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="bg-white rounded-lg p-6 border border-[#E8E6E3] hover:border-[#18A36C] transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#18A36C] rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg text-[#2E2E2E] mb-2">Email</h3>
                <a href="mailto:smartmedical.by@gmail.com" className="text-[#2E2E2E] hover:text-[#18A36C] transition-colors text-sm">
                  smartmedical.by@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg p-6 border border-[#E8E6E3] text-center">
            <h3 className="text-lg text-[#2E2E2E] mb-4">Записаться на приём</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white px-8 py-4 h-auto text-lg rounded-lg transition-all duration-300 flex-1"
                onClick={() => window.open('tel:+375291610101')}
              >
                Позвонить
                <Phone className="w-5 h-5 ml-[2.5px]" />
              </Button>
              <Button 
                variant="outline"
                className="border-2 border-[#18A36C] text-[#18A36C] hover:bg-[#18A36C] hover:text-white px-8 py-4 h-auto text-lg rounded-lg transition-all duration-300 flex-1"
              >
                Онлайн запись
                <ArrowRight className="w-5 h-5 ml-[2.5px]" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Map */}
        <motion.div
          className="bg-white rounded-lg p-6 border border-[#E8E6E3] self-start"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-lg text-[#2E2E2E] mb-4">Как нас найти</h3>
          <div className="h-[400px] rounded-lg overflow-hidden bg-[#E8E6E3] border border-[#E8E6E3]">
            <iframe
              src="https://yandex.ru/map-widget/v1/?um=constructor%3Ae6b6b92b5e178d58ea5b9508e45c9bd1c01c0888b4e7098056c9b8da68dd0bb1&source=constructor"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Doctor Family Clinic Location"
            ></iframe>
          </div>
          <p className="text-gray-600 text-xs mt-3 text-center">
            Нажмите на карту для увеличения и построения маршрута
          </p>
        </motion.div>
      </div>

      {/* Additional Information */}
      <motion.div
        className="mt-6 lg:mt-10 bg-white rounded-lg p-6 lg:p-8 border border-[#E8E6E3]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div className="text-center max-w-2xl mx-auto">
          <h3 className="text-xl text-[#2E2E2E] mb-4">Удобное расположение</h3>
          <p className="text-gray-600 text-sm lg:text-base leading-relaxed">
            Наша клиника находится в самом центре Минска, всего в нескольких минутах ходьбы от станции метро "Пушкинская". 
            Удобная парковка и отличная транспортная доступность делают посещение нашей клиники максимально комфортным для всех пациентов.
          </p>
        </div>
      </motion.div>
    </div>
  );
}