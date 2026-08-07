import { RolUsuario } from '../../types/roles.type';
import { IUsuario } from '../../interfaces/usuario.interface';
import { IEstudiante } from '../../interfaces/estudiante.interface';
import { IProfesor } from '../../interfaces/profesor.interface';

export class EstudianteUser implements IEstudiante {
  rol: 'estudiante' = 'estudiante';
  constructor(
    public nombre: string,
    public email: string,
    public pais_id: number
  ) {
    if (!pais_id) {
      throw new Error('Un estudiante debe pertenecer obligatoriamente a un país de origen.');
    }
  }
}

export class ProfesorUser implements IProfesor {
  rol: 'profesor' = 'profesor';
  constructor(
    public nombre: string,
    public email: string
  ) {}
}

export class UserFactory {
  public static createUser(
    type: RolUsuario,
    data: { nombre: string; email: string; pais_id?: number }
  ): IUsuario {
    switch (type) {
      case 'estudiante':
        if (!data.pais_id) {
          throw new Error('Se requiere el campo pais_id para registrar un estudiante.');
        }
        return new EstudianteUser(data.nombre, data.email, data.pais_id);

      case 'profesor':
        return new ProfesorUser(data.nombre, data.email);

      default:
        throw new Error(`Rol de usuario no reconocido: ${type}`);
    }
  }
}
