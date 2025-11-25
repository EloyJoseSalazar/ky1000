import { Injectable, Inject, PLATFORM_ID } from '@angular/core'; // <--- IMPORTANTE: Inject y PLATFORM_ID
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../../environments/environmen';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { isPlatformBrowser } from '@angular/common'; // <--- IMPORTANTE: Para saber si estamos en navegador

interface LoginRequest {
  email: string;
  password: string;
}

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

  // Inicializamos con valores "seguros" (false/null)
  // El verdadero chequeo se hará en el constructor solo si es navegador
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<string | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object // <--- Inyectamos el ID de la plataforma
  ) {
    // Solo actualizamos el estado si estamos en el NAVEGADOR
    if (isPlatformBrowser(this.platformId)) {
      this.updateAuthenticationStatus();
      this.updateCurrentUser();
    }
  }

  private hasToken(): boolean {
    // PROTECCIÓN SSR: Si es servidor, retornamos false y no tocamos localStorage
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem(this.tokenKey);
      return !!token;
    }
    return false;
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/api/auth/login`, credentials).pipe(
      tap(response => {
        if (response && response.token) {
          // PROTECCIÓN SSR
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(this.tokenKey, response.token);
            this.updateAuthenticationStatus();
            this.updateCurrentUser();
          }
        }
      })
    );
  }

  logout(): void {
    // PROTECCIÓN SSR
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
      this.updateAuthenticationStatus();
      this.updateCurrentUser();
      this.router.navigate(['/login']);
    }
  }

  getToken(): string | null {
    // PROTECCIÓN SSR: El servidor no tiene tokens
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  private updateAuthenticationStatus(): void {
    this.isAuthenticatedSubject.next(this.hasToken());
  }

  private updateCurrentUser(): void {
    this.currentUserSubject.next(this.extractUsernameFromToken());
  }

  private extractUsernameFromToken(): string | null {
    const token = this.getToken(); // getToken ya es seguro ahora
    if (token) {
      try {
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
}
