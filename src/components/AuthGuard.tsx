import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard component that protects routes from unauthorized access.
 * Checks if a valid token exists; if not, redirects to login.
 *
 * @component
 * @param {React.ReactNode} children - Components to render when the user is authenticated.
 * @returns {JSX.Element} The protected content or a loading screen.
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Gets the authentication token from localStorage
   */
  const getAuthToken = (): string | null => {
    return localStorage.getItem('supabase.auth.token');
  };

  /**
   * Verifies if the user is authenticated by checking the token with the backend.
   * Redirects to the login page if no valid token is found.
   *
   * @async
   * @function checkAuth
   * @returns {Promise<void>}
   */
  const checkAuth = async () => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.log('❌ No hay token, redirigiendo al login...');
        navigate('/');
        return;
      }

      // Verificar el token con el backend
      const API_URL = import.meta.env.VITE_API_URL || 'https://movie-wave-ocyd.onrender.com';
      const response = await fetch(`${API_URL}/api/user-profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        console.log('✅ Token válido, usuario autenticado');
        setIsAuthenticated(true);
        setLoading(false);
      } else {
        console.log('❌ Token inválido o expirado, redirigiendo al login...');
        // Limpiar token inválido
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('userData');
        navigate('/');
      }

    } catch (error) {
      console.error('❌ Error en AuthGuard:', error);
      // Limpiar tokens en caso de error
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('userData');
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(180deg, #001b3a, #000d1f)',
        color: 'white'
      }}>
        <div>Verificando autenticación...</div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
};

export default AuthGuard;