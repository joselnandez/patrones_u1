export interface IEstudianteCursoDTO {
  estudiante: { id: string; nombre: string; email: string } | null;
  curso: { id: string; nombre: string } | null;
}