import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../domains/shared/services/auth.service'; // Asegúrate de la ruta correcta
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string | null = null;
  returnUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || null;
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.errorMessage = null;
      const { email, password } = this.loginForm.value;

      this.authService.login({ email, password }).pipe(
        catchError(error => {
          // El backend puede enviar un 401 para credenciales inválidas.
          // Asegúrate de que el 'message' o 'error.error.message' del backend sea útil.
          this.errorMessage = error.error?.message || 'Error en el login. Credenciales inválidas o problema del servidor.';
          return throwError(() => error);
        })
      ).subscribe(
        response => {
          console.log('Login exitoso:', response); // La respuesta ya está manejada por el servicio
          this.router.navigateByUrl(this.returnUrl || '/');
        },
        // Error handler ya está en catchError, pero podemos añadir un fallback si es necesario
        // error => {
        //   this.errorMessage = error.message || 'Ocurrió un error desconocido.';
        // }
      );
    } else {
      this.errorMessage = 'Por favor, introduce un email válido y la contraseña.';
    }
  }
}
