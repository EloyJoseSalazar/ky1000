import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot } from '@angular/router';
import { ProductService } from '@shared/services/product.service';
import { Product } from '@shared/models/product.model';
import { catchError, of, timeout } from 'rxjs'; // <--- Solo timeout

export const productResolver: ResolveFn<Product | null> = (route: ActivatedRouteSnapshot) => {
  const productService = inject(ProductService);
  const id = route.paramMap.get('id');

  if (!id) return of(null);

  console.log('[SSR] Resolver iniciado para ID:', id);

  return productService.getOne(id).pipe(
    // ⏱️ CORTAMOS A LOS 1000ms (1 segundo)
    timeout(2000),

    catchError((error) => {
      // Si entra aquí, es que saltó el timeout o falló la red.
      // DEVOLVEMOS NULL para que la página cargue sí o sí.
      console.error('⚠️ [SSR FALLBACK] El servidor falló/tardó. Cargando en cliente...', error);
      return of(null);
    })
  );
};
