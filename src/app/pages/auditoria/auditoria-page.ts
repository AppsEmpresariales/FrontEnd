import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuditRegistro, TableColumn } from '../../core/models/docucloud.models';
import { DocucloudApiService } from '../../core/services/docucloud-api';
import { matchesSearch } from '../../core/utils/search';

import { ButtonComponent } from '../../shared/ui/atoms/button/button';
import { SearchBarComponent } from '../../shared/ui/molecules/search-bar/search-bar';
import { SectionHeaderComponent } from '../../shared/ui/molecules/section-header/section-header';
import { DataTableComponent } from '../../shared/ui/organisms/data-table/data-table';

@Component({
  selector: 'app-auditoria-page',
  imports: [ButtonComponent, DataTableComponent, SearchBarComponent, SectionHeaderComponent],
  templateUrl: './auditoria-page.html',
  styleUrl: './auditoria-page.css'
})
export class AuditoriaPageComponent {
  private readonly api = inject(DocucloudApiService);
  private readonly route = inject(ActivatedRoute);
  protected readonly registros = signal<AuditRegistro[]>([]);
  protected readonly term = signal('');

  protected readonly columns: TableColumn[] = [
    { key: 'accion', label: 'Acción' },
    { key: 'documentoTitulo', label: 'Documento' },
    { key: 'usuarioNombre', label: 'Usuario' },
    { key: 'estadoPrevio', label: 'Estado previo' },
    { key: 'estadoNuevo', label: 'Estado nuevo' },
    { key: 'creadoEn', label: 'Fecha' }
  ];

  protected readonly rows = computed<Record<string, unknown>[]>(() => {
    return this.registros()
      .filter((item) => matchesSearch(
        this.term(),
        item.accion,
        item.descripcion,
        item.documentoTitulo,
        item.usuarioNombre,
        item.estadoPrevio,
        item.estadoNuevo,
        item.creadoEn
      ))
      .map((item) => ({ ...item }));
  });

  constructor() {
    this.api.buscarAuditoria({}).subscribe({
      next: (items) => this.registros.set(items),
      error: (err) => console.error('Error cargando auditoria:', err)
    });
    this.route.queryParamMap.subscribe(params => this.term.set(params.get('buscar') ?? ''));
  }

  search(term: string): void {
    this.term.set(term);
  }

  exportar(): void {
    const data = this.rows();
    if (data.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }

    // Build CSV content
    const headers = this.columns.map(c => c.label).join(',');
    const csvRows = data.map(row => {
      return this.columns.map(c => {
        let val = String(row[c.key] || '');
        // Escape quotes and commas
        val = val.replace(/"/g, '""');
        if (val.search(/("|,|\n)/g) >= 0) {
          val = `"${val}"`;
        }
        return val;
      }).join(',');
    });

    const csvContent = [headers, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `auditoria_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
