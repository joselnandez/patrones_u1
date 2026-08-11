import { SupabaseSingleton } from '../../config/supabase';
import { IProfesorAccessValidator } from './IProfesorAccessValidator';

export class ProfesorAccessValidator implements IProfesorAccessValidator {
  public async validarAcceso(profesorId: string): Promise<boolean> {
    const supabase = SupabaseSingleton.getInstance();

    const { data, error } = await supabase
      .from('usuarios')
      .select('id, rol')
      .eq('id', profesorId)
      .single();

    if (error || !data) {
      throw new Error('Acceso no permitido: el profesor_id indicado no existe.');
    }

    if (data.rol !== 'profesor') {
      throw new Error('Acceso no permitido: el usuario indicado no tiene el rol de profesor.');
    }
    return true;
  }
}
