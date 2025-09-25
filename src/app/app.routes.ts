import { Routes } from '@angular/router';
import { LayoutComponent } from '@shared/components/layout/layout.component';
import { NotFoundComponent } from '@info/pages/not-found/not-found.component';
import { LoginComponent } from './pages/login/login.component';
// Importa ambos componentes de gestión, aunque el `authGuard` puede ser aplicado al padre `ingresa`
import { GestionImagenesProductoComponent } from './domains/shared/gestion-imagenes-producto/gestion-imagenes-producto.component';
import { GestionProductosComponent } from './pages/gestion-productos/gestion-productos.component';

import { authGuard } from './domains/shared/guards/auth.guard'; // ¡Importa tu AuthGuard!

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./domains/products/pages/list/list.component').then(m => m.ListComponent)
      },
      {
        path: 'login',
        component: LoginComponent
      },
      {
        path: 'about',
        loadComponent: () => import('./domains/info/pages/about/about.component').then(m => m.AboutComponent)
      },
      {
        path: 'product/:id',
        loadComponent: () => import('./domains/products/pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
      },

      // Rutas Protegidas
      {
        path: 'gestion-imagenes-producto', // Esta ruta ya estaba protegida, la mantenemos
        component: GestionImagenesProductoComponent,
        canActivate: [authGuard]
      },
      {
        path: 'ingresa', // Protegemos el módulo 'ingresa' completo
        canActivate: [authGuard], // Aplicamos el guard a la ruta padre
        children: [
          { path: '', redirectTo: 'producto/nuevo', pathMatch: 'full' },
          {
            path: 'producto/nuevo',
            loadComponent: () => import('./pages/gestion-productos/gestion-productos.component').then(m => m.GestionProductosComponent)
          },
          {
            path: 'producto/:id',
            loadComponent: () => import('./pages/gestion-productos/gestion-productos.component').then(m => m.GestionProductosComponent)
          }
        ]
      },
    ]
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];
