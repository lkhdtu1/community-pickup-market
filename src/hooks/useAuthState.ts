import { useState, useEffect } from 'react';
import { getCurrentUser, isAuthenticated } from '../lib/auth';

export const useAuthState = () => {
  const [user, setUser] = useState(getCurrentUser());
  const [isAuth, setIsAuth] = useState(isAuthenticated());

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = getCurrentUser();
      const authenticated = isAuthenticated();
      
      setUser(currentUser);
      setIsAuth(authenticated);
    };

    // Check auth state immediately
    checkAuth();

    // Set up interval to check auth state periodically
    const interval = setInterval(checkAuth, 1000);

    return () => clearInterval(interval);
  }, []);

  return { user, isAuthenticated: isAuth };
};
