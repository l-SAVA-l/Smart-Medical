'use client';

import { Search, Phone, Menu, MapPin, Mail, X } from "lucide-react";
import { Button } from "../common/SMButton/SMButton";
import { Input } from "../common/SMInput/SMInput";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthModals } from "../SMAuthModals/SMAuthModals";
import { useMenu } from "../SMMenuContext/SMMenuContext";
import SMLogo from "@/icons/SMLogo";
import SMMobileLogo from "@/icons/SMMobileLogo";
import { SearchModal } from "../common/SMSearch/SMSearch";
import SMBurgerMenu from "../common/SMBurgerMenu/SMBurgerMenu";
import navigationConfig from "@/config/navigation.json";
import contactsConfig from "@/config/contacts.json";
import { SMProfileButton } from "../common/SMProfileButton/SMProfileButton";
import { signIn, useSession } from "next-auth/react";
import { LoginData, RegisterData } from "../SMAuthModals/SMAuthModals.styles";
import { useContacts } from "@/hooks/useContacts";
import { useAlert } from "../common/SMAlert/AlertProvider";
import { NavigationModal } from "./NavigationModal";
import { openBookingModal } from "@/components/SMBookingModal/BookingModalProvider";

// Компонент скелетона для текста
function TextSkeleton({ className = '' }: { className?: string }) {
  return <span className={`inline-block animate-pulse bg-white/30 rounded ${className}`}>&nbsp;</span>;
}

export function Header() {
  const { isBurgerMenuOpen, setIsBurgerMenuOpen } = useMenu();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState<'login' | 'register' | 'forgot-password'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileScrolled, setIsMobileScrolled] = useState(false);
  const [isNavModalOpen, setIsNavModalOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { contacts, loading: contactsLoading } = useContacts();
  const alert = useAlert();
  const { data: session } = useSession();

  // Все useEffect хуки должны быть ДО любых условных return
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

  // Keyboard shortcut: Ctrl+K or Cmd+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Scroll detection - показываем compact header когда виден только нижний блок навигации
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Находим блок с навигацией в основном header
          const headers = document.querySelectorAll('header');
          let navBarElement: HTMLElement | null = null;

          headers.forEach(header => {
            const style = window.getComputedStyle(header);
            if (style.position !== 'fixed') {
              // Это основной header, ищем навигацию
              const nav = header.querySelector('nav');
              if (nav && nav.parentElement) {
                navBarElement = nav.parentElement as HTMLElement;
              }
            }
          });

          if (navBarElement) {
            const rect = (navBarElement as HTMLElement).getBoundingClientRect();
            // Когда навигационный блок достигает верха экрана (или почти достигает)
            // показываем компактный header
            const SHOW_THRESHOLD = 10; // Показать когда навигация в 10px от верха
            const HIDE_THRESHOLD = 50; // Скрыть когда навигация ниже 50px от верха

            setIsScrolled(prev => {
              if (rect.top <= SHOW_THRESHOLD) {
                return true;
              } else if (rect.top > HIDE_THRESHOLD) {
                return false;
              }
              return prev;
            });
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    // Небольшая задержка для инициализации
    const initTimeout = setTimeout(handleScroll, 100);

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      clearTimeout(initTimeout);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // Mobile/Tablet scroll detection for shadow effect
  useEffect(() => {
    let ticking = false;

    const handleMobileScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsMobileScrolled(window.scrollY > 0);
          ticking = false;
        });
        ticking = true;
      }
    };

    // Initial check
    handleMobileScroll();

    window.addEventListener("scroll", handleMobileScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleMobileScroll);
    };
  }, []);

  // Не показываем хедер на страницах админки (после всех хуков!)
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <>
      {/* Main Header (sticky on mobile/tablet, scrolls on desktop) */}
      <header className={`bg-white sticky top-0 z-40 lg:relative lg:z-auto lg:shadow-lg transition-shadow duration-300 ${isMobileScrolled ? 'shadow-lg' : 'shadow-none'}`}>
        {/* Top bar with address/email */}
        <div className="hidden md:block bg-[#18A36C] py-2 lg:py-3">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-white">
            <div className="flex items-center">
              <div className="flex items-center gap-2 lg:gap-3">
                <MapPin className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                {contactsLoading || !contacts ? (
                  <TextSkeleton className="w-48 lg:w-64 h-4" />
                ) : (
                  <a
                    href={`https://yandex.ru/maps/?text=${encodeURIComponent(contacts.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs lg:text-sm hover:scale-105 transition-transform cursor-pointer inline-block"
                  >
                    {contacts.address}
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-3">
              <Mail className="w-3 h-3 lg:w-4 lg:h-4 text-white flex-shrink-0" />
              {contactsLoading || !contacts ? (
                <TextSkeleton className="w-40 h-4" />
              ) : (
                <a
                  href={`mailto:${contacts.email}`}
                  className="text-xs lg:text-sm hover:scale-105 transition-transform cursor-pointer inline-block"
                >
                  {contacts.email}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="py-3 lg:py-6">
          <div className="max-w-7xl mx-auto px-4">
            {/* Desktop - Normal state (full) */}
            <div className="hidden lg:flex items-center justify-between">
              <button
                onClick={() => handleNavigation("/")}
                className="flex items-center cursor-pointer"
              >
                <SMLogo />
              </button>

              {/* Desktop Search - Click to open modal */}
              <div className="flex-1 max-w-md mx-8">
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="w-full relative cursor-pointer"
                >
                  <Input
                    type="text"
                    placeholder="Поиск услуг и специалистов..."
                    readOnly
                    className="pl-4 pr-12 bg-gray-50 border-0 h-12 rounded-lg focus:outline-none focus:shadow-none focus:border-0 focus:ring-1 focus:ring-[#18A36C] cursor-pointer"
                  />
                  <div className="absolute right-1 top-1 h-10 w-10 p-0 bg-[#18A36C] cursor-pointer rounded flex items-center justify-center">
                    <Search className="w-4 h-4 text-white" />
                  </div>
                </button>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="flex items-center gap-2 text-[#2E2E2E] text-lg">
                    <Phone className="w-5 h-5 text-[#18A36C]" />
                    {contactsLoading || !contacts ? (
                      <span className="inline-block animate-pulse bg-gray-200 rounded w-36 h-6">&nbsp;</span>
                    ) : (
                      <a
                        href={`tel:${contacts.phone_number.replace(/[\s\-]/g, '')}`}
                        className="hover:text-[#18A36C] transition-colors cursor-pointer"
                      >
                        {contacts.phone_number}
                      </a>
                    )}
                  </div>
                  {contactsLoading || !contacts ? (
                    <span className="inline-block animate-pulse bg-gray-200 rounded w-32 h-4 mt-1">&nbsp;</span>
                  ) : contacts.phone_number_sec ? (
                    <a
                      href={`tel:${contacts.phone_number_sec.replace(/[\s\-]/g, '')}`}
                      className="text-sm text-gray-500 hover:text-[#18A36C] transition-colors cursor-pointer"
                    >
                      {contacts.phone_number_sec}
                    </a>
                  ) : null}
                </div>

                <Button
                  size="lg"
                  className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white px-8 h-12"
                  onClick={() => (session ? openBookingModal() : handleNavigation("/contacts"))}
                >
                  {session ? "Запись онлайн" : contactsConfig.onlineBookingText}
                </Button>
              </div>
            </div>

            <div className="lg:hidden">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleNavigation("/")}
                  className="flex items-center cursor-pointer"
                >
                  <SMMobileLogo />
                </button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2"
                  >
                    <Search className="w-5 h-5" />
                  </Button>
                  <Button
                    onClick={() => (session ? openBookingModal() : handleNavigation("/contacts"))}
                    className="bg-[#18A36C] hover:bg-[#18A36C]/90 text-white px-4 text-sm h-9"
                  >
                    {session ? "Запись онлайн" : "Связаться с нами"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation bar */}
        <div className="bg-white border-t border-b border-[#E8E6E3]">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex items-center">
              <div className="flex">
                {navigationConfig.mainNavigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.path)}
                    className="px-3 py-3 lg:px-4 lg:py-4 text-[#2E2E2E] hover:text-[#18A36C] transition-colors text-sm lg:text-base hidden lg:block cursor-pointer"
                  >
                    {item.name}
                  </button>
                ))}
              </div>

              <div className="ml-auto flex items-center gap-2 lg:gap-4">
                <div className="hidden lg:flex items-center gap-3">
                  <SMProfileButton onAuthModalOpen={(type) => {
                    setAuthModalType(type || 'login');
                    setIsAuthModalOpen(true);
                  }} />
                  {session === undefined ? (
                    <span className="inline-block animate-pulse bg-gray-200 rounded-lg w-24 h-9">&nbsp;</span>
                  ) : !session && (
                    <Button
                      onClick={() => {
                        setAuthModalType('register');
                        setIsAuthModalOpen(true);
                      }}
                      className="bg-[#18A36C] hover:bg-[#15905f] text-white px-4 py-2 cursor-pointer rounded-lg transition-all text-sm h-9"
                    >
                      Регистрация
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
            <SMBurgerMenu onAuthModalOpen={(type) => {
              setAuthModalType(type || 'login');
              setIsAuthModalOpen(true);
            }} />
          </div>
        </div>
      </header>

      {/* Compact Sticky Header (slides down when scrolling - desktop only) */}
      <header className={`hidden lg:block fixed top-0 left-0 right-0 z-50 bg-white shadow-md transition-transform duration-300 ease-in-out ${isScrolled ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="py-3 lg:py-4">
          <div className="max-w-7xl mx-auto px-4">
            <div className="hidden lg:flex items-center gap-6 justify-between">
              {/* Left side: Burger + Logo */}
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsNavModalOpen(true)}
                  className="p-2 hover:bg-[#18A36C]/10 cursor-pointer rounded-lg"
                >
                  <Menu className="w-6 h-6 text-[#18A36C]" />
                </Button>

                <button
                  onClick={() => handleNavigation("/")}
                  className="flex items-center cursor-pointer"
                >
                  <SMLogo />
                </button>
              </div>

              {/* Center: Search */}
              <div className="flex-1 max-w-md">
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="w-full relative cursor-pointer"
                >
                  <Input
                    type="text"
                    placeholder="Поиск..."
                    readOnly
                    className="pl-4 pr-10 bg-gray-50 border-0 h-10 rounded-lg focus:outline-none focus:shadow-none cursor-pointer text-sm"
                  />
                  <div className="absolute right-1 top-1 h-8 w-8 bg-[#18A36C] cursor-pointer rounded flex items-center justify-center">
                    <Search className="w-4 h-4 text-white" />
                  </div>
                </button>
              </div>

              {/* Right side: Phone + Auth buttons */}
              <div className="flex items-center gap-4">
                {/* Phone */}
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-[#18A36C]" />
                  {contactsLoading || !contacts ? (
                    <span className="inline-block animate-pulse bg-gray-200 rounded w-28 h-5">&nbsp;</span>
                  ) : (
                    <div className="flex flex-col gap-0.5">
                      <a
                        href={`tel:${contacts.phone_number.replace(/[\s\-]/g, '')}`}
                        className="text-sm text-gray-700 hover:text-[#18A36C] transition-colors cursor-pointer font-medium"
                      >
                        {contacts.phone_number}
                      </a>
                      {contacts.phone_number_sec && (
                        <a
                          href={`tel:${contacts.phone_number_sec.replace(/[\s\-]/g, '')}`}
                          className="text-xs text-gray-500 hover:text-[#18A36C] transition-colors cursor-pointer"
                        >
                          {contacts.phone_number_sec}
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="h-6 w-px bg-gray-300" />

                {/* Profile button */}
                <SMProfileButton onAuthModalOpen={(type) => {
                  setAuthModalType(type || 'login');
                  setIsAuthModalOpen(true);
                }} />

                {/* Register button */}
                {session === undefined ? (
                  <span className="inline-block animate-pulse bg-gray-200 rounded-lg w-24 h-9">&nbsp;</span>
                ) : !session && (
                  <Button
                    onClick={() => {
                      setAuthModalType('register');
                      setIsAuthModalOpen(true);
                    }}
                    className="bg-[#18A36C] hover:bg-[#15905f] text-white px-4 py-2 cursor-pointer rounded-lg transition-all text-sm h-9"
                  >
                    Регистрация
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <AuthModals
        isOpen={isAuthModalOpen}
        isLoading={isLoading}
        initialType={authModalType}
        onClose={() => {
          setIsAuthModalOpen(false);
        }}
        onLogin={async (credentials: LoginData) => {
          setIsLoading(true);

          try {
            const result = await signIn("credentials", {
              login: credentials.login,
              password: credentials.password,
              redirect: false,
            });

            if (result?.error) {
              alert.error("Неверный логин или пароль", "Ошибка входа");
            } else if (result?.ok) {
              setIsAuthModalOpen(false);
              alert.success("Вы успешно вошли в систему!", "Добро пожаловать");
              router.push("/account");
              router.refresh();
            }
          } catch (err) {
            alert.error("Ошибка при входе. Попробуйте позже.", "Ошибка");
          } finally {
            setIsLoading(false);
          }
        }}
        onRegister={async (userData: RegisterData) => {
          setIsLoading(true);

          try {
            const response = await fetch("/api/auth/register", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                lastName: userData.lastName,
                firstName: userData.firstName,
                middleName: userData.middleName,
                email: userData.email,
                phone: userData.phone,
                password: userData.password,
                confirmPassword: userData.confirmPassword,
                login: userData.login,
              }),
            });

            const data = await response.json();

            if (!response.ok) {
              alert.error(data.error || "Ошибка при регистрации", "Ошибка регистрации");
              return;
            }

            // После успешной регистрации автоматически входим
            const loginResult = await signIn("credentials", {
              login: userData.login,
              password: userData.password,
              redirect: false,
            });

            if (loginResult?.ok) {
              setIsAuthModalOpen(false);
              alert.success("Регистрация прошла успешно! Добро пожаловать!", "Успешная регистрация");
              router.push("/account");
              router.refresh();
            }
          } catch (err) {
            alert.error("Ошибка при регистрации. Попробуйте позже.", "Ошибка");
          } finally {
            setIsLoading(false);
          }
        }}
        onForgotPassword={async (email: string) => {
          setIsLoading(true);

          try {
            // TODO: Реализовать API для восстановления пароля
            alert.warning("Функция восстановления пароля пока не реализована", "Скоро будет");
          } catch (err) {
            alert.error("Ошибка при восстановлении пароля. Попробуйте позже.", "Ошибка");
          } finally {
            setIsLoading(false);
          }
        }}
      />

      <NavigationModal
        isOpen={isNavModalOpen}
        onClose={() => setIsNavModalOpen(false)}
        onNavigate={handleNavigation}
      />
    </>
  );
}
