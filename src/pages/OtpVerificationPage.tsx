import React, { useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useRouter } from '../router/Router';

export const OtpVerificationPage: React.FC = () => {
  const { user, loading } = useAuth();
  const { navigate } = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        navigate('/app', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  return null;
};
