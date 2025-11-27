import { inject, PLATFORM_ID } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot } from '@angular/router';
import { ProductService } from '@shared/services/product.service';
import { Product } from '@shared/models/product.model';
import { of, from, race, timer } from 'rxjs'; // <--- AGREGAR 'race' y 'timer'
import { isPlatformServer } from '@angular/common';
import { map, catchError, take } from 'rxjs/operators'; // <--- AGREGAR estos operadores

export const productResolver: ResolveFn<Product | null> = (route: ActivatedRouteSnapshot) => {
  const productService = inject(ProductService);
  const platformId = inject(PLATFORM_ID);
  const id = route.paramMap.get('id');

  if (!id) return of(null);

// 🕵️‍♂️ ESTRATEGIA NUCLEAR V2: NOMBRE DE RED
  if (isPlatformServer(platformId)) {
    console.log(`[SSR] Intentando fetch interno...`);

    // CAMBIO: Usamos el nombre 'backend-api' en lugar de la IP fija.
    // Docker se encarga de encontrar la IP nueva automáticamente.
    const url = `http://backend-api:8080/api/products/${id}`;

    const fetch$ = from(
      fetch(url)
        .then(response => {
          if (!response.ok) throw new Error(`Fetch status: ${response.status}`);
          return response.json();
        })
        .then(data => {
          console.log('✅ [SSR] ¡ÉXITO! Producto encontrado vía backend-api');
          return data as Product;
        })
    );

    // Damos 3 segundos de gracia (Spring Boot a veces es lento en la primera carga)
    return race(
      fetch$,
      timer(3000).pipe(map(() => {
        console.warn('⚠️ [SSR] Timeout. Backend tardó mucho, soltamos página.');
        return null;
      }))
    ).pipe(
      take(1),
      catchError(err => {
        // IMPORTANTE: Este error saldrá en los logs de Coolify
        console.error('❌ [SSR ERROR] Falló conexión interna:', err);
        return of(null);
      })
    );
  }

  // Si es el navegador (Cliente), usamos el servicio normal de Angular
  return productService.getOne(id);
};
