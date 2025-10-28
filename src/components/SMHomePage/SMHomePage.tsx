"use client"
import { useState, useEffect } from "react";
import {
  Calendar,
  Phone,
  ArrowRight,
  Stethoscope,
  UserCheck,
  Activity,
  Timer,
  MapPin,
  Mail,
  Eye,
  Building,
  FileText,
  Users,
  Star,
  Clock,
  Award,
  Heart
} from "lucide-react";
import { Button } from "../common/SMButton/SMButton";
import { useRouter } from "../SMRouter/SMRouter";
import { ImageWithFallback } from "../SMImage/ImageWithFallback";

export function SMHomePage() {
  const { navigate } = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const services = [
    {
      id: "konsultacii",
      name: "Консультации специалистов",
      description: "Более 15 врачей различных направлений готовы помочь вам",
      icon: Stethoscope,
    },
    {
      id: "diagnostika",
      name: "Современная диагностика",
      description: "Точные результаты с использованием новейшего оборудования",
      icon: Activity,
    },
    {
      id: "lechenie",
      name: "Эффективное лечение",
      description: "Персональные программы лечения для каждого пациента",
      icon: UserCheck,
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4 py-12 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">

            {/* Main Headline */}
            <h1 className="text-4xl lg:text-6xl xl:text-7xl text-[#2E2E2E] mb-8 leading-tight">
              Профессиональная медицина
              <br />
              <span className="text-[#18A36C]">нового уровня</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Объединяем опыт лучших врачей Беларуси, передовые медицинские технологии
              и персональный подход для вашего благополучия
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button
                className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white px-8 py-4 h-auto text-lg rounded-lg transition-all duration-300"
                onClick={() => navigate("/doctors")}
              >
                Записаться на приём
                <ArrowRight className="w-5 h-5 ml-[2.5px]" />
              </Button>

              <Button
                variant="outline"
                className="border-2 border-[#18A36C] text-[#18A36C] hover:bg-[#18A36C] hover:text-white px-8 py-4 h-auto text-lg rounded-lg transition-all duration-300"
                onClick={() => navigate("/services")}
              >
                Наши услуги
                <Eye className="w-5 h-5 ml-[2.5px]" />
              </Button>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white border border-[#E8E6E3] rounded-lg p-8 hover:border-[#18A36C] transition-all duration-300 text-center">
                <div className="flex justify-center mb-4">
                  <UserCheck className="w-8 h-8 text-[#18A36C]" />
                </div>
                <h3 className="text-xl text-[#2E2E2E] mb-2">15+ специалистов</h3>
                <p className="text-gray-600 text-sm">Врачи высшей категории</p>
              </div>

              <div className="bg-white border border-[#E8E6E3] rounded-lg p-8 hover:border-[#18A36C] transition-all duration-300 text-center">
                <div className="flex justify-center mb-4">
                  <Activity className="w-8 h-8 text-[#18A36C]" />
                </div>
                <h3 className="text-xl text-[#2E2E2E] mb-2">Современное оборудование</h3>
                <p className="text-gray-600 text-sm">Точная диагностика</p>
              </div>

              <div className="bg-white border border-[#E8E6E3] rounded-lg p-8 hover:border-[#18A36C] transition-all duration-300 text-center">
                <div className="flex justify-center mb-4">
                  <Timer className="w-8 h-8 text-[#18A36C]" />
                </div>
                <h3 className="text-xl text-[#2E2E2E] mb-2">Быстрый результат</h3>
                <p className="text-gray-600 text-sm">Минимум ожидания</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 lg:py-20 bg-white border-t border-[#E8E6E3]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl text-[#2E2E2E] mb-6">
              Наши услуги
            </h2>
            <p className="text-gray-600 text-lg lg:text-xl max-w-3xl mx-auto">
              Полный спектр медицинских услуг с использованием передовых технологий и персональным подходом
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {services.map((service, index) => (
              <div
                key={service.name}
                className="group cursor-pointer"
                onClick={() => navigate("/services")}
              >
                <div className="bg-white border border-[#E8E6E3] rounded-lg p-8 hover:border-[#18A36C] transition-all duration-300 h-full text-center flex flex-col">
                  <div className="flex justify-center mb-6">
                    <service.icon className="w-8 h-8 text-[#18A36C]" />
                  </div>

                  <h3 className="text-xl lg:text-2xl text-[#2E2E2E] mb-4">{service.name}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed flex-grow">{service.description}</p>

                  <div className="flex items-center justify-center text-[#18A36C] group-hover:text-[#18A36C]/80 transition-colors">
                    <span className="mr-2">Подробнее</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button
              className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white px-8 py-4 h-auto text-lg rounded-lg transition-all duration-300"
              onClick={() => navigate("/services")}
            >
              Все услуги
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
              Готовы позаботиться о своём здоровье?
            </h2>
            <p className="text-gray-600 text-lg lg:text-xl leading-relaxed max-w-3xl mx-auto">
              Запишитесь на консультацию прямо сейчас и получите профессиональную медицинскую помощь
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Contact Info */}
            <div className="space-y-6">
              {/* Contact Details */}
              <div className="space-y-6">
                <div className="bg-white border border-[#E8E6E3] rounded-lg p-6">
                  <h3 className="text-xl text-[#2E2E2E] mb-4 flex items-center gap-3">
                    <Phone className="w-5 h-5 text-[#18A36C]" />
                    Телефон
                  </h3>
                  <p className="text-[#2E2E2E] mb-2">+375 29 161-01-01</p>
                  <p className="text-sm text-gray-600">Ежедневно с 9:00 до 21:00</p>
                </div>

                <div className="bg-white border border-[#E8E6E3] rounded-lg p-6">
                  <h3 className="text-xl text-[#2E2E2E] mb-4 flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-[#18A36C]" />
                    Адрес
                  </h3>
                  <p className="text-[#2E2E2E] mb-2">г. Минск, пр. Победителей, д. 119, пом. 504</p>
                  <p className="text-sm text-gray-600">Легко добраться на транспорте</p>
                </div>

                <div className="bg-white border border-[#E8E6E3] rounded-lg p-6">
                  <h3 className="text-xl text-[#2E2E2E] mb-4 flex items-center gap-3">
                    <Mail className="w-5 h-5 text-[#18A36C]" />
                    Email
                  </h3>
                  <p className="text-[#2E2E2E] mb-2">smartmedical.by@gmail.com</p>
                  <p className="text-sm text-gray-600">Ответим в течение 24 часов</p>
                </div>
              </div>

              {/* CTA Button */}
              <div className="text-center lg:text-left">
                <Button
                  className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white px-8 py-4 h-auto text-lg rounded-lg transition-all duration-300"
                  onClick={() => navigate("/contacts")}
                >
                  Записаться сейчас
                  <ArrowRight className="w-5 h-5 ml-[2.5px]" />
                </Button>
              </div>
            </div>

            {/* Location & Image */}
            <div className="space-y-6">
              {/* Office Image */}
              <div className="border border-[#E8E6E3] rounded-lg overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1744190070208-4b348963252b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBtZWRpY2FsJTIwb2ZmaWNlJTIwYnVpbGRpbmclMjBleHRlcmlvcnxlbnwxfHx8fDE3NTkyMjYwODJ8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Doctor Family Clinic Building"
                  className="w-full h-64 lg:h-72 object-cover"
                />
              </div>

              {/* Map placeholder */}
              <div className="bg-white border border-[#E8E6E3] rounded-lg p-8 text-center">
                <div className="flex justify-center mb-4">
                  <MapPin className="w-12 h-12 text-[#18A36C]" />
                </div>
                <h4 className="text-lg text-[#2E2E2E] mb-2">Удобное расположение</h4>
                <p className="text-gray-600 text-sm mb-4">
                  Клиника находится в самом центре Минска, рядом с метро и остановками общественного транспорта
                </p>
                <Button
                  variant="outline"
                  className="border-2 border-[#18A36C] text-[#18A36C] hover:bg-[#18A36C] hover:text-white px-8 py-4 h-auto text-lg rounded-lg transition-all duration-300"
                  onClick={() => window.open('https://maps.google.com', '_blank')}
                >
                  Показать на карте
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