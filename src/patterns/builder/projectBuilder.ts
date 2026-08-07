import { IProyecto } from '../../interfaces/proyecto.interface';
import { EstadoProyecto } from '../../types/project-status.type';
import { SupabaseSingleton } from '../../config/supabase';

export class ProjectBuilder {
  private project: Partial<IProyecto> = {
    estado: 'activo'
  };

  public setNombre(nombre: string): this {
    this.project.nombre = nombre;
    return this;
  }

  public setDescripcion(descripcion: string): this {
    this.project.descripcion = descripcion;
    return this;
  }

  public setProfesorResponsable(profesorId: string): this {
    this.project.profesor_id = profesorId;
    return this;
  }

  public setCuros(curso_id: string): this {
    this.project.curso_id = curso_id;
    return this;
  }

  public setEstado(estado: EstadoProyecto): this {
    this.project.estado = estado;
    return this;
  }

  public async buildAndSave(): Promise<IProyecto> {
    if (!this.project.nombre) {
      throw new Error('El nombre del proyecto es obligatorio.');
    }

    const supabase = SupabaseSingleton.getInstance();

    if (this.project.profesor_id) {
      const { data: existingProject } = await supabase
        .from('proyectos')
        .select('id')
        .eq('profesor_id', this.project.profesor_id)
        .eq('estado', 'activo')
        .single();

      if (existingProject) {
        throw new Error('Regla: Un profesor sólo puede coordinar un proyecto ICCIS activo.');
      }
    }

    const { data, error } = await supabase
      .from('proyectos')
      .insert([this.project])
      .select()
      .single();

    if (error) {
      throw new Error(`Error en Base de Datos: ${error.message}`);
    }

    return data as IProyecto;
  }
}
