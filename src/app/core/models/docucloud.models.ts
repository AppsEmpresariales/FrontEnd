export type IsoDateTime = string;

export type EstadoTarea = 'PENDIENTE' | 'COMPLETADO' | 'CANCELADO';
export type CanalNotificacion = 'EMAIL';
export type TipoEvento =
  | 'DOCUMENTO_CREADO'
  | 'TAREA_ASIGNADA'
  | 'TAREA_VENCIDA'
  | 'DOCUMENTO_APROBADO'
  | 'DOCUMENTO_RECHAZADO';

export interface Organizacion {
  nit: number;
  nombre: string;
  email: string;
  telefono: string;
  dirCalle: string;
  dirNumero: string;
  dirComuna: string;
  active: boolean;
  creadoEn: IsoDateTime;
}

export interface OrganizacionCreate {
  nit: number;
  nombre: string;
  email: string;
  telefono: string;
  dirCalle: string;
  dirNumero: string;
  dirComuna: string;
  active?: boolean;
}

export interface Usuario {
  cedula: number;
  nombre: string;
  email: string;
  active: boolean;
  creadoEn: IsoDateTime;
  actualizadoEn: IsoDateTime;
  organizacionNit: number;
  organizacionNombre: string;
  rolNombre?: string;
}

export interface UsuarioCreate {
  cedula: number;
  nombre: string;
  email: string;
  password: string;
  organizacionNit: number;
}

export interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface RolUsuario {
  id: number;
  usuarioCedula: number;
  usuarioNombre: string;
  rolId: number;
  rolNombre: string;
}

export interface TipoDocumento {
  id: number;
  nombre: string;
  descripcion: string;
  active: boolean;
  creadoEn: IsoDateTime;
  organizacionNit: number;
  organizacionNombre: string;
}

export interface EstadoDocumento {
  id: number;
  nombre: string;
  color: string;
  esInicial: boolean;
  esFinal: boolean;
  organizacionNit: number;
  organizacionNombre: string;
}

export interface Documento {
  id: number;
  titulo: string;
  descripcion: string;
  version: number;
  archivoNombre?: string;
  archivoRuta?: string;
  tamanioArchivo?: number;
  creadoEn: IsoDateTime;
  actualizadoEn: IsoDateTime;
  creadoPorCedula: number;
  creadoPorNombre: string;
  organizacionNit: number;
  organizacionNombre: string;
  tipoDocumentoId: number;
  tipoDocumentoNombre: string;
  estadoDocumentoId: number;
  estadoDocumentoNombre: string;
}

export interface DocumentoCreate {
  titulo: string;
  descripcion?: string;
  creadoPorCedula: number;
  organizacionNit: number;
  tipoDocumentoId: number;
  estadoDocumentoId?: number;
}

export interface FlujoTrabajo {
  id: number;
  nombre: string;
  descripcion: string;
  active: boolean;
  organizacionNit: number;
  organizacionNombre: string;
  tipoDocumentoId: number;
  tipoDocumentoNombre: string;
}

export interface FlujoTrabajoPaso {
  id: number;
  nombre: string;
  descripcion: string;
  ordenPaso: number;
  flujoTrabajoId: number;
  flujoTrabajoNombre: string;
  rolRequeridoId: number;
  rolRequeridoNombre: string;
  objetivoEstadoId: number;
  objetivoEstadoNombre: string;
}

export interface FlujoTrabajoTarea {
  id: number;
  estado: EstadoTarea;
  comentario: string;
  fechaLimite: IsoDateTime;
  creadoEn: IsoDateTime;
  completadoEn?: IsoDateTime;
  documentoId: number;
  documentoTitulo: string;
  pasoId: number;
  pasoNombre: string;
  asignadoACedula: number;
  asignadoANombre: string;
}

export interface Notificacion {
  id: number;
  canal: CanalNotificacion;
  mensaje: string;
  estaLeida: boolean;
  enviadaA: IsoDateTime;
  usuarioCedula: number;
  usuarioNombre: string;
  documentoId: number;
  documentoTitulo: string;
  plantillaId: number;
  plantillaNombre: string;
}

export interface PlantillaCorreo {
  id: number;
  nombre: string;
  asunto: string;
  cuerpo: string;
  tipoEvento: TipoEvento;
  activo: boolean;
  organizacionNit: number;
  organizacionNombre: string;
}

export interface AuditRegistro {
  id: number;
  accion: string;
  descripcion: string;
  estadoPrevio: string;
  estadoNuevo: string;
  creadoEn: IsoDateTime;
  documentoId: number;
  documentoTitulo: string;
  usuarioCedula: number;
  usuarioNombre: string;
}

export interface TableColumn {
  key: string;
  label: string;
}
