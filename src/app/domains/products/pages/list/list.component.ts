// E:\WebStorm\KY1001\src\app\domains\products\pages\list\list.component.ts

import {Component, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router'; // ActivatedRoute ya está importado
import { Observable, switchMap, map } from 'rxjs'; // ⬅️ AÑADIR 'map' DE rxjs

import { ProductComponent } from '@products/components/product/product.component';
import { Product } from '@shared/models/product.model';
import { CartService } from '@shared/services/cart.service';
import { ProductService } from '@shared/services/product.service';
import { BannerComponent } from "../../../../components/banner/banner.component";


@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, BannerComponent, ProductComponent],
  templateUrl: './list.component.html'
})

export class ListComponent implements OnInit {

  products$: Observable<Product[]> | undefined;
  private cartService = inject(CartService);
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);


  ngOnInit() {
    this.products$ = this.route.queryParamMap.pipe(
      switchMap(params => {
        const categoryId = params.get('categoryId');
        const query = params.get('q');

        console.log('Router activado. Category ID: de list.componet.ts linea 36', categoryId);

        const filters: { [key: string]: string | undefined } = {};
        if (categoryId) {
          filters['categoryId'] = categoryId;
          //filters['categoryId'] = categoryId;
        }
        if (query) {
          filters['title'] = query;
        }

        // Llamada al servicio
        return this.productService.getProductsPaged(filters, 0, 20);
      }),
      map(pagedResponse => pagedResponse.content)
    );
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }
}
