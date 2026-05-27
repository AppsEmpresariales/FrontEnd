import { Component, Input } from '@angular/core';
import { IconComponent } from '../../atoms/icon/icon';

@Component({
  selector: 'app-stat-card',
  imports: [IconComponent],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.css'
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value: string | number = 0;
  @Input() helper = '';
  @Input() icon = 'analytics';
  @Input() tone: 'primary' | 'success' | 'warning' | 'info' = 'primary';
}
