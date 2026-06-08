export interface AuthModalsProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin?: (credentials: LoginData) => void;
    onRegister?: (userData: RegisterData) => void;
    onForgotPassword?: (email: string) => void;
    isLoading?: boolean;
    initialType?: 'login' | 'register' | 'forgot-password';
  };
  
export interface LoginData {
    login: string;
    password: string;
  };
  
export interface RegisterData {
    lastName: string;
    firstName: string;
    middleName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    login: string;
    agreeToTerms: boolean;
  };