import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '@shared/services/product.service';
import { Product } from '@shared/models/product.model';
import { CartService } from '@shared/services/cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule], // No necesitamos GestionImagenesProductoComponent aquí
  templateUrl: './product-detail.component.html'
})
export default class ProductDetailComponent {

  @Input() id?: string;
  product = signal<Product | null>(null);
  cover = signal('');
  private productService = inject(ProductService);
  private cartService = inject(CartService);

  // --- NUEVO: Signal para el índice de la imagen actual ---
  currentIndex = signal(0);

  ngOnInit() {
    if (this.id) {
      this.productService.getOne(this.id)
        .subscribe({
          next: (product) => {
            this.product.set(product);
            if (product.images.length > 0) {
              this.cover.set(product.images[0]);
              this.currentIndex.set(0); // Reiniciamos el índice
            }
          }
        })
    }
  }

  // --- MODIFICADO: Ahora también actualiza el índice ---
  changeCover(newImg: string, index: number): void {
    this.cover.set(newImg);
    this.currentIndex.set(index);
  }

  // --- NUEVO: Función para ir a la siguiente imagen ---
  nextImage(): void {
    const product = this.product();
    if (!product || product.images.length === 0) return;

    const nextIndex = (this.currentIndex() + 1) % product.images.length;
    this.changeCover(product.images[nextIndex], nextIndex);
  }

  // --- NUEVO: Función para ir a la imagen anterior ---
  prevImage(): void {
    const product = this.product();
    if (!product || product.images.length === 0) return;

    const prevIndex = (this.currentIndex() - 1 + product.images.length) % product.images.length;
    this.changeCover(product.images[prevIndex], prevIndex);
  }

  addToCart(): void {
    const product = this.product();
    if (product) {
      this.cartService.addToCart(product);
    }
  }
}
