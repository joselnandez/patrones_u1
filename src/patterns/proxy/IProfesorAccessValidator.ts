
export interface IProfesorAccessValidator {
  validarAcceso(profesorId: string): Promise<boolean>;
}
