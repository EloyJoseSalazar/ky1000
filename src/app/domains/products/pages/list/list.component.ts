// src/app/domains/products/pages/list/list.component.ts

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// Importa Router para la navegación
import { ActivatedRoute, Router } from '@angular/router';
// Importa operadores de RxJS
import { Observable, switchMap, map, startWith } from 'rxjs';
import { shareReplay } from 'rxjs/operators'; // Asegúrate de importar shareReplay

import { ProductComponent } from '@products/components/product/product.component';
import { Product } from '@shared/models/product.model';
import { CartService } from '@shared/services/cart.service';
import { ProductService } from '@shared/services/product.service';
import { BannerComponent } from "../../../../components/banner/banner.component";

// Importa tu componente de paginación
import { PaginationComponent } from '../../../../components/pagination/pagination.component';
// Importa el modelo de respuesta paginada (ajusta la ruta si es necesario)
import { PagedResponse } from '@shared/models/paged-response.model';

@Component({
  selector: 'app-list',
  standalone: true,
  // 1. Agrega PaginationComponent a los imports
  imports: [
    CommonModule,
    BannerComponent,
    ProductComponent,
    PaginationComponent
  ],
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit {

  // Observables para la paginación
  pagedResponse$!: Observable<PagedResponse<Product>>;
  products$!: Observable<Product[]>;
  totalPages$!: Observable<number>;
  currentPage$!: Observable<number>; // Página actual (basada en índice 0 de Spring)

  showBanner$: Observable<boolean> | undefined;

  private cartService = inject(CartService);
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router); // 2. Inyecta el Router

  ngOnInit() {
    // Definimos la fuente principal de parámetros
    const paramMap$ = this.route.queryParamMap;

    // --- Lógica para mostrar/ocultar el banner (sin cambios) ---
    this.showBanner$ = paramMap$.pipe(
      map(params => {
        const categoryId = params.get('categoryId');
        const query = params.get('q');
        return !(categoryId || query);
      }),
      startWith(true)
    );

    // --- Lógica de carga paginada ---
    this.pagedResponse$ = paramMap$.pipe(
      switchMap(params => {
        const categoryId = params.get('categoryId');
        const query = params.get('q');
        // 3. Lee el parámetro 'page' de la URL, si no existe, usa '0'
        const page = Number(params.get('page') || '0');
        const size = 20; // Defines el tamaño de página (o lo haces dinámico)

        console.log(`Router activado. Page: ${page}, Category: ${categoryId}, Query: ${query}`);

        const filters: { [key: string]: string | undefined } = {};
        if (categoryId) {
          filters['categoryId'] = categoryId;
        }
        if (query) {
          filters['title'] = query;
        }

        // 4. Llama al servicio con la página dinámica
        return this.productService.getProductsPaged(filters, page, size);
      }),
      // 5. Comparte la respuesta para los observables derivados
      shareReplay(1)
    );

    // Derivamos los productos de la respuesta paginada
    this.products$ = this.pagedResponse$.pipe(
      map(response => response.content),
      startWith([]) // Valor inicial mientras carga
    );

    // Derivamos el total de páginas
    this.totalPages$ = this.pagedResponse$.pipe(
      map(response => response.totalPages),
      startWith(0)
    );

    // Derivamos la página actual (Spring usa 'number' para la pág. actual 0-indexed)
    this.currentPage$ = this.pagedResponse$.pipe(
      map(response => response.page), // Asumiendo que tu PagedResponse tiene 'number'
      startWith(0)
    );
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }

  // 6. Método para manejar el cambio de página
  onPageChange(page: number) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: page },
      queryParamsHandling: 'merge', // 'merge' conserva los otros filtros (categoryId, q)
    });
  }
}
