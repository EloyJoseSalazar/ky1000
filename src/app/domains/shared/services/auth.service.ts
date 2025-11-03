import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../../environments/environmen';
import { Router } from '@angular/router';


import { jwtDecode } from 'jwt-decode';

// Interfaz para las credenciales de login
interface LoginRequest {
  email: string;
  password: string;
}

// Interfaz para la respuesta del backend al login
interface LoginResponse {
  message: string;
  email: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'jwt_token';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<string | null>(this.extractUsernameFromToken());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.updateAuthenticationStatus();
    this.updateCurrentUser();
  }

  private hasToken(): boolean {
    const token = localStorage.getItem(this.tokenKey);
    return !!token;
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/api/auth/login`, credentials).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem(this.tokenKey, response.token);
          this.updateAuthenticationStatus();
          this.updateCurrentUser();
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.updateAuthenticationStatus();
    this.updateCurrentUser();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private updateAuthenticationStatus(): void {
    this.isAuthenticatedSubject.next(this.hasToken());
  }

  private updateCurrentUser(): void {
    this.currentUserSubject.next(this.extractUsernameFromToken());
  }

  private extractUsernameFromToken(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        // Usa jwtDecode directamente aquí
        const decodedToken: any = jwtDecode(token);
        return decodedToken?.sub || decodedToken?.username || decodedToken?.email || null;
      } catch (e) {
        console.error('Error decoding token or token invalid. Forcing logout.', e);
        this.logout();
        return null;
      }
    }
    return null;
  }

  // Ahora la función decodeToken ya no es necesaria, porque llamamos a jwtDecode directamente
  // private decodeToken(token: string): any {
  //   try {
  //     return jwtDecode(token);
  //   } catch (error: unknown) {
  //     if (error instanceof Error) {
  //       console.error('Error al decodificar el token JWT:', error.message);
  //     } else {
  //       console.error('Error al decodificar el token JWT (desconocido):', error);
  //     }
  //     throw new Error('Token JWT inválido o corrupto.');
  //   }
  // }
}

