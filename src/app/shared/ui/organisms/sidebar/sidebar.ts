import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { IconComponent } from '../../atoms/icon/icon';

interface NavigationItem {
  label: string;
  path: string;
  icon: string;
  roles: string[];
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent {
  private readonly auth = inject(AuthService);

  private readonly navigation: NavigationItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard', roles: ['admin', 'admin_org', 'user', 'editor', 'revisor', 'aprobador'] },
    { label: 'Documentos', path: '/documentos', icon: 'description', roles: ['admin', 'admin_org', 'user', 'editor', 'revisor', 'aprobador'] },
    { label: 'Usuarios', path: '/usuarios', icon: 'group', roles: ['admin', 'admin_org'] },
    { label: 'Organizaciones', path: '/organizaciones', icon: 'domain', roles: ['admin', 'admin_org'] },
    { label: 'Tipos documentales', path: '/tipos-documentales', icon: 'folder', roles: ['admin', 'admin_org'] },
    { label: 'Flujos', path: '/flujos', icon: 'account_tree', roles: ['admin', 'admin_org'] },
    { label: 'Tareas', path: '/tareas', icon: 'task_alt', roles: ['admin', 'admin_org', 'user', 'editor', 'revisor', 'aprobador'] },
    { label: 'Auditoria', path: '/auditoria', icon: 'history', roles: ['admin', 'admin_org'] },
    { label: 'Configuracion', path: '/configuracion', icon: 'settings', roles: ['admin', 'admin_org'] }
  ];

  protected readonly items = computed(() => this.navigation.filter(item => this.auth.hasAnyRole(item.roles)));
}
