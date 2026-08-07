import { RolUsuario } from '../types/roles.type';

export interface IUsuario {
  id?: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  pais_id?: number;
  creado_en?: Date;
}
