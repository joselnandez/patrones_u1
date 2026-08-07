export interface IEvaluacionDTO {
  id: string;
  calificacion: number;
  fecha: Date;
  proyecto: { id: string; nombre: string } | null;
  estudiante: { id: string; nombre: string; email: string } | null;
}