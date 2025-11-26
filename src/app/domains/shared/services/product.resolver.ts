import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ProductService } from '@shared/services/product.service';
import { Product } from '@shared/models/product.model';
import { catchError, of, timeout } from 'rxjs';

export const productResolver: ResolveFn<Product | null> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const productService = inject(ProductService);
  const id = route.paramMap.get('id');

  if (!id) return of(null);

  return productService.getOne(id).pipe(
    // Como la red interna es rápida, 2 segundos es más que suficiente.
    timeout(2000),
    catchError((error) => {
      console.error('🔴 Error SSR:', error);
      return of(null);
    })
  );
};
