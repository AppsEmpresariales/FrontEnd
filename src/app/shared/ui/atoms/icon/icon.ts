import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon',
  imports: [],
  templateUrl: './icon.html',
  styleUrl: './icon.css'
})
export class IconComponent {
  @Input({ required: true }) name = '';
  @Input() size = 22;
  @Input() color = 'currentColor';
  @Input() label = '';
}
