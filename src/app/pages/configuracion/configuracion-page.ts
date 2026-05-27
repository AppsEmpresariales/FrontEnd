import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { EstadoDocumento, PlantillaCorreo, TipoEvento } from '../../core/models/docucloud.models';
import { AuthService } from '../../core/services/auth.service';
import { DocucloudApiService } from '../../core/services/docucloud-api';
import { BadgeComponent } from '../../shared/ui/atoms/badge/badge';
import { ButtonComponent } from '../../shared/ui/atoms/button/button';
import { IconComponent } from '../../shared/ui/atoms/icon/icon';
import { SectionHeaderComponent } from '../../shared/ui/molecules/section-header/section-header';

interface ColorToken {
  name: string;
  value: string;
  usage: string;
}

interface EndpointGroup {
  name: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-configuracion-page',
  imports: [BadgeComponent, ButtonComponent, IconComponent, SectionHeaderComponent, ReactiveFormsModule],
  templateUrl: './configuracion-page.html',
  styleUrl: './configuracion-page.css'
})
export class ConfiguracionPageComponent {
  private readonly api = inject(DocucloudApiService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  protected readonly apiUrl = environment.apiUrl;
  protected readonly nit = this.auth.currentOrganizationNit();
  protected readonly estados = signal<EstadoDocumento[]>([]);
  protected readonly plantillas = signal<PlantillaCorreo[]>([]);
  protected readonly isSavingEstado = signal(false);
  protected readonly isSavingPlantilla = signal(false);

  protected estadoForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    color: ['#3A7CA5', [Validators.required]],
    esInicial: [false],
    esFinal: [false]
  });

  protected plantillaForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    asunto: ['', [Validators.required, Validators.minLength(3)]],
    cuerpo: ['', [Validators.required, Validators.minLength(8)]],
    tipoEvento: ['DOCUMENTO_CREADO' as TipoEvento, Validators.required]
  });

  protected readonly eventos: TipoEvento[] = [
    'DOCUMENTO_CREADO',
    'TAREA_ASIGNADA',
    'TAREA_VENCIDA',
    'DOCUMENTO_APROBADO',
    'DOCUMENTO_RECHAZADO'
  ];

  protected readonly colors: ColorToken[] = [
    { name: 'Primario', value: '#1D4E89', usage: 'Botones principales, enlaces y navegacion activa' },
    { name: 'Secundario', value: '#4F6D8A', usage: 'Acciones secundarias y bloques de apoyo' },
    { name: 'Terciario', value: '#3B5F73', usage: 'Iconos, indicadores y detalles discretos' },
    { name: 'Fondo', value: '#F5F7FA', usage: 'Fondo general de aplicacion' },
    { name: 'Texto', value: '#1F2933', usage: 'Contenido y celdas de tabla' },
    { name: 'Exito', value: '#2D6A4F', usage: 'Confirmaciones y documentos aprobados' },
    { name: 'Error', value: '#A63D40', usage: 'Errores y eliminacion' },
    { name: 'Advertencia', value: '#C49A3A', usage: 'Pendientes, revision y avisos' }
  ];

  protected readonly endpoints: EndpointGroup[] = [
    { name: 'Organizaciones', path: '/organizaciones', icon: 'domain' },
    { name: 'Usuarios', path: '/usuarios', icon: 'group' },
    { name: 'Documentos', path: '/documentos', icon: 'description' },
    { name: 'Tipos documentales', path: '/tipos-documentales', icon: 'folder' },
    { name: 'Estados documento', path: '/estados-documento', icon: 'flag' },
    { name: 'Flujos trabajo', path: '/flujos-trabajo', icon: 'account_tree' },
    { name: 'Tareas', path: '/tareas', icon: 'task_alt' },
    { name: 'Auditoria', path: '/auditoria', icon: 'history' }
  ];

  constructor() {
    this.loadConfiguracion();
  }

  protected loadConfiguracion(): void {
    this.api.getEstadosDocumento(this.nit).subscribe({
      next: (items) => this.estados.set(items),
      error: (err) => console.error('Error cargando estados:', err)
    });
    this.api.getPlantillasCorreo(this.nit).subscribe({
      next: (items) => this.plantillas.set(items),
      error: (err) => console.error('Error cargando plantillas:', err)
    });
  }

  protected saveEstado(): void {
    if (this.estadoForm.invalid) {
      this.estadoForm.markAllAsTouched();
      return;
    }

    this.isSavingEstado.set(true);
    const value = this.estadoForm.value;
    this.api.createEstadoDocumento({
      nombre: value.nombre!,
      color: value.color || '#3A7CA5',
      esInicial: value.esInicial ?? false,
      esFinal: value.esFinal ?? false,
      organizacionNit: this.nit
    }).subscribe({
      next: (estado) => {
        this.estados.update(items => [...items, estado]);
        this.estadoForm.reset({ color: '#3A7CA5', esInicial: false, esFinal: false });
        this.isSavingEstado.set(false);
      },
      error: (err) => {
        console.error('Error creando estado:', err);
        this.isSavingEstado.set(false);
      }
    });
  }

  protected savePlantilla(): void {
    if (this.plantillaForm.invalid) {
      this.plantillaForm.markAllAsTouched();
      return;
    }

    this.isSavingPlantilla.set(true);
    const value = this.plantillaForm.value;
    this.api.createPlantillaCorreo({
      nombre: value.nombre!,
      asunto: value.asunto!,
      cuerpo: value.cuerpo!,
      tipoEvento: value.tipoEvento!,
      organizacionNit: this.nit
    }).subscribe({
      next: (plantilla) => {
        this.plantillas.update(items => [...items, plantilla]);
        this.plantillaForm.reset({ tipoEvento: 'DOCUMENTO_CREADO' });
        this.isSavingPlantilla.set(false);
      },
      error: (err) => {
        console.error('Error creando plantilla:', err);
        this.isSavingPlantilla.set(false);
      }
    });
  }
}
