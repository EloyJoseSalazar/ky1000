//src/app/app.routes.ts

import { Routes } from '@angular/router';
import { LayoutComponent } from '@shared/components/layout/layout.component';
import { NotFoundComponent } from '@info/pages/not-found/not-found.component';
import { LoginComponent } from './pages/login/login.component';
import { GestionImagenesProductoComponent } from './domains/shared/gestion-imagenes-producto/gestion-imagenes-producto.component';
import { authGuard } from './domains/shared/guards/auth.guard';
import { productResolver } from './domains/shared/services/product.resolver'; // <--- IMPORTANTE

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
        path: 'contacto',
        loadComponent: () => import('./domains/info/pages/contacto/contacto.component').then(m => m.ContactoComponent)
      },
      // --- RUTA MODIFICADA ---
      {
        path: 'product/:id',
        loadComponent: () => import('./domains/products/pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
        resolve: {
          productData: productResolver // <--- ¡RESOLVER ACTIVADO!
        }
      },
      // -----------------------
      {
        path: 'gestion-imagenes-producto',
        component: GestionImagenesProductoComponent,
        canActivate: [authGuard]
      },
      {
        path: 'ingresa',
        canActivate: [authGuard],
        children: [
          {
            path: 'admin/moneda',
            loadComponent: () => import('./pages/moneda/moneda.component').then(m => m.MonedaComponent),
            // canActivate: [AuthGuard] // Asegúrate de protegerla si tienes guardias
          },
          {
            path: 'producto/nuevo',
            loadComponent: () => import('./pages/gestion-productos/gestion-productos.component').then(m => m.GestionProductosComponent)
          },
          {
            path: 'producto/:sku',
            loadComponent: () => import('./pages/gestion-productos/gestion-productos.component').then(m => m.GestionProductosComponent)
          },
          {
            path: 'lista-productos',
            loadComponent: () => import('./pages/product-list/product-list.component').then(m => m.ProductListComponent)
          },
          {
            path: 'analitica',
            loadComponent: () => import('./pages/DashboardAnalyticsComponent/dashboard-analytics.component').then(m => m.DashboardAnalyticsComponent)
          },
          { path: '', redirectTo: 'lista-productos', pathMatch: 'full' },
        ]
      },
    ]
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];

