import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../../environments/environmen';
import { Router } from '@angular/router';

// Interfaz para las credenciales de login
interface LoginRequest {
  email: string; // Cambiamos 'id' por 'email'
  password: string;
}

// Interfaz para la respuesta del backend al login
interface LoginResponse {
  message: string;
  email: string; // Asumo que el backend también devuelve 'email' y no 'userId' como en tu ejemplo de Postman
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'jwt_token'; // Clave para almacenar el token en localStorage
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken()); // Observador para el estado de autenticación

  isAuthenticated$ = this.isAuthenticatedSubject.asObservable(); // Observable público

  constructor(private http: HttpClient, private router: Router) { }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  // El parámetro 'credentials' ahora debe ser de tipo LoginRequest
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
        tap(response => {
          // Almacenar el token al hacer login exitoso
          localStorage.setItem(this.tokenKey, response.token);
          this.isAuthenticatedSubject.next(true); // Actualizar el estado de autenticación
        })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']); // Redirige al usuario a la página de login
  }

  isLoggedIn(): boolean {
    // Podrías añadir lógica para validar el token si es necesario (ej: expiración)
    return this.hasToken();
  }
}
