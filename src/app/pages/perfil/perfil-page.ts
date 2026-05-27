import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { DocucloudApiService } from '../../core/services/docucloud-api';
import { Organizacion, RolUsuario, Usuario, UsuarioCreate } from '../../core/models/docucloud.models';
import { AppRole } from '../../models/user.dto';
import { BadgeComponent } from '../../shared/ui/atoms/badge/badge';
import { ButtonComponent } from '../../shared/ui/atoms/button/button';
import { IconComponent } from '../../shared/ui/atoms/icon/icon';
import { SectionHeaderComponent } from '../../shared/ui/molecules/section-header/section-header';

@Component({
  selector: 'app-perfil-page',
  imports: [BadgeComponent, ButtonComponent, IconComponent, SectionHeaderComponent, ReactiveFormsModule],
  templateUrl: './perfil-page.html',
  styleUrl: './perfil-page.css'
})
export class PerfilPageComponent {
  private readonly auth = inject(AuthService);
  private readonly api = inject(DocucloudApiService);
  private readonly fb = inject(FormBuilder);

  protected readonly currentUser = this.auth.currentUser;
  protected readonly userRecord = signal<Usuario | null>(null);
  protected readonly organizacion = signal<Organizacion | null>(null);
  protected readonly roles = signal<RolUsuario[]>([]);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly isSavingProfile = signal(false);
  protected readonly isSavingOrg = signal(false);

  protected readonly canEditProfile = computed(() =>
    this.auth.hasAnyRole(['admin', 'admin_org', 'user', 'editor', 'revisor', 'aprobador'])
  );

  protected readonly canEditOrganization = computed(() =>
    this.auth.hasAnyRole(['admin', 'admin_org'])
  );

  protected readonly roleLabel = computed(() => this.formatRole(this.currentUser()?.role));
  protected readonly roleDescription = computed(() => this.describeRole(this.currentUser()?.role));

  protected profileForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(8)]]
  });

  protected orgForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    telefono: [''],
    dirCalle: [''],
    dirNumero: [''],
    dirComuna: ['']
  });

  constructor() {
    this.loadProfile();
  }

  protected loadProfile(): void {
    const user = this.currentUser();
    if (!user) {
      return;
    }

    this.profileForm.patchValue({
      nombre: user.name,
      email: user.email,
      password: ''
    });

    const cedula = Number(user.id);
    if (!Number.isNaN(cedula)) {
      this.api.getUsuarioByCedula(cedula).subscribe({
        next: (usuario) => {
          this.userRecord.set(usuario);
          this.profileForm.patchValue({
            nombre: usuario.nombre,
            email: usuario.email,
            password: ''
          });
        },
        error: () => this.userRecord.set(null)
      });

      this.api.getRolesByUsuario(cedula).subscribe({
        next: (roles) => this.roles.set(roles),
        error: () => this.roles.set([])
      });
    }

    if (user.organizacionNit) {
      this.api.getOrganizacionByNit(user.organizacionNit).subscribe({
        next: (org) => {
          this.organizacion.set(org);
          this.orgForm.patchValue({
            nombre: org.nombre,
            email: org.email,
            telefono: org.telefono,
            dirCalle: org.dirCalle,
            dirNumero: org.dirNumero,
            dirComuna: org.dirComuna
          });
        },
        error: () => this.organizacion.set(null)
      });
    }
  }

  protected saveProfile(): void {
    if (!this.canEditProfile() || this.profileForm.invalid || !this.currentUser()) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const cedula = Number(this.currentUser()!.id);
    if (Number.isNaN(cedula)) {
      this.errorMessage.set('No se pudo identificar la cedula del usuario actual.');
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');
    this.isSavingProfile.set(true);

    const value = this.profileForm.value;
    const payload: Partial<UsuarioCreate> = {
      nombre: value.nombre!,
      email: value.email!
    };

    if (value.password) {
      payload.password = value.password;
    }

    this.api.updateUsuario(cedula, payload).subscribe({
      next: (usuario) => {
        this.userRecord.set(usuario);
        this.auth.updateCurrentUser({ name: usuario.nombre, email: usuario.email });
        this.profileForm.patchValue({ password: '' });
        this.successMessage.set('Perfil actualizado correctamente.');
        this.isSavingProfile.set(false);
      },
      error: (err) => {
        console.error('Error actualizando perfil:', err);
        this.errorMessage.set('No se pudo actualizar el perfil.');
        this.isSavingProfile.set(false);
      }
    });
  }

  protected saveOrganization(): void {
    const org = this.organizacion();
    if (!this.canEditOrganization() || this.orgForm.invalid || !org) {
      this.orgForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');
    this.isSavingOrg.set(true);

    const value = this.orgForm.value;
    this.api.updateOrganizacion(org.nit, {
      nombre: value.nombre!,
      email: value.email!,
      telefono: value.telefono || '',
      dirCalle: value.dirCalle || '',
      dirNumero: value.dirNumero || '',
      dirComuna: value.dirComuna || ''
    }).subscribe({
      next: (updated) => {
        this.organizacion.set(updated);
        this.auth.updateCurrentUser({ organizacionNombre: updated.nombre });
        this.successMessage.set('Organizacion actualizada correctamente.');
        this.isSavingOrg.set(false);
      },
      error: (err) => {
        console.error('Error actualizando organizacion:', err);
        this.errorMessage.set('No se pudo actualizar la organizacion.');
        this.isSavingOrg.set(false);
      }
    });
  }

  protected formatDate(value?: string): string {
    if (!value) {
      return 'Sin registro';
    }

    return new Date(value).toLocaleString('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  }

  private formatRole(role?: AppRole): string {
    const labels: Record<AppRole, string> = {
      admin: 'Administrador',
      admin_org: 'Administrador de organizacion',
      user: 'Usuario estandar',
      editor: 'Editor documental',
      revisor: 'Revisor',
      aprobador: 'Aprobador',
      sistema: 'Sistema'
    };

    return labels[role ?? 'user'];
  }

  private describeRole(role?: AppRole): string {
    const descriptions: Record<AppRole, string> = {
      admin: 'Gestiona usuarios, organizaciones, configuracion, tipos documentales y flujos.',
      admin_org: 'Gestiona usuarios, configuracion, tipos documentales y flujos de su organizacion.',
      user: 'Gestiona documentos y participa en tareas de flujo asignadas.',
      editor: 'Crea y actualiza documentos dentro de la organizacion.',
      revisor: 'Revisa documentos y atiende tareas pendientes del workflow.',
      aprobador: 'Aprueba o rechaza documentos dentro del flujo configurado.',
      sistema: 'Ejecuta procesos automaticos; no esta pensado para uso interactivo.'
    };

    return descriptions[role ?? 'user'];
  }
}
