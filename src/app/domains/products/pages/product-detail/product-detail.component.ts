import { Component, Input, inject, signal, OnInit, OnDestroy, ViewChild, ElementRef, computed, PLATFORM_ID, makeStateKey, TransferState, AfterViewInit } from '@angular/core';
import { CommonModule, isPlatformServer, isPlatformBrowser } from '@angular/common'; // <-- Añade isPlatformBrowser
import { Product } from '@shared/models/product.model';
import { CartService } from '@shared/services/cart.service';
import Hammer from 'hammerjs';
import { Title, Meta } from '@angular/platform-browser';
import { ProductService } from '@shared/services/product.service';
//import { PLATFORM_ID, makeStateKey, TransferState } from '@angular/core';
//import { isPlatformServer } from '@angular/common';

const PRODUCT_STATE_KEY = makeStateKey<Product>('productData');

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.component.html'
})
export default class ProductDetailComponent implements OnInit, OnDestroy {

  // --- PROPIEDADES EXISTENTES ---
  @Input() id?: string;
  product = signal<Product | null>(null);
  cover = signal('');
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  currentIndex = signal(0);
  lightboxVisible = signal(false);

  // --- LÓGICA DE HAMMERJS ---
  //@ViewChild('mainGalleryContainer') mainGalleryContainer!: ElementRef;
  //@ViewChild('lightboxContainer') lightboxContainer!: ElementRef;
  //private mainHammer: HammerManager | null = null;
  //private lightboxHammer: HammerManager | null = null;

  // --- NUEVO: SIGNALS PARA EL ESTADO DEL ZOOM ---
  currentScale = signal(1);
  currentX = signal(0);
  currentY = signal(0);
  // Un signal "computado" que genera el string del estilo CSS automáticamente
  transformStyle = computed(() => `translate3d(${this.currentX()}px, ${this.currentY()}px, 0) scale(${this.currentScale()})`);
  // --- FIN DE LA LÓGICA DE ZOOM ---

  // --- INYECCIONES (CON LAS NUEVAS) ---
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private transferState = inject(TransferState);
  private platformId = inject(PLATFORM_ID);


  ngOnInit() {
    if (this.id) {
      const cachedProduct = this.transferState.get(PRODUCT_STATE_KEY, null);
      if (cachedProduct) {
        this.product.set(cachedProduct);
        this.initializeComponent(cachedProduct);
      } else {
        this.productService.getOne(this.id).subscribe({
          next: (product) => {
            if (isPlatformServer(this.platformId)) {
              this.transferState.set(PRODUCT_STATE_KEY, product);
            }
            this.product.set(product);
            this.initializeComponent(product);
          }
        });
      }
    }
  }

  ngAfterViewInit(): void {
    // ¡PROTECCIÓN! Solo ejecutamos la inicialización de HammerJS si estamos en un NAVEGADOR.
    if (isPlatformBrowser(this.platformId)) {
    //  setTimeout(() => { this.setupMainGalleryHammer(); }, 0);
    }
  }

  private initializeComponent(product: Product): void {
    if (product.images.length > 0) {
      this.cover.set(product.images[0]);
      this.currentIndex.set(0);
    }
    this.updateMetaTags(product);
  }

  private updateMetaTags(product: Product): void {
    const pageTitle = `${product.title} - LA TIENDA`;
    const imageUrl = this.cover();

    // La comprobación aquí es crucial y ya la tenías, ¡perfecto!
    const url = isPlatformServer(this.platformId)
      ? `https://nuestratienda.systemash.com/product/${product.id}`
      : window.location.href;

    this.metaService.updateTag({ property: 'og:title', content: pageTitle });
    this.metaService.updateTag({ property: 'og:image', content: imageUrl });
    this.metaService.updateTag({ property: 'og:url', content: url });
    // ...
  }

  ngOnDestroy(): void {
    // ¡PROTECCIÓN! Solo intentamos destruir las instancias si estamos en un NAVEGADOR.
    if (isPlatformBrowser(this.platformId)) {
     // this.destroyHammer(this.mainHammer);
     // this.destroyHammer(this.lightboxHammer);
    }
  }

  openLightbox(): void {
    this.lightboxVisible.set(true);
    // ¡PROTECCIÓN! Solo activamos HammerJS para la lightbox si estamos en un NAVEGADOR.
    if (isPlatformBrowser(this.platformId)) {
      //setTimeout(() => { this.setupLightboxHammer(); }, 0);
    }
  }

  shareOnWhatsApp(): void {
    // ¡PROTECCIÓN! Esta función solo tiene sentido en el navegador.
    if (isPlatformBrowser(this.platformId)) {
      const product = this.product();
      if (!product) return;

      this.updateMetaTags(product);
      const title = `*${product.title}*`;
      const url = window.location.href; // Seguro usar 'window' aquí
      const message = `${title}\n\n¡Échale un vistazo aquí! 👇\n${url}`;
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
    }
  }
  //---eloy


  closeLightbox(): void {
    console.log('[ESPÍA] closeLightbox: Cerrando lightbox...');
    this.lightboxVisible.set(false);
    //this.lightboxHammer = this.destroyHammer(this.lightboxHammer);
    // Reseteamos el zoom al cerrar
    this.resetZoom();
  }

  /*
  // --- LÓGICA DE HAMMERJS ---
  private setupMainGalleryHammer(): void {
    console.log('[ESPÍA] setupMainGalleryHammer: Intentando configurar Hammer para la galería principal...');
    if (this.mainGalleryContainer && this.mainGalleryContainer.nativeElement) {
      console.log('%c[ESPÍA] ¡ÉXITO! #mainGalleryContainer encontrado. Creando instancia...', 'color: green; font-weight: bold;');
      this.mainHammer = this.createHammerInstance(this.mainGalleryContainer.nativeElement, false, 'Galería Principal');
    } else {
      console.error('%c[ESPÍA] ¡FALLO! #mainGalleryContainer NO encontrado en el DOM.', 'color: red; font-weight: bold;');
    }
  }

  private setupLightboxHammer(): void {
    console.log('[ESPÍA] setupLightboxHammer: Intentando configurar Hammer para la lightbox...');
    if (this.lightboxContainer && this.lightboxContainer.nativeElement) {
      console.log('%c[ESPÍA] ¡ÉXITO! #lightboxContainer encontrado. Creando instancia...', 'color: green; font-weight: bold;');
      this.lightboxHammer = this.createHammerInstance(this.lightboxContainer.nativeElement, true, 'Lightbox');
    } else {
      console.error('%c[ESPÍA] ¡FALLO! #lightboxContainer NO encontrado en el DOM.', 'color: red; font-weight: bold;');
    }
  }

  */
  private createHammerInstance(element: HTMLElement, enablePinch: boolean, source: string): HammerManager {
    const hammerInstance = new Hammer(element);
    hammerInstance.get('swipe').set({ direction: 30 });

    if (enablePinch) {
      hammerInstance.get('pinch').set({ enable: true });
      hammerInstance.get('doubletap').set({ taps: 2 });
      hammerInstance.on('pinchstart pinchmove pinchend doubletap', (event) => this.handlePinch(event));
    }

    hammerInstance.on('swipeleft', () => {
      console.log(`[ESPÍA] Evento detectado: SWIPE IZQUIERDA en ${source}`);
      this.nextImage();
    });
    hammerInstance.on('swiperight', () => {
      console.log(`[ESPÍA] Evento detectado: SWIPE DERECHA en ${source}`);
      this.prevImage();
    });
    return hammerInstance;
  }


  private destroyHammer(hammerInstance: HammerManager | null): null {
    if (hammerInstance) hammerInstance.destroy();
    console.log(`[ESPÍA] Destruyendo instancia de HammerJS para `);
    return null;
  }

  // --- NUEVA FUNCIÓN PARA MANEJAR EL ZOOM ---
  private lastScale = 1;
  private lastX = 0;
  private lastY = 0;

  handlePinch(event: HammerInput): void {
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
        // Guardamos el estado final para el próximo pinch
        this.lastScale = this.currentScale();
        this.lastX = this.currentX();
        this.lastY = this.currentY();
        break;
      case 'doubletap':
        this.resetZoom();
        break;
    }
  }

  resetZoom(): void {
    this.currentScale.set(1);
    this.currentX.set(0);
    this.currentY.set(0);
    this.lastScale = 1;
    this.lastX = 0;
    this.lastY = 0;
  }
  // --- FIN DE LA LÓGICA DE ZOOM ---


  // --- changeCover (CORREGIDA) ---
  changeCover(newImg: string, index: number): void {
    this.cover.set(newImg);
    this.currentIndex.set(index);

    const product = this.product();
    if (product) {
      // Actualizamos las meta tags cada vez que el usuario cambia la imagen
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

