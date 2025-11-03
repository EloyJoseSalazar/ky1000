// E:\WebStorm\KY1001\src\app\domains\products\pages\list\list.component.ts

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router'; // ActivatedRoute ya está importado
import { Observable, switchMap, map } from 'rxjs'; // ⬅️ AÑADIR 'map' DE rxjs

import { ProductComponent } from '@products/components/product/product.component';
import { Product } from '@shared/models/product.model';
import { CartService } from '@shared/services/cart.service';
import { ProductService } from '@shared/services/product.service';
import { BannerComponent } from "../../../../components/banner/banner.component";
// 💡 Asumimos que PagedResponse está definido en este path, ajústalo si es necesario
import { PagedResponse } from '@shared/models/paged-response.model';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, BannerComponent, ProductComponent],
  templateUrl: './list.component.html'
})
export class ListComponent {

  // products$ seguirá siendo Observable<Product[]>, porque extraeremos la lista
  products$: Observable<Product[]>;
  private cartService = inject(CartService);
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);

  constructor() {
    this.products$ = this.route.queryParamMap.pipe(
      switchMap(params => {
        const categoryId = params.get('category_id');
        const query = params.get('q');

        // 1. Preparamos los filtros como un objeto, similar a product-list.component
        const filters: { [key: string]: string | undefined } = {};
        if (categoryId) {
          // ⚠️ Revisa si tu backend espera 'categoryId' o 'category_id'
          filters['categoryId'] = categoryId;
        }
        if (query) {
          // ⚠️ Revisa si tu backend espera 'title', 'q' o algún otro nombre para la búsqueda
          filters['title'] = query;
        }

        // 2. Llamamos al SERVICIO PAGINADO para la PÁGINA 0, TAMAÑO 10 (o el que prefieras)
        // 🚨 Asegúrate que tu ProductService tenga un método como este:
        // getProductsPaged(filters: any, page: number, size: number): Observable<PagedResponse<Product[]>>
        return this.productService.getProductsPaged(filters, 0, 10);
      }),
      // 3. EXTRAEMOS la lista 'content' de la respuesta paginada
      map(pagedResponse => pagedResponse.content) // ⬅️ ¡Este es el cambio clave!
      // Opcional: Manejo de errores básico
      // catchError(error => {
      //   console.error('Error fetching initial products:', error);
      //   return of([]); // Devuelve un array vacío en caso de error
      // })
    );
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }
}
