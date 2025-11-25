import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ProductService } from '@shared/services/product.service'; // Ajusta tu ruta
import { Product } from '@shared/models/product.model';
import { Observable } from 'rxjs';

export const productResolver: ResolveFn<Product | null> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const productService = inject(ProductService);
  const id = route.paramMap.get('id');

  if (!id) return null;

  // Esto obliga al servidor a esperar la respuesta
  return productService.getOne(id);
};
