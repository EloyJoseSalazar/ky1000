import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ProductService } from '@shared/services/product.service';
import { Product } from '@shared/models/product.model';
import { catchError, of, timeout } from 'rxjs'; // <--- IMPORTANTE: Agregamos 'timeout'

export const productResolver: ResolveFn<Product | null> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const productService = inject(ProductService);
  const id = route.paramMap.get('id');

  if (!id) return of(null);

  console.log(`[SSR] Intentando resolver producto ID: ${id}`); // Log para depurar en servidor

  return productService.getOne(id).pipe(
    // 🔥 VÁLVULA DE SEGURIDAD:
    // Si la API tarda más de 3000ms (3 segundos), cortamos la espera.
    timeout(3000),

    catchError((error) => {
      // Este mensaje saldrá en los logs de Coolify si algo falla
      console.error(`[SSR ERROR] Falló la carga del producto ${id}. Causa:`, error);

      // Retornamos null para que la página cargue (aunque sea sin datos de producto)
      // en lugar de quedarse en blanco eternamente.
      return of(null);
    })
  );
};
