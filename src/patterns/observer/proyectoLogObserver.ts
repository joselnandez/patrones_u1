import { IProyectoObserver } from './IProyectoObserver';
import { IEvaluacionResultado } from '../../services/projectService';

export class ProyectoLogObserver implements IProyectoObserver {
  public onProyectoCerrado(proyectoId: string, estado: IEvaluacionResultado): void {
    console.log(`LOG Proyecto ${proyectoId} cerrado. ${estado.mensaje}`);
  }
}
