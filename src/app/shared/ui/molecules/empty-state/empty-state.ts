import { Component, Input } from '@angular/core';
import { IconComponent } from '../../atoms/icon/icon';

@Component({
  selector: 'app-empty-state',
  imports: [IconComponent],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.css'
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'Sin datos';
  @Input() message = 'No hay informacion disponible para mostrar.';
}
