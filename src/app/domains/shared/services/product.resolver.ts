import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ProductService } from '@shared/services/product.service';
import { Product } from '@shared/models/product.model';
import { catchError, of } from 'rxjs'; // <--- Importante: 'of' crea un observable vacío

export const productResolver: ResolveFn<Product | null> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const productService = inject(ProductService);
  const id = route.paramMap.get('id');

  // Si no hay ID, retornamos null inmediatamente para no bloquear
  if (!id) return of(null);

  // Intentamos obtener el producto
  return productService.getOne(id).pipe(
    // BLOQUE DE SEGURIDAD:
    catchError((error) => {
      console.error('🔴 El Resolver falló, pero dejamos cargar la página:', error);
      // Retornamos null para que la página cargue vacía en vez de quedarse blanca
      return of(null);
    })
  );
};
