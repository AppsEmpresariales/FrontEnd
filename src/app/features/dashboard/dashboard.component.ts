import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgStyle, NgClass, UpperCasePipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgStyle, NgClass, UpperCasePipe],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Expose the signal so the template can use it
  user = this.authService.currentUser;

  // Mock data for @for
  projects = [
    { id: 1, name: 'Proyecto Alpha', status: 'active', progress: 80 },
    { id: 2, name: 'Proyecto Beta', status: 'pending', progress: 20 },
    { id: 3, name: 'Proyecto Gamma', status: 'completed', progress: 100 }
  ];

  themeColor = '#4F46E5'; // Indigo

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
