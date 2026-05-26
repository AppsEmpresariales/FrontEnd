import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgClass],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm = this.fb.group({
    cedula: [null, [Validators.required, Validators.min(1000)]],
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    organizacionNit: [null, [Validators.required, Validators.min(1)]],
    organizacionNombre: ['', [Validators.required, Validators.minLength(3)]],
    organizacionEmail: ['', [Validators.required, Validators.email]],
    organizacionTelefono: [''],
    organizacionDirCalle: [''],
    organizacionDirNumero: [''],
    organizacionDirComuna: ['']
  });

  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const {
      cedula,
      nombre,
      email,
      password,
      organizacionNit,
      organizacionNombre,
      organizacionEmail,
      organizacionTelefono,
      organizacionDirCalle,
      organizacionDirNumero,
      organizacionDirComuna
    } = this.registerForm.value;

    this.authService.register({
      cedula: Number(cedula!),
      nombre: nombre!,
      email: email!,
      password: password!,
      organizacionNit: Number(organizacionNit!),
      organizacionNombre: organizacionNombre!,
      organizacionEmail: organizacionEmail!,
      organizacionTelefono: organizacionTelefono || undefined,
      organizacionDirCalle: organizacionDirCalle || undefined,
      organizacionDirNumero: organizacionDirNumero || undefined,
      organizacionDirComuna: organizacionDirComuna || undefined
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Error en el registro');
      }
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.registerForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
