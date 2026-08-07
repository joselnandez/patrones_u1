import { IUsuario } from './usuario.interface';

export interface IProfesor extends IUsuario {
  rol: 'profesor';
}
