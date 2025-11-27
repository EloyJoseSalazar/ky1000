
// src/app/domains/products/pages/product-detail/product-detail.component.ts

import {
  Component,
  Input,
  inject,
  signal,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  computed,
  PLATFORM_ID,
  makeStateKey,
  TransferState,
  AfterViewInit,
  DestroyRef, // <-- Nueva importación
} from '@angular/core';

import { CommonModule, isPlatformServer, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router'; // <-- Nueva importación
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'; // <-- Nueva importación

import { Product } from '@shared/models/product.model';
import { CartService } from '@shared/services/cart.service';
// import Hammer from 'hammerjs'; // <-- COMENTA O ELIMINA ESTA LÍNEA (ya lo hicimos)

import { Title, Meta } from '@angular/platform-browser';
import { ProductService } from '@shared/services/product.service';

const PRODUCT_STATE_KEY = makeStateKey<Product>('productData');

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent implements OnInit, OnDestroy, AfterViewInit {
  // --- PROPIEDADES EXISTENTES ---
  @Input() id?: string;
  product = signal<Product | null>(null);
  cover = signal('');
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  currentIndex = signal(0);
  lightboxVisible = signal(false);

  // --- LÓGICA DE HAMMERJS ---
  @ViewChild('mainGalleryContainer') mainGalleryContainer!: ElementRef;
  @ViewChild('lightboxContainer') lightboxContainer!: ElementRef;
  private mainHammer: any | null = null; // Usamos 'any' por la carga dinámica
  private lightboxHammer: any | null = null; // Usamos 'any' por la carga dinámica
  private HammerJS: any; // Para almacenar la librería importada dinámicamente

  // --- NUEVO: SIGNALS PARA EL ESTADO DEL ZOOM ---
  currentScale = signal(1);
  currentX = signal(0);
  currentY = signal(0);
  transformStyle = computed(() => `translate3d(${this.currentX()}px, ${this.currentY()}px, 0) scale(${this.currentScale()})`);

  // --- INYECCIONES (CON LAS NUEVAS Y LAS EXISTENTES) ---
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private transferState = inject(TransferState);
  private platformId = inject(PLATFORM_ID);
  private route = inject(ActivatedRoute); // <-- Inyección de ActivatedRoute
  private destroyRef = inject(DestroyRef); // <-- Inyección de DestroyRef

  ngOnInit() {
    this.route.data.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(data => {
      const product = data['productData'];

      if (product) {
        // ¡ÉXITO! Datos traídos por la red interna
        this.product.set(product);
        this.initializeComponent(product);
        this.updateMetaTags(product);
      } else {
        // Fallback por si acaso
        const idFromParams = this.route.snapshot.paramMap.get('id');
        if (idFromParams) this.loadProduct(idFromParams);
      }
    });
  }

  // Nueva función para cargar el producto, que incluye la lógica de TransferState y el servicio.
  private loadProduct(productId: string): void {
    const cachedProduct = this.transferState.get(PRODUCT_STATE_KEY, null);

    // Si hay un producto en caché Y es el producto que estamos buscando actualmente
    // @ts-ignore
    if (cachedProduct && cachedProduct.id === productId) {
      this.product.set(cachedProduct);
      this.initializeComponent(cachedProduct);
      // Una vez que usamos el estado, lo removemos para que no se use incorrectamente en futuras navegaciones
      // a menos que sea específicamente para el mismo producto que está en caché.
      this.transferState.remove(PRODUCT_STATE_KEY);
    } else {
      // Si no hay caché o no es el producto correcto, cargar desde el servicio
      this.productService.getOne(productId).subscribe({
        next: (product) => {
          // Si estamos en el servidor, guardamos el producto en TransferState
          if (isPlatformServer(this.platformId)) {
            this.transferState.set(PRODUCT_STATE_KEY, product);
          }
          this.product.set(product);
          this.initializeComponent(product);
        },
        error: (err) => {
          console.error('Error loading product:', err);
          // Aquí podrías manejar el error, por ejemplo, mostrando un mensaje
          // o redirigiendo a una página de "producto no encontrado".
          this.product.set(null); // Asegúrate de que el producto sea null en caso de error
        }
      });
    }
  }


  ngAfterViewInit(): void {
    // ¡PROTECCIÓN! Solo ejecutamos la inicialización de HammerJS si estamos en un NAVEGADOR.
    if (isPlatformBrowser(this.platformId)) {
      // Importa Hammer.js dinámicamente solo en el navegador
      import('hammerjs')
        .then((module) => {
          this.HammerJS = module.default;
          setTimeout(() => {
            this.setupMainGalleryHammer();
          }, 0);
        })
        .catch((err) => console.error('Error loading Hammer.js:', err));
    }
  }

  private initializeComponent(product: Product): void {
    if (product.images.length > 0) {
      this.cover.set(product.images[0]);
      this.currentIndex.set(0);
    }
    this.updateMetaTags(product); // Descomentado si lo quieres activo
  }

  private updateMetaTags(product: Product): void {
    const pageTitle = `${product.title} - LA TIENDA`;
    const imageUrl = this.cover();

    const url = isPlatformServer(this.platformId)
      ? `https://www.tiendap2p.com/product/${product.id}` // Asegúrate de que este dominio sea correcto
      : window.location.href;

    this.titleService.setTitle(pageTitle); // También actualiza el título directamente
    this.metaService.updateTag({ property: 'og:title', content: pageTitle });
    this.metaService.updateTag({ property: 'og:image', content: imageUrl });
    this.metaService.updateTag({ property: 'og:url', content: url });
    this.metaService.updateTag({ name: 'description', content: product.description }); // Opcional: añadir descripción
  }

  ngOnDestroy(): void {
    // La desuscripción de route.params ya está manejada por takeUntilDestroyed
    if (isPlatformBrowser(this.platformId)) {
      this.destroyHammer(this.mainHammer);
      this.destroyHammer(this.lightboxHammer);
    }
  }

  openLightbox(): void {
    this.lightboxVisible.set(true);
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => { this.setupLightboxHammer(); }, 0);
    }
  }

  shareOnWhatsApp(): void {
    if (isPlatformBrowser(this.platformId)) {
      const product = this.product();
      if (!product) return;

      this.updateMetaTags(product); // Asegúrate de que las meta tags estén actualizadas con el producto actual
      const title = `*${product.title}*`;
      const url = window.location.href;
      const message = `${title}\n\n¡Échale un vistazo aquí! 👇\n${url}`;
     // const message = `${title}`;
      const encodedMessage = encodeURIComponent(message);
       const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
    }
  }

  closeLightbox(): void {
    this.lightboxVisible.set(false);
    this.resetZoom();
  }

  private setupMainGalleryHammer(): void {
    if (isPlatformBrowser(this.platformId) && this.HammerJS && this.mainGalleryContainer?.nativeElement) {
      console.log('[ESPÍA] ¡ÉXITO! #mainGalleryContainer encontrado. Creando instancia...');
      this.mainHammer = this.createHammerInstance(this.mainGalleryContainer.nativeElement, false, 'Galería Principal');
    } else if (!isPlatformBrowser(this.platformId)) {
      console.log('[ESPÍA] setupMainGalleryHammer: No en el navegador, omitiendo HammerJS.');
    } else {
      console.error('[ESPÍA] ¡FALLO! #mainGalleryContainer NO encontrado o HammerJS no cargado.');
    }
  }

  private setupLightboxHammer(): void {
    if (isPlatformBrowser(this.platformId) && this.HammerJS && this.lightboxContainer?.nativeElement) {
      console.log('[ESPÍA] ¡ÉXITO! #lightboxContainer encontrado. Creando instancia...');
      this.lightboxHammer = this.createHammerInstance(this.lightboxContainer.nativeElement, true, 'Lightbox');
    } else if (!isPlatformBrowser(this.platformId)) {
      console.log('[ESPÍA] setupLightboxHammer: No en el navegador, omitiendo HammerJS.');
    } else {
      console.error('[ESPÍA] ¡FALLO! #lightboxContainer NO encontrado o HammerJS no cargado.');
    }
  }

  private createHammerInstance(element: HTMLElement, enablePinch: boolean, source: string): any {
    if (!this.HammerJS) {
      console.error('Hammer.js no está disponible. No se puede crear la instancia.');
      return null;
    }
    const hammerInstance = new this.HammerJS(element);
    hammerInstance.get('swipe').set({ direction: 30 });

    if (enablePinch) {
      hammerInstance.get('pinch').set({ enable: true });
      hammerInstance.get('doubletap').set({ taps: 2 });
      hammerInstance.on('pinchstart pinchmove pinchend doubletap', (event: any) => this.handlePinch(event));
    }

    hammerInstance.on('swipeleft', () => {
      this.nextImage();
    });
    hammerInstance.on('swiperight', () => {
      this.prevImage();
    });

    return hammerInstance;
  }

  private destroyHammer(hammerInstance: any | null): null {
    if (hammerInstance) {
      hammerInstance.destroy();
      console.log(`[ESPÍA] Destruyendo instancia de HammerJS.`);
    }
    return null;
  }

  private lastScale = 1;
  private lastX = 0;
  private lastY = 0;

  handlePinch(event: any): void { // Usamos 'any' para el tipo de evento de Hammer
    /*
    // Descomenta y ajusta si la lógica de pinch está en un estado deseado
    switch(event.type) {
        case 'pinchstart':
          this.lastScale = this.currentScale();
          this.lastX = this.currentX();
          this.lastY = this.currentY();
          break;
        case 'pinchmove':
          this.currentScale.set(this.lastScale * event.scale);
          this.currentX.set(this.lastX + event.deltaX);
          this.currentY.set(this.lastY + event.deltaY);
          break;
        case 'pinchend':
          this.lastScale = this.currentScale();
          this.lastX = this.currentX();
          this.lastY = this.currentY();
          break;
        case 'doubletap':
          this.resetZoom();
          break;
    }
    */
  }

  resetZoom(): void {
    this.currentScale.set(1);
    this.currentX.set(0);
    this.currentY.set(0);
    this.lastScale = 1;
    this.lastX = 0;
    this.lastY = 0;
  }

  changeCover(newImg: string, index: number): void {
    this.cover.set(newImg);
    this.currentIndex.set(index);

    const product = this.product();
    if (product) {
      this.updateMetaTags(product);
    }
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
}
