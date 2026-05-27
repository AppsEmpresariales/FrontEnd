import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TableColumn, TipoDocumento } from '../../core/models/docucloud.models';
import { DocucloudApiService } from '../../core/services/docucloud-api';
import { AuthService } from '../../core/services/auth.service';
import { matchesSearch } from '../../core/utils/search';

import { ButtonComponent } from '../../shared/ui/atoms/button/button';
import { SearchBarComponent } from '../../shared/ui/molecules/search-bar/search-bar';
import { SectionHeaderComponent } from '../../shared/ui/molecules/section-header/section-header';
import { DataTableComponent } from '../../shared/ui/organisms/data-table/data-table';

@Component({
  selector: 'app-tipos-documentales-page',
  imports: [ButtonComponent, DataTableComponent, SearchBarComponent, SectionHeaderComponent, ReactiveFormsModule],
  templateUrl: './tipos-documentales-page.html',
  styleUrl: './tipos-documentales-page.css'
})
export class TiposDocumentalesPageComponent {
  private readonly api = inject(DocucloudApiService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);

  protected readonly nit = this.auth.currentOrganizationNit();
  protected readonly tipos = signal<TipoDocumento[]>([]);
  protected readonly term = signal('');
  protected readonly isPanelOpen = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly isEditing = signal(false);
  protected readonly selectedTipo = signal<TipoDocumento | null>(null);
  protected readonly errorMessage = signal('');

  protected typeForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: ['']
  });

  protected readonly columns: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'active', label: 'Estado' }
  ];

  protected readonly rows = computed<Record<string, unknown>[]>(() => {
    return this.tipos()
      .filter((tipo) => matchesSearch(this.term(), tipo.nombre, tipo.descripcion, tipo.active ? 'Activo' : 'Inactivo'))
      .map((tipo) => ({ ...tipo, active: tipo.active ? 'Activo' : 'Inactivo' }));
  });

  constructor() {
    this.loadTipos();
    this.route.queryParamMap.subscribe(params => this.term.set(params.get('buscar') ?? ''));
  }

  protected loadTipos(): void {
    this.api.getTiposDocumentales(this.nit).subscribe({
      next: (items) => this.tipos.set(items),
      error: (err) => console.error('Error cargando tipos documentales:', err)
    });
  }

  search(term: string): void {
    this.term.set(term);
  }

  togglePanel() {
    this.isPanelOpen.update(value => !value);
    if (!this.isPanelOpen()) {
      this.typeForm.reset();
      this.isEditing.set(false);
      this.selectedTipo.set(null);
      this.errorMessage.set('');
    }
  }

  editTipo(row: Record<string, unknown>) {
    const tipo = row as unknown as TipoDocumento;
    this.selectedTipo.set(tipo);
    this.isEditing.set(true);
    this.typeForm.patchValue({
      nombre: tipo.nombre,
      descripcion: tipo.descripcion
    });
    this.isPanelOpen.set(true);
  }

  saveTipo() {
    if (this.typeForm.invalid) {
      this.typeForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');
    const { nombre, descripcion } = this.typeForm.value;

    const request$ = this.isEditing() && this.selectedTipo()
      ? this.api.updateTipoDocumento(this.selectedTipo()!.id, { nombre: nombre!, descripcion: descripcion || '' })
      : this.api.createTipoDocumento({ nombre: nombre!, descripcion: descripcion || '', organizacionNit: this.nit });

    request$.subscribe({
      next: (savedTipo) => {
        this.tipos.update(items => {
          const exists = items.some(item => item.id === savedTipo.id);
          return exists ? items.map(item => item.id === savedTipo.id ? savedTipo : item) : [...items, savedTipo];
        });
        this.isSaving.set(false);
        this.errorMessage.set('');
        this.togglePanel();
      },
      error: (err) => {
        console.error('Error al guardar tipo documental:', err);
        this.isSaving.set(false);
        this.errorMessage.set(err.error?.message || 'Error al guardar el tipo documental. Por favor intenta de nuevo.');
      }
    });
  }

  toggleEstado(row: Record<string, unknown>) {
    const tipo = row as unknown as TipoDocumento;
    const status = String(row['active']).toLowerCase();
    const isActive = status === 'activo' || status === 'true';
    const request$ = isActive ? this.api.desactivarTipoDocumento(tipo.id) : this.api.activarTipoDocumento(tipo.id);

    request$.subscribe({
      next: (updated) => this.tipos.update(items => items.map(item => item.id === updated.id ? updated : item)),
      error: (err) => console.error('Error cambiando estado del tipo documental:', err)
    });
  }
}
