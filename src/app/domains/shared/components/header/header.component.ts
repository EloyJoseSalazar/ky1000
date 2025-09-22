
import { Component, inject, signal, OnInit } from '@angular/core'; // Importamos OnInit
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { RouterLinkWithHref, RouterLinkActive } from '@angular/router';
import { RouterLink, Router } from '@angular/router'; // Necesario para RouterLink y para logout
import { AuthService } from '../../services/auth.service'; // Asegúrate de la ruta correcta
import { SearchComponent } from '../search/search.component';
import { CategoryService } from '@shared/services/category.service';
import { Category } from '@shared/models/category.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLinkWithHref, RouterLinkActive, RouterLink, SearchComponent],
  templateUrl: './header.component.html',
  //styleUrls: ['./header.component.css']
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


  isAuthenticated$!: Observable<boolean>; // Para suscribirse al estado de autenticación

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    // Cargamos las categorías cuando el componente se inicia
    this.categoryService.getAll().subscribe(data => {
      this.categories.set(data);
    });
  }

  onLogout(): void {
    this.authService.logout(); // Llama al método logout del servicio
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
