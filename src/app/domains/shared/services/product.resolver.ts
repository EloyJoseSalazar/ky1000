import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ProductService } from '@shared/services/product.service';
import { Product } from '@shared/models/product.model';
import { catchError, of, timeout } from 'rxjs'; // <--- Importar 'timeout'

export const productResolver: ResolveFn<Product | null> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const productService = inject(ProductService);
  const id = route.paramMap.get('id');

  if (!id) return of(null);

  return productService.getOne(id).pipe(
    // 🛡️ SEGURIDAD:
    // Esperamos máximo 2 segundos. Si tarda más, soltamos la página.
    timeout(2000),

    catchError((error) => {
      console.error('🔴 SSR Error o Timeout:', error);
      // Retornamos null para que la página cargue vacía (carga cliente) en vez de colgarse
      return of(null);
    })
  );
};
