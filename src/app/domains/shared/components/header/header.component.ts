
import { Component, inject, signal, OnInit } from '@angular/core'; // Importamos OnInit
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { RouterLinkWithHref, RouterLinkActive } from '@angular/router';
import { SearchComponent } from '../search/search.component';

// --- NUEVO: Importamos el servicio y el modelo de categorías ---
import { CategoryService } from '@shared/services/category.service';
import { Category } from '@shared/models/category.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLinkWithHref, RouterLinkActive, SearchComponent],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit { // Implementamos OnInit
  hideSideMenu = signal(true);
  showMenu = signal(false);

  private cartService = inject(CartService);
  cart = this.cartService.cart;
  total = this.cartService.total;

  // --- NUEVO: Lógica para categorías ---
  private categoryService = inject(CategoryService);
  categories = signal<Category[]>([]);
  showCategoriesDropdown = signal(false); // Para controlar el dropdown en PC

  // --- NUEVO: Lógica para la búsqueda móvil ---
  showMobileSearch = signal(false);

  ngOnInit() {
    // Cargamos las categorías cuando el componente se inicia
    this.categoryService.getAll().subscribe(data => {
      this.categories.set(data);
    });
  }

  toogleSideMenu() {
    this.hideSideMenu.update(prevState => !prevState);
  }

  toggleMenu() {
    this.showMenu.update(prevState => !prevState);
  }

  // --- NUEVO ---
  toggleCategoriesDropdown() {
    this.showCategoriesDropdown.update(prevState => !prevState);
  }

  // --- NUEVO ---
  toggleMobileSearch() {
    this.showMobileSearch.update(prevState => !prevState);
  }

  // ... (tus otros métodos de carrito) ...

  removeFromCart(productId: number) {
    this.cartService.removeFromCart(productId);
  }

  increaseQuantity(productId: number) {
    this.cartService.updateQuantity(productId, 1);
  }

  decreaseQuantity(productId: number) {
    this.cartService.updateQuantity(productId, -1);
  }
}
