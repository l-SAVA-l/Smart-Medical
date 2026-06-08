"use client";

import { MapPin, Phone, Clock, Mail, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../common/SMButton/SMButton";
import contactsPageConfig from "@/config/contactsPage.json";
import { useContacts } from "@/hooks/useContacts";
import { ContactsPageSkeleton } from "./SMContactsSkeleton";

export function SMContactsPage() {
  const { contacts, loading } = useContacts();

  // Показываем скелетон во время загрузки
  if (loading) {
    return <ContactsPageSkeleton />;
  }

  // Prepare phone numbers array
  const phoneNumbers = contacts?.phone_number
    ? [contacts.phone_number, ...(contacts.phone_number_sec ? [contacts.phone_number_sec] : [])]
    : contactsPageConfig.contactInfo.phones.numbers;

  // Prepare map URL from coordinates
  const mapUrl = contacts?.map_geo
    ? `https://www.google.com/maps?q=${contacts.map_geo}&output=embed`
    : contactsPageConfig.map.url;

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
        <h1 className="text-3xl lg:text-4xl text-white mb-4">
          {contactsPageConfig.header.title}
        </h1>
        <p className="text-white/90 leading-relaxed text-base lg:text-lg max-w-3xl mx-auto">
          {contactsPageConfig.header.subtitle}
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
                <h3 className="text-lg text-[#2E2E2E] mb-2">
                  {contactsPageConfig.contactInfo.address.title}
                </h3>
                <a
                  href={`https://yandex.ru/maps/?text=${encodeURIComponent(contacts?.address || contactsPageConfig.contactInfo.address.main)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-[#18A36C] transition-colors text-sm leading-relaxed cursor-pointer block"
                >
                  {contacts?.address || contactsPageConfig.contactInfo.address.main}
                </a>
                <p className="text-[#2E2E2E] text-sm mt-1">
                  {contactsPageConfig.contactInfo.address.metro}
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
                <h3 className="text-lg text-[#2E2E2E] mb-3">
                  {contactsPageConfig.contactInfo.workingHours.title}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center gap-6">
                    <span className="text-gray-600">
                      {contactsPageConfig.contactInfo.workingHours.weekdays.days}
                    </span>
                    <span className="text-[#2E2E2E]">
                      {contacts?.work_hours_main || contactsPageConfig.contactInfo.workingHours.weekdays.hours}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-6">
                    <span className="text-gray-600">
                      {contactsPageConfig.contactInfo.workingHours.weekend.days}
                    </span>
                    <span className="text-[#2E2E2E]">
                      {contacts?.work_hours_sunday || contactsPageConfig.contactInfo.workingHours.weekend.hours}
                    </span>
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
                <h3 className="text-lg text-[#2E2E2E] mb-3">
                  {contactsPageConfig.contactInfo.phones.title}
                </h3>
                <div className="space-y-2">
                  {phoneNumbers.map((phone, index) => (
                    <a
                      key={index}
                      href={`tel:${phone.replace(/-/g, "")}`}
                      className="block text-[#2E2E2E] hover:text-[#18A36C] transition-colors text-sm cursor-pointer"
                    >
                      {phone}
                    </a>
                  ))}
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
                <h3 className="text-lg text-[#2E2E2E] mb-2">
                  {contactsPageConfig.contactInfo.email.title}
                </h3>
                <a
                  href={`mailto:${contacts?.email || contactsPageConfig.contactInfo.email.address}`}
                  className="text-[#2E2E2E] hover:text-[#18A36C] transition-colors text-sm cursor-pointer"
                >
                  {contacts?.email || contactsPageConfig.contactInfo.email.address}
                </a>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg p-6 border border-[#E8E6E3] text-center">
            <h3 className="text-lg text-[#2E2E2E] mb-4">
              {contactsPageConfig.appointmentSection.title}
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white px-8 py-4 h-auto text-lg rounded-lg transition-all duration-300 flex-1"
                onClick={() =>
                  window.open(
                    `tel:${phoneNumbers[0].replace(/-/g, "")}`
                  )
                }
              >
                {contactsPageConfig.appointmentSection.callButton}
                <Phone className="w-5 h-5 ml-[2.5px]" />
              </Button>
              <Button
                variant="outline"
                className="border-[#18A36C] text-[#18A36C] px-8 py-4 h-auto text-lg rounded-lg hover:shadow-xl hover:shadow-[#18A36C]/20 flex-1"
                onClick={() =>
                  window.location.href = `mailto:${contacts?.email || contactsPageConfig.contactInfo.email.address}`
                }
              >
                {contactsPageConfig.appointmentSection.onlineButton}
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
          <h3 className="text-lg text-[#2E2E2E] mb-4">
            {contactsPageConfig.map.title}
          </h3>
          <div className="h-[400px] rounded-lg overflow-hidden bg-[#E8E6E3] border border-[#E8E6E3]">
            <iframe
              src={mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={contactsPageConfig.map.altText}
            ></iframe>
          </div>
          <p className="text-gray-600 text-xs mt-3 text-center">
            {contactsPageConfig.map.description}
          </p>
        </motion.div>
      </div>

    </div>
  );
}
