import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuditRegistro,
  Documento,
  DocumentoCreate,
  EstadoDocumento,
  FlujoTrabajo,
  FlujoTrabajoPaso,
  FlujoTrabajoTarea,
  Notificacion,
  Organizacion,
  OrganizacionCreate,
  PlantillaCorreo,
  Rol,
  RolUsuario,
  TipoDocumento,
  Usuario,
  UsuarioCreate
} from '../models/docucloud.models';

@Injectable({
  providedIn: 'root'
})
export class DocucloudApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getOrganizaciones(): Observable<Organizacion[]> {
    return this.http.get<Organizacion[]>(`${this.apiUrl}/organizaciones`);
  }

  getOrganizacionesActivas(): Observable<Organizacion[]> {
    return this.http.get<Organizacion[]>(`${this.apiUrl}/organizaciones/activas`);
  }

  getOrganizacionByNit(nit: number): Observable<Organizacion> {
    return this.http.get<Organizacion>(`${this.apiUrl}/organizaciones/${nit}`);
  }

  createOrganizacion(payload: OrganizacionCreate): Observable<Organizacion> {
    return this.http.post<Organizacion>(`${this.apiUrl}/organizaciones`, payload);
  }

  updateOrganizacion(nit: number, payload: Partial<OrganizacionCreate>): Observable<Organizacion> {
    return this.http.put<Organizacion>(`${this.apiUrl}/organizaciones/${nit}`, payload);
  }

  deleteOrganizacion(nit: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/organizaciones/${nit}`);
  }

  getUsuariosByOrganizacion(nit: number): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/usuarios/organizacion/${nit}`);
  }

  getUsuariosActivosByOrganizacion(nit: number): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/usuarios/organizacion/${nit}/activos`);
  }

  getUsuarioByCedula(cedula: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/usuarios/${cedula}`);
  }

  createUsuario(payload: UsuarioCreate): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/usuarios`, payload);
  }

  updateUsuario(cedula: number, payload: Partial<UsuarioCreate>): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/usuarios/${cedula}`, payload);
  }

  activarUsuario(cedula: number): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.apiUrl}/usuarios/${cedula}/activar`, null);
  }

  inactivarUsuario(cedula: number): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.apiUrl}/usuarios/${cedula}/inactivar`, null);
  }

  getRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(`${this.apiUrl}/roles`);
  }

  getRolesByUsuario(cedula: number): Observable<RolUsuario[]> {
    return this.http.get<RolUsuario[]>(`${this.apiUrl}/roles-usuarios/${cedula}`);
  }

  asignarRolUsuario(payload: { usuarioCedula: number; rolId: number }): Observable<RolUsuario> {
    return this.http.post<RolUsuario>(`${this.apiUrl}/roles-usuarios`, payload);
  }

  eliminarRolUsuario(cedula: number, rolId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/roles-usuarios/${cedula}/${rolId}`);
  }

  getDocumentosByOrganizacion(nit: number): Observable<Documento[]> {
    return this.http.get<Documento[]>(`${this.apiUrl}/documentos/organizacion/${nit}`);
  }

  createDocumento(payload: DocumentoCreate): Observable<Documento> {
    return this.http.post<Documento>(`${this.apiUrl}/documentos`, payload);
  }

  updateDocumento(id: number, payload: Partial<DocumentoCreate>): Observable<Documento> {
    return this.http.put<Documento>(`${this.apiUrl}/documentos/${id}`, payload);
  }

  uploadDocumentoArchivo(id: number, file: File): Observable<Documento> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Documento>(`${this.apiUrl}/documentos/${id}/archivo`, formData);
  }

  downloadDocumentoArchivo(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/documentos/${id}/archivo`, { responseType: 'blob' });
  }

  cambiarEstadoDocumento(id: number, estadoId: number): Observable<Documento> {
    return this.http.patch<Documento>(`${this.apiUrl}/documentos/${id}/estado/${estadoId}`, null);
  }

  deleteDocumento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/documentos/${id}`);
  }

  getTiposDocumentales(nit: number): Observable<TipoDocumento[]> {
    return this.http.get<TipoDocumento[]>(`${this.apiUrl}/tipos-documentales/organizacion/${nit}`);
  }

  getTiposDocumentalesActivos(nit: number): Observable<TipoDocumento[]> {
    return this.http.get<TipoDocumento[]>(`${this.apiUrl}/tipos-documentales/organizacion/${nit}/activos`);
  }

  createTipoDocumento(payload: { nombre: string; descripcion: string; organizacionNit: number }): Observable<TipoDocumento> {
    return this.http.post<TipoDocumento>(`${this.apiUrl}/tipos-documentales`, payload);
  }

  updateTipoDocumento(id: number, payload: { nombre?: string; descripcion?: string }): Observable<TipoDocumento> {
    return this.http.put<TipoDocumento>(`${this.apiUrl}/tipos-documentales/${id}`, payload);
  }

  activarTipoDocumento(id: number): Observable<TipoDocumento> {
    return this.http.patch<TipoDocumento>(`${this.apiUrl}/tipos-documentales/${id}/activar`, null);
  }

  desactivarTipoDocumento(id: number): Observable<TipoDocumento> {
    return this.http.patch<TipoDocumento>(`${this.apiUrl}/tipos-documentales/${id}/desactivar`, null);
  }

  deleteTipoDocumento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tipos-documentales/${id}`);
  }

  getEstadosDocumento(nit: number): Observable<EstadoDocumento[]> {
    return this.http.get<EstadoDocumento[]>(`${this.apiUrl}/estados-documento/organizacion/${nit}`);
  }

  createEstadoDocumento(payload: {
    nombre: string;
    color?: string;
    esInicial?: boolean;
    esFinal?: boolean;
    organizacionNit: number;
  }): Observable<EstadoDocumento> {
    return this.http.post<EstadoDocumento>(`${this.apiUrl}/estados-documento`, payload);
  }

  updateEstadoDocumento(id: number, payload: Partial<EstadoDocumento>): Observable<EstadoDocumento> {
    return this.http.put<EstadoDocumento>(`${this.apiUrl}/estados-documento/${id}`, payload);
  }

  deleteEstadoDocumento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/estados-documento/${id}`);
  }

  getFlujosTrabajo(nit: number): Observable<FlujoTrabajo[]> {
    return this.http.get<FlujoTrabajo[]>(`${this.apiUrl}/flujos-trabajo/organizacion/${nit}`);
  }

  getFlujosTrabajoActivos(nit: number): Observable<FlujoTrabajo[]> {
    return this.http.get<FlujoTrabajo[]>(`${this.apiUrl}/flujos-trabajo/organizacion/${nit}/activos`);
  }

  getPasosByFlujo(flujoId: number): Observable<FlujoTrabajoPaso[]> {
    return this.http.get<FlujoTrabajoPaso[]>(`${this.apiUrl}/flujos-trabajo-pasos/flujo/${flujoId}`);
  }

  createFlujoTrabajo(payload: any): Observable<FlujoTrabajo> {
    return this.http.post<FlujoTrabajo>(`${this.apiUrl}/flujos-trabajo`, payload);
  }

  createPasoFlujo(payload: any): Observable<FlujoTrabajoPaso> {
    return this.http.post<FlujoTrabajoPaso>(`${this.apiUrl}/flujos-trabajo-pasos`, payload);
  }

  updateFlujoTrabajo(id: number, payload: Partial<FlujoTrabajo>): Observable<FlujoTrabajo> {
    return this.http.put<FlujoTrabajo>(`${this.apiUrl}/flujos-trabajo/${id}`, payload);
  }

  deleteFlujoTrabajo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/flujos-trabajo/${id}`);
  }

  createTarea(payload: {
    documentoId: number;
    pasoId: number;
    asignadoACedula: number;
    comentario?: string;
    fechaLimite?: string;
  }): Observable<FlujoTrabajoTarea> {
    return this.http.post<FlujoTrabajoTarea>(`${this.apiUrl}/tareas`, payload);
  }

  getTareasByDocumento(documentoId: number): Observable<FlujoTrabajoTarea[]> {
    return this.http.get<FlujoTrabajoTarea[]>(`${this.apiUrl}/tareas/documento/${documentoId}`);
  }

  getTareasPendientesByUsuario(cedula: number): Observable<FlujoTrabajoTarea[]> {
    return this.http.get<FlujoTrabajoTarea[]>(`${this.apiUrl}/tareas/usuario/${cedula}/pendientes`);
  }

  completarTarea(id: number, comentario?: string): Observable<FlujoTrabajoTarea> {
    const params = comentario ? new HttpParams().set('comentario', comentario) : undefined;
    return this.http.patch<FlujoTrabajoTarea>(`${this.apiUrl}/tareas/${id}/completar`, null, { params });
  }

  cancelarTarea(id: number): Observable<FlujoTrabajoTarea> {
    return this.http.patch<FlujoTrabajoTarea>(`${this.apiUrl}/tareas/${id}/cancelar`, null);
  }

  getNotificacionesByUsuario(cedula: number): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(`${this.apiUrl}/notificaciones/usuario/${cedula}`);
  }

  getNoLeidasByUsuario(cedula: number): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(`${this.apiUrl}/notificaciones/usuario/${cedula}/no-leidas`);
  }

  marcarNotificacionLeida(id: number): Observable<Notificacion> {
    return this.http.patch<Notificacion>(`${this.apiUrl}/notificaciones/${id}/leida`, null);
  }

  marcarTodasComoLeidas(cedula: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/notificaciones/usuario/${cedula}/leer-todo`, null);
  }

  getPlantillasCorreo(nit: number): Observable<PlantillaCorreo[]> {
    return this.http.get<PlantillaCorreo[]>(`${this.apiUrl}/plantillas-correo/organizacion/${nit}`);
  }

  createPlantillaCorreo(payload: {
    nombre: string;
    asunto: string;
    cuerpo: string;
    tipoEvento: string;
    organizacionNit: number;
  }): Observable<PlantillaCorreo> {
    return this.http.post<PlantillaCorreo>(`${this.apiUrl}/plantillas-correo`, payload);
  }

  updatePlantillaCorreo(id: number, payload: Partial<PlantillaCorreo>): Observable<PlantillaCorreo> {
    return this.http.put<PlantillaCorreo>(`${this.apiUrl}/plantillas-correo/${id}`, payload);
  }

  activarPlantillaCorreo(id: number): Observable<PlantillaCorreo> {
    return this.http.patch<PlantillaCorreo>(`${this.apiUrl}/plantillas-correo/${id}/activar`, null);
  }

  desactivarPlantillaCorreo(id: number): Observable<PlantillaCorreo> {
    return this.http.patch<PlantillaCorreo>(`${this.apiUrl}/plantillas-correo/${id}/desactivar`, null);
  }

  deletePlantillaCorreo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/plantillas-correo/${id}`);
  }

  getAuditoriaByDocumento(documentoId: number): Observable<AuditRegistro[]> {
    return this.http.get<AuditRegistro[]>(`${this.apiUrl}/auditoria/documento/${documentoId}`);
  }

  getAuditoriaByUsuario(cedula: number): Observable<AuditRegistro[]> {
    return this.http.get<AuditRegistro[]>(`${this.apiUrl}/auditoria/usuario/${cedula}`);
  }

  buscarAuditoria(filters: { accion?: string; desde?: string; hasta?: string }): Observable<AuditRegistro[]> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params = params.set(key, value);
      }
    });

    return this.http.get<AuditRegistro[]>(`${this.apiUrl}/auditoria/buscar`, { params });
  }
}
