import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BadgeComponent } from '../../atoms/badge/badge';
import { IconComponent } from '../../atoms/icon/icon';
import { EmptyStateComponent } from '../../molecules/empty-state/empty-state';
import { TableColumn } from '../../../../core/models/docucloud.models';

@Component({
  selector: 'app-data-table',
  imports: [BadgeComponent, EmptyStateComponent, IconComponent],
  templateUrl: './data-table.html',
  styleUrl: './data-table.css'
})
export class DataTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() rows: Record<string, unknown>[] = [];
  @Input() emptyTitle = 'Sin registros';
  @Input() emptyMessage = 'No hay datos para los filtros seleccionados.';
  @Input() deleteIcon = 'power_settings_new';
  @Input() deleteTitle = 'Activar/Inactivar';

  @Input() showViewFn?: (row: Record<string, unknown>) => boolean;
  @Input() showEditFn?: (row: Record<string, unknown>) => boolean;
  @Input() showDeleteFn?: (row: Record<string, unknown>) => boolean;

  @Output() view = new EventEmitter<Record<string, unknown>>();
  @Output() edit = new EventEmitter<Record<string, unknown>>();
  @Output() delete = new EventEmitter<Record<string, unknown>>();

  showView(row: Record<string, unknown>): boolean {
    if (!this.view.observed) return false;
    if (this.showViewFn) return this.showViewFn(row);
    return true;
  }

  showEdit(row: Record<string, unknown>): boolean {
    if (!this.edit.observed) return false;
    if (this.showEditFn) return this.showEditFn(row);
    return true;
  }

  showDelete(row: Record<string, unknown>): boolean {
    if (!this.delete.observed) return false;
    if (this.showDeleteFn) return this.showDeleteFn(row);
    return true;
  }

  getCell(row: Record<string, unknown>, key: string): unknown {
    return row[key] ?? '-';
  }

  getCellText(row: Record<string, unknown>, key: string): string {
    return String(this.getCell(row, key));
  }

  badgeTone(value: unknown): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
    const text = String(value).toLowerCase();
    if (['true', 'activo', 'aprobado', 'completado'].some((word) => text.includes(word))) {
      return 'success';
    }
    if (['pendiente', 'revision', 'creado'].some((word) => text.includes(word))) {
      return 'warning';
    }
    if (['false', 'inactivo', 'rechazado', 'cancelado', 'error'].some((word) => text.includes(word))) {
      return 'error';
    }
    return 'info';
  }

  isStatusColumn(key: string): boolean {
    return ['active', 'estado', 'estadoDocumentoNombre', 'activo', 'estaLeida'].includes(key);
  }
}
