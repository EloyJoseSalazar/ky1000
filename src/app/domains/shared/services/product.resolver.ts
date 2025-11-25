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

  // Intentamos obtener el producto
  return productService.getOne(id).pipe(
    // 🛡️ SEGURIDAD: Si la API tarda más de 3 segundos, cortamos para no colgar la página.
    timeout(1500),
    catchError((error) => {
      console.error('🔴 Error o Timeout en Resolver (SSR):', error);
      // Retornamos null para que la página cargue vacía en vez de pantalla blanca
      return of(null);
    })
  );
};

