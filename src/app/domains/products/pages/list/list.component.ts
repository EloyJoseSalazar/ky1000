import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLinkWithHref } from '@angular/router'; // <-- Importar ActivatedRoute
import { ProductComponent } from '@products/components/product/product.component';
import { Product } from '@shared/models/product.model';
import { CartService } from '@shared/services/cart.service';
import { ProductService } from '@shared/services/product.service';
import { Observable, switchMap } from 'rxjs';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, ProductComponent],
  templateUrl: './list.component.html'
})
export  class ListComponent {

  products$: Observable<Product[]>;
  private cartService = inject(CartService);
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute); // <-- Inyectamos ActivatedRoute

  // ELIMINAMOS @Input y ngOnChanges, ahora todo se basa en la URL.

  constructor() {
    // Creamos un stream que reacciona a los cambios en los query params de la URL
    this.products$ = this.route.queryParamMap.pipe(
      switchMap(params => {
        const categoryId = params.get('category_id');
        const query = params.get('q'); // 'q' es el parámetro que definimos en search.component
        // Llamamos al servicio con los valores de la URL
        return this.productService.getProducts(categoryId ?? undefined, query ?? undefined);
      })
    );
  }

  // ngOnInit y ngOnChanges ya no son necesarios para esta lógica

  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }
}
