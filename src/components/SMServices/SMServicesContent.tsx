'use client';

import { Stethoscope, Phone, ArrowRight } from 'lucide-react';
import { Button } from '../common/SMButton/SMButton';
import { Card } from '../common/SMCard/SMCard';
import servicesContentConfig from '@/config/servicesContent.json';
import { iconMap, IconName } from '@/utils/iconMapper';
import { useRouter } from 'next/navigation';

export function ServicesContent() {
  const router = useRouter();

  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div
          className="mb-8 lg:mb-12"
        >
          <div className="text-center mb-6 lg:mb-8">
            <div className="w-16 h-16 bg-[#18A36C] rounded-lg flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl lg:text-3xl text-[#2E2E2E] mb-3 lg:mb-4">
              {servicesContentConfig.header.title}
            </h1>
            <p className="text-gray-600 leading-relaxed text-sm lg:text-base">
              {servicesContentConfig.header.subtitle}
            </p>
          </div>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-8"
        >
          {servicesContentConfig.services.map((service, index) => {
            const Icon = iconMap[service.icon as IconName];
            return (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 border border-[#E8E6E3] hover:border-[#18A36C] rounded-lg"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#18A36C]/10 rounded-lg flex items-center justify-center group-hover:bg-[#18A36C]/20 transition-all duration-300 flex-shrink-0">
                      <Icon className="w-6 h-6 text-[#18A36C]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg text-[#2E2E2E] mb-2 group-hover:text-[#18A36C] transition-colors duration-300">
                        {service.name}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div
          className="text-center bg-white border border-[#E8E6E3] rounded-lg p-8 lg:p-12"
        >
          <h2 className="text-xl lg:text-2xl text-[#2E2E2E] mb-3 lg:mb-4">
            {servicesContentConfig.ctaSection.title}
          </h2>
          <p className="text-gray-600 mb-6 lg:mb-8 text-sm lg:text-base">
            {servicesContentConfig.ctaSection.subtitle}{' '}
            <span className="lg:inline hidden">слева</span>
            <span className="lg:hidden inline">выше</span>
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 lg:gap-6">
            <Button
              onClick={() => router.push('/contacts')}
              className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white px-8 py-4 h-auto rounded-lg transition-all duration-300 cursor-pointer"
            >
              {servicesContentConfig.ctaSection.buttons.online}
              <ArrowRight className="w-5 h-5 ml-[2.5px]" />
            </Button>
            <Button
              onClick={() => router.push('/contacts')}
              variant="outline"
              className="border-[#18A36C] text-[#18A36C] px-8 py-4 h-auto rounded-lg hover:shadow-xl hover:shadow-[#18A36C]/20 cursor-pointer"
            >
              {servicesContentConfig.ctaSection.buttons.call}
              <Phone className="w-5 h-5 ml-[2.5px]" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
