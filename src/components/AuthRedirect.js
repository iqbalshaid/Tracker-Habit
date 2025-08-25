// components/AuthRedirectHandler.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/Auth-context';

function AuthRedirectHandler() {
  const { shouldRedirect, resetRedirect } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (shouldRedirect) {
      navigate('/', { replace: true });
      resetRedirect();
    }
  }, [shouldRedirect, resetRedirect, navigate]);

  return null;
}

export default AuthRedirectHandler;