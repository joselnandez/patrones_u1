
export interface INotificacion {
  id?: string;
  proyecto_id: string;
  fecha: string;
  mensaje: string;
  estado: 'pendiente' | 'enviada' | 'fallida';
}
