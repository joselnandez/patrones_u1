import express, { Request, Response } from 'express';
import { RolUsuario } from './types/roles.type';
import { IUsuario } from './interfaces/usuario.interface';
import { IProyecto } from './interfaces/proyecto.interface';
import { IEvaluacionProyecto } from './interfaces/evaluacion.interface';
import { UserFactory } from './patterns/factory/userFactory';
import { ProjectBuilder } from './patterns/builder/projectBuilder';
import { SupabaseSingleton } from './config/supabase';
import { ProjectService } from './services/projectService';
import { IFacultad } from './interfaces/facultad.interface';
import { ICurso } from './interfaces/curso.interface';
import { IUsuarioDTO } from './interfaces/IUsuarioDTO';
import { IProyectoDTO } from './interfaces/IProyectoDTO';
import { IFacultadDTO } from './interfaces/IFacultadDTO';
import { ICursoDTO } from './interfaces/ICursoDTO';
import { IEvaluacionDTO } from './interfaces/IEvaluacionDTO';
import { IEstudianteCursoDTO } from './interfaces/IEstudianteCursoDTO';
import { IProfesorAccessValidator } from './patterns/proxy/IProfesorAccessValidator';
import { ProfesorAccessValidatorProxy } from './patterns/proxy/profesorAccessValidatorProxy';
import { ProyectoLogObserver } from './patterns/observer/proyectoLogObserver';
import { ProyectoNotificacionPersistenceObserver } from './patterns/observer/proyectoNotificacionPersistenceObserver';

const profesorAccessValidator: IProfesorAccessValidator = new ProfesorAccessValidatorProxy();

ProjectService.suscribir(new ProyectoLogObserver());
ProjectService.suscribir(new ProyectoNotificacionPersistenceObserver());

const app = express();
app.use(express.json());

// Bloque de interfaces para los cuerpos de las solicitudes
interface ICreateUserRequestBody {
  tipo: RolUsuario;
  nombre: string;
  email: string;
  pais_id?: number;
}

interface ICreateProjectRequestBody {
  nombre: string;
  descripcion?: string;
  profesor_id?: string;
  curso_id?: string;
}

interface ICreateEvaluationRequestBody {
  proyecto_id: string;
  estudiante_id: string;
  calificacion: number;
}

interface ICreateFacultadRequestBody {
  nombre: string;
  descripcion?: string;
}

interface ICreateCursoRequestBody {
  nombre: string;
  facultad_id: number;
  profesor_id?: string;
}

interface IAssignStudentRequestBody {
  estudiante_id: string;
  curso_id: string;
}

// Bloque de logica de los endpoints POST
app.post('/api/usuarios', async (req: Request<{}, {}, ICreateUserRequestBody>, res: Response) => {
  try {
    const { tipo, nombre, email, pais_id } = req.body;
    const usuarioObjeto: IUsuario = UserFactory.createUser(tipo, { nombre, email, pais_id });

    const supabase = SupabaseSingleton.getInstance();
    const { data, error } = await supabase
      .from('usuarios')
      .insert([usuarioObjeto])
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    return res.status(201).json({ mensaje: 'Usuario creado exitosamente', data: data as IUsuario });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.post('/api/proyectos', async (req: Request<{}, {}, ICreateProjectRequestBody>, res: Response) => {
  try {
    const { nombre, descripcion, profesor_id, curso_id } = req.body;

    if (profesor_id) {
      await profesorAccessValidator.validarAcceso(profesor_id);
    }

    const builder = new ProjectBuilder();
    if (descripcion) builder.setDescripcion(descripcion);
    if (profesor_id) builder.setProfesorResponsable(profesor_id);
    if (curso_id) builder.setCuros(curso_id);
    const nuevoProyecto: IProyecto = await builder
      .setNombre(nombre)
      .buildAndSave();

    return res.status(201).json({ mensaje: 'Proyecto ICCIS creado correctamente', proyecto: nuevoProyecto });
  } catch (err: any) {
    const esAccesoNoPermitido = typeof err.message === 'string' && err.message.startsWith('Acceso no permitido');
    return res.status(esAccesoNoPermitido ? 403 : 400).json({ error: err.message });
  }
});

app.post('/api/evaluaciones', async (req: Request<{}, {}, ICreateEvaluationRequestBody>, res: Response) => {
  try {
    const { proyecto_id, estudiante_id, calificacion } = req.body;

    const evaluacionObjeto: IEvaluacionProyecto = {
      proyecto_id,
      estudiante_id,
      calificacion
    };

    const supabase = SupabaseSingleton.getInstance();
    const { data, error } = await supabase
      .from('evaluaciones_proyectos')
      .insert([evaluacionObjeto])
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    const estadoProyecto = await ProjectService.evaluarEstadoProyecto(proyecto_id);

    return res.status(201).json({
      mensaje: 'Calificación registrada con éxito',
      evaluacion: data as IEvaluacionProyecto,
      estadoProyecto
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.post('/api/facultades', async (req: Request<{}, {}, ICreateFacultadRequestBody>, res: Response) => {
  try {
    const { nombre, descripcion } = req.body;
    const supabase = SupabaseSingleton.getInstance();
    const facultad: IFacultad = {
      nombre,
      descripcion: descripcion,
    };
    const { data, error } = await supabase
      .from('facultades')
      .insert([facultad])
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    return res.status(201).json({ mensaje: 'Facultad creada exitosamente', data });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.post('/api/cursos', async (req: Request<{}, {}, ICreateCursoRequestBody>, res: Response) => {
  try {
    const { nombre, facultad_id, profesor_id } = req.body;
    const supabase = SupabaseSingleton.getInstance();
    const curso: ICurso = {
      nombre,
      facultad_id,
      profesor_id,
    };
    const { data, error } = await supabase
      .from('cursos')
      .insert([curso])
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    return res.status(201).json({ mensaje: 'Curso creado exitosamente', data });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.post('/api/estudiantes-cursos', async (req: Request<{}, {}, IAssignStudentRequestBody>, res: Response) => {
  try {
    const { estudiante_id, curso_id } = req.body;
    const supabase = SupabaseSingleton.getInstance();
    const estudianteCurso = {
      estudiante_id,
      curso_id,
    };
    const { error } = await supabase
      .from('estudiantes_cursos')
      .insert([estudianteCurso]);

    if (error) return res.status(400).json({ error: error.message });

    return res.status(201).json({ 
      mensaje: 'Estudiante asignado al curso exitosamente',
      data: { estudiante_id, curso_id }
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// Bloque de logica de los endpoints GET
app.get('/api/usuarios', async (req: Request, res: Response) => {
  try {
    const supabase = SupabaseSingleton.getInstance();
    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        id, nombre, email, rol, creado_en,
        pais:paises (id, nombre)
      `);

    if (error) return res.status(400).json({ error: error.message });

    const usuariosFormateados: IUsuarioDTO[] = data?.map((usuario: any) => ({
      ...usuario,
      pais: Array.isArray(usuario.pais) ? usuario.pais[0] : (usuario.pais || null)
    })) || [];

    return res.status(200).json({ data: usuariosFormateados });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/facultades', async (req: Request, res: Response) => {
  try {
    const supabase = SupabaseSingleton.getInstance();
    const { data, error } = await supabase
      .from('facultades')
      .select(`
        id, nombre, descripcion
      `);

    if (error) return res.status(400).json({ error: error.message });

    const facultadesFormateados: IFacultadDTO[] = data?.map((facultad: any) => ({
      ...facultad
    })) || [];

    return res.status(200).json({ data: facultadesFormateados });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});


app.get('/api/cursos', async (req: Request, res: Response) => {
  try {
    const supabase = SupabaseSingleton.getInstance();
    const { data, error } = await supabase
      .from('cursos')
      .select(`
        id, nombre,
        facultad:facultades (id, nombre),
        profesor:usuarios!cursos_profesor_id_fkey (id, nombre)
      `);

    if (error) return res.status(400).json({ error: error.message });

    const cursosFormateados: ICursoDTO[] = data?.map((curso: any) => ({
      ...curso,
      facultad: Array.isArray(curso.facultad) ? curso.facultad[0] : (curso.facultad || null),
      profesor: Array.isArray(curso.profesor) ? curso.profesor[0] : (curso.profesor || null)
    })) || [];

    return res.status(200).json({ data: cursosFormateados });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/evaluaciones', async (req: Request, res: Response) => {
  try {
    const supabase = SupabaseSingleton.getInstance();
    const { data, error } = await supabase
      .from('evaluaciones_proyectos')
      .select(`
        id, calificacion, fecha,
        proyecto:proyectos (id, nombre),
        estudiante:usuarios (id, nombre, email)
      `);

    if (error) return res.status(400).json({ error: error.message });

    const evaluacionesFormateadas: IEvaluacionDTO[] = data?.map((evaluacion: any) => ({
      ...evaluacion,
      proyecto: Array.isArray(evaluacion.proyecto) ? evaluacion.proyecto[0] : (evaluacion.proyecto || null),
      estudiante: Array.isArray(evaluacion.estudiante) ? evaluacion.estudiante[0] : (evaluacion.estudiante || null)
    })) || [];

    return res.status(200).json({ data: evaluacionesFormateadas });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/estudiantes-cursos', async (req: Request, res: Response) => {
  try {
    const supabase = SupabaseSingleton.getInstance();
    const { data, error } = await supabase
      .from('estudiantes_cursos')
      .select(`
        estudiante:usuarios (id, nombre, email),
        curso:cursos (id, nombre)
      `);

    if (error) return res.status(400).json({ error: error.message });

    const inscripcionesFormateadas: IEstudianteCursoDTO[] = data?.map((inscripcion: any) => ({
      estudiante: Array.isArray(inscripcion.estudiante) ? inscripcion.estudiante[0] : (inscripcion.estudiante || null),
      curso: Array.isArray(inscripcion.curso) ? inscripcion.curso[0] : (inscripcion.curso || null)
    })) || [];

    return res.status(200).json({ data: inscripcionesFormateadas });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/proyectos', async (req: Request, res: Response) => {
  try {
    const supabase = SupabaseSingleton.getInstance();
    const { data, error } = await supabase
      .from('proyectos')
      .select(`
        id, nombre, creado_en, estado,
        curso:cursos (id, nombre),
        profesor:usuarios (id, nombre, email)
      `);

    if (error) return res.status(400).json({ error: error.message });

    const proyectosFormateadas: IProyectoDTO[] = data?.map((proyecto: any) => ({
      ...proyecto,
      curso: Array.isArray(proyecto.curso) ? proyecto.curso[0] : (proyecto.curso || null),
      profesor: Array.isArray(proyecto.profesor) ? proyecto.profesor[0] : (proyecto.profesor || null)
    })) || [];

    return res.status(200).json({ data: proyectosFormateadas });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});


const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Servidor TypeScript en ejecución en http://localhost:${PORT}`);
});
