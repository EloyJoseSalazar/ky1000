
import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, UpperCasePipe } from '@angular/common';
import { ProductService } from '@shared/services/product.service';
import { Product } from '@shared/models/product.model';
import { CartService } from '@shared/services/cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  // Asegúrate de que los pipes que usas en la plantilla estén aquí
  imports: [CommonModule, CurrencyPipe, UpperCasePipe],
  templateUrl: './product-detail.component.html'
})
export default class ProductDetailComponent {

  @Input() id?: string;
  product = signal<Product | null>(null);
  cover = signal('');

  // --- NUEVO SIGNAL PARA EL ÍNDICE ---
  currentIndex = signal(0);

  private productService = inject(ProductService);
  private cartService = inject(CartService);

  ngOnInit() {
    if (this.id) {
      this.productService.getOne(this.id)
        .subscribe({
          next: (product) => {
            this.product.set(product);
            if (product.images.length > 0) {
              this.cover.set(product.images[0]);
              this.currentIndex.set(0); // Inicializamos el índice
            }
          }
        })
    }
  }

  // --- MÉTODO MODIFICADO ---
  // Ahora también actualiza el índice al hacer clic en una miniatura
  changeCover(newImg: string, index: number) {
    this.cover.set(newImg);
    this.currentIndex.set(index);
  }

  // --- NUEVOS MÉTODOS PARA LAS FLECHAS ---
  nextImage() {
    const product = this.product();
    if (!product) return;

    let nextIndex = this.currentIndex() + 1;
    // Si llegamos al final, volvemos al principio (loop)
    if (nextIndex >= product.images.length) {
      nextIndex = 0;
    }
    this.changeCover(product.images[nextIndex], nextIndex);
  }

  prevImage() {
    const product = this.product();
    if (!product) return;

    let prevIndex = this.currentIndex() - 1;
    // Si estamos en el principio, vamos al final (loop)
    if (prevIndex < 0) {
      prevIndex = product.images.length - 1;
    }
    this.changeCover(product.images[prevIndex], prevIndex);
  }

  addToCart() {
    const product = this.product();
    if (product) {
      this.cartService.addToCart(product);
    }
  }
}

