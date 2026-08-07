import { EstadoProyecto } from '../types/project-status.type';

export interface IProyecto {
  id?: string;
  nombre: string;
  descripcion?: string;
  profesor_id?: string;
  curso_id?: string;
  estado: EstadoProyecto;
  creado_en?: Date;
}
