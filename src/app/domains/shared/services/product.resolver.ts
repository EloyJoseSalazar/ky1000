import { inject, PLATFORM_ID } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot } from '@angular/router';
import { ProductService } from '@shared/services/product.service';
import { Product } from '@shared/models/product.model';
import { of, from } from 'rxjs';
import { isPlatformServer } from '@angular/common';

export const productResolver: ResolveFn<Product | null> = (route: ActivatedRouteSnapshot) => {
  const productService = inject(ProductService);
  const platformId = inject(PLATFORM_ID);
  const id = route.paramMap.get('id');

  if (!id) return of(null);

  // 🕵️‍♂️ ESTRATEGIA NUCLEAR: FETCH NATIVO
  if (isPlatformServer(platformId)) {
    console.log(`[SSR NUCLEAR] Usando fetch nativo para ID: ${id}`);

    // Usamos la IP DIRECTA que funcionó en tu curl + el puerto
    const url = `http://10.0.1.12:8080/api/products/${id}`;

    // Convertimos la promesa de fetch en un Observable
    return from(
      fetch(url)
        .then(response => {
          if (!response.ok) throw new Error(`Fetch status: ${response.status}`);
          return response.json();
        })
        .then(data => {
          console.log('✅ [SSR] Datos obtenidos con éxito vía fetch');
          return data as Product;
        })
        .catch(err => {
          console.error('❌ [SSR] Falló fetch nativo:', err);
          return null;
        })
    );
  }

  // Si es el navegador (Cliente), usamos el servicio normal de Angular
  return productService.getOne(id);
};
