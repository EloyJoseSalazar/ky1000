// src/app/domains/products/pages/list/list.component.ts

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// Importa Router para la navegación
import { ActivatedRoute, Router } from '@angular/router';
// Importa operadores de RxJS
import { Observable, switchMap, map, startWith } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { ProductComponent } from '@products/components/product/product.component';
import { Product } from '@shared/models/product.model';
import { CartService } from '@shared/services/cart.service';
import { ProductService } from '@shared/services/product.service';
import { BannerComponent } from "../../../../components/banner/banner.component";

// Importa tu componente de paginación
import { PaginationComponent } from '../../../../components/pagination/pagination.component';
// Importa el modelo de respuesta paginada
import { PagedResponse } from '@shared/models/paged-response.model';

// --- NUEVO: IMPORTAR EL PIPE DE CÁLCULO ---
// Ajusta la ruta si tu alias '@shared' no apunta a 'src/app/domains/shared'
// Si no funciona @shared, usa: '../../../../shared/pipes/calculo-precio.pipe'
import { CalculoPrecioPipe } from '@shared/pipes/calculo-precio.pipe';

@Component({
  selector: 'app-list',
  standalone: true,
  // 1. Agregamos CalculoPrecioPipe a los imports para poder usarlo en el HTML
  imports: [
    CommonModule,
    BannerComponent,
    ProductComponent,
    PaginationComponent,
    CalculoPrecioPipe // <--- AQUÍ LO AGREGAMOS
  ],
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit {

  // Observables para la paginación
  pagedResponse$!: Observable<PagedResponse<Product>>;
  products$!: Observable<Product[]>;
  totalPages$!: Observable<number>;
  currentPage$!: Observable<number>;

  showBanner$: Observable<boolean> | undefined;

  private cartService = inject(CartService);
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit() {
    const paramMap$ = this.route.queryParamMap;

    // --- Lógica para mostrar/ocultar el banner ---
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
        const page = Number(params.get('page') || '0');
        const size = 20;

        console.log(`Router activado. Page: ${page}, Category: ${categoryId}, Query: ${query}`);

        const filters: { [key: string]: string | undefined } = {};
        if (categoryId) {
          filters['categoryId'] = categoryId;
        }
        if (query) {
          filters['title'] = query;
        }

        return this.productService.getProductsPaged(filters, page, size);
      }),
      shareReplay(1)
    );

    this.products$ = this.pagedResponse$.pipe(
      map(response => response.content),
      startWith([])
    );

    this.totalPages$ = this.pagedResponse$.pipe(
      map(response => response.totalPages),
      startWith(0)
    );

    this.currentPage$ = this.pagedResponse$.pipe(
      map(response => response.page),
      startWith(0)
    );
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }

  onPageChange(page: number) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: page },
      queryParamsHandling: 'merge',
    });
  }
}
