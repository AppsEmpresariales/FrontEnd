import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EstadoDocumento, FlujoTrabajo, FlujoTrabajoPaso, Rol, TipoDocumento } from '../../core/models/docucloud.models';
import { DocucloudApiService } from '../../core/services/docucloud-api';
import { AuthService } from '../../core/services/auth.service';

import { BadgeComponent } from '../../shared/ui/atoms/badge/badge';
import { ButtonComponent } from '../../shared/ui/atoms/button/button';
import { IconComponent } from '../../shared/ui/atoms/icon/icon';
import { SectionHeaderComponent } from '../../shared/ui/molecules/section-header/section-header';

@Component({
  selector: 'app-flujos-page',
  imports: [BadgeComponent, ButtonComponent, IconComponent, SectionHeaderComponent, ReactiveFormsModule],
  templateUrl: './flujos-page.html',
  styleUrl: './flujos-page.css'
})
export class FlujosPageComponent {
  private readonly api = inject(DocucloudApiService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly nit = this.auth.currentOrganizationNit();

  protected readonly flujos = signal<FlujoTrabajo[]>([]);
  protected readonly pasos = signal<FlujoTrabajoPaso[]>([]);
  protected readonly tiposDocumento = signal<TipoDocumento[]>([]);
  protected readonly roles = signal<Rol[]>([]);
  protected readonly estadosDocumento = signal<EstadoDocumento[]>([]);
  protected readonly selectedFlujoId = signal<number | null>(null);
  protected readonly editingFlujoId = signal<number | null>(null);

  protected readonly isFlujoModalOpen = signal(false);
  protected readonly isPasoModalOpen = signal(false);
  protected readonly isSaving = signal(false);

  protected flujoForm = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    tipoDocumentoId: [null as number | null, Validators.required]
  });

  protected pasoForm = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    ordenPaso: [1, Validators.required],
    rolRequeridoId: [null as number | null, Validators.required],
    objetivoEstadoId: [null as number | null, Validators.required]
  });

  constructor() {
    this.loadCatalogos();
    this.loadFlujos();
  }

  protected loadFlujos(): void {
    this.api.getFlujosTrabajo(this.nit).subscribe({
      next: (items) => {
        this.flujos.set(items);
        if (items.length > 0 && !this.selectedFlujoId()) {
          this.selectFlujo(items[0].id);
        }
      },
      error: (err) => console.error('Error cargando flujos:', err)
    });
  }

  private loadCatalogos(): void {
    this.api.getTiposDocumentalesActivos(this.nit).subscribe({
      next: (items) => {
        if (items.length > 0) {
          this.tiposDocumento.set(items);
          return;
        }

        this.api.getTiposDocumentales(this.nit).subscribe({
          next: (allItems) => this.tiposDocumento.set(allItems),
          error: (err) => console.error('Error cargando todos los tipos:', err)
        });
      },
      error: (err) => console.error('Error cargando tipos:', err)
    });
    this.api.getRoles().subscribe({
      next: (items) => this.roles.set(items),
      error: (err) => console.error('Error cargando roles:', err)
    });
    this.api.getEstadosDocumento(this.nit).subscribe({
      next: (items) => this.estadosDocumento.set(items),
      error: (err) => console.error('Error cargando estados:', err)
    });
  }

  selectFlujo(flujoId: number) {
    this.selectedFlujoId.set(flujoId);
    this.api.getPasosByFlujo(flujoId).subscribe({
      next: (items) => this.pasos.set(items),
      error: (err) => console.error('Error cargando pasos:', err)
    });
  }

  toggleFlujoModal() {
    this.isFlujoModalOpen.update(value => !value);
    if (!this.isFlujoModalOpen()) {
      this.flujoForm.reset();
      this.editingFlujoId.set(null);
    }
  }

  togglePasoModal() {
    this.isPasoModalOpen.update(value => !value);
    if (!this.isPasoModalOpen()) this.pasoForm.reset({ ordenPaso: this.pasos().length + 1 });
  }

  saveFlujo() {
    if (this.flujoForm.invalid) {
      this.flujoForm.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    const payload = {
      nombre: this.flujoForm.value.nombre!,
      descripcion: this.flujoForm.value.descripcion || '',
      tipoDocumentoId: Number(this.flujoForm.value.tipoDocumentoId),
      organizacionNit: this.nit
    };

    if (this.editingFlujoId()) {
      this.api.updateFlujoTrabajo(this.editingFlujoId()!, payload).subscribe({
        next: (flujo) => {
          this.flujos.update(items => items.map(f => f.id === flujo.id ? flujo : f));
          this.isSaving.set(false);
          this.toggleFlujoModal();
        },
        error: (err) => {
          console.error('Error actualizando flujo:', err);
          this.isSaving.set(false);
        }
      });
    } else {
      this.api.createFlujoTrabajo(payload).subscribe({
        next: (flujo) => {
          this.flujos.update(items => [...items, flujo]);
          this.isSaving.set(false);
          this.toggleFlujoModal();
          this.selectFlujo(flujo.id);
        },
        error: (err) => {
          console.error('Error creando flujo:', err);
          this.isSaving.set(false);
        }
      });
    }
  }

  editFlujo(flujo: FlujoTrabajo) {
    this.editingFlujoId.set(flujo.id);
    this.flujoForm.patchValue({
      nombre: flujo.nombre,
      descripcion: flujo.descripcion,
      tipoDocumentoId: flujo.tipoDocumentoId
    });
    this.isFlujoModalOpen.set(true);
  }

  deleteFlujo(id: number) {
    if (confirm('Esta seguro de eliminar este flujo de trabajo?')) {
      this.api.deleteFlujoTrabajo(id).subscribe({
        next: () => {
          this.flujos.update(items => items.filter(f => f.id !== id));
          if (this.selectedFlujoId() === id) {
            this.selectedFlujoId.set(null);
            this.pasos.set([]);
          }
        },
        error: (err) => console.error('Error eliminando flujo:', err)
      });
    }
  }

  savePaso() {
    if (this.pasoForm.invalid || !this.selectedFlujoId()) {
      this.pasoForm.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    const payload = {
      nombre: this.pasoForm.value.nombre!,
      descripcion: this.pasoForm.value.descripcion || '',
      ordenPaso: Number(this.pasoForm.value.ordenPaso),
      rolRequeridoId: Number(this.pasoForm.value.rolRequeridoId),
      objetivoEstadoId: Number(this.pasoForm.value.objetivoEstadoId),
      flujoTrabajoId: this.selectedFlujoId()!
    };
    this.api.createPasoFlujo(payload).subscribe({
      next: (paso) => {
        this.pasos.update(items => [...items, paso].sort((a, b) => a.ordenPaso - b.ordenPaso));
        this.isSaving.set(false);
        this.togglePasoModal();
      },
      error: (err) => {
        console.error('Error creando paso:', err);
        this.isSaving.set(false);
      }
    });
  }
}
