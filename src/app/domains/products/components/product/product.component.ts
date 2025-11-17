//src/app/domains/products/components/product/product.component.ts


// --- CAMBIO 1: Importar OnChanges y SimpleChanges ---
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '@shared/models/product.model';
import { RouterLinkWithHref } from '@angular/router';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule,
    RouterLinkWithHref],
  templateUrl: './product.component.html'
})

// --- CAMBIO 2: Implementar OnChanges ---
export class ProductComponent implements OnChanges {

  @Input({ required: true }) product!: Product;
  @Output() addToCart = new EventEmitter<Product>();

  // --- CAMBIO 3: Añadir propiedades para el precio ---
  public priceDollars: string = '0';
  public priceCents: string = '00';

  // --- CAMBIO 4: Añadir el método ngOnChanges ---
  ngOnChanges(changes: SimpleChanges): void {

    // --- ¡CORRECCIÓN TS4111 AQUÍ! ---
    // Usamos changes['product'] en lugar de changes.product
    if (changes['product'] && this.product) {
      const priceStr = this.product.price.toFixed(2);
      const parts = priceStr.split('.');
      this.priceDollars = parts[0];
      this.priceCents = parts[1];
    }
  }

  onAddToCart() {
    this.addToCart.emit(this.product);
  }
}
