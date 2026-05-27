import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Organizacion, TableColumn } from '../../core/models/docucloud.models';
import { DocucloudApiService } from '../../core/services/docucloud-api';
import { matchesSearch } from '../../core/utils/search';

import { ButtonComponent } from '../../shared/ui/atoms/button/button';
import { SearchBarComponent } from '../../shared/ui/molecules/search-bar/search-bar';
import { SectionHeaderComponent } from '../../shared/ui/molecules/section-header/section-header';
import { DataTableComponent } from '../../shared/ui/organisms/data-table/data-table';

@Component({
  selector: 'app-organizaciones-page',
  imports: [ButtonComponent, DataTableComponent, SearchBarComponent, SectionHeaderComponent, ReactiveFormsModule],
  templateUrl: './organizaciones-page.html',
  styleUrl: './organizaciones-page.css'
})
export class OrganizacionesPageComponent {
  private readonly api = inject(DocucloudApiService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);

  protected readonly organizaciones = signal<Organizacion[]>([]);
  protected readonly term = signal('');
  protected readonly isPanelOpen = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly isEditing = signal(false);
  protected readonly selectedNit = signal<number | null>(null);

  protected orgForm = this.fb.group({
    nit: [null as number | null, [Validators.required, Validators.min(1)]],
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    telefono: [''],
    dirCalle: [''],
    dirNumero: [''],
    dirComuna: [''],
    active: [true]
  });

  protected readonly columns: TableColumn[] = [
    { key: 'nit', label: 'NIT' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'email', label: 'Correo' },
    { key: 'telefono', label: 'Telefono' },
    { key: 'active', label: 'Estado' }
  ];

  protected readonly rows = computed<Record<string, unknown>[]>(() => {
    return this.organizaciones()
      .filter((org) => matchesSearch(
        this.term(),
        org.nombre,
        org.email,
        org.nit,
        org.telefono,
        org.dirCalle,
        org.dirNumero,
        org.dirComuna,
        org.active ? 'Activo' : 'Inactivo'
      ))
      .map((org) => ({ ...org, active: org.active ? 'Activo' : 'Inactivo' }));
  });

  constructor() {
    this.loadOrganizaciones();
    this.route.queryParamMap.subscribe(params => this.term.set(params.get('buscar') ?? ''));
  }

  protected loadOrganizaciones(): void {
    this.api.getOrganizaciones().subscribe({
      next: (items) => this.organizaciones.set(items),
      error: (err) => console.error('Error cargando organizaciones:', err)
    });
  }

  search(term: string): void {
    this.term.set(term);
  }

  togglePanel() {
    this.isPanelOpen.update(value => !value);
    if (!this.isPanelOpen()) {
      this.orgForm.reset({ active: true });
      this.orgForm.get('nit')?.enable();
      this.isEditing.set(false);
      this.selectedNit.set(null);
    }
  }

  editOrganizacion(row: Record<string, unknown>) {
    const org = row as unknown as Organizacion;
    this.selectedNit.set(org.nit);
    this.isEditing.set(true);
    this.orgForm.patchValue({
      nit: org.nit,
      nombre: org.nombre,
      email: org.email,
      telefono: org.telefono,
      dirCalle: org.dirCalle,
      dirNumero: org.dirNumero,
      dirComuna: org.dirComuna,
      active: org.active === true || (org as unknown as { active: string }).active === 'Activo'
    });
    this.orgForm.get('nit')?.disable();
    this.isPanelOpen.set(true);
  }

  saveOrganizacion() {
    if (this.orgForm.invalid) {
      this.orgForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const value = this.orgForm.getRawValue();
    const payload = {
      nit: Number(value.nit),
      nombre: value.nombre!,
      email: value.email!,
      telefono: value.telefono || '',
      dirCalle: value.dirCalle || '',
      dirNumero: value.dirNumero || '',
      dirComuna: value.dirComuna || '',
      active: value.active ?? true
    };

    const request$ = this.isEditing() && this.selectedNit()
      ? this.api.updateOrganizacion(this.selectedNit()!, payload)
      : this.api.createOrganizacion(payload);

    request$.subscribe({
      next: (savedOrg) => {
        this.organizaciones.update(items => {
          const exists = items.some(item => item.nit === savedOrg.nit);
          return exists ? items.map(item => item.nit === savedOrg.nit ? savedOrg : item) : [...items, savedOrg];
        });
        this.isSaving.set(false);
        this.togglePanel();
      },
      error: (err) => {
        console.error('Error guardando organizacion:', err);
        this.isSaving.set(false);
      }
    });
  }
}
