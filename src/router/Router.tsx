import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

export type AppRoute = '/' | '/login' | '/register' | '/verify-otp' | '/forgot-password' | '/reset-password' | '/app';

interface RouterContextType {
  path: string;
  navigate: (to: string, options?: { replace?: boolean }) => void;
  searchParams: URLSearchParams;
}

const RouterContext = createContext<RouterContextType | null>(null);

function normalizePath(rawPath: string): string {
  if (!rawPath) return '/';
  // Remove hash/query for base routing path
  const [pathname] = rawPath.split('?');
  const clean = pathname.replace(/\/+$/, '') || '/';
  return clean;
}

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [path, setPath] = useState<string>(() => {
    if (typeof window === 'undefined') return '/';
    return normalizePath(window.location.pathname);
  });

  const [searchParams, setSearchParams] = useState<URLSearchParams>(() => {
    if (typeof window === 'undefined') return new URLSearchParams();
    return new URLSearchParams(window.location.search);
  });

  const navigate = useCallback((to: string, options?: { replace?: boolean }) => {
    if (typeof window === 'undefined') return;
    const targetUrl = new URL(to, window.location.origin);
    const normalized = normalizePath(targetUrl.pathname);

    if (options?.replace) {
      window.history.replaceState({}, '', to);
    } else {
      window.history.pushState({}, '', to);
    }

    setPath(normalized);
    setSearchParams(new URLSearchParams(targetUrl.search));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      setPath(normalizePath(window.location.pathname));
      setSearchParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const value = useMemo(
    () => ({
      path,
      navigate,
      searchParams,
    }),
    [path, navigate, searchParams]
  );

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
};

export function useRouter(): RouterContextType {
  const ctx = useContext(RouterContext);
  if (!ctx) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return ctx;
}

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  replace?: boolean;
}

export const Link: React.FC<LinkProps> = ({ href, replace, onClick, children, ...rest }) => {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);

    // Allow default behavior for external links or if modified keys pressed (cmd/ctrl/shift)
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.altKey ||
      e.ctrlKey ||
      e.shiftKey ||
      href.startsWith('http://') ||
      href.startsWith('https://') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:')
    ) {
      return;
    }

    e.preventDefault();
    navigate(href, { replace });
  };

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
};
