import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from '@shared/components/header/header.component';
import { Title, Meta } from '@angular/platform-browser';
import { filter } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <app-header />
    <main class="container mx-auto p-4">
      <router-outlet />
    </main>
  `
})
export class LayoutComponent implements OnInit {
  private router = inject(Router);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      // CADA VEZ que una navegación termina, hacemos esto:

      // 1. Ponemos los valores POR DEFECTO.
      this.setDefaultMetaTags();

      // 2. Si estás usando SSR, el TransferState ya habrá hecho su trabajo.
      //    En el lado del cliente, esto asegura que si navegas de una página
      //    a otra, las etiquetas se resetean antes de que el nuevo componente
      //    las establezca.
    });
  }

  private setDefaultMetaTags(): void {
    this.titleService.setTitle('LA TIENDA - !Productos Increíbles!!');
    this.metaService.updateTag({ property: 'og:title', content: 'LA TIENDA -** Productos Increíbles **' });
    this.metaService.updateTag({ property: 'og:description', content: 'Descubre nuestras ofertas exclusivas.' });
    // Usamos la URL de tu logo como imagen por defecto
    this.metaService.updateTag({ property: 'og:image', content: 'https://nuestratienda.systemash.com/assets/logo3.png' });
  }
}
