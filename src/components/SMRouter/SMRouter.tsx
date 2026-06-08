'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface RouterContextType {
  currentRoute: string;
  navigate: (route: string) => void;
  params: Record<string, string>;
}

const RouterContext = createContext<RouterContextType | null>(null);

export function Router({ children }: { children: ReactNode }) {
  const [currentRoute, setCurrentRoute] = useState('/');
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentRoute(window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handlePopState = () => {
        setCurrentRoute(window.location.pathname);
      };
      
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, []);
  
  const navigate = (route: string) => {
    setCurrentRoute(route);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', route);
      // Dispatch custom event for ScrollToTop and other components
      window.dispatchEvent(new CustomEvent('routeChange', { detail: { route } }));
      // Scroll to top on navigation
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
    }
  };

  // Parse route parameters
  const params: Record<string, string> = {};
  const routeParts = currentRoute.split('/').filter(Boolean);

  return (
    <RouterContext.Provider value={{ currentRoute, navigate, params }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a Router');
  }
  return context;
}

interface RouteProps {
  path: string;
  children: ReactNode;
}

export function Route({ path, children }: RouteProps) {
  const { currentRoute } = useRouter();

  if (path === '/' && currentRoute === '/') {
    return <>{children}</>;
  }

  if (path !== '/' && currentRoute.startsWith(path)) {
    return <>{children}</>;
  }

  return null;
}