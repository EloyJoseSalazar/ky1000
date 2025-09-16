
import {Component,Input,inject,signal,OnInit,OnDestroy,ViewChild,ElementRef,computed,PLATFORM_ID,
  makeStateKey,
  TransferState,
  AfterViewInit,
} from '@angular/core';

import { CommonModule, isPlatformServer, isPlatformBrowser } from '@angular/common';

import { Product } from '@shared/models/product.model';
import { CartService } from '@shared/services/cart.service';
// import Hammer from 'hammerjs'; // <-- COMENTA O ELIMINA ESTA LÍNEA

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


  //  HammerManager como tipo, pero inicializa a null
  @ViewChild('mainGalleryContainer') mainGalleryContainer!: ElementRef;
  @ViewChild('lightboxContainer') lightboxContainer!: ElementRef;
  private mainHammer: any | null = null; // Usa 'any' si tienes problemas con el tipo HammerManager
  private lightboxHammer: any | null = null; // o define una interfaz para HammerManager si es posible
  private HammerJS: any; // Para almacenar la librería importada dinámicamente

// --- NUEVO: SIGNALS PARA EL ESTADO DEL ZOOM ---
  currentScale = signal(1);
  currentX = signal(0);
  currentY = signal(0);
  transformStyle = computed(() => `translate3d(${this.currentX()}px, ${this.currentY()}px, 0) scale(${this.currentScale()})`);


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
          },
        });
      }
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Importa Hammer.js dinámicamente solo en el navegador
      import('hammerjs')
        .then((module) => {
          this.HammerJS = module.default; // Guarda la referencia al constructor de Hammer
          setTimeout(() => {
            this.setupMainGalleryHammer();
          }, 0); // La setTimeout es una buena práctica para asegurar que el DOM esté listo.
        })
        .catch((err) => console.error('Error loading Hammer.js:', err));
    }
  }


  private initializeComponent(product: Product): void {
    if (product.images.length > 0) {
      this.cover.set(product.images[0]);
      this.currentIndex.set(0);
    }
   // s22 this.updateMetaTags(product);
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

  }


  openLightbox(): void {
    this.lightboxVisible.set(true);
    // ¡PROTECCIÓN! Solo activamos HammerJS para la lightbox si estamos en un NAVEGADOR.
    if (isPlatformBrowser(this.platformId)) {
       setTimeout(() => { this.setupLightboxHammer(); }, 0); //22
    }
  }

  shareOnWhatsApp(): void {


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



  closeLightbox(): void {
   // console.log('[ESPÍA] closeLightbox: Cerrando lightbox...');
     this.lightboxVisible.set(false);
    //this.lightboxHammer = this.destroyHammer(this.lightboxHammer);
    // Reseteamos el zoom al cerrar
      this.resetZoom();
  }


// Modifica setupMainGalleryHammer
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

  // Modifica setupLightboxHammer
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


  // Modifica createHammerInstance para usar this.HammerJS
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

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.destroyHammer(this.mainHammer);
      this.destroyHammer(this.lightboxHammer);
    }
  }

  private destroyHammer(hammerInstance: any | null): null {
    if (hammerInstance) {
      hammerInstance.destroy();
      console.log(`[ESPÍA] Destruyendo instancia de HammerJS.`);
    }
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

