import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

export class SupabaseSingleton {
  private static instance: SupabaseClient;

  private constructor() {}

  public static getInstance(): SupabaseClient {
    if (!SupabaseSingleton.instance) {
      const supabaseUrl = process.env.SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Variables de entorno de Supabase no configuradas en el archivo .env.');
      }

      SupabaseSingleton.instance = createClient(supabaseUrl, supabaseKey);
      console.log('⚡ Conexión a Supabase establecida correctamente (Singleton).');
    }
    return SupabaseSingleton.instance;
  }
}
