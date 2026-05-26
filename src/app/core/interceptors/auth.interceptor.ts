import { HttpHandlerFn, HttpRequest, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    // Clone the request to add the authentication header.
    const newReq = req.clone({
      headers: req.headers.append('Authorization', `Bearer ${token}`)
    });
    return next(newReq);
  }

  // If no token, just pass the original request
  return next(req);
}
