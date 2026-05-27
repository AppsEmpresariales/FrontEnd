import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TableColumn, Usuario, UsuarioCreate } from '../../core/models/docucloud.models';
import { DocucloudApiService } from '../../core/services/docucloud-api';
import { AuthService } from '../../core/services/auth.service';
import { matchesSearch } from '../../core/utils/search';

import { ButtonComponent } from '../../shared/ui/atoms/button/button';
import { SearchBarComponent } from '../../shared/ui/molecules/search-bar/search-bar';
import { SectionHeaderComponent } from '../../shared/ui/molecules/section-header/section-header';
import { DataTableComponent } from '../../shared/ui/organisms/data-table/data-table';

@Component({
  selector: 'app-usuarios-page',
  imports: [ButtonComponent, DataTableComponent, SearchBarComponent, SectionHeaderComponent, ReactiveFormsModule],
  templateUrl: './usuarios-page.html',
  styleUrl: './usuarios-page.css'
})
export class UsuariosPageComponent {
  private readonly api = inject(DocucloudApiService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  protected readonly nit = this.auth.currentOrganizationNit();
  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly roles = signal<any[]>([]);
  protected readonly term = signal('');
  protected readonly isPanelOpen = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly isEditing = signal(false);
  protected readonly editingCedula = signal<number | null>(null);

  private readonly fb = inject(FormBuilder);
  
  protected userForm = this.fb.group({
    cedula: [null as number | null, [Validators.required, Validators.min(1000)]],
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    rolId: [null as number | null, Validators.required]
  });

  protected readonly columns: TableColumn[] = [
    { key: 'cedula', label: 'Cédula' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'email', label: 'Correo' },
    { key: 'rolNombre', label: 'Rol' },
    { key: 'active', label: 'Estado' },
    { key: 'organizacionNombre', label: 'Organización' }
  ];

  protected readonly rows = computed<Record<string, unknown>[]>(() => {
    return this.usuarios()
      .filter((usuario) => matchesSearch(
        this.term(),
        usuario.nombre,
        usuario.email,
        usuario.cedula,
        usuario.active ? 'Activo' : 'Inactivo',
        usuario.organizacionNombre,
        usuario.rolNombre
      ))
      .map((usuario) => ({
        ...usuario,
        active: usuario.active ? 'Activo' : 'Inactivo'
      }));
  });

  constructor() {
    this.api.getUsuariosByOrganizacion(this.nit).subscribe({
      next: (items) => this.usuarios.set(items),
      error: (err) => console.error('Error cargando usuarios:', err)
    });
    this.api.getRoles().subscribe({
      next: (items) => this.roles.set(items),
      error: (err) => console.error('Error cargando roles:', err)
    });
    this.route.queryParamMap.subscribe(params => this.term.set(params.get('buscar') ?? ''));
  }

  search(term: string): void {
    this.term.set(term);
  }

  togglePanel() {
    this.isPanelOpen.update(val => !val);
    if (!this.isPanelOpen()) {
      this.userForm.reset();
      this.isEditing.set(false);
      this.editingCedula.set(null);
      this.userForm.get('cedula')?.enable();
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  editUser(row: any) {
    const usuario = row as Usuario;
    this.isEditing.set(true);
    this.editingCedula.set(usuario.cedula);
    
    const userRole = this.roles().find(r => usuario.rolNombre && usuario.rolNombre.includes(r.nombre));
    const rolId = userRole ? userRole.id : null;
    
    this.userForm.patchValue({
      cedula: usuario.cedula,
      nombre: usuario.nombre,
      email: usuario.email,
      password: '', // No mostrar contrasena, se deja vacio
      rolId: rolId
    });
    
    this.userForm.get('cedula')?.disable(); // No se edita la cedula
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.setValidators([Validators.minLength(8)]);
    this.userForm.get('password')?.updateValueAndValidity();
    
    this.isPanelOpen.set(true);
  }

  toggleStatus(row: any) {
    const usuario = row as Usuario;
    const isActivo = usuario.active === true || row.active === 'Activo';
    
    const obs$ = isActivo 
      ? this.api.inactivarUsuario(usuario.cedula) 
      : this.api.activarUsuario(usuario.cedula);
      
    obs$.subscribe({
      next: (updatedUser) => {
        this.usuarios.update(users => users.map(u => u.cedula === updatedUser.cedula ? updatedUser : u));
      },
      error: (err) => console.error('Error cambiando estado', err)
    });
  }

  saveUser() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const formValues = this.userForm.getRawValue(); // Incluye valores disabled
    const { cedula, nombre, email, password, rolId } = formValues;
    
    const refreshList = () => {
      this.api.getUsuariosByOrganizacion(this.nit).subscribe({
        next: (items) => {
          this.usuarios.set(items);
          this.isSaving.set(false);
          this.togglePanel();
        },
        error: (err) => {
          console.error('Error recargando usuarios:', err);
          this.isSaving.set(false);
        }
      });
    };

    if (this.isEditing() && this.editingCedula()) {
      const payload: Partial<UsuarioCreate> = { nombre: nombre!, email: email! };
      if (password) payload.password = password; // Solo enviar si se escribio algo
      
      this.api.updateUsuario(this.editingCedula()!, payload).subscribe({
        next: (updatedUser) => {
          if (rolId) {
            this.api.asignarRolUsuario({ usuarioCedula: updatedUser.cedula, rolId: Number(rolId) }).subscribe({
              next: () => refreshList(),
              error: () => refreshList()
            });
          } else {
            this.usuarios.update(users => users.map(u => u.cedula === updatedUser.cedula ? updatedUser : u));
            this.isSaving.set(false);
            this.togglePanel();
          }
        },
        error: (err) => {
          console.error('Error al actualizar usuario:', err);
          this.isSaving.set(false);
        }
      });
    } else {
      this.api.createUsuario({
        cedula: Number(cedula),
        nombre: nombre!,
        email: email!,
        password: password!,
        organizacionNit: this.nit
      }).subscribe({
        next: (newUser) => {
          if (rolId) {
            this.api.asignarRolUsuario({ usuarioCedula: newUser.cedula, rolId: Number(rolId) }).subscribe({
              next: () => refreshList(),
              error: () => refreshList()
            });
          } else {
            this.usuarios.update(users => [...users, newUser]);
            this.isSaving.set(false);
            this.togglePanel();
          }
        },
        error: (err) => {
          console.error('Error al crear usuario:', err);
          this.isSaving.set(false);
        }
      });
    }
  }
}
