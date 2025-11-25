// src/app/domains/shared/services/product.resolver.ts

import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ProductService } from '@shared/services/product.service';
import { Product } from '@shared/models/product.model';
import { catchError, of } from 'rxjs'; // <--- IMPORTANTE

export const productResolver: ResolveFn<Product | null> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const productService = inject(ProductService);
  const id = route.paramMap.get('id');

  if (!id) {
    return of(null); // Si no hay ID, retornamos null y dejamos pasar
  }

  return productService.getOne(id).pipe(
    // IMPORTANTE: Si la API falla (404, 500), no rompemos la app.
    // Retornamos null para que el componente cargue y maneje el error.
    catchError((error) => {
      console.error('🔴 Error en el Resolver:', error);
      return of(null);
    })
  );
};
