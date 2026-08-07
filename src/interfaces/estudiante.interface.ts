import { IUsuario } from './usuario.interface';

export interface IEstudiante extends IUsuario {
  rol: 'estudiante';
  pais_id: number;
}
