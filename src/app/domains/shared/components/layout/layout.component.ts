// E:\WebStorm\KY1001\src\app\domains\shared\components\layout\layout.component.ts
// E:\WebStorm\KY1001\src\app\domains\shared\components\layout\layout.component.ts

import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from '@shared/components/header/header.component';
import { AnalyticsService } from '../../services/analytics.service';
import { Title, Meta } from '@angular/platform-browser';
import { filter } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent], // No necesitas CommonModule ni RouterLink aquí
  // 👇 VOLVEMOS AL TEMPLATE EN LÍNEA. NO MÁS BARRA LATERAL
  template: `
    <app-header />
    <main class="container mx-auto p-4">
      <router-outlet />
    </main>
  `
})
export class LayoutComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);
  private router = inject(Router);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  ngOnInit() {
    this.analyticsService.trackView('HOME');

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      // Tu lógica de Meta Tags está perfecta
      this.setDefaultMetaTags();
    });
  }

  private setDefaultMetaTags(): void {
    this.titleService.setTitle('Tienda OnLine  - !Productos Increíbles!!');
    this.metaService.updateTag({ property: 'og:image', content: 'https://www.tiendap2p.com/assets/logo.png' });
  }
}
