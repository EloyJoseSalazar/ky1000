// src/app/components/banner/banner.component.ts
import { Component, inject, OnDestroy, OnInit, signal, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  banners = signal<Banner[]>([]);
  isLoading = signal<boolean>(true);
  currentIndex = signal<number>(0);

  private intervalId: any;
  private readonly SCROLL_INTERVAL = 3000; // 3 segundos

  ngOnInit(): void {
    this.loadBanners();
  }

  ngAfterViewInit(): void {
    this.startAutoScroll();
  }

  ngOnDestroy(): void {
    this.stopAutoScroll(); // Muy importante para evitar memory leaks
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
    this.stopAutoScroll(); // Limpia cualquier intervalo anterior
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
    const container = this.slidesContainer.nativeElement;
    const slideWidth = container.clientWidth;
    let newIndex = this.currentIndex() + 1;

    if (newIndex >= this.banners().length) {
      newIndex = 0; // Vuelve al inicio
      container.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: slideWidth, behavior: 'smooth' });
    }
    this.currentIndex.set(newIndex);
  }

  scrollPrev(): void {
    const container = this.slidesContainer.nativeElement;
    const slideWidth = container.clientWidth;
    let newIndex = this.currentIndex() - 1;

    if (newIndex < 0) {
      newIndex = this.banners().length - 1; // Va al final
      container.scrollTo({ left: slideWidth * newIndex, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: -slideWidth, behavior: 'smooth' });
    }
    this.currentIndex.set(newIndex);
  }

  // Reinicia el auto-scroll si el usuario navega manualmente
  manualScroll(direction: 'prev' | 'next'): void {
    this.stopAutoScroll();
    direction === 'prev' ? this.scrollPrev() : this.scrollNext();
    this.startAutoScroll();
  }

  // Maneja el clic en un banner
  onBannerClick(banner: Banner): void {
    console.log('Banner clicked:', banner);
    switch (banner.linkType) {
      case 'CATEGORY':
        // Asume que tienes una ruta /products que acepta un queryParam 'category'
        this.router.navigate(['/products'], { queryParams: { category: banner.linkValue } });
        break;
      case 'PRODUCT':
        // Asume que tu ruta de detalle es /product/:id
        this.router.navigate(['/product', banner.linkValue]);
        break;
      case 'QUERY':
        // Asume que la misma página de productos puede filtrar por búsqueda
        this.router.navigate(['/products'], { queryParams: { search: banner.linkValue } });
        break;
      case 'EXTERNAL':
        window.open(banner.linkValue, '_blank');
        break;
    }
  }
}
