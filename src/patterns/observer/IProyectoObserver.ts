import { IEvaluacionResultado } from '../../services/projectService';

export interface IProyectoObserver {
  
  onProyectoCerrado(proyectoId: string, estado: IEvaluacionResultado): void | Promise<void>;
}
