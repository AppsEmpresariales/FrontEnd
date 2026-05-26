import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppRole, UserDto } from '../../models/user.dto';
import { LoginDto, RegisterDto, AuthResponseDto } from '../../models/auth.dto';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl.replace('/api/v1', '/api/auth');
  private docucloudApiUrl = environment.apiUrl;

  // Using Signals for state management
  private _isAuthenticated = signal<boolean>(false);
  private _currentUser = signal<UserDto | null>(null);

  // Computed signals
  readonly isAuthenticated = computed(() => this._isAuthenticated());
  readonly currentUser = computed(() => this._currentUser());
  readonly currentRole = computed(() => this._currentUser()?.role ?? 'user');

  constructor() {
    // Check local storage on initialization
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      try {
        const user = this.normalizeUser(JSON.parse(storedUser));
        this._currentUser.set(user);
        this._isAuthenticated.set(true);
        this.loadAssignedRoles(user);
      } catch {
        this.logout();
      }
    }
  }

  login(credentials: LoginDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => this.handleAuthSuccess(response))
      );
  }

  register(data: RegisterDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${this.apiUrl}/register`, data)
      .pipe(
        tap(response => this.handleAuthSuccess(response))
      );
  }

  logout() {
    this._isAuthenticated.set(false);
    this._currentUser.set(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  currentOrganizationNit(): number {
    return this._currentUser()?.organizacionNit ?? environment.defaultOrganizacionNit;
  }

  hasAnyRole(roles?: readonly string[] | string): boolean {
    if (!roles || roles.length === 0) {
      return true;
    }

    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    const user = this._currentUser();
    if (!user) {
      return false;
    }

    const userRoles = new Set([user.role, ...(user.roles ?? [])].map(role => this.normalizeRole(role)));
    return requiredRoles.some(role => userRoles.has(this.normalizeRole(role)));
  }

  updateCurrentUser(patch: Partial<UserDto>): void {
    const currentUser = this._currentUser();
    if (!currentUser) {
      return;
    }

    const updated = this.normalizeUser({ ...currentUser, ...patch });
    this._currentUser.set(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  }

  private handleAuthSuccess(response: AuthResponseDto) {
    const user = this.normalizeUser(response.user);
    this._isAuthenticated.set(true);
    this._currentUser.set(user);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', response.token);
    this.loadAssignedRoles(user);
  }

  private normalizeUser(user: UserDto): UserDto {
    const role = this.normalizeRole(user.role);
    const roles = user.roles?.map(item => this.normalizeRole(item)) ?? [role];

    return {
      ...user,
      id: String(user.id),
      role,
      roles: Array.from(new Set(roles))
    };
  }

  private normalizeRole(role?: string): AppRole {
    const normalized = String(role ?? 'user')
      .replace(/^ROLE_/i, '')
      .toLowerCase()
      .replace(/[\s-]+/g, '_');

    switch (normalized) {
      case 'admin':
      case 'administrator':
      case 'administrador':
        return 'admin';
      case 'admin_org':
      case 'administrador_organizacion':
      case 'administrador_de_organizacion':
        return 'admin_org';
      case 'editor':
        return 'editor';
      case 'revisor':
        return 'revisor';
      case 'aprobador':
        return 'aprobador';
      case 'sistema':
      case 'system':
        return 'sistema';
      default:
        return 'user';
    }
  }

  private loadAssignedRoles(user: UserDto): void {
    const cedula = Number(user.id);
    if (Number.isNaN(cedula)) {
      return;
    }

    this.http.get<Array<{ rolNombre: string }>>(`${this.docucloudApiUrl}/roles-usuarios/${cedula}`).subscribe({
      next: (assignedRoles) => {
        const roles = assignedRoles.map(item => this.normalizeRole(item.rolNombre));
        if (roles.length === 0) {
          return;
        }

        this.updateCurrentUser({
          role: roles.includes(user.role) ? user.role : roles[0],
          roles: Array.from(new Set([user.role, ...roles]))
        });
      },
      error: () => {
        // The login response still carries the main role, so role loading is best effort.
      }
    });
  }
}
