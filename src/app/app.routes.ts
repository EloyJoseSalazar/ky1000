
import { Routes } from '@angular/router';
import { LayoutComponent } from '@shared/components/layout/layout.component';
import { NotFoundComponent } from '@info/pages/not-found/not-found.component';

// --- ¡NUEVO! Importamos el componente directamente ---
import { ProductDetailComponent } from './domains/products/pages/product-detail/product-detail.component';

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
        path: 'about',
        loadComponent: () => import('./domains/info/pages/about/about.component').then(m => m.AboutComponent)
      },
      {
        // --- ¡EL CAMBIO ESTÁ AQUÍ! ---
        // En lugar de `loadComponent`, usamos `component`.
        path: 'product/:id',
        component: ProductDetailComponent
      },
      {
        path: 'ingresa',
        loadChildren: () => import('./pages/ingresa.routes').then(m => m.INGRESA_ROUTES),
      },
    ]
  },
  {
    path: '**',
    // Asumimos que NotFoundComponent tampoco usa export default
    loadComponent: () => import('./domains/info/pages/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
