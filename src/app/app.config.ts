import { ApplicationConfig } from '@angular/core';
import { PreloadAllModules, provideRouter, withComponentInputBinding, withPreloading } from '@angular/router';
//import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding(), withPreloading(PreloadAllModules)),
    provideHttpClient(withFetch())
   // provideHttpClient(), provideClientHydration(withEventReplay()) // Si quieres la versión moderna, usa provideHttpClient(withFetch())
  ]
};
