import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para usar *ngIf, etc.
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // Para formularios reactivos
import { ActivatedRoute, Router } from '@angular/router'; // Para manejar rutas y query params
import { AuthService } from '../../domains/shared/services/auth.service'; // Asegúrate de la ruta correcta
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // Importa CommonModule y ReactiveFormsModule
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string | null = null;
  returnUrl: string | null = null; // Variable para almacenar la URL a la que redirigir

  constructor(
      private fb: FormBuilder,
      private authService: AuthService,
      private router: Router,
      private route: ActivatedRoute // Inyecta ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], // Cambiamos 'id' por 'email' y añadimos validador de email
      password: ['', Validators.required]
    });

    // Leer el 'returnUrl' de los query parameters
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || null;
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.errorMessage = null; // Limpiar mensaje de error previo
      const { email, password } = this.loginForm.value; // Obtenemos email y password

      // Pasamos un objeto con las propiedades 'email' y 'password'
      this.authService.login({ email, password }).pipe(
          catchError(error => {
            // Mejor manejo de errores: Si el backend envía un mensaje, usarlo.
            this.errorMessage = error.error?.message || 'Error en el login. Credenciales inválidas o problema del servidor.';
            return throwError(() => error);
          })
      ).subscribe(
          response => {
            console.log('Login exitoso:', response);
            // Redirigir después del login
            // Si hay un returnUrl, navega a él; de lo contrario, navega a la raíz '/'
            this.router.navigateByUrl(this.returnUrl || '/');
          }
      );
    } else {
      this.errorMessage = 'Por favor, introduce un email válido y la contraseña.';
    }
  }
}
