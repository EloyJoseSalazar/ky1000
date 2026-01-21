//src/app/domains/products/components/product/product.component.ts

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '@shared/models/product.model';
import { RouterLink } from '@angular/router'; // O RouterLinkWithHref según tu versión
import { CalculoPrecioPipe } from '@shared/pipes/calculo-precio.pipe';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink, // O RouterLinkWithHref
    CalculoPrecioPipe
  ],
  templateUrl: './product.component.html'
})
export class ProductComponent {

  @Input({ required: true }) product!: Product;
  @Output() addToCart = new EventEmitter<Product>();



  onAddToCart() {
    this.addToCart.emit(this.product);
  }
}
