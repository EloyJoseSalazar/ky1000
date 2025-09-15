import { Routes } from '@angular/router';
import { LayoutComponent } from '@shared/components/layout/layout.component';
import { NotFoundComponent } from '@info/pages/not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        // USAMOS .then(m => m.default) para asegurar la carga correcta del componente
        loadComponent: () => import('./domains/products/pages/list/list.component').then(m => m.ListComponent)
      },
      {
        path: 'about',
        loadComponent: () => import('./domains/info/pages/about/about.component').then(m => m.AboutComponent)
      },
      {
        path: 'product/:id',
        loadComponent: () => import('./domains/products/pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
      },
      {
        path: 'ingresa',
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
