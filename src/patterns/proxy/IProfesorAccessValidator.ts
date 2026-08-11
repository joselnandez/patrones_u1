/**
 * Proxy (patrón estructural)
 *
 * Contrato compartido entre el objeto real (que consulta Supabase) y el
 * proxy que lo protege. El endpoint solo conoce esta interfaz: no sabe,
 * ni le importa, si la respuesta vino de la base de datos o de una
 * caché en memoria.
 */
export interface IProfesorAccessValidator {
  /**
   * Debe resolver sin lanzar si profesor_id existe y tiene rol 'profesor'.
   * Si no cumple, lanza un Error cuyo mensaje inicia con
   * "Acceso no permitido" para que el endpoint pueda mapearlo a HTTP 403.
   */
  validarAcceso(profesorId: string): Promise<boolean>;
}
