import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { SidebarComponent } from '../../organisms/sidebar/sidebar';
import { TopbarComponent } from '../../organisms/topbar/topbar';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css'
})
export class AdminLayoutComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  handleGlobalSearch(term: string): void {
    const query = term.trim();
    if (!query) {
      return;
    }

    const target = this.resolveSearchTarget(query);
    this.router.navigate([target], { queryParams: { buscar: query } });
  }

  private resolveSearchTarget(term: string): string {
    const value = term.toLowerCase();

    if (this.auth.hasAnyRole(['admin', 'admin_org']) && /\b(usuario|user|correo|email|cedula|rol)\b/.test(value)) {
      return '/usuarios';
    }

    if (this.auth.hasAnyRole(['admin', 'admin_org']) && /\b(auditoria|historial|accion|trazabilidad)\b/.test(value)) {
      return '/auditoria';
    }

    return '/documentos';
  }
}
