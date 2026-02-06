import { Component, inject, OnDestroy, OnInit, signal, ElementRef, ViewChild, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common'; // <--- IMPORTANTE
import { Router } from '@angular/router';
import { BannerService } from '../../domains/shared/services/banner.service';
import { Banner } from '../../domains/shared/models/banner.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.css'
})
export class BannerComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('slidesContainer') slidesContainer!: ElementRef<HTMLDivElement>;

  private bannerService = inject(BannerService);
  private router = inject(Router);

  // INYECCIÓN MANUAL DE PLATFORM_ID (Necesaria para saber si es navegador)
  private platformId = inject(PLATFORM_ID);

  banners = signal<Banner[]>([]);
  isLoading = signal<boolean>(true);
  currentIndex = signal<number>(0);

  private intervalId: any;
  private readonly SCROLL_INTERVAL = 6000; // 6 segundos

  ngOnInit(): void {
    this.loadBanners();
  }

  ngAfterViewInit(): void {
    // 🛡️ SOLUCIÓN: Solo iniciamos el movimiento si estamos en el NAVEGADOR.
    // El servidor se queda quieto.
    if (isPlatformBrowser(this.platformId)) {
      this.startAutoScroll();
    }
  }

  ngOnDestroy(): void {
    // También protegemos esto por buenas prácticas
    if (isPlatformBrowser(this.platformId)) {
      this.stopAutoScroll();
    }
  }

  private loadBanners(): void {
    this.isLoading.set(true);
    this.bannerService.getActiveBanners()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => this.banners.set(data),
        error: (err) => console.error('Error fetching banners:', err)
      });
  }

  private startAutoScroll(): void {
    // Doble chequeo de seguridad
    if (!isPlatformBrowser(this.platformId)) return;

    this.stopAutoScroll();
    this.intervalId = setInterval(() => {
      this.scrollNext();
    }, this.SCROLL_INTERVAL);
  }

  private stopAutoScroll(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  scrollNext(): void {
    // Protección extra: Si por alguna razón se llama en el servidor, no hacemos nada
    if (!isPlatformBrowser(this.platformId)) return;

    if (!this.slidesContainer) return; // Validación extra

    const container = this.slidesContainer.nativeElement;
    const slideWidth = container.clientWidth;
    let newIndex = this.currentIndex() + 1;

    if (newIndex >= this.banners().length) {
      newIndex = 0;
      container.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: slideWidth, behavior: 'smooth' });
    }
    this.currentIndex.set(newIndex);
  }

  scrollPrev(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.slidesContainer) return;

    const container = this.slidesContainer.nativeElement;
    const slideWidth = container.clientWidth;
    let newIndex = this.currentIndex() - 1;

    if (newIndex < 0) {
      newIndex = this.banners().length - 1;
      container.scrollTo({ left: slideWidth * newIndex, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: -slideWidth, behavior: 'smooth' });
    }
    this.currentIndex.set(newIndex);
  }

  manualScroll(direction: 'prev' | 'next'): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.stopAutoScroll();
    direction === 'prev' ? this.scrollPrev() : this.scrollNext();
    this.startAutoScroll();
  }

  onBannerClick(banner: Banner): void {
    console.log('Banner clicked:', banner);

    // Tu lógica de navegación...
    switch (banner.linkType) {
      // ...
    }
  }
}
