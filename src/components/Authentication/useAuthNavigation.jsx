import { useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const useAuthNavigation = () => {
  const { isAuthenticated, expireSession } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handlePopState = () => {
      if (location.pathname === '/dashboard' && !isAuthenticated) {
        expireSession();
        navigate('/');
      } else if (location.pathname === '/' && isAuthenticated) {
        expireSession();
        navigate('/');
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isAuthenticated, location, navigate, expireSession]);
};

export default useAuthNavigation;
