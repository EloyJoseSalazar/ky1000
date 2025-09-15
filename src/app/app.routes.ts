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
                loadComponent: () => import('./domains/products/pages/list/list.component').then(m => m.default)
            },
            {
                path: 'about',
                loadComponent: () => import('./domains/info/pages/about/about.component').then(m => m.default)
            },
            {
                path: 'product/:id',
                loadComponent: () => import('./domains/products/pages/product-detail/product-detail.component').then(m => m.default)
            },

          {
            path: 'ingresa', // Ruta base para la sección de administración
            children: [
              // Por ahora redirigimos a la creación, en el futuro aquí puede ir un listado de productos
              { path: '', redirectTo: 'producto/nuevo', pathMatch: 'full' },
              {
                path: 'producto/nuevo', // Ruta para crear un nuevo producto
                loadComponent: () => import('./pages/gestion-productos/gestion-productos.component').then(m => m.default)
              },


              {
                path: 'producto/:id', // Ruta para editar un producto existente
                loadComponent: () => import('./pages/gestion-productos/gestion-productos.component').then(m => m.default)
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
