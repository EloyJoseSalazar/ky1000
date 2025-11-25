// E:\WebStorm\KY1001\src\app\app.routes.ts
import { Routes } from '@angular/router';
import { LayoutComponent } from '@shared/components/layout/layout.component';
import { NotFoundComponent } from '@info/pages/not-found/not-found.component';
import { LoginComponent } from './pages/login/login.component';
import { GestionImagenesProductoComponent } from './domains/shared/gestion-imagenes-producto/gestion-imagenes-producto.component';
import { authGuard } from './domains/shared/guards/auth.guard';
import { productResolver } from './domains/shared/services/product.resolver'; // Asegúrate de que esta ruta sea correcta

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
      // --- AQUI ESTA EL CAMBIO IMPORTANTE ---
      {
        path: 'product/:id',
        loadComponent: () => import('./domains/products/pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
        resolve: {
          productData: productResolver // <--- Esto obliga a esperar los datos
        }
      },
      // -------------------------------------
      // Rutas Protegidas
      {
        path: 'gestion-imagenes-producto',
        component: GestionImagenesProductoComponent,
        canActivate: [authGuard]
      },
      {
        path: 'ingresa', // Protegemos el módulo 'ingresa' completo
        canActivate: [authGuard], // El guard ya protege todo lo que está adentro
        children: [
          // Rutas que ya tenías para crear y editar productos
          {
            path: 'producto/nuevo',
            loadComponent: () => import('./pages/gestion-productos/gestion-productos.component').then(m => m.GestionProductosComponent)
          },
          {
            // CAMBIO: La ruta ahora espera un SKU en lugar de un ID
            path: 'producto/:sku',
            loadComponent: () => import('./pages/gestion-productos/gestion-productos.component').then(m => m.GestionProductosComponent)
          },
          {
            path: 'lista-productos', // La URL será /ingresa/lista-productos
            loadComponent: () => import('./pages/product-list/product-list.component').then(m => m.ProductListComponent)
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
