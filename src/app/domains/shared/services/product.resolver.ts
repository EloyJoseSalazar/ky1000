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

  // 🕵️‍♂️ ESTRATEGIA NUCLEAR: FETCH NATIVO
  if (isPlatformServer(platformId)) {
    console.log(`[SSR NUCLEAR] Usando fetch nativo para ID: ${id}`);

    // Usamos la URL interna (backend-api)
    const url = `http://backend-api:8080/api/products/${id}`;

    // 1. Creamos el Observable del fetch (la petición real)
    const fetch$ = from(
      fetch(url)
        .then(response => {
          if (!response.ok) throw new Error(`Fetch status: ${response.status}`);
          return response.json();
        })
        .then(data => {
          console.log('✅ [SSR] Datos obtenidos con éxito vía fetch');
          return data as Product;
        })
    );

    // 2. AQUI ESTÁ EL CAMBIO DEL TIMER:
    // Ponemos a competir (race) la petición 'fetch$' contra un 'timer' de 3 segundos.
    return race(
      fetch$,
      timer(3000).pipe(map(() => {
        console.warn('⚠️ [SSR] Timeout de 3s alcanzado. Soltando página.');
        return null; // Si gana el timer, devolvemos null
      }))
    ).pipe(
      take(1), // Tomamos el primero que termine
      catchError(err => {
        console.error('❌ [SSR] Falló fetch nativo o error general:', err);
        return of(null); // Si falla algo, devolvemos null para no colgar
      })
    );
  }

  // Si es el navegador (Cliente), usamos el servicio normal de Angular
  return productService.getOne(id);
};
