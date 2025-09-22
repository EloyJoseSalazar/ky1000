import { inject } from '@angular/core'; // Necesitas inject aquí
import {
  HttpRequest,
  HttpHandlerFn, // Usa HttpHandlerFn para interceptores funcionales
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service'; // Asegúrate de que la ruta sea correcta

// Define el interceptor como una función, no una clase
export const authInterceptor: (req: HttpRequest<unknown>, next: HttpHandlerFn) => Observable<HttpEvent<unknown>> = (req, next) => {
  const authService = inject(AuthService); // Usa inject para obtener el servicio
  const token = authService.getToken(); // Obtiene el token del servicio

  // Si hay un token, clona la petición y añade la cabecera de autorización
  if (token) {
    // Excluir peticiones a '/auth/login' o '/auth/register' del interceptor para evitar bucles o añadir el token antes de obtenerlo
    if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
      return next(req); // Pasa la petición sin modificar
    }

    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
