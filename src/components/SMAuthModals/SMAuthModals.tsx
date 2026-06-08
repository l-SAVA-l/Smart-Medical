import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
} from "lucide-react";
import { LoginData, RegisterData, AuthModalsProps } from "../SMAuthModals/SMAuthModals.styles";
import {
  validatePassword,
  validateNamePart,
  validateLogin,
  validateEmail,
  validatePhone,
  capitalizeName,
} from "@/utils/validation";

type ModalType = "login" | "register" | "forgot-password";

export function AuthModals({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  onForgotPassword,
  isLoading = false,
  initialType = "login",
}: AuthModalsProps) {
  const [modalType, setModalType] = useState<ModalType>(initialType);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loginData, setLoginData] = useState<LoginData>({
    login: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState<RegisterData>({
    lastName: "",
    firstName: "",
    middleName: "",
    email: "",
    phone: "+375",
    password: "",
    confirmPassword: "",
    login: "",
    agreeToTerms: false,
  });

  const [forgotEmail, setForgotEmail] = useState("");

  // Validation errors state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [checking, setChecking] = useState<Record<string, boolean>>({});
  const [valid, setValid] = useState<Record<string, boolean>>({});

  // Sync modalType with initialType when modal opens
  useEffect(() => {
    if (isOpen) {
      setModalType(initialType);
    }
  }, [isOpen, initialType]);

  // Password strength checker
  const passwordStrength = (password: string): { strength: number; text: string; color: string } => {
    if (!password) return { strength: 0, text: '', color: '' };

    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    if (strength <= 1) return { strength: 20, text: 'Слабый', color: 'bg-red-500' };
    if (strength <= 2) return { strength: 40, text: 'Средний', color: 'bg-orange-500' };
    if (strength <= 3) return { strength: 60, text: 'Хороший', color: 'bg-yellow-500' };
    if (strength <= 4) return { strength: 80, text: 'Сильный', color: 'bg-green-500' };
    return { strength: 100, text: 'Очень сильный', color: 'bg-emerald-500' };
  };

  // Debounced uniqueness check
  const checkUniqueness = useCallback(async (field: 'login' | 'phone' | 'email', value: string) => {
    if (!value || value.length < 3) return;

    setChecking(prev => ({ ...prev, [field]: true }));
    try {
      const response = await fetch(`/api/auth/check-unique?${field}=${encodeURIComponent(value)}`);
      const data = await response.json();

      if (!data.isUnique) {
        setErrors(prev => ({ ...prev, [field]: data.message }));
        setValid(prev => ({ ...prev, [field]: false }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
        setValid(prev => ({ ...prev, [field]: true }));
      }
    } catch (error) {
    } finally {
      setChecking(prev => ({ ...prev, [field]: false }));
    }
  }, []);

  // Validate field on blur
  const validateField = useCallback((field: string, value: string) => {
    let result;
    switch (field) {
      case 'firstName':
        result = validateNamePart(value, 'Имя');
        break;
      case 'lastName':
        result = validateNamePart(value, 'Фамилия');
        break;
      case 'middleName':
        if (!value || !value.trim()) {
          result = { isValid: true };
        } else {
          result = validateNamePart(value, 'Отчество');
        }
        break;
      case 'login':
        result = validateLogin(value);
        if (result.isValid && value.length >= 3) {
          checkUniqueness('login', value);
        }
        break;
      case 'email':
        result = validateEmail(value);
        if (result.isValid) {
          checkUniqueness('email', value);
        }
        break;
      case 'phone':
        result = validatePhone(value);
        if (result.isValid) {
          const digits = value.replace(/\D/g, '');
          if (digits.length === 12) {
            checkUniqueness('phone', value);
          }
        }
        break;
      case 'password':
        result = validatePassword(value);
        break;
      case 'confirmPassword':
        if (value !== registerData.password) {
          result = { isValid: false, error: 'Пароли не совпадают' };
        } else {
          result = { isValid: true };
        }
        break;
      default:
        result = { isValid: true };
    }

    if (!result.isValid) {
      setErrors(prev => ({ ...prev, [field]: result.error || 'Ошибка валидации' }));
      setValid(prev => ({ ...prev, [field]: false }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      setValid(prev => ({ ...prev, [field]: true }));
    }

    return result.isValid;
  }, [registerData.password, checkUniqueness]);

  // Check uniqueness with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (registerData.login && registerData.login.length >= 3) {
        const loginValid = validateLogin(registerData.login);
        if (loginValid.isValid) {
          checkUniqueness('login', registerData.login);
        }
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [registerData.login, checkUniqueness]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (registerData.email && registerData.email.includes('@')) {
        const emailValid = validateEmail(registerData.email);
        if (emailValid.isValid) {
          checkUniqueness('email', registerData.email);
        }
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [registerData.email, checkUniqueness]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const digits = registerData.phone.replace(/\D/g, '');
      if (digits.length === 12) {
        checkUniqueness('phone', registerData.phone);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [registerData.phone, checkUniqueness]);

  // Форматирование белорусского номера телефона
  const formatPhoneNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    let phoneDigits = digits;
    if (digits.startsWith('375')) {
      phoneDigits = digits.slice(3);
    }
    phoneDigits = phoneDigits.slice(0, 9);

    let formatted = '+375';
    if (phoneDigits.length > 0) {
      formatted += '(' + phoneDigits.slice(0, 2);
    }
    if (phoneDigits.length >= 2) {
      formatted += ')';
    }
    if (phoneDigits.length > 2) {
      formatted += phoneDigits.slice(2, 5);
    }
    if (phoneDigits.length > 5) {
      formatted += '-' + phoneDigits.slice(5, 7);
    }
    if (phoneDigits.length > 7) {
      formatted += '-' + phoneDigits.slice(7, 9);
    }

    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setRegisterData({
      ...registerData,
      phone: formatted,
    });
  };

  const handleSubmit = () => {
    if (modalType === "login" && onLogin) {
      onLogin(loginData);
    } else if (modalType === "register" && onRegister) {
      onRegister(registerData);
    } else if (modalType === "forgot-password" && onForgotPassword) {
      onForgotPassword(forgotEmail);
    }
  };

  const resetForms = () => {
    setLoginData({
      login: "",
      password: "",
    });
    setRegisterData({
      lastName: "",
      firstName: "",
      middleName: "",
      email: "",
      phone: "+375",
      password: "",
      confirmPassword: "",
      login: "",
      agreeToTerms: false,
    });
    setForgotEmail("");
    setErrors({});
    setChecking({});
    setValid({});
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      resetForms();
    }
  };

  // Field error display component
  const FieldError = ({ field }: { field: string }) => {
    if (!errors[field]) return null;
    return (
      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        {errors[field]}
      </p>
    );
  };

  // Field status indicator
  const FieldStatus = ({ field }: { field: string }) => {
    if (checking[field]) {
      return <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />;
    }
    if (valid[field] && !errors[field]) {
      return <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />;
    }
    if (errors[field]) {
      return <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />;
    }
    return null;
  };

  const handleModalChange = (type: ModalType) => {
    setModalType(type);
    resetForms();
  };

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

  const renderLoginForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Login */}
      <div>
        <Label htmlFor="login" className="block text-sm font-medium text-gray-700 mb-1.5">
          Логин <span className="text-red-500">*</span>
        </Label>
        <Input
          id="login"
          type="text"
          placeholder="Введите логин"
          value={loginData.login}
          onChange={(e) => setLoginData({ ...loginData, login: e.target.value })}
          required
          className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18A36C]/20 focus:border-[#18A36C] transition-all border-gray-200"
        />
      </div>

      {/* Password */}
      <div>
        <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
          Пароль <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Введите пароль"
            value={loginData.password}
            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            required
            className="w-full px-4 py-2.5 pr-12 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18A36C]/20 focus:border-[#18A36C] transition-all border-gray-200"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#18A36C] transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Submit button */}
      <Button
        onClick={handleSubmit}
        disabled={isLoading || !loginData.login || !loginData.password}
        className="w-full bg-[#18A36C] hover:bg-[#15905f] text-white cursor-pointer py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Вход...
          </>
        ) : (
          <>
            Войти
            <LogIn className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>

      {/* Links */}
      <div className="flex justify-between items-center text-sm pt-2">
        <button
          onClick={() => handleModalChange("forgot-password")}
          className="text-gray-600 hover:text-[#18A36C] transition-colors cursor-pointer"
        >
          Забыли пароль?
        </button>
        <button
          onClick={() => handleModalChange("register")}
          className="text-gray-600 hover:text-[#18A36C] transition-colors cursor-pointer"
        >
          Регистрация
        </button>
      </div>
    </motion.div>
  );

  const renderRegisterForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Last Name */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-1.5">
          Фамилия <span className="text-red-500">*</span>
          <span className="text-gray-400 text-xs font-normal ml-1">(мин. 2 символа)</span>
        </Label>
        <div className="relative">
          <Input
            type="text"
            placeholder="Иванов"
            value={registerData.lastName}
            onChange={(e) => setRegisterData({ ...registerData, lastName: capitalizeName(e.target.value) })}
            onBlur={() => validateField('lastName', registerData.lastName)}
            required
            className={`w-full px-4 py-2.5 pr-10 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18A36C]/20 focus:border-[#18A36C] transition-all ${errors.lastName ? 'border-red-500' : 'border-gray-200'}`}
          />
          <FieldStatus field="lastName" />
        </div>
        <FieldError field="lastName" />
      </div>

      {/* First Name */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-1.5">
          Имя <span className="text-red-500">*</span>
          <span className="text-gray-400 text-xs font-normal ml-1">(мин. 2 символа)</span>
        </Label>
        <div className="relative">
          <Input
            type="text"
            placeholder="Иван"
            value={registerData.firstName}
            onChange={(e) => setRegisterData({ ...registerData, firstName: capitalizeName(e.target.value) })}
            onBlur={() => validateField('firstName', registerData.firstName)}
            required
            className={`w-full px-4 py-2.5 pr-10 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18A36C]/20 focus:border-[#18A36C] transition-all ${errors.firstName ? 'border-red-500' : 'border-gray-200'}`}
          />
          <FieldStatus field="firstName" />
        </div>
        <FieldError field="firstName" />
      </div>

      {/* Middle Name */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-1.5">
          Отчество <span className="text-gray-400 font-normal">(необязательно)</span>
        </Label>
        <div className="relative">
          <Input
            type="text"
            placeholder="Иванович"
            value={registerData.middleName}
            onChange={(e) => setRegisterData({ ...registerData, middleName: e.target.value ? capitalizeName(e.target.value) : '' })}
            onBlur={() => validateField('middleName', registerData.middleName)}
            className={`w-full px-4 py-2.5 pr-10 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18A36C]/20 focus:border-[#18A36C] transition-all ${errors.middleName ? 'border-red-500' : 'border-gray-200'}`}
          />
          <FieldStatus field="middleName" />
        </div>
        <FieldError field="middleName" />
      </div>

      {/* Email */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-1.5">
          Email <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            type="email"
            placeholder="example@mail.com"
            value={registerData.email}
            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
            onBlur={() => validateField('email', registerData.email)}
            required
            className={`w-full px-4 py-2.5 pr-10 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18A36C]/20 focus:border-[#18A36C] transition-all ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
          />
          <FieldStatus field="email" />
        </div>
        <FieldError field="email" />
      </div>

      {/* Phone */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-1.5">
          Телефон <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            type="tel"
            placeholder="+375(29)123-45-67"
            value={registerData.phone}
            onChange={handlePhoneChange}
            onBlur={() => validateField('phone', registerData.phone)}
            required
            className={`w-full px-4 py-2.5 pr-10 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18A36C]/20 focus:border-[#18A36C] transition-all ${errors.phone ? 'border-red-500' : 'border-gray-200'}`}
          />
          <FieldStatus field="phone" />
        </div>
        <FieldError field="phone" />
      </div>

      {/* Login */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-1.5">
          Логин <span className="text-red-500">*</span>
          <span className="text-gray-400 text-xs font-normal ml-1">(латиница, цифры, _)</span>
        </Label>
        <div className="relative">
          <Input
            type="text"
            placeholder="username"
            value={registerData.login}
            onChange={(e) => setRegisterData({ ...registerData, login: e.target.value })}
            onBlur={() => validateField('login', registerData.login)}
            required
            className={`w-full px-4 py-2.5 pr-10 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18A36C]/20 focus:border-[#18A36C] transition-all ${errors.login ? 'border-red-500' : 'border-gray-200'}`}
          />
          <FieldStatus field="login" />
        </div>
        <FieldError field="login" />
      </div>

      {/* Password */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-1.5">
          Пароль <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Введите пароль"
            value={registerData.password}
            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
            onBlur={() => validateField('password', registerData.password)}
            required
            className={`w-full px-4 py-2.5 pr-12 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18A36C]/20 focus:border-[#18A36C] transition-all ${errors.password ? 'border-red-500' : 'border-gray-200'}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#18A36C] transition-colors cursor-pointer z-10"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        <FieldError field="password" />

        {/* Password Strength Indicator */}
        {registerData.password && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-2 mt-2"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Надежность пароля</span>
              <span className={`font-medium ${passwordStrength(registerData.password).color.replace('bg-', 'text-')}`}>
                {passwordStrength(registerData.password).text}
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${passwordStrength(registerData.password).strength}%` }}
                transition={{ duration: 0.3 }}
                className={`h-full ${passwordStrength(registerData.password).color} rounded-full`}
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-1.5">
          Подтверждение пароля <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Повторите пароль"
            value={registerData.confirmPassword}
            onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
            onBlur={() => validateField('confirmPassword', registerData.confirmPassword)}
            required
            className={`w-full px-4 py-2.5 pr-12 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18A36C]/20 focus:border-[#18A36C] transition-all ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'}`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#18A36C] transition-colors cursor-pointer z-10"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        <FieldError field="confirmPassword" />

        {/* Match Indicator */}
        {registerData.confirmPassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 mt-2"
          >
            {registerData.password === registerData.confirmPassword ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-600">Пароли совпадают</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-xs text-red-600">Пароли не совпадают</span>
              </>
            )}
          </motion.div>
        )}
      </div>

      {/* Terms checkbox */}
      <div className="flex items-start space-x-3 pt-2">
        <Checkbox
          id="terms"
          checked={registerData.agreeToTerms}
          onCheckedChange={(checked) => setRegisterData({ ...registerData, agreeToTerms: checked === true })}
          className="mt-0.5 h-5 w-5 border-gray-300 data-[state=checked]:bg-[#18A36C] data-[state=checked]:border-[#18A36C] data-[state=checked]:text-white"
        />
        <Label htmlFor="terms" className="text-sm text-gray-700 leading-tight cursor-pointer">
          Я согласен на обработку персональных данных
        </Label>
      </div>

      {/* Submit button */}
      <Button
        onClick={handleSubmit}
        disabled={
          !registerData.agreeToTerms ||
          isLoading ||
          Object.keys(errors).length > 0 ||
          checking.login ||
          checking.email ||
          checking.phone ||
          !registerData.lastName ||
          !registerData.firstName ||
          !registerData.email ||
          !registerData.phone ||
          !registerData.login ||
          !registerData.password ||
          !registerData.confirmPassword
        }
        className="w-full bg-[#18A36C] hover:bg-[#15905f] text-white cursor-pointer py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Регистрация...
          </>
        ) : (
          <>
            Зарегистрироваться
            <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>

      {/* Link to login */}
      <div className="text-center pt-2">
        <button
          onClick={() => handleModalChange("login")}
          className="text-sm text-gray-600 hover:text-[#18A36C] transition-colors cursor-pointer"
        >
          Уже есть аккаунт? Войти
        </button>
      </div>
    </motion.div>
  );

  const renderForgotPasswordForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600">
          Введите email для получения ссылки на восстановление пароля
        </p>
      </div>

      {/* Email */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-1.5">
          Email <span className="text-red-500">*</span>
        </Label>
        <Input
          type="email"
          placeholder="example@mail.com"
          value={forgotEmail}
          onChange={(e) => setForgotEmail(e.target.value)}
          required
          className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18A36C]/20 focus:border-[#18A36C] transition-all border-gray-200"
        />
      </div>

      {/* Submit button */}
      <Button
        onClick={handleSubmit}
        disabled={isLoading || !forgotEmail}
        className="w-full bg-[#18A36C] hover:bg-[#15905f] text-white cursor-pointer py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Отправка...
          </>
        ) : (
          <>
            Восстановить пароль
            <Mail className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>

      {/* Link to login */}
      <div className="text-center pt-2">
        <button
          onClick={() => handleModalChange("login")}
          className="text-sm text-gray-600 hover:text-[#18A36C] transition-colors cursor-pointer"
        >
          Вернуться к входу
        </button>
      </div>
    </motion.div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="bg-[#18A36C] px-6 py-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">{getTitle()}</h2>
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="p-1.5 hover:bg-white/20 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {modalType === "login" && renderLoginForm()}
              {modalType === "register" && renderRegisterForm()}
              {modalType === "forgot-password" && renderForgotPasswordForm()}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
