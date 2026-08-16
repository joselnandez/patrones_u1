import { IProyectoObserver } from './IProyectoObserver';
import { IEvaluacionResultado } from '../../services/projectService';
import { SupabaseSingleton } from '../../config/supabase';
import { INotificacion } from '../../interfaces/notificacion.interface';

export class ProyectoNotificacionPersistenceObserver implements IProyectoObserver {
  public async onProyectoCerrado(proyectoId: string, estado: IEvaluacionResultado): Promise<void> {
    const supabase = SupabaseSingleton.getInstance();

    const notificacion: INotificacion = {
      proyecto_id: proyectoId,
      fecha: new Date().toISOString(),
      mensaje: estado.mensaje,
      estado: 'pendiente'
    };

    const { error } = await supabase.from('notificaciones').insert([notificacion]);

    if (error) {
      console.error(`No se pudo guardar la notificación del proyecto ${proyectoId}: ${error.message}`);
    }
  }
}
