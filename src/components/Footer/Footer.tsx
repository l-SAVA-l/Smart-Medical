'use client';
import {
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Clock,
} from "lucide-react";
import { Button } from "../common/SMButton/SMButton";
import SMLogo from "@/icons/SMLogo";
import { useRouter } from "next/navigation";

export function Footer() {
  const  navigate  = useRouter();

  return (
    <footer className="bg-[#F8F8F8] text-[#2E2E2E]">
      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-16">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-8 lg:mb-12">
          {/* Logo and description */}
          <div className="lg:col-span-1">
            <div className="mb-4 lg:mb-6">
              {/* Logo from Header */}
              <button onClick={() => navigate.push("/")} className="mb-3">
                <SMLogo></SMLogo>
              </button>

              <p className="text-gray-600 text-sm lg:text-base leading-relaxed">
                Современная медицинская клиника в Минске.
                Профессиональная медицина нового уровня.
              </p>
            </div>

            {/* Newsletter */}
            <div className="mb-4 lg:mb-6">
              <h4 className="text-lg text-[#2E2E2E] mb-2 lg:mb-3">
                Новости клиники
              </h4>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Ваш email"
                  className="flex-1 px-3 lg:px-4 py-2 bg-white border border-gray-300 text-[#2E2E2E] text-sm lg:text-base rounded-lg focus:outline-none focus:border-[#18A36C]"
                />
                <Button className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white px-4 lg:px-6 py-2 rounded-lg">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg text-[#2E2E2E] mb-3 lg:mb-4">
              Услуги
            </h4>
            <ul className="space-y-2 text-sm lg:text-base">
              <li>
                <button
                  onClick={() => navigate.push("/services")}
                  className="text-gray-600 hover:text-[#18A36C] transition-colors"
                >
                  Стоматология
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate.push("/services")}
                  className="text-gray-600 hover:text-[#18A36C] transition-colors"
                >
                  Гинекология
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate.push("/services")}
                  className="text-gray-600 hover:text-[#18A36C] transition-colors"
                >
                  УЗИ диагностика
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate.push("/services")}
                  className="text-gray-600 hover:text-[#18A36C] transition-colors"
                >
                  Детские услуги
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate.push("/services")}
                  className="text-gray-600 hover:text-[#18A36C] transition-colors"
                >
                  Эндокринология
                </button>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="text-lg text-[#2E2E2E] mb-3 lg:mb-4">
              Информация
            </h4>
            <ul className="space-y-2 text-sm lg:text-base">
              <li>
                <button
                  onClick={() => navigate.push("/doctors")}
                  className="text-gray-600 hover:text-[#18A36C] transition-colors"
                >
                  Наши врачи
                </button>
              </li>

              <li>
                <button
                  onClick={() => navigate.push("/clinic")}
                  className="text-gray-600 hover:text-[#18A36C] transition-colors"
                >
                  О клинике
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate.push("/contacts")}
                  className="text-gray-600 hover:text-[#18A36C] transition-colors"
                >
                  Контакты
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate.push("/patient")}
                  className="text-gray-600 hover:text-[#18A36C] transition-colors"
                >
                  Пациенту
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg text-[#2E2E2E] mb-3 lg:mb-4">
              Контакты
            </h4>
            <div className="space-y-3 lg:space-y-4">
              <div className="flex items-start gap-2 lg:gap-3">
                <Phone className="w-4 h-4 lg:w-5 lg:h-5 mt-0.5 flex-shrink-0 text-[#18A36C]" />
                <div>
                  <div className="text-[#2E2E2E] text-sm lg:text-base">
                    +375 29 161-01-01
                  </div>
                  <div className="text-gray-500 text-xs lg:text-sm">
                    Ежедневно с 9:00 до 21:00
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 lg:gap-3">
                <Mail className="w-4 h-4 lg:w-5 lg:h-5 mt-0.5 flex-shrink-0 text-[#18A36C]" />
                <div>
                  <div className="text-[#2E2E2E] text-sm lg:text-base">
                    smartmedical.by@gmail.com
                  </div>
                  <div className="text-gray-500 text-xs lg:text-sm">
                    Ответим в течение 24 часов
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 lg:gap-3">
                <MapPin className="w-4 h-4 lg:w-5 lg:h-5 mt-0.5 flex-shrink-0 text-[#18A36C]" />
                <div>
                  <div className="text-[#2E2E2E] text-sm lg:text-base">
                    г. Минск, пр. Победителей, д. 119, пом. 504
                  </div>
                  <div className="text-gray-500 text-xs lg:text-sm">
                    Центр города, удобная парковка
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 lg:gap-3">
                <Clock className="w-4 h-4 lg:w-5 lg:h-5 mt-0.5 flex-shrink-0 text-[#18A36C]" />
                <div>
                  <div className="text-[#2E2E2E] text-sm lg:text-base">
                    Режим работы
                  </div>
                  <div className="text-gray-500 text-xs lg:text-sm">
                    Пн-Вс: 9:00-21:00
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social links */}
        <div className="flex flex-col lg:flex-row justify-between items-center pt-6 lg:pt-8 border-t border-gray-300">
          <div className="mb-4 lg:mb-0">
            <div className="flex gap-2 lg:gap-3">
              <a
                href="#"
                className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-200 flex items-center justify-center text-[#2E2E2E] hover:bg-[#18A36C] hover:text-white transition-all rounded-lg"
              >
                <span className="text-xs lg:text-sm">VK</span>
              </a>
              <a
                href="#"
                className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-200 flex items-center justify-center text-[#2E2E2E] hover:bg-[#18A36C] hover:text-white transition-all rounded-lg"
              >
                <span className="text-xs lg:text-sm">F</span>
              </a>
              <a
                href="#"
                className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-200 flex items-center justify-center text-[#2E2E2E] hover:bg-[#18A36C] hover:text-white transition-all rounded-lg"
              >
                <span className="text-xs lg:text-sm">IG</span>
              </a>
              <a
                href="#"
                className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-200 flex items-center justify-center text-[#2E2E2E] hover:bg-[#18A36C] hover:text-white transition-all rounded-lg"
              >
                <span className="text-xs lg:text-sm">YT</span>
              </a>
            </div>
          </div>

          <div className="text-center lg:text-right">
            <div className="text-gray-500 text-xs lg:text-sm">
              © 2025 Doctor Family. Все права защищены.
            </div>
            <div className="text-gray-400 text-xs mt-1">
              Лицензия на медицинскую деятельность от 15.06.2020
              г.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
