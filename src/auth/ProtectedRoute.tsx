import React, { useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useRouter } from '../router/Router';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const { navigate } = useRouter();

  useEffect(() => {
    // If finished loading and no authenticated user, redirect to public home page '/'
    if (!loading && !user) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return null;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};
