import { SupabaseSingleton } from '../config/supabase';
import { IEvaluacionProyecto } from '../interfaces/evaluacion.interface';

export interface IEvaluacionResultado {
  cerrado: boolean;
  mensaje: string;
  porcentajeDeficientes: number;
}

export class ProjectService {
  public static async evaluarEstadoProyecto(proyectoId: string): Promise<IEvaluacionResultado> {
    const supabase = SupabaseSingleton.getInstance();

    const { data: evaluaciones, error } = await supabase
      .from('evaluaciones_proyectos')
      .select('calificacion')
      .eq('proyecto_id', proyectoId);

    if (error || !evaluaciones || evaluaciones.length === 0) {
      return {
        cerrado: false,
        mensaje: 'Sin evaluaciones registradas aún.',
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

      return {
        cerrado: true,
        mensaje: `Proyecto cerrado automáticamente. El ${porcentajeDeficientes.toFixed(1)}% de las evaluaciones son menores a 70 puntos.`,
        porcentajeDeficientes
      };
    }

    return {
      cerrado: false,
      mensaje: 'El proyecto se mantiene activo. Porcentaje de evaluaciones deficientes',
      porcentajeDeficientes
    };
  }
}
