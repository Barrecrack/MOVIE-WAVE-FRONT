import { supabase } from '../supabaseClient';

/**
 * Synchronizes the Supabase session with a given access and refresh token.
 * 
 * @async
 * @function
 * @param {string} token - The access token used to set the session.
 * @param {string} [refreshToken] - Optional refresh token (defaults to the access token if not provided).
 * @returns {Promise<boolean>} Returns `true` if the session was successfully synchronized, otherwise `false`.
 */
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

/**
 * Checks if there is an active authenticated Supabase session.
 * 
 * @async
 * @function
 * @returns {Promise<boolean>} Returns `true` if a valid session exists, otherwise `false`.
 */
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
