import { Component, Input, inject, signal, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '@shared/services/product.service';
import { Product } from '@shared/models/product.model';
import { CartService } from '@shared/services/cart.service';
import Hammer from 'hammerjs';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.component.html'
})
// Ya no necesitamos AfterViewInit aquí, solo OnInit y OnDestroy
export default class ProductDetailComponent implements OnInit, OnDestroy {

  @Input() id?: string;
  product = signal<Product | null>(null);
  cover = signal('');
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  currentIndex = signal(0);

  @ViewChild('imageContainer') imageContainer!: ElementRef;
  private hammerManager: HammerManager | null = null;

  ngOnInit() {
    if (this.id) {
      this.productService.getOne(this.id)
        .subscribe({
          next: (product) => {
            this.product.set(product);
            if (product.images.length > 0) {
              this.cover.set(product.images[0]);
              this.currentIndex.set(0);
            }

            // --- ¡LA SOLUCIÓN! ---
            // Esperamos un instante para que Angular renderice el @if
            // y luego inicializamos HammerJS.
            setTimeout(() => {
              this.setupHammer();
            }, 0);
          }
        })
    }
  }

  // --- NUEVO: Función helper para configurar HammerJS ---
  setupHammer(): void {
    // Verificamos si el contenedor de imagen existe en el DOM
    if (this.imageContainer && this.imageContainer.nativeElement) {
      console.log('¡Contenedor de imagen encontrado! Creando instancia de HammerJS...');
      this.hammerManager = new Hammer(this.imageContainer.nativeElement);
      this.hammerManager.get('swipe').set({ direction: 30 }); // DIRECTION_ALL

     // this.hammerManager.on('swipeleft', () => this.nextImage());
     // this.hammerManager.on('swiperight', () => this.prevImage());
       // this.hammerManager.on('swipeleft', () => this.prevImage());
      //this.hammerManager.on('swiperight', () => this.nextImage());

      this.hammerManager.on('swipeleft', () => {
        console.log('SWIPE IZQUIERDA --> Llamando a nextImage()');
        this.prevImage();

      });

      this.hammerManager.on('swiperight', () => {
        console.log('SWIPE DERECHA --> Llamando a prevImage()');
        this.nextImage();
      });

    } else {
      console.error('Error: El contenedor de la imagen no se encontró en el DOM al intentar inicializar HammerJS.');
    }
  }

  ngOnDestroy(): void {
    // La limpieza se mantiene igual, es una buena práctica
    if (this.hammerManager) {
      this.hammerManager.destroy();
    }
  }

  // ... (el resto de tus funciones no necesitan cambios) ...
  changeCover(newImg: string, index: number): void {
    this.cover.set(newImg);
    this.currentIndex.set(index);
  }

  nextImage(): void {
    const product = this.product();
    if (!product || product.images.length === 0) return;
    const nextIndex = (this.currentIndex() + 1) % product.images.length;
    this.changeCover(product.images[nextIndex], nextIndex);
  }

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

  shareOnWhatsApp(): void {
    const product = this.product();
    const imageUrl = this.cover();
    if (!product) { return; }
    const message = `¡Mira este increíble producto!\n\n*${product.title}*\nSKU: ${product.slug}\n\nPuedes verlo aquí:\n${window.location.href}\n\nImagen:\n${imageUrl}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  }
}
