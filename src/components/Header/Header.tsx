'use client';

import { Search, Phone, User, Menu, MapPin, Mail, X } from "lucide-react";
import { Button } from "../common/SMButton/SMButton";
import { Input } from "../common/SMInput/SMInput";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthModals } from "../SMAuthModals/SMAuthModals";
import { useMenu } from "../SMMenuContext/SMMenuContext";
import SMLogo from "@/icons/SMLogo";
import SMSearchInput from "../common/SMSearchInput/SMSerachInput";
import SMMobileLogo from "@/icons/SMMobileLogo";
import SMBurgerMenu from "../common/SMBurgerMenu/SMBurgerMenu";
import navigationConfig from "@/config/navigation.json";
import contactsConfig from "@/config/contacts.json";

export function Header() {
  const { isBurgerMenuOpen, setIsBurgerMenuOpen } = useMenu();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isBurgerMenuOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    };
  }, [isBurgerMenuOpen]);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="hidden md:block bg-[#18A36C] py-2 lg:py-3">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-white">
          <div className="flex items-center">
            <div className="flex items-center gap-2 lg:gap-3">
              <MapPin className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
              <span className="text-xs lg:text-sm">{contactsConfig.address}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
            <Mail className="w-3 h-3 lg:w-4 lg:h-4 text-white flex-shrink-0" />
            <span className="text-xs lg:text-sm">{contactsConfig.email}</span>
          </div>
        </div>
      </div>

      <div className="py-3 lg:py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="hidden lg:flex items-center justify-between">
            <button
              onClick={() => handleNavigation("/")}
              className="flex items-center"
            >
              <SMLogo />
            </button>

            <SMSearchInput />

            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="flex items-center gap-2 text-[#2E2E2E] text-lg">
                  <Phone className="w-5 h-5 text-[#18A36C]" />
                  <span>{contactsConfig.phone}</span>
                </div>
                <button className="text-sm text-gray-500 hover:text-[#18A36C] transition-colors">
                  {contactsConfig.callbackText}
                </button>
              </div>

              <Button
                size="lg"
                className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white px-8 h-12"
              >
                {contactsConfig.onlineBookingText}
              </Button>
            </div>
          </div>

          <div className="lg:hidden">
            <div className="flex items-center justify-between">
              <button
                onClick={() => handleNavigation("/")}
                className="flex items-center"
              >
                <SMMobileLogo />
              </button>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="p-2"
                >
                  <Search className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2"
                >
                  <Phone className="w-5 h-5" />
                </Button>
                <Button className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white px-4 text-sm h-9">
                  Запись
                </Button>
              </div>
            </div>

            {isSearchOpen && (
              <div className="mt-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Поиск..."
                    className="pl-4 pr-12 bg-gray-50 border-0 h-10 rounded-lg w-full"
                  />
                  <Button
                    size="sm"
                    className="absolute right-1 top-1 h-8 w-8 p-0 bg-[#18A36C] hover:bg-[#18A36C]/90"
                  >
                    <Search className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-[#E8E6E3]">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center">
            <div className="flex">
              {navigationConfig.mainNavigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.path)}
                  className="px-3 py-3 lg:px-4 lg:py-4 text-[#2E2E2E] hover:text-[#18A36C] hover:bg-gray-50 transition-colors text-sm lg:text-base hidden lg:block"
                >
                  {item.name}
                </button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2 lg:gap-4">
              <div className="hidden lg:block">
                {isAuthenticated ? (
                  <Button
                    onClick={() => handleNavigation("/account")}
                    variant="ghost"
                    size="sm"
                    className="text-[#18A36C] hover:bg-[#F4F4F4] flex items-center gap-2 px-2 lg:px-3 py-2 text-sm"
                  >
                    <User className="w-4 h-4" />
                    <span>Мой кабинет</span>
                  </Button>
                ) : (
                  <Button
                    onClick={() => setIsAuthModalOpen(true)}
                    variant="ghost"
                    size="sm"
                    className="text-[#18A36C] hover:bg-[#F4F4F4] flex items-center gap-2 px-2 lg:px-3 py-2 text-sm"
                  >
                    <User className="w-4 h-4" />
                    <span>Мой кабинет</span>
                  </Button>
                )}
              </div>

              <div className="lg:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsBurgerMenuOpen(!isBurgerMenuOpen)}
                  className="p-2"
                >
                  {isBurgerMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </nav>
          <SMBurgerMenu />
        </div>
      </div>

      <AuthModals
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={(credentials) => {
          console.log("Login:", credentials);
          setIsAuthenticated(true);
          setIsAuthModalOpen(false);
        }}
        onRegister={(userData) => {
          console.log("Register:", userData);
          setIsAuthenticated(true);
          setIsAuthModalOpen(false);
        }}
        onForgotPassword={(email) => {
          console.log("Forgot password:", email);
          setIsAuthModalOpen(false);
        }}
      />
    </header>
  );
}
