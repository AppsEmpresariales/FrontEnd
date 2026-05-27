import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FlujoTrabajoTarea, TableColumn } from '../../core/models/docucloud.models';
import { DocucloudApiService } from '../../core/services/docucloud-api';
import { AuthService } from '../../core/services/auth.service';
import { matchesSearch } from '../../core/utils/search';

import { ButtonComponent } from '../../shared/ui/atoms/button/button';
import { SearchBarComponent } from '../../shared/ui/molecules/search-bar/search-bar';
import { SectionHeaderComponent } from '../../shared/ui/molecules/section-header/section-header';
import { DataTableComponent } from '../../shared/ui/organisms/data-table/data-table';

@Component({
  selector: 'app-tareas-page',
  imports: [ButtonComponent, DataTableComponent, SearchBarComponent, SectionHeaderComponent],
  templateUrl: './tareas-page.html',
  styleUrl: './tareas-page.css'
})
export class TareasPageComponent {
  private readonly api = inject(DocucloudApiService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  protected readonly tareas = signal<FlujoTrabajoTarea[]>([]);
  protected readonly term = signal('');

  protected readonly columns: TableColumn[] = [
    { key: 'documentoTitulo', label: 'Documento' },
    { key: 'pasoNombre', label: 'Paso' },
    { key: 'asignadoANombre', label: 'Asignado a' },
    { key: 'estado', label: 'Estado' },
    { key: 'fechaLimite', label: 'Fecha límite' }
  ];

  protected readonly rows = computed<Record<string, unknown>[]>(() => {
    return this.tareas()
      .filter((task) => matchesSearch(
        this.term(),
        task.documentoTitulo,
        task.pasoNombre,
        task.asignadoANombre,
        task.estado,
        task.fechaLimite,
        task.comentario
      ))
      .map((task) => ({ ...task }));
  });

  constructor() {
    this.loadTareas();
    this.route.queryParamMap.subscribe(params => this.term.set(params.get('buscar') ?? ''));
  }

  protected loadTareas() {
    const user = this.auth.currentUser();
    if (!user) return;
    
    this.api.getTareasPendientesByUsuario(Number(user.id)).subscribe({
      next: (items) => this.tareas.set(items),
      error: (err) => console.error('Error cargando tareas:', err)
    });
  }

  completarTarea(row: any) {
    if (!confirm('¿Seguro que deseas marcar esta tarea como completada?')) return;
    const tarea = row as FlujoTrabajoTarea;
    this.api.completarTarea(tarea.id).subscribe({
      next: (updatedTask) => {
        // Filtrar o actualizar la tarea
        this.tareas.update(tasks => tasks.filter(t => t.id !== updatedTask.id));
      },
      error: (err) => console.error('Error completando tarea:', err)
    });
  }

  cancelarTarea(row: any) {
    if (!confirm('¿Seguro que deseas cancelar esta tarea?')) return;
    const tarea = row as FlujoTrabajoTarea;
    this.api.cancelarTarea(tarea.id).subscribe({
      next: (updatedTask) => {
        this.tareas.update(tasks => tasks.filter(t => t.id !== updatedTask.id));
      },
      error: (err) => console.error('Error cancelando tarea:', err)
    });
  }

  search(term: string): void {
    this.term.set(term);
  }
}
