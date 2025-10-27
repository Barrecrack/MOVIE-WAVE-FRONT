import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard component that protects routes from unauthorized access.
 * Checks if a valid Supabase session exists; if not, redirects to login.
 *
 * @component
 * @param {React.ReactNode} children - Components to render when the user is authenticated.
 * @returns {JSX.Element} The protected content or a loading screen.
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Verifies if there is an active user session in Supabase.
   * Redirects to the login page if no session is found or if an error occurs.
   *
   * @async
   * @function checkAuth
   * @returns {Promise<void>}
   */
  const checkAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error verificando sesión:', error);
        navigate('/');
        return;
      }

      if (!session) {
        console.log('No hay sesión activa, redirigiendo al login...');
        navigate('/');
        return;
      }

      console.log('✅ Sesión activa encontrada:', session.user.email);
      setLoading(false);
    } catch (error) {
      console.error('Error en AuthGuard:', error);
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

  return <>{children}</>;
};

export default AuthGuard;
