// src/app/app.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';

// TUS COMPONENTES Y SERVICIOS
import { NavbarComponent } from './components/navbar/navbar.component';
import { MonedaService } from './domains/shared/services/moneda.service';
import { CategoryService } from '@shared/services/category.service';
import {HeaderComponent} from "@shared/components/header/header.component";
import { Category } from './domains/shared/models/category.model';


@Component({
  selector: 'app-root',
  standalone: true,
  // Importamos Navbar y MatSidenavModule para que funcionen en el HTML
  imports: [CommonModule, RouterOutlet, MatSidenavModule, NavbarComponent, HeaderComponent],
  templateUrl: './app.component.html', // <--- Vinculamos el nuevo archivo HTML
  styleUrl: './app.component.scss'     // <--- Vinculamos el nuevo archivo SCSS
})
export class AppComponent implements OnInit {

  // Inyección de dependencias
  private monedaService = inject(MonedaService);
  private categoryService = inject(CategoryService);
  private router = inject(Router);

  // Variable para guardar las categorías del menú lateral
  categorias = signal<Category[]>([]);

  ngOnInit() {
    // 1. Cargar Tasas (Tu lógica original)
    this.monedaService.loadRates();
    this.cargarCategorias();

  }

  cargarCategorias() {
    this.categoryService.getAll().subscribe({
      next: (data) => {
        this.categorias.set(data);
        console.log("Categorías cargadas:", data);
      },
      error: (err) => console.error('Error cargando categorías:', err)
    });
  }

  // Método para navegar y cerrar el menú (se usará en el HTML)
  irACategoria(id: number) {
    // Usamos 'categoryId' que es lo que tu backend y lista esperan
    this.router.navigate(['/'], { queryParams: { categoryId: id } });
  }

  irAOfertas() {
    this.router.navigate(['/'], {
      queryParams: {
        isOffer: 'true', // <--- Buscamos solo lo que tenga el switch encendido
        sortCol: 'price',
        sortDir: 'asc'
      }
    });
  }
}


