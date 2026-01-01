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
  DestroyRef,
} from '@angular/core';
import { CommonModule, isPlatformServer, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title, Meta } from '@angular/platform-browser';

import { Product } from '@shared/models/product.model';
import { CartService } from '@shared/services/cart.service';
import { ProductService } from '@shared/services/product.service';
import { AnalyticsService } from '@shared/services/analytics.service';

const PRODUCT_STATE_KEY = makeStateKey<Product>('productData');

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit, OnDestroy, AfterViewInit {

  // --- PROPIEDADES ---
  @Input() id?: string;
  product = signal<Product | null>(null);
  cover = signal('');
  currentIndex = signal(0);
  lightboxVisible = signal(false);

  // --- HAMMERJS & ZOOM ---
  @ViewChild('mainGalleryContainer') mainGalleryContainer!: ElementRef;
  @ViewChild('lightboxContainer') lightboxContainer!: ElementRef;
  private mainHammer: any | null = null;
  private lightboxHammer: any | null = null;
  private HammerJS: any;

  currentScale = signal(1);
  currentX = signal(0);
  currentY = signal(0);
  transformStyle = computed(() => `translate3d(${this.currentX()}px, ${this.currentY()}px, 0) scale(${this.currentScale()})`);

  // --- INYECCIONES ---
  private analyticsService = inject(AnalyticsService);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private transferState = inject(TransferState);
  private platformId = inject(PLATFORM_ID);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  // Variables para lógica de zoom
  private lastScale = 1;
  private lastX = 0;
  private lastY = 0;

  ngOnInit() {
    this.route.data.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(data => {
      const product = data['productData'];
      if (product) {
        this.product.set(product);
        this.initializeComponent(product);
      } else {
        const idFromParams = this.route.snapshot.paramMap.get('id');
        if (idFromParams) this.loadProduct(idFromParams);
      }
    });
  }

  private loadProduct(productId: string): void {
    const cachedProduct = this.transferState.get(PRODUCT_STATE_KEY, null);
    // @ts-ignore
    if (cachedProduct && cachedProduct.id === productId) {
      this.product.set(cachedProduct);
      this.initializeComponent(cachedProduct);
      this.transferState.remove(PRODUCT_STATE_KEY);
    } else {
      this.productService.getOne(productId).subscribe({
        next: (product) => {
          if (isPlatformServer(this.platformId)) {
            this.transferState.set(PRODUCT_STATE_KEY, product);
          }
          this.product.set(product);
          this.initializeComponent(product);
        },
        error: (err) => {
          console.error('Error loading product:', err);
          this.product.set(null);
        }
      });
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
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
    this.analyticsService.trackView('PRODUCT', Number(product.id));
    if (product.images.length > 0) {
      this.cover.set(product.images[0]);
      this.currentIndex.set(0);
    }
    this.updateMetaTags(product);
  }

  // --- CORRECCIÓN AQUÍ: Usamos 'q' ---
  executeInterestSearch(keyword: string): void {
    if (!keyword) return;

    // Cambiamos 'title' por 'q' para coincidir con tu SearchComponent y ListComponent
    this.router.navigate(['/'], {
      queryParams: { q: keyword }
    }).then(() => {
      if (isPlatformBrowser(this.platformId)) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  private updateMetaTags(product: Product): void {
    const pageTitle = `${product.title} - LA TIENDA`;
    const imageUrl = this.cover();
    const url = isPlatformServer(this.platformId)
      ? `https://www.tiendap2p.com/product/${product.id}`
      : window.location.href;

    this.titleService.setTitle(pageTitle);
    this.metaService.updateTag({ property: 'og:title', content: pageTitle });
    this.metaService.updateTag({ property: 'og:image', content: imageUrl });
    this.metaService.updateTag({ property: 'og:url', content: url });
    this.metaService.updateTag({ name: 'description', content: product.description });
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.destroyHammer(this.mainHammer);
      this.destroyHammer(this.lightboxHammer);
    }
  }

  // --- Funciones de Galería y Lightbox ---

  openLightbox(): void {
    this.lightboxVisible.set(true);
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => { this.setupLightboxHammer(); }, 0);
    }
  }

  closeLightbox(): void {
    this.lightboxVisible.set(false);
    this.resetZoom();
  }

  shareOnWhatsApp(): void {
    if (isPlatformBrowser(this.platformId)) {
      const product = this.product();
      if (!product) return;

      const title = `*${product.title}*`;
      const url = window.location.href;
      const message = `${title}\n\n¡Ver Precio y Más Productos Aquí! 👇\n${url}`;
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
    }
  }

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
    if (product) this.cartService.addToCart(product);
  }

  // --- HammerJS Config ---

  private setupMainGalleryHammer(): void {
    if (isPlatformBrowser(this.platformId) && this.HammerJS && this.mainGalleryContainer?.nativeElement) {
      this.mainHammer = this.createHammerInstance(this.mainGalleryContainer.nativeElement, false);
    }
  }

  private setupLightboxHammer(): void {
    if (isPlatformBrowser(this.platformId) && this.HammerJS && this.lightboxContainer?.nativeElement) {
      this.lightboxHammer = this.createHammerInstance(this.lightboxContainer.nativeElement, true);
    }
  }

  private createHammerInstance(element: HTMLElement, enablePinch: boolean): any {
    if (!this.HammerJS) return null;
    const hammerInstance = new this.HammerJS(element);

    hammerInstance.get('swipe').set({ direction: 30 }); // All directions

    if (enablePinch) {
      hammerInstance.get('pinch').set({ enable: true });
      hammerInstance.on('pinchstart pinchmove pinchend', (event: any) => this.handlePinch(event));
    }

    hammerInstance.on('swipeleft', () => { this.nextImage(); });
    hammerInstance.on('swiperight', () => { this.prevImage(); });

    return hammerInstance;
  }

  private destroyHammer(hammerInstance: any | null): null {
    if (hammerInstance) hammerInstance.destroy();
    return null;
  }

  // --- Zoom Logic Simplificada ---
  handlePinch(event: any): void {
    if (event.type === 'pinchstart') {
      this.lastScale = this.currentScale() || 1;
    }
    const newScale = Math.max(1, Math.min(this.lastScale * event.scale, 4));
    this.currentScale.set(newScale);
  }

  resetZoom(): void {
    this.currentScale.set(1);
    this.currentX.set(0);
    this.currentY.set(0);
    this.lastScale = 1;
  }
}
