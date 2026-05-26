import {
  AuditRegistro,
  Documento,
  EstadoDocumento,
  FlujoTrabajo,
  FlujoTrabajoPaso,
  FlujoTrabajoTarea,
  Notificacion,
  Organizacion,
  PlantillaCorreo,
  Rol,
  TipoDocumento,
  Usuario
} from '../models/docucloud.models';

export const mockOrganizaciones: Organizacion[] = [
  {
    nit: 900123456,
    nombre: 'DocuCloud Demo',
    email: 'contacto@docucloud.local',
    telefono: '606 555 0140',
    dirCalle: 'Carrera 15',
    dirNumero: '24-10',
    dirComuna: 'Centro',
    active: true,
    creadoEn: '2026-04-10T08:30:00'
  },
  {
    nit: 901884221,
    nombre: 'Archivo Empresarial SAS',
    email: 'operaciones@archivoempresarial.local',
    telefono: '606 555 0188',
    dirCalle: 'Calle 21',
    dirNumero: '7-45',
    dirComuna: 'Norte',
    active: true,
    creadoEn: '2026-04-14T11:10:00'
  }
];

export const mockUsuarios: Usuario[] = [
  {
    cedula: 1002456789,
    nombre: 'Laura Mejia',
    email: 'laura.mejia@docucloud.local',
    active: true,
    creadoEn: '2026-04-11T09:00:00',
    actualizadoEn: '2026-05-03T15:20:00',
    organizacionNit: 900123456,
    organizacionNombre: 'DocuCloud Demo'
  },
  {
    cedula: 1098765432,
    nombre: 'Mateo Rojas',
    email: 'mateo.rojas@docucloud.local',
    active: true,
    creadoEn: '2026-04-12T13:40:00',
    actualizadoEn: '2026-05-01T10:05:00',
    organizacionNit: 900123456,
    organizacionNombre: 'DocuCloud Demo'
  },
  {
    cedula: 1122334455,
    nombre: 'Sofia Alvarez',
    email: 'sofia.alvarez@docucloud.local',
    active: false,
    creadoEn: '2026-04-15T16:15:00',
    actualizadoEn: '2026-04-28T18:05:00',
    organizacionNit: 900123456,
    organizacionNombre: 'DocuCloud Demo'
  }
];

export const mockRoles: Rol[] = [
  { id: 1, nombre: 'ADMIN_ORG', descripcion: 'Administrador de la organizacion' },
  { id: 2, nombre: 'REVISOR', descripcion: 'Usuario encargado de revisar documentos' },
  { id: 3, nombre: 'APROBADOR', descripcion: 'Usuario con permisos de aprobacion final' }
];

export const mockTiposDocumento: TipoDocumento[] = [
  {
    id: 1,
    nombre: 'Contrato',
    descripcion: 'Documentos contractuales internos y externos',
    active: true,
    creadoEn: '2026-04-12T08:00:00',
    organizacionNit: 900123456,
    organizacionNombre: 'DocuCloud Demo'
  },
  {
    id: 2,
    nombre: 'Factura',
    descripcion: 'Soportes contables y facturacion',
    active: true,
    creadoEn: '2026-04-13T08:00:00',
    organizacionNit: 900123456,
    organizacionNombre: 'DocuCloud Demo'
  }
];

export const mockEstadosDocumento: EstadoDocumento[] = [
  {
    id: 1,
    nombre: 'Creado',
    color: '#3A7CA5',
    esInicial: true,
    esFinal: false,
    organizacionNit: 900123456,
    organizacionNombre: 'DocuCloud Demo'
  },
  {
    id: 2,
    nombre: 'En revision',
    color: '#C49A3A',
    esInicial: false,
    esFinal: false,
    organizacionNit: 900123456,
    organizacionNombre: 'DocuCloud Demo'
  },
  {
    id: 3,
    nombre: 'Aprobado',
    color: '#2D6A4F',
    esInicial: false,
    esFinal: true,
    organizacionNit: 900123456,
    organizacionNombre: 'DocuCloud Demo'
  }
];

export const mockDocumentos: Documento[] = [
  {
    id: 101,
    titulo: 'Contrato de servicios 2026',
    descripcion: 'Contrato anual para servicios empresariales.',
    version: 2,
    archivoNombre: 'contrato-servicios-2026.pdf',
    archivoRuta: '/docs/contrato-servicios-2026.pdf',
    tamanioArchivo: 248000,
    creadoEn: '2026-05-01T09:35:00',
    actualizadoEn: '2026-05-06T14:10:00',
    creadoPorCedula: 1002456789,
    creadoPorNombre: 'Laura Mejia',
    organizacionNit: 900123456,
    organizacionNombre: 'DocuCloud Demo',
    tipoDocumentoId: 1,
    tipoDocumentoNombre: 'Contrato',
    estadoDocumentoId: 2,
    estadoDocumentoNombre: 'En revision'
  },
  {
    id: 102,
    titulo: 'Factura proveedor abril',
    descripcion: 'Factura enviada por proveedor de infraestructura.',
    version: 1,
    archivoNombre: 'factura-proveedor-abril.pdf',
    archivoRuta: '/docs/factura-proveedor-abril.pdf',
    tamanioArchivo: 98000,
    creadoEn: '2026-05-02T11:25:00',
    actualizadoEn: '2026-05-04T12:00:00',
    creadoPorCedula: 1098765432,
    creadoPorNombre: 'Mateo Rojas',
    organizacionNit: 900123456,
    organizacionNombre: 'DocuCloud Demo',
    tipoDocumentoId: 2,
    tipoDocumentoNombre: 'Factura',
    estadoDocumentoId: 3,
    estadoDocumentoNombre: 'Aprobado'
  },
  {
    id: 103,
    titulo: 'Acta comite documental',
    descripcion: 'Acta de revision del comite documental.',
    version: 1,
    archivoNombre: 'acta-comite.pdf',
    archivoRuta: '/docs/acta-comite.pdf',
    tamanioArchivo: 178000,
    creadoEn: '2026-05-07T08:20:00',
    actualizadoEn: '2026-05-07T08:20:00',
    creadoPorCedula: 1002456789,
    creadoPorNombre: 'Laura Mejia',
    organizacionNit: 900123456,
    organizacionNombre: 'DocuCloud Demo',
    tipoDocumentoId: 1,
    tipoDocumentoNombre: 'Contrato',
    estadoDocumentoId: 1,
    estadoDocumentoNombre: 'Creado'
  }
];

export const mockFlujos: FlujoTrabajo[] = [
  {
    id: 1,
    nombre: 'Revision contractual',
    descripcion: 'Flujo estandar para revisar y aprobar contratos.',
    active: true,
    organizacionNit: 900123456,
    organizacionNombre: 'DocuCloud Demo',
    tipoDocumentoId: 1,
    tipoDocumentoNombre: 'Contrato'
  },
  {
    id: 2,
    nombre: 'Aprobacion contable',
    descripcion: 'Revision contable para documentos financieros.',
    active: true,
    organizacionNit: 900123456,
    organizacionNombre: 'DocuCloud Demo',
    tipoDocumentoId: 2,
    tipoDocumentoNombre: 'Factura'
  }
];

export const mockPasos: FlujoTrabajoPaso[] = [
  {
    id: 1,
    nombre: 'Revision juridica',
    descripcion: 'Validacion inicial del contrato.',
    ordenPaso: 1,
    flujoTrabajoId: 1,
    flujoTrabajoNombre: 'Revision contractual',
    rolRequeridoId: 2,
    rolRequeridoNombre: 'REVISOR',
    objetivoEstadoId: 2,
    objetivoEstadoNombre: 'En revision'
  },
  {
    id: 2,
    nombre: 'Aprobacion gerencial',
    descripcion: 'Aprobacion final del documento.',
    ordenPaso: 2,
    flujoTrabajoId: 1,
    flujoTrabajoNombre: 'Revision contractual',
    rolRequeridoId: 3,
    rolRequeridoNombre: 'APROBADOR',
    objetivoEstadoId: 3,
    objetivoEstadoNombre: 'Aprobado'
  }
];

export const mockTareas: FlujoTrabajoTarea[] = [
  {
    id: 201,
    estado: 'PENDIENTE',
    comentario: 'Revisar clausulas de renovacion.',
    fechaLimite: '2026-05-12T17:00:00',
    creadoEn: '2026-05-08T09:00:00',
    documentoId: 101,
    documentoTitulo: 'Contrato de servicios 2026',
    pasoId: 1,
    pasoNombre: 'Revision juridica',
    asignadoACedula: 1098765432,
    asignadoANombre: 'Mateo Rojas'
  },
  {
    id: 202,
    estado: 'COMPLETADO',
    comentario: 'Factura validada con contabilidad.',
    fechaLimite: '2026-05-09T12:00:00',
    creadoEn: '2026-05-03T09:30:00',
    completadoEn: '2026-05-04T11:15:00',
    documentoId: 102,
    documentoTitulo: 'Factura proveedor abril',
    pasoId: 2,
    pasoNombre: 'Aprobacion gerencial',
    asignadoACedula: 1002456789,
    asignadoANombre: 'Laura Mejia'
  }
];

export const mockNotificaciones: Notificacion[] = [
  {
    id: 301,
    canal: 'EMAIL',
    mensaje: 'Tienes una tarea pendiente de revision documental.',
    estaLeida: false,
    enviadaA: '2026-05-08T09:05:00',
    usuarioCedula: 1098765432,
    usuarioNombre: 'Mateo Rojas',
    documentoId: 101,
    documentoTitulo: 'Contrato de servicios 2026',
    plantillaId: 1,
    plantillaNombre: 'Tarea asignada'
  }
];

export const mockPlantillas: PlantillaCorreo[] = [
  {
    id: 1,
    nombre: 'Tarea asignada',
    asunto: 'Nueva tarea documental asignada',
    cuerpo: 'Se ha asignado una nueva tarea sobre el documento {{documento}}.',
    tipoEvento: 'TAREA_ASIGNADA',
    activo: true,
    organizacionNit: 900123456,
    organizacionNombre: 'DocuCloud Demo'
  }
];

export const mockAuditoria: AuditRegistro[] = [
  {
    id: 401,
    accion: 'DOCUMENTO_CREADO',
    descripcion: 'Documento creado por Laura Mejia.',
    estadoPrevio: 'N/A',
    estadoNuevo: 'Creado',
    creadoEn: '2026-05-01T09:35:00',
    documentoId: 101,
    documentoTitulo: 'Contrato de servicios 2026',
    usuarioCedula: 1002456789,
    usuarioNombre: 'Laura Mejia'
  },
  {
    id: 402,
    accion: 'ESTADO_CAMBIADO',
    descripcion: 'Documento enviado a revision juridica.',
    estadoPrevio: 'Creado',
    estadoNuevo: 'En revision',
    creadoEn: '2026-05-06T14:10:00',
    documentoId: 101,
    documentoTitulo: 'Contrato de servicios 2026',
    usuarioCedula: 1098765432,
    usuarioNombre: 'Mateo Rojas'
  }
];
