import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '../icon/icon';

@Component({
  selector: 'app-button',
  imports: [IconComponent],
  templateUrl: './button.html',
  styleUrl: './button.css'
})
export class ButtonComponent {
  @Input() label = '';
  @Input() icon = '';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' = 'primary';
  @Input() size: 'sm' | 'md' = 'md';
  @Input() disabled = false;
  @Output() btnClick = new EventEmitter<void>();
}
