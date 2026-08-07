export interface ICursoDTO {
  id: string;
  nombre: string;
  facultad: { id: number; nombre: string } | null;
  profesor: { id: string; nombre: string } | null;
}