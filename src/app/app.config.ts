// src/app/app.config.ts

import { ApplicationConfig } from '@angular/core';
import { PreloadAllModules, provideRouter, withComponentInputBinding, withPreloading } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';

import { routes } from './app.routes';
import { authInterceptor } from './domains/shared/interceptors/auth.interceptor';
import { withRouterConfig } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding(), withPreloading(PreloadAllModules),withRouterConfig({ onSameUrlNavigation: 'reload' })),
    provideClientHydration(), // Simplificado si no usas event replay

    provideHttpClient(
      withFetch(),
      withInterceptors([
        authInterceptor
      ])
    )
  ]
};
