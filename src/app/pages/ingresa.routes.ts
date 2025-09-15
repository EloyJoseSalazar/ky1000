import { Routes } from '@angular/router';

export const INGRESA_ROUTES: Routes = [
  { path: '', redirectTo: 'producto/nuevo', pathMatch: 'full' },
  {
    path: 'producto/nuevo',
    loadComponent: () => import('./gestion-productos/gestion-productos.component').then(m => m.GestionProductosComponent),
  },
  {
    path: 'producto/:id',
    loadComponent: () => import('./gestion-productos/gestion-productos.component').then(m => m.GestionProductosComponent),
  }
];


//loadComponent: () => import('./domains/info/pages/about/about.component').then(m => m.AboutComponent),
