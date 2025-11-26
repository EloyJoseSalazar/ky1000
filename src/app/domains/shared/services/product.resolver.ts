import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot } from '@angular/router';
import { ProductService } from '@shared/services/product.service';
import { Product } from '@shared/models/product.model';
import { of, timer, race } from 'rxjs'; // Importamos race y timer
import { map, catchError, take } from 'rxjs/operators';

export const productResolver: ResolveFn<Product | null> = (route: ActivatedRouteSnapshot) => {
  const productService = inject(ProductService);
  const id = route.paramMap.get('id');

  if (!id) return of(null);

  // Ponemos a competir: La API Interna vs Un cronómetro de 0.8 segundos
  return race(
    productService.getOne(id),
    timer(800).pipe(map(() => null))
  ).pipe(
    take(1),
    catchError((err) => {
      console.error('🔴 Error en Resolver:', err);
      return of(null);
    })
  );
};
