import {ApplicationConfig, inject} from '@angular/core';
import { PreloadAllModules, provideRouter, withComponentInputBinding, withPreloading } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { provideHttpClient, withFetch ,withInterceptors } from '@angular/common/http'; // ¡Importa withInterceptors!
import { authInterceptor  } from './domains/shared/interceptors/auth.interceptor';
import {AuthService} from "@shared/services/auth.service"; // ¡Importa tu interceptor!


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding(), withPreloading(PreloadAllModules)),
    provideHttpClient(withFetch()), // Es importante que withFetch() esté aquí para habilitar HttpClient
    provideClientHydration(withEventReplay()), // Si usas SSR
    provideHttpClient(
      withInterceptors([
        authInterceptor // ¡Ahora puedes pasar la función directamente!
      ])
    ),
  ]

};
