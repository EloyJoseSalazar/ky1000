// src/app/domains/shared/components/header/header.component.ts

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { RouterLinkWithHref, RouterLinkActive } from '@angular/router';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SearchComponent } from '../search/search.component';
import { CategoryService } from '@shared/services/category.service';
import { Category } from '@shared/models/category.model';
import { Observable } from 'rxjs'; // Importar Observable

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLinkWithHref, RouterLinkActive, RouterLink, SearchComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'] // <-- ¡Descomenta o añade esto!
})
export class HeaderComponent implements OnInit {
  hideSideMenu = signal(true);
  showMenu = signal(false); // Para el menú móvil
  showCategoriesDropdown = signal(false); // Para el dropdown de categorías en PC

  // --- Propiedades para el Auth ---
  isAuthenticated$: Observable<boolean>;
  currentUser$: Observable<string | null>;
  showUserMenu = signal(false); // Signal para controlar la visibilidad del submenú de usuario


  private cartService = inject(CartService);
  cart = this.cartService.cart;
  total = this.cartService.total;

  private categoryService = inject(CategoryService);
  categories = signal<Category[]>([]);

  constructor(private authService: AuthService, private router: Router) {
    // Inicializar los Observables del AuthService en el constructor
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit() {
    this.categoryService.getAll().subscribe(data => {
      this.categories.set(data);
      console.log("eliguiendo departamento ..")
    });

  }

  // --- Métodos de Auth ---
  onLoginClick(): void {
    this.router.navigate(['/login']);
  }

  navigateToGestionProductos(): void {
    // CAMBIO AQUÍ: Navegamos a la ruta específica para crear un nuevo producto
    this.router.navigate(['/ingresa/producto/nuevo']); // Ajusta la ruta a tu 'Crear Producto'
    this.showUserMenu.set(false);

  }

  toggleUserMenu(): void {
    this.showUserMenu.update(prevState => !prevState);
  }

  onLogout(): void {
    this.authService.logout();
    this.showUserMenu.set(false); // Oculta el menú después de cerrar sesión
  }

 // navigateToGestionProductos(): void {
  //  this.router.navigate(['/gestion-productos']);
   // this.showUserMenu.set(false); // Oculta el menú después de navegar
 // }

  // --- Métodos existentes ---
  toogleSideMenu() {
    this.hideSideMenu.update(prevState => !prevState);
  }

  toggleMenu() {
    this.showMenu.update(prevState => !prevState);
  }

  toggleCategoriesDropdown() {
    this.showCategoriesDropdown.update(prevState => !prevState);
  }

  removeFromCart(productId: number) {
    this.cartService.removeFromCart(productId);
  }

  increaseQuantity(productId: number) {
    this.cartService.updateQuantity(productId, 1);
  }

  decreaseQuantity(productId: number) {
    this.cartService.updateQuantity(productId, -1);
  }


  navigateToListaProductos() {
    this.router.navigate(['/ingresa/lista-productos']);
    this.showUserMenu.set(false); // También cierra el menú de usuario al navegar
  }

  navigateToAnalytics() {
    this.router.navigate(['/ingresa/analitica']);
    this.showUserMenu.set(false); // Cierra el menú de usuario PC
    this.showMenu.set(false);     // Cierra el menú móvil por si acaso
  }

  navigateToCategory(categoryId: number) {
    this.router.navigate(
      ['/'],
      {
        queryParams: { categoryId: categoryId },
        // **Clave:** Forzar la navegación aunque la ruta sea la misma
        queryParamsHandling: 'merge'
      }
    );
    this.toggleCategoriesDropdown();
  }

}
