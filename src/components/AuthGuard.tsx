import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

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