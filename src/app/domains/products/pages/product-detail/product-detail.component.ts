
import { Component, Input, inject, signal, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
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
// Asegúrate de que implementa AfterViewInit
export default class ProductDetailComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() id?: string;
  product = signal<Product | null>(null);
  cover = signal('');
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  currentIndex = signal(0);
  lightboxVisible = signal(false);

  // --- DOS REFERENCIAS, UNA PARA CADA CONTENEDOR ---
  @ViewChild('imageContainer') mainGalleryContainer!: ElementRef;
  @ViewChild('lightboxContainer') lightboxContainer!: ElementRef;

  // --- DOS INSTANCIAS DE HAMMERJS ---
  private mainHammer: HammerManager | null = null;
  private lightboxHammer: HammerManager | null = null;

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
          }
        })
    }
  }

  // ngAfterViewInit se usa para la galería principal, que siempre está visible
  ngAfterViewInit(): void {
    // Usamos setTimeout para asegurarnos de que el @if se haya renderizado
    setTimeout(() => {
      this.setupMainGalleryHammer();
    }, 0);
  }

  // Nos aseguramos de destruir AMBAS instancias al salir de la página
  ngOnDestroy(): void {
    this.destroyHammer(this.mainHammer);
    this.destroyHammer(this.lightboxHammer);
  }

  // --- LÓGICA DE LA LIGHTBOX ---
  openLightbox(): void {
    if (this.product()?.images && this.product()!.images.length > 0) {
      this.lightboxVisible.set(true);
      // Creamos la instancia de HammerJS para la lightbox
      setTimeout(() => { this.setupLightboxHammer(); }, 0);
    }
  }

  closeLightbox(): void {
    this.lightboxVisible.set(false);
    // Destruimos la instancia de HammerJS de la lightbox al cerrar
    this.lightboxHammer = this.destroyHammer(this.lightboxHammer);
  }

  // --- LÓGICA DE HAMMERJS (REFACTORIZADA Y SEPARADA) ---
  private setupMainGalleryHammer(): void {
    if (this.mainGalleryContainer && this.mainGalleryContainer.nativeElement) {
      console.log('Creando instancia de HammerJS para la Galería Principal...');
      this.mainHammer = this.createHammerInstance(this.mainGalleryContainer.nativeElement);
    }
  }

  private setupLightboxHammer(): void {
    if (this.lightboxContainer && this.lightboxContainer.nativeElement) {
      console.log('Creando instancia de HammerJS para la Lightbox...');
      this.lightboxHammer = this.createHammerInstance(this.lightboxContainer.nativeElement);
    }
  }

  private createHammerInstance(element: HTMLElement): HammerManager {
    const hammerInstance = new Hammer(element);
    hammerInstance.get('swipe').set({ direction: 30 }); // DIRECTION_ALL

    // El swipe a la izquierda te lleva a la siguiente imagen
    hammerInstance.on('swipeleft', () => this.nextImage());
    // El swipe a la derecha te lleva a la imagen anterior
    hammerInstance.on('swiperight', () => this.prevImage());

    return hammerInstance;
  }

  private destroyHammer(hammerInstance: HammerManager | null): null {
    if (hammerInstance) {
      hammerInstance.destroy();
    }
    return null;
  }
//  aqui eloy
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
