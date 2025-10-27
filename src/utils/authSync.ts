import { supabase } from '../supabaseClient';

export const syncSupabaseSession = async (token: string, refreshToken?: string) => {
  try {
    console.log('🔄 Sincronizando sesión de Supabase...');
    
    const { error } = await supabase.auth.setSession({
      access_token: token,
      refresh_token: refreshToken || token,
    });

    if (error) {
      console.warn('⚠️ No se pudo sincronizar sesión:', error.message);
      return false;
    }

    console.log('✅ Sesión de Supabase sincronizada correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error sincronizando sesión:', error);
    return false;
  }
};

export const checkSupabaseAuth = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Error verificando sesión:', error);
      return false;
    }

    return !!session;
  } catch (error) {
    console.error('❌ Error en checkSupabaseAuth:', error);
    return false;
  }
};