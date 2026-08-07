export interface IProyectoDTO {
  id: string;
  nombre: string;
  descripcion: string;
  estado: string;
  profesor: { id: string; nombre: string; email: string } | null;
  curso: { id: string; nombre: string } | null;
  creado_en: Date;
}