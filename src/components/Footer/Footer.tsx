'use client';

import { ChevronRight, Phone, Mail, MapPin, Clock } from "lucide-react";
import { Button } from "../common/SMButton/SMButton";
import SMLogo from "@/icons/SMLogo";
import { useRouter, usePathname } from "next/navigation";
import footerConfig from "@/config/footer.json";
import { useContacts } from "@/hooks/useContacts";

// Компонент скелетона для текста
function TextSkeleton({ className = '' }: { className?: string }) {
  return <span className={`inline-block animate-pulse bg-gray-200 rounded ${className}`}>&nbsp;</span>;
}

export function Footer() {
  const router = useRouter();
  const pathname = usePathname();
  const { contacts, loading: contactsLoading } = useContacts();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  // Не показываем футер на страницах админки
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-[#F8F8F8] text-[#2E2E2E]">
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-8 lg:pt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-8 lg:mb-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="mb-4 lg:mb-6">
              <button onClick={() => handleNavigation("/")} className="mb-3 cursor-pointer">
                <SMLogo />
              </button>

              <p className="text-gray-600 text-sm lg:text-base leading-relaxed">
                {footerConfig.companyInfo.description}
              </p>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg text-[#2E2E2E] mb-3 lg:mb-4">Услуги</h4>
            <ul className="space-y-2 text-sm lg:text-base">
              {footerConfig.services.map((service, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleNavigation(service.path)}
                    className="text-gray-600 hover:text-[#18A36C] transition-colors cursor-pointer"
                  >
                    {service.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Information Links */}
          <div>
            <h4 className="text-lg text-[#2E2E2E] mb-3 lg:mb-4">Информация</h4>
            <ul className="space-y-2 text-sm lg:text-base">
              {footerConfig.informationLinks.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleNavigation(link.path)}
                    className="text-gray-600 hover:text-[#18A36C] transition-colors cursor-pointer"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg text-[#2E2E2E] mb-3 lg:mb-4">Контакты</h4>
            <div className="space-y-3 lg:space-y-4">
              <div className="flex items-start gap-2 lg:gap-3">
                <Phone className="w-4 h-4 lg:w-5 lg:h-5 mt-0.5 flex-shrink-0 text-[#18A36C]" />
                <div>
                  {contactsLoading || !contacts ? (
                    <TextSkeleton className="w-32 h-5" />
                  ) : (
                    <a
                      href={`tel:${contacts.phone_number.replace(/[\s\-]/g, '')}`}
                      className="text-[#2E2E2E] text-sm lg:text-base hover:text-[#18A36C] transition-colors cursor-pointer"
                    >
                      {contacts.phone_number}
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2 lg:gap-3">
                <Mail className="w-4 h-4 lg:w-5 lg:h-5 mt-0.5 flex-shrink-0 text-[#18A36C]" />
                <div>
                  {contactsLoading || !contacts ? (
                    <TextSkeleton className="w-40 h-5" />
                  ) : (
                    <a
                      href={`mailto:${contacts.email}`}
                      className="text-[#2E2E2E] text-sm lg:text-base hover:text-[#18A36C] transition-colors cursor-pointer"
                    >
                      {contacts.email}
                    </a>
                  )}
                  <div className="text-gray-500 text-xs lg:text-sm">
                    {footerConfig.contactInfo.email.responseTime}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 lg:gap-3">
                <MapPin className="w-4 h-4 lg:w-5 lg:h-5 mt-0.5 flex-shrink-0 text-[#18A36C]" />
                <div>
                  {contactsLoading || !contacts ? (
                    <TextSkeleton className="w-48 h-5" />
                  ) : (
                    <a
                      href={`https://yandex.ru/maps/?text=${encodeURIComponent(contacts.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2E2E2E] text-sm lg:text-base hover:text-[#18A36C] transition-colors cursor-pointer"
                    >
                      {contacts.address}
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2 lg:gap-3">
                <Clock className="w-4 h-4 lg:w-5 lg:h-5 mt-0.5 flex-shrink-0 text-[#18A36C]" />
                <div>
                  <div className="text-[#2E2E2E] text-sm lg:text-base">
                    {footerConfig.contactInfo.schedule.title}
                  </div>
                  <div className="text-gray-500 text-xs lg:text-sm">
                    {contactsLoading || !contacts ? (
                      <TextSkeleton className="w-24 h-4" />
                    ) : (
                      contacts.work_hours_main
                    )}
                  </div>
                  <div className="text-gray-500 text-xs lg:text-sm">
                    {contactsLoading || !contacts ? (
                      <TextSkeleton className="w-24 h-4" />
                    ) : (
                      contacts.work_hours_sunday
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col lg:flex-row pt-6 lg:pt-8 border-t border-gray-300 justify-center items-center">

          <div className="text-center lg:text-right">
            <div className="text-gray-500 text-xs lg:text-sm">
              {footerConfig.companyInfo.copyright}
            </div>
            <div className="text-gray-400 text-xs mt-1">
              {footerConfig.companyInfo.license}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
