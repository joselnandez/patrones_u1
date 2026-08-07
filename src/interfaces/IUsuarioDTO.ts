export interface IUsuarioDTO {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  pais: { id: number; nombre: string } | null;
  creado_en: Date;
}