import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-badge',
  imports: [],
  templateUrl: './badge.html',
  styleUrl: './badge.css'
})
export class BadgeComponent {
  @Input() label = '';
  @Input() tone: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral' = 'neutral';
}
