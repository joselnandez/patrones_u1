import { IProfesorAccessValidator } from './IProfesorAccessValidator';
import { ProfesorAccessValidator } from './profesorAccessValidator';

export class ProfesorAccessValidatorProxy implements IProfesorAccessValidator {
  private readonly cacheProfesoresValidados: Set<string> = new Set();

  constructor(
    private readonly realValidator: IProfesorAccessValidator = new ProfesorAccessValidator()
  ) {}

  public async validarAcceso(profesorId: string): Promise<boolean> {
    if (this.cacheProfesoresValidados.has(profesorId)) {
      console.log('desde cache');
      return true;
    }

    await this.realValidator.validarAcceso(profesorId);
    console.log('desde base de datos');
    this.cacheProfesoresValidados.add(profesorId);
    return true;
  }
}
