import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../atoms/button/button';
import { IconComponent } from '../../atoms/icon/icon';
import { SearchBarComponent } from '../../molecules/search-bar/search-bar';
import { AuthService } from '../../../../core/services/auth.service';
import { DocucloudApiService } from '../../../../core/services/docucloud-api';
import { Notificacion } from '../../../../core/models/docucloud.models';

@Component({
  selector: 'app-topbar',
  imports: [ButtonComponent, IconComponent, SearchBarComponent],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css'
})
export class TopbarComponent {
  private authService = inject(AuthService);
  private api = inject(DocucloudApiService);
  private router = inject(Router);
  public currentUser = this.authService.currentUser;

  protected readonly notifications = signal<Notificacion[]>([]);
  protected readonly isNotificationsOpen = signal<boolean>(false);

  @Output() globalSearch = new EventEmitter<string>();

  constructor() {
    const user = this.authService.currentUser();
    if (user) {
      this.loadNotifications(Number(user.id));
    }
  }

  private loadNotifications(userId: number) {
    this.api.getNoLeidasByUsuario(userId).subscribe({
      next: (items) => this.notifications.set(items),
      error: (err) => console.error('Error loading topbar notifications:', err)
    });
  }

  toggleNotifications() {
    this.isNotificationsOpen.update(v => !v);
  }

  marcarLeida(notif: Notificacion, event: Event) {
    event.stopPropagation();
    this.api.marcarNotificacionLeida(notif.id).subscribe({
      next: () => {
        this.notifications.update(items => items.filter(n => n.id !== notif.id));
      },
      error: (err) => console.error('Error marking read:', err)
    });
  }

  marcarTodasComoLeidas(event: Event) {
    event.stopPropagation();
    const user = this.authService.currentUser();
    if (!user) return;
    
    this.api.marcarTodasComoLeidas(Number(user.id)).subscribe({
      next: () => {
        this.notifications.set([]);
      },
      error: (err) => console.error('Error marking all read:', err)
    });
  }

  formatTime(isoStr: string): string {
    if (!isoStr) return '';
    try {
      const date = new Date(isoStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString();
    } catch {
      return isoStr;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToProfile(): void {
    this.router.navigate(['/perfil']);
  }
}
