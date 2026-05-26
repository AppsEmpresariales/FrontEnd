import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRoles = route.data?.['roles'] ?? route.data?.['role'];

  if (!authService.isAuthenticated()) {
    return router.parseUrl('/login');
  }

  if (authService.hasAnyRole(requiredRoles)) {
    return true;
  }

  return router.parseUrl('/dashboard');
};
