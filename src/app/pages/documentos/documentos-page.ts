import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { AuditRegistro, Documento, EstadoDocumento, TableColumn, TipoDocumento } from '../../core/models/docucloud.models';
import { DocucloudApiService } from '../../core/services/docucloud-api';
import { AuthService } from '../../core/services/auth.service';
import { matchesSearch } from '../../core/utils/search';

import { ButtonComponent } from '../../shared/ui/atoms/button/button';
import { SearchBarComponent } from '../../shared/ui/molecules/search-bar/search-bar';
import { SectionHeaderComponent } from '../../shared/ui/molecules/section-header/section-header';
import { DataTableComponent } from '../../shared/ui/organisms/data-table/data-table';

@Component({
  selector: 'app-documentos-page',
  imports: [ButtonComponent, DataTableComponent, SearchBarComponent, SectionHeaderComponent, ReactiveFormsModule],
  templateUrl: './documentos-page.html',
  styleUrl: './documentos-page.css'
})
export class DocumentosPageComponent {
  private readonly api = inject(DocucloudApiService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);

  protected readonly nit = this.auth.currentOrganizationNit();
  protected readonly documentos = signal<Documento[]>([]);
  protected readonly tiposDocumento = signal<TipoDocumento[]>([]);
  protected readonly estadosDocumento = signal<EstadoDocumento[]>([]);
  protected readonly historial = signal<AuditRegistro[]>([]);
  protected readonly term = signal('');
  protected readonly isPanelOpen = signal(false);
  protected readonly isDetailOpen = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly isEditing = signal(false);
  protected readonly selectedDocumento = signal<Documento | null>(null);
  protected readonly selectedEstadoId = signal<number | null>(null);
  protected readonly errorMessage = signal('');
  protected readonly catalogMessage = signal('');

  protected readonly hasInitialState = computed(() =>
    this.estadosDocumento().some(estado => estado.esInicial)
  );

  protected docForm = this.fb.group({
    titulo: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: [''],
    tipoDocumentoId: [null as number | null, Validators.required],
    file: [null as File | null]
  });

  protected readonly columns: TableColumn[] = [
    { key: 'titulo', label: 'Título' },
    { key: 'tipoDocumentoNombre', label: 'Tipo' },
    { key: 'estadoDocumentoNombre', label: 'Estado' },
    { key: 'creadoPorNombre', label: 'Creador' },
    { key: 'version', label: 'Versión' }
  ];

  protected readonly rows = computed<Record<string, unknown>[]>(() => {
    return this.documentos()
      .filter((documento) => matchesSearch(
        this.term(),
        documento.titulo,
        documento.descripcion,
        documento.tipoDocumentoNombre,
        documento.estadoDocumentoNombre,
        documento.creadoPorNombre,
        documento.version
      ))
      .map((documento) => ({ ...documento }));
  });

  constructor() {
    this.loadDocumentos();
    this.loadCatalogos();
    this.route.queryParamMap.subscribe(params => {
      this.term.set(params.get('buscar') ?? '');
      if (params.get('nuevo') === '1') {
        this.openCreatePanel();
      }
    });
  }

  protected loadDocumentos(): void {
    this.api.getDocumentosByOrganizacion(this.nit).subscribe({
      next: (items) => this.documentos.set(items),
      error: (err) => console.error('Error cargando documentos:', err)
    });
  }

  private loadCatalogos(): void {
    this.api.getTiposDocumentalesActivos(this.nit).subscribe({
      next: (items) => {
        if (items.length > 0) {
          this.tiposDocumento.set(items);
          this.catalogMessage.set('');
          return;
        }

        this.api.getTiposDocumentales(this.nit).subscribe({
          next: (allItems) => {
            this.tiposDocumento.set(allItems);
            this.catalogMessage.set(allItems.length ? 'No hay tipos activos; se muestran tipos existentes para que puedas seleccionarlos.' : '');
          },
          error: (err) => console.error('Error cargando todos los tipos:', err)
        });
      },
      error: (err) => console.error('Error cargando tipos:', err)
    });
    this.api.getEstadosDocumento(this.nit).subscribe({
      next: (items) => this.estadosDocumento.set(items),
      error: (err) => console.error('Error cargando estados:', err)
    });
  }

  search(term: string): void {
    this.term.set(term);
  }

  togglePanel() {
    this.isPanelOpen.update(value => !value);
    if (!this.isPanelOpen()) {
      this.resetDocumentForm();
      this.isEditing.set(false);
      this.selectedDocumento.set(null);
      this.errorMessage.set('');
      this.catalogMessage.set('');
    }
  }

  protected openCreatePanel(): void {
    this.resetDocumentForm();
    this.isEditing.set(false);
    this.selectedDocumento.set(null);
    this.errorMessage.set('');
    this.isPanelOpen.set(true);
  }

  private resetDocumentForm(): void {
    this.docForm.reset({
      titulo: '',
      descripcion: '',
      tipoDocumentoId: null,
      file: null
    });
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.docForm.patchValue({ file });
    }
  }

  saveDocument() {
    if (this.docForm.invalid) {
      this.docForm.markAllAsTouched();
      return;
    }

    const currentUser = this.auth.currentUser();
    if (!currentUser) return;

    this.isSaving.set(true);
    this.errorMessage.set('');
    const { titulo, descripcion, tipoDocumentoId, file } = this.docForm.value;
    const estadoInicial = this.estadosDocumento().find(estado => estado.esInicial);
    const payload = {
      titulo: titulo!,
      descripcion: descripcion || '',
      tipoDocumentoId: Number(tipoDocumentoId),
      creadoPorCedula: Number(currentUser.id),
      organizacionNit: this.nit,
      estadoDocumentoId: estadoInicial?.id
    };

    const request$ = this.isEditing() && this.selectedDocumento()
      ? this.api.updateDocumento(this.selectedDocumento()!.id, {
          titulo: payload.titulo,
          descripcion: payload.descripcion,
          tipoDocumentoId: payload.tipoDocumentoId
        })
      : this.api.createDocumento(payload);

    request$.pipe(
      switchMap((savedDoc) => file ? this.api.uploadDocumentoArchivo(savedDoc.id, file) : of(savedDoc))
    ).subscribe({
      next: (savedDoc) => {
        this.documentos.update(docs => {
          const exists = docs.some(doc => doc.id === savedDoc.id);
          return exists ? docs.map(doc => doc.id === savedDoc.id ? savedDoc : doc) : [savedDoc, ...docs];
        });
        this.isSaving.set(false);
        this.togglePanel();
      },
      error: (err) => {
        console.error('Error al guardar documento:', err);
        this.errorMessage.set('No se pudo guardar el documento. Revisa tipo documental, estado inicial y usuario creador.');
        this.isSaving.set(false);
      }
    });
  }

  editDocument(row: Record<string, unknown>) {
    const documento = row as unknown as Documento;
    this.selectedDocumento.set(documento);
    this.isEditing.set(true);
    this.docForm.patchValue({
      titulo: documento.titulo,
      descripcion: documento.descripcion,
      tipoDocumentoId: documento.tipoDocumentoId
    });
    this.isPanelOpen.set(true);
  }

  viewDocument(row: Record<string, unknown>) {
    const documento = row as unknown as Documento;
    this.selectedDocumento.set(documento);
    this.selectedEstadoId.set(documento.estadoDocumentoId);
    this.errorMessage.set('');
    this.isDetailOpen.set(true);
    this.api.getAuditoriaByDocumento(documento.id).subscribe({
      next: (items) => this.historial.set(items),
      error: () => this.historial.set([])
    });
  }

  changeEstado() {
    const documento = this.selectedDocumento();
    const estadoId = this.selectedEstadoId();
    if (!documento || !estadoId) return;

    this.api.cambiarEstadoDocumento(documento.id, estadoId).subscribe({
      next: (updated) => {
        this.documentos.update(docs => docs.map(doc => doc.id === updated.id ? updated : doc));
        this.selectedDocumento.set(updated);
      },
      error: (err) => console.error('Error cambiando estado:', err)
    });
  }

  setSelectedEstado(event: Event) {
    const value = Number((event.target as HTMLSelectElement).value);
    this.selectedEstadoId.set(Number.isNaN(value) ? null : value);
  }

  downloadDocument(documento = this.selectedDocumento()) {
    if (!documento?.archivoNombre) return;

    this.api.downloadDocumentoArchivo(documento.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = documento.archivoNombre ?? `${documento.titulo}.bin`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error descargando archivo:', err);
        this.errorMessage.set('No se pudo descargar el archivo del documento.');
      }
    });
  }

  formatFileSize(size?: number) {
    if (!size) return '0 KB';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  closeDetail() {
    this.isDetailOpen.set(false);
    this.selectedDocumento.set(null);
    this.historial.set([]);
    this.errorMessage.set('');
  }

  canDeleteDocument = (row: Record<string, unknown>): boolean => {
    const documento = row as unknown as Documento;
    const currentUser = this.auth.currentUser();
    if (!currentUser || !documento || !documento.creadoPorCedula) return false;
    return Number(documento.creadoPorCedula) === Number(currentUser.id) ||
           this.auth.hasAnyRole(['admin', 'admin_org']);
  };

  deleteDocument(row: Record<string, unknown>) {
    const documento = row as unknown as Documento;
    if (!confirm(`Eliminar el documento "${documento.titulo}"?`)) return;

    this.api.deleteDocumento(documento.id).subscribe({
      next: () => this.documentos.update(docs => docs.filter(doc => doc.id !== documento.id)),
      error: (err) => console.error('Error eliminando documento:', err)
    });
  }
}
