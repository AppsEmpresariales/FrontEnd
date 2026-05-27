import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SectionHeaderComponent } from '../../shared/ui/molecules/section-header/section-header';
import { StatCardComponent } from '../../shared/ui/molecules/stat-card/stat-card';
import { BadgeComponent } from '../../shared/ui/atoms/badge/badge';
import { IconComponent } from '../../shared/ui/atoms/icon/icon';
import { DocucloudApiService } from '../../core/services/docucloud-api';
import { AuthService } from '../../core/services/auth.service';

import { Documento, FlujoTrabajoTarea, Notificacion, Organizacion, Usuario } from '../../core/models/docucloud.models';

@Component({
  selector: 'app-dashboard-page',
  imports: [SectionHeaderComponent, StatCardComponent, BadgeComponent, IconComponent],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css'
})
export class DashboardPageComponent {
  private readonly api = inject(DocucloudApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly nit = this.auth.currentOrganizationNit();

  protected readonly organizaciones = signal<Organizacion[]>([]);
  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly documentos = signal<Documento[]>([]);
  protected readonly tareas = signal<FlujoTrabajoTarea[]>([]);
  protected readonly notificaciones = signal<Notificacion[]>([]);

  protected readonly pendientes = computed(() => this.tareas().filter((task) => task.estado === 'PENDIENTE').length);
  protected readonly aprobados = computed(() =>
    this.documentos().filter((document) => document.estadoDocumentoNombre.toLowerCase().includes('aprobado')).length
  );

  constructor() {
    this.api.getOrganizacionesActivas().subscribe({
      next: (items) => this.organizaciones.set(items),
      error: (err) => console.error('Error:', err)
    });
    this.api.getUsuariosActivosByOrganizacion(this.nit).subscribe({
      next: (items) => this.usuarios.set(items),
      error: (err) => console.error('Error:', err)
    });
    this.api.getDocumentosByOrganizacion(this.nit).subscribe({
      next: (items) => this.documentos.set(items),
      error: (err) => console.error('Error:', err)
    });
    
    const user = this.auth.currentUser();
    if (user) {
      this.api.getTareasPendientesByUsuario(Number(user.id)).subscribe({
        next: (items) => this.tareas.set(items),
        error: (err) => console.error('Error:', err)
      });
      this.api.getNoLeidasByUsuario(Number(user.id)).subscribe({
        next: (items) => this.notificaciones.set(items),
        error: (err) => console.error('Error:', err)
      });
    }
  }

  marcarLeida(notificacion: Notificacion) {
    this.api.marcarNotificacionLeida(notificacion.id).subscribe({
      next: () => {
        this.notificaciones.update(items => items.filter(n => n.id !== notificacion.id));
      },
      error: (err) => console.error('Error al marcar leida:', err)
    });
  }

  protected createDocument(): void {
    this.router.navigate(['/documentos'], { queryParams: { nuevo: '1' } });
  }
}
