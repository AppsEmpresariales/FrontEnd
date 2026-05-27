import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-form-field',
  imports: [],
  templateUrl: './form-field.html',
  styleUrl: './form-field.css'
})
export class FormFieldComponent {
  @Input() label = '';
  @Input() value = '';
  @Input() placeholder = '';
  @Input() type: 'text' | 'email' | 'number' | 'password' | 'date' = 'text';
  @Input() hint = '';
  @Input() disabled = false;
  @Output() valueChange = new EventEmitter<string>();
}
