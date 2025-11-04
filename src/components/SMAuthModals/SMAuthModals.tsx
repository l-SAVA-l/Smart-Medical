import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../common/SMDialog/SMDialog";
import { Button } from "../common/SMButton/SMButton"; 
import { Input } from "../common/SMInput/SMInput"; 
import { Label } from "../common/SMLabel/SMLabel"; 
import { Checkbox } from "../common/SMCheckBox/SMCheckBox";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Lock,
  Shield,
  ArrowRight,
  LogIn,
} from "lucide-react";
import { motion } from "framer-motion";
import { LoginData, RegisterData, AuthModalsProps } from "../SMAuthModals/SMAuthModals.styles";

type ModalType = "login" | "register" | "forgot-password";

export function AuthModals({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  onForgotPassword,
}: AuthModalsProps) {
  const [modalType, setModalType] =
    useState<ModalType>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loginData, setLoginData] = useState<LoginData>({
    login: "",
    password: "",
    rememberMe: false,
  });

  const [registerData, setRegisterData] =
    useState<RegisterData>({
      lastName: "",
      firstName: "",
      middleName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      login: "",
      captcha: "",
      agreeToTerms: false,
    });

  const [forgotEmail, setForgotEmail] = useState("");

  const handleSubmit = () => {
    if (modalType === "login" && onLogin) {
      onLogin(loginData);
    } else if (modalType === "register" && onRegister) {
      onRegister(registerData);
    } else if (
      modalType === "forgot-password" &&
      onForgotPassword
    ) {
      onForgotPassword(forgotEmail);
    }
    onClose();
  };

  const resetForms = () => {
    setLoginData({
      login: "",
      password: "",
      rememberMe: false,
    });
    setRegisterData({
      lastName: "",
      firstName: "",
      middleName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      login: "",
      captcha: "",
      agreeToTerms: false,
    });
    setForgotEmail("");
  };

  const handleModalChange = (type: ModalType) => {
    setModalType(type);
    resetForms();
  };

  const renderLoginForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.2,
            type: "spring",
            stiffness: 200,
          }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-[#18A36C]/10 mb-4"
        >
          <User className="w-8 h-8 text-[#18A36C]" />
        </motion.div>
        <h3 className="text-xl text-[#2E2E2E] mb-2">
          С возвращением!
        </h3>
        <p className="text-gray-600">
          Войдите в свой личный кабинет
        </p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="login" className="text-[#2E2E2E]">
            Логин
          </Label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#18A36C] transition-colors" />
            <Input
              id="login"
              type="text"
              placeholder="Введите логин"
              value={loginData.login}
              onChange={(e) =>
                setLoginData({
                  ...loginData,
                  login: e.target.value,
                })
              }
              className="pl-12 h-12 border-gray-300 focus:border-[#18A36C] transition-all duration-200 rounded-lg"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-[#2E2E2E]">
            Пароль
          </Label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#18A36C] transition-colors" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Введите пароль"
              value={loginData.password}
              onChange={(e) =>
                setLoginData({
                  ...loginData,
                  password: e.target.value,
                })
              }
              className="pl-12 pr-12 h-12 border-gray-300 focus:border-[#18A36C] transition-all duration-200 rounded-lg"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#18A36C] transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Checkbox
            id="remember"
            checked={loginData.rememberMe}
            onCheckedChange={(checked) =>
              setLoginData({
                ...loginData,
                rememberMe: checked === true,
              })
            }
            className="border-gray-300 data-[state=checked]:bg-[#18A36C] data-[state=checked]:border-[#18A36C] data-[state=checked]:text-white"
          />
          <Label
            htmlFor="remember"
            className="text-[#2E2E2E]"
          >
            Запомнить меня
          </Label>
        </div>
      </div>

      <div className="space-y-4">
        <Button
          onClick={handleSubmit}
          className="w-full h-12 bg-[#18A36C] hover:bg-[#18A36C]/90 text-white rounded-lg transition-all duration-200"
        >
          Войти
          <LogIn className="w-5 h-5 ml-[2.5px]" />
        </Button>

        <div className="flex justify-between items-center text-sm">
          <button
            onClick={() => handleModalChange("forgot-password")}
            className="text-gray-600 hover:text-[#18A36C] underline underline-offset-2 transition-colors"
          >
            Забыли пароль?
          </button>
          <button
            onClick={() => handleModalChange("register")}
            className="text-gray-600 hover:text-[#18A36C] underline underline-offset-2 transition-colors"
          >
            Регистрация
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-gray-600 mt-6 p-4 bg-[#F4F4F4] rounded-lg">
        <Shield className="w-4 h-4 inline mr-1" />
        Входя в личный кабинет, вы соглашаетесь с условиями использования сервиса
      </div>
    </motion.div>
  );

  const renderRegisterForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.2,
            type: "spring",
            stiffness: 200,
          }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-[#18A36C]/10 mb-4"
        >
          <User className="w-8 h-8 text-[#18A36C]" />
        </motion.div>
        <h3 className="text-xl text-[#2E2E2E] mb-2">
          Присоединяйтесь к нам!
        </h3>
        <p className="text-gray-600">
          Создайте личный кабинет для удобного доступа к услугам
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="lastName"
              className="text-[#2E2E2E]"
            >
              Фамилия
            </Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Введите фамилию"
              value={registerData.lastName}
              onChange={(e) =>
                setRegisterData({
                  ...registerData,
                  lastName: e.target.value,
                })
              }
              className="h-11 border-gray-300 focus:border-[#18A36C] transition-all duration-200 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="firstName"
              className="text-[#2E2E2E]"
            >
              Имя
            </Label>
            <Input
              id="firstName"
              type="text"
              placeholder="Введите имя"
              value={registerData.firstName}
              onChange={(e) =>
                setRegisterData({
                  ...registerData,
                  firstName: e.target.value,
                })
              }
              className="h-11 border-gray-300 focus:border-[#18A36C] transition-all duration-200 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="middleName"
              className="text-[#2E2E2E]"
            >
              Отчество
            </Label>
            <Input
              id="middleName"
              type="text"
              placeholder="Введите отчество"
              value={registerData.middleName}
              onChange={(e) =>
                setRegisterData({
                  ...registerData,
                  middleName: e.target.value,
                })
              }
              className="h-11 border-gray-300 focus:border-[#18A36C] transition-all duration-200 rounded-lg"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="regEmail" className="text-[#2E2E2E]">
            Почта
          </Label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#18A36C] transition-colors" />
            <Input
              id="regEmail"
              type="email"
              placeholder="Введите email"
              value={registerData.email}
              onChange={(e) =>
                setRegisterData({
                  ...registerData,
                  email: e.target.value,
                })
              }
              className="pl-12 h-11 border-gray-300 focus:border-[#18A36C] transition-all duration-200 rounded-lg"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="regPhone" className="text-[#2E2E2E]">
            Телефон
          </Label>
          <div className="relative group">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#18A36C] transition-colors" />
            <Input
              id="regPhone"
              type="tel"
              placeholder="+375 29 123-45-67"
              value={registerData.phone}
              onChange={(e) =>
                setRegisterData({
                  ...registerData,
                  phone: e.target.value,
                })
              }
              className="pl-12 h-11 border-gray-300 focus:border-[#18A36C] transition-all duration-200 rounded-lg"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="regLogin" className="text-[#2E2E2E]">
            Логин{" "}
            <span className="text-sm text-gray-600">
              (мин. 3 символа)
            </span>
          </Label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#18A36C] transition-colors" />
            <Input
              id="regLogin"
              type="text"
              placeholder="Введите логин"
              value={registerData.login}
              onChange={(e) =>
                setRegisterData({
                  ...registerData,
                  login: e.target.value,
                })
              }
              className="pl-12 h-11 border-gray-300 focus:border-[#18A36C] transition-all duration-200 rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="regPassword"
              className="text-[#2E2E2E]"
            >
              Пароль
            </Label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#18A36C] transition-colors" />
              <Input
                id="regPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Введите пароль"
                value={registerData.password}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    password: e.target.value,
                  })
                }
                className="pl-12 pr-12 h-11 border-gray-300 focus:border-[#18A36C] transition-all duration-200 rounded-lg"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#18A36C] transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-[#2E2E2E]"
            >
              Подтверждение
            </Label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#18A36C] transition-colors" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Повторите пароль"
                value={registerData.confirmPassword}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    confirmPassword: e.target.value,
                  })
                }
                className="pl-12 pr-12 h-11 border-gray-300 focus:border-[#18A36C] transition-all duration-200 rounded-lg"
              />
              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#18A36C] transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="captcha" className="text-[#2E2E2E]">
            Капча
          </Label>
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative group">
              <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#18A36C] transition-colors" />
              <Input
                id="captcha"
                type="text"
                placeholder="Введите код"
                value={registerData.captcha}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    captcha: e.target.value,
                  })
                }
                className="pl-12 h-11 border-gray-300 focus:border-[#18A36C] transition-all duration-200 rounded-lg"
              />
            </div>
            <div className="w-24 h-11 bg-[#18A36C]/10 rounded-lg border border-gray-300 flex items-center justify-center">
              <span className="text-[#18A36C] text-lg tracking-widest font-mono">
                A7B3
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Checkbox
            id="terms"
            checked={registerData.agreeToTerms}
            onCheckedChange={(checked) =>
              setRegisterData({
                ...registerData,
                agreeToTerms: checked === true,
              })
            }
            className="border-gray-300 data-[state=checked]:bg-[#18A36C] data-[state=checked]:border-[#18A36C] data-[state=checked]:text-white"
          />
          <Label
            htmlFor="terms"
            className="text-sm text-[#2E2E2E]"
          >
            Я согласен на обработку персональных данных
          </Label>
        </div>
      </div>

      <div className="space-y-4">
        <Button
          onClick={handleSubmit}
          className="w-full h-12 bg-[#18A36C] hover:bg-[#18A36C]/90 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!registerData.agreeToTerms}
        >
          Зарегистрироваться
          <ArrowRight className="w-5 h-5 ml-[2.5px]" />
        </Button>

        <div className="text-center">
          <button
            onClick={() => handleModalChange("login")}
            className="text-gray-600 hover:text-[#18A36C] underline underline-offset-2 text-sm transition-colors"
          >
            Уже есть аккаунт? Войти
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-gray-600 mt-6 p-4 bg-[#F4F4F4] rounded-lg">
        <Shield className="w-4 h-4 inline mr-1" />
        Регистрируясь, вы соглашаетесь с политикой конфиденциальности и условиями использования
      </div>
    </motion.div>
  );

  const renderForgotPasswordForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header section */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.2,
            type: "spring",
            stiffness: 200,
          }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-[#18A36C]/10 mb-4"
        >
          <Lock className="w-8 h-8 text-[#18A36C]" />
        </motion.div>
        <h3 className="text-xl text-[#2E2E2E] mb-2">
          Восстановление пароля
        </h3>
        <p className="text-gray-600">
          Введите email для получения ссылки
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="forgotEmail" className="text-[#2E2E2E]">
          Почта
        </Label>
        <div className="relative group">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#18A36C] transition-colors" />
          <Input
            id="forgotEmail"
            type="email"
            placeholder="Введите ваш email"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            className="pl-12 h-12 border-gray-300 focus:border-[#18A36C] transition-all duration-200 rounded-lg"
          />
        </div>
      </div>

      <div className="space-y-4">
        <Button
          onClick={handleSubmit}
          className="w-full h-12 bg-[#18A36C] hover:bg-[#18A36C]/90 text-white rounded-lg transition-all duration-200"
        >
          Восстановить пароль
          <Mail className="w-5 h-5 ml-[2.5px]" />
        </Button>

        <div className="text-center">
          <button
            onClick={() => handleModalChange("login")}
            className="text-gray-600 hover:text-[#18A36C] underline underline-offset-2 text-sm transition-colors"
          >
            Вернуться к входу
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-gray-600 mt-6 p-4 bg-[#F4F4F4] rounded-lg">
        <Mail className="w-4 h-4 inline mr-1" />
        На указанный email будет отправлена ссылка для восстановления пароля
      </div>
    </motion.div>
  );

  const getTitle = () => {
    switch (modalType) {
      case "login":
        return "Вход в личный кабинет";
      case "register":
        return "Регистрация";
      case "forgot-password":
        return "Восстановление пароля";
      default:
        return "Авторизация";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md lg:max-w-lg max-h-[95vh] overflow-y-auto border-gray-200 bg-white">
        <DialogHeader className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <DialogTitle className="text-center text-[#2E2E2E] text-2xl">
              {getTitle()}
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600 mt-2">
              {modalType === "login" && "Войдите в свой личный кабинет для доступа к услугам"}
              {modalType === "register" && "Создайте аккаунт для персонализированного доступа к медицинским услугам"}
              {modalType === "forgot-password" && "Мы отправим вам инструкции по восстановлению пароля"}
            </DialogDescription>
          </motion.div>
        </DialogHeader>
        
        <div className="relative z-10 mt-6">
          {modalType === "login" && renderLoginForm()}
          {modalType === "register" && renderRegisterForm()}
          {modalType === "forgot-password" && renderForgotPasswordForm()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
