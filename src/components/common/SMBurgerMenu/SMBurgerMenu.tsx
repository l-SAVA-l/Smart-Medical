"use client";

import SMBurgerMenuLogo from "@/icons/SMBurgerMenuLogo";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../SMButton/SMButton";
import { useRouter } from "next/navigation";
import { useMenu } from "@/components/SMMenuContext/SMMenuContext";
import { Phone, X, Mail, User, Shield } from "lucide-react";
import navigationConfig from "@/config/navigation.json";
import contactsConfig from "@/config/contacts.json";
import { iconMap, IconName } from "@/utils/iconMapper";
import { useContacts } from "@/hooks/useContacts";
import { useSession, signIn } from "next-auth/react";
import { useState, useEffect } from "react";

interface SMBurgerMenuProps {
  onAuthModalOpen?: (type?: 'login' | 'register' | 'forgot-password') => void;
}

const SMBurgerMenu = ({ onAuthModalOpen }: SMBurgerMenuProps) => {
  const { isBurgerMenuOpen, setIsBurgerMenuOpen } = useMenu();
  const router = useRouter();
  const { contacts, loading: contactsLoading } = useContacts();
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (session) {
      fetch('/api/admin/auth')
        .then(res => res.json())
        .then(data => setIsAdmin(data.isAdmin))
        .catch(() => setIsAdmin(false));
    } else {
      setIsAdmin(false);
    }
  }, [session]);

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsBurgerMenuOpen(false);
  };

  const handleProfileClick = () => {
    if (status === 'unauthenticated' || !session) {
      setIsBurgerMenuOpen(false);
      if (onAuthModalOpen) {
        onAuthModalOpen('login');
      } else {
        signIn('google', {
          callbackUrl: '/account',
          redirect: true,
        });
      }
    } else if (status === 'authenticated' && session) {
      handleNavigation('/account');
    }
  };

  const handleAdminClick = () => {
    handleNavigation('/admin');
  };

  return (
    <AnimatePresence>
      {isBurgerMenuOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] lg:hidden"
            onClick={() => setIsBurgerMenuOpen(false)}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 200,
              duration: 0.4,
            }}
            className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-[70] lg:hidden overflow-y-auto"
          >
            {/* Header */}
            <div className="bg-[#18A36C] p-6 text-white">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <SMBurgerMenuLogo />
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsBurgerMenuOpen(false)}
                    className="p-2 hover:bg-white/20 text-white"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>

                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  {contactsLoading || !contacts ? (
                    <div className="space-y-2">
                      <div className="h-5 bg-white/20 rounded animate-pulse w-32" />
                      <div className="h-3 bg-white/20 rounded animate-pulse w-24" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-green-200" />
                        <a
                          href={`tel:${contacts.phone_number.replace(/[\s\-]/g, '')}`}
                          className="hover:text-white transition-colors cursor-pointer"
                        >
                          {contacts.phone_number}
                        </a>
                      </div>
                      {contacts.phone_number_sec && (
                        <div className="text-xs text-green-200 mt-1">
                          {contacts.phone_number_sec}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="p-6">
              <nav className="space-y-2">
                {navigationConfig.mainNavigation.map((item, index) => {
                  const Icon = iconMap[item.icon as IconName];
                  return (
                    <motion.button
                      key={item.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: index * 0.1 + 0.2,
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[#2E2E2E] hover:text-[#18A36C] transition-all duration-200 group cursor-pointer"
                      onClick={() => handleNavigation(item.path)}
                    >
                      <Icon className="w-5 h-5 text-gray-400 group-hover:text-[#18A36C] transition-colors" />
                      <span className="text-base">{item.name}</span>
                    </motion.button>
                  );
                })}
              </nav>

              {/* CTA Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-8 pt-6 border-t border-[#E8E6E3]"
              >
                <Button
                  className="w-full bg-[#18A36C] hover:bg-[#18A36C]/90 text-white py-3 h-auto"
                  onClick={() => handleNavigation("/contacts")}
                >
                  {contactsConfig.onlineBookingText}
                </Button>

                {/* Profile and Admin Buttons */}
                <div className="mt-4 space-y-2">
                  {status === 'loading' && (
                    <div className="space-y-2">
                      <div className="w-full h-12 animate-pulse bg-gray-200 rounded-lg" />
                      <div className="w-full h-12 animate-pulse bg-gray-200 rounded-lg" />
                    </div>
                  )}

                  {status === 'unauthenticated' && (
                    <>
                      <Button
                        onClick={handleProfileClick}
                        variant="outline"
                        className="w-full border-[#18A36C] text-[#18A36C] py-3 h-auto flex items-center justify-center gap-2 hover:bg-[#18A36C]/10 hover:shadow-lg hover:shadow-[#18A36C]/20 cursor-pointer"
                      >
                        <span>Авторизация</span>
                      </Button>

                      <Button
                        onClick={() => {
                          setIsBurgerMenuOpen(false);
                          if (onAuthModalOpen) {
                            onAuthModalOpen('register');
                          }
                        }}
                        variant="outline"
                        className="w-full border-[#18A36C] text-[#18A36C] py-3 h-auto flex items-center justify-center gap-2 hover:bg-[#18A36C]/10 hover:shadow-lg hover:shadow-[#18A36C]/20 cursor-pointer"
                      >
                        <span>Регистрация</span>
                      </Button>
                    </>
                  )}

                  {status === 'authenticated' && session && (
                    <Button
                      onClick={handleProfileClick}
                      variant="outline"
                      className="w-full border-[#18A36C] text-[#18A36C] py-3 h-auto flex items-center justify-center gap-2 hover:bg-[#18A36C]/10 hover:shadow-lg hover:shadow-[#18A36C]/20 cursor-pointer"
                    >
                      <User className="w-5 h-5" />
                      <span>Мой кабинет</span>
                    </Button>
                  )}

                  {status === 'authenticated' && session && isAdmin && (
                    <Button
                      onClick={handleAdminClick}
                      variant="outline"
                      className="w-full border-[#18A36C] text-[#18A36C] py-3 h-auto flex items-center justify-center gap-2 hover:bg-[#18A36C]/10 hover:shadow-lg hover:shadow-[#18A36C]/20 cursor-pointer"
                    >
                      <Shield className="w-5 h-5" />
                      <span>Админ-панель</span>
                    </Button>
                  )}
                </div>
              </motion.div>

              {/* Contact info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="mt-6 pt-6 border-t border-[#E8E6E3] text-center text-sm text-[#2E2E2E]"
              >
                {contactsLoading || !contacts ? (
                  <div className="flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4 text-[#18A36C]" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-40" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4 text-[#18A36C]" />
                    <a
                      href={`mailto:${contacts.email}`}
                      className="hover:text-[#18A36C] transition-colors cursor-pointer"
                    >
                      {contacts.email}
                    </a>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SMBurgerMenu;
