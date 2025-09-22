import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Asegúrate de que la ruta sea correcta
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

// El AuthGuard como función (CanActivateFn) es el estándar en Angular moderno
export const authGuard: CanActivateFn = (route, state): Observable<boolean> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true; // Si el usuario está autenticado, permite el acceso
      } else {
        // Si no está autenticado, redirige a la página de login
        // y guarda la URL intentada para redirigir después del login
        router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
      }
    })
  );
};
