import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, switchMap, map, startWith } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { ProductComponent } from '@products/components/product/product.component';
import { Product } from '@shared/models/product.model';
import { CartService } from '@shared/services/cart.service';
import { ProductService } from '@shared/services/product.service';
import { BannerComponent } from "../../../../components/banner/banner.component";
import { PaginationComponent } from '../../../../components/pagination/pagination.component';
import { PagedResponse } from '@shared/models/paged-response.model';
// import { CalculoPrecioPipe } from '@shared/pipes/calculo-precio.pipe'; // Descomentar si lo usas en el HTML

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonModule,
    BannerComponent,
    ProductComponent,
    PaginationComponent,
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
    // Ocultamos el banner si hay alguna búsqueda (categoría, texto u oferta)
    this.showBanner$ = paramMap$.pipe(
      map(params => {
        const categoryId = params.get('categoryId');
        const query = params.get('q');
        const isOffer = params.get('isOffer'); // También ocultamos banner si estamos en ofertas
        return !(categoryId || query || isOffer);
      }),
      startWith(true)
    );

    // --- Lógica de carga paginada ---
    this.pagedResponse$ = paramMap$.pipe(
      switchMap(params => {
        // 1. EXTRAEMOS LOS PARÁMETROS DE LA URL
        const categoryId = params.get('categoryId');
        const query = params.get('q');
        const isOffer = params.get('isOffer'); // <--- ¡AQUÍ ESTÁ LA CLAVE!
        const page = Number(params.get('page') || '0');
        const size = 20;

        console.log(`Router activado. Page: ${page}, Category: ${categoryId}, Query: ${query}, Offer: ${isOffer}`);

        // 2. CONSTRUIMOS EL OBJETO FILTROS
        const filters: { [key: string]: string | undefined } = {};

        if (categoryId) {
          filters['categoryId'] = categoryId;
        }
        if (query) {
          filters['title'] = query;
        }
        // Agregamos el filtro de oferta si existe en la URL
        if (isOffer) {
          filters['isOffer'] = isOffer; // <--- SE LO PASAMOS AL SERVICIO
        }

        // 3. LLAMAMOS AL SERVICIO CON LOS FILTROS
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
