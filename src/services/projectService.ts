import { SupabaseSingleton } from '../config/supabase';
import { IEvaluacionProyecto } from '../interfaces/evaluacion.interface';
import { IProyectoObserver } from '../patterns/observer/IProyectoObserver';

export interface IEvaluacionResultado {
  cerrado: boolean;
  mensaje: string;
  porcentajeDeficientes: number;
}

export class ProjectService {
  private static readonly observadores: IProyectoObserver[] = [];

  public static suscribir(observer: IProyectoObserver): void {
    ProjectService.observadores.push(observer);
  }

  private static async notificarCierre(proyectoId: string, estado: IEvaluacionResultado): Promise<void> {
    for (const observer of ProjectService.observadores) {
      await observer.onProyectoCerrado(proyectoId, estado);
    }
  }

  public static async evaluarEstadoProyecto(proyectoId: string): Promise<IEvaluacionResultado> {
    const supabase = SupabaseSingleton.getInstance();

    const { data: evaluaciones, error } = await supabase
      .from('evaluaciones_proyectos')
      .select('calificacion')
      .eq('proyecto_id', proyectoId);

    if (error || !evaluaciones || evaluaciones.length === 0) {
      return {
        cerrado: false,
        mensaje: 'Sin evaluaciones registradas aun.',
        porcentajeDeficientes: 0
      };
    }

    const totalEvaluaciones = evaluaciones.length;
    const deficientes = evaluaciones.filter((e: Pick<IEvaluacionProyecto, 'calificacion'>) => e.calificacion < 70).length;
    const porcentajeDeficientes = (deficientes / totalEvaluaciones) * 100;

    if (porcentajeDeficientes >= 50) {
      await supabase
        .from('proyectos')
        .update({ estado: 'cerrado' })
        .eq('id', proyectoId);

      const resultado: IEvaluacionResultado = {
        cerrado: true,
        mensaje: `Proyecto cerrado automáticamente. El ${porcentajeDeficientes.toFixed(1)}% de las evaluaciones son menores a 70 puntos.`,
        porcentajeDeficientes
      };

      await ProjectService.notificarCierre(proyectoId, resultado);

      return resultado;
    }

    return {
      cerrado: false,
      mensaje: 'El proyecto se mantiene activo. Porcentaje de evaluaciones deficientes',
      porcentajeDeficientes
    };
  }
}
