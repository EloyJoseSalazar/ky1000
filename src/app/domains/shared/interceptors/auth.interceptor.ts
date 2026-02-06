// src/app/domains/shared/interceptors/auth.interceptor.ts (REFINADO)

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service'; // Asegúrate que la ruta sea correcta

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  // Asumimos que AuthService tiene un método getToken() que lee de localStorage
  const token = authService.getToken();

  if (token) {
    // Clonamos la petición para añadir la nueva cabecera
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    // Pasamos la petición clonada al siguiente manejador
    return next(clonedReq);
  }

  // Si no hay token, la petición original continúa sin cambios
  return next(req);
};
