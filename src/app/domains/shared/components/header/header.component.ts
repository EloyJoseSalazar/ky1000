import { Component, inject, signal, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { RouterLinkWithHref, RouterLinkActive, RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SearchComponent } from '../search/search.component';
import { CategoryService } from '@shared/services/category.service';
import { Category } from '@shared/models/category.model';
import { Observable } from 'rxjs';
import { CartComponent } from '../cart/cart.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLinkWithHref,
    RouterLinkActive,
    RouterLink,
    SearchComponent,
    CartComponent // <--- LO AGREGAMOS AQUÍ
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  @Output() toggleSidenav = new EventEmitter<void>();

  // Controla si el SIDEBAR del carrito está abierto o cerrado (false = cerrado por defecto)
  hideSideMenu = signal(true);

  showMenu = signal(false);

  isAuthenticated$: Observable<boolean>;
  currentUser$: Observable<string | null>;
  showUserMenu = signal(false);

  private cartService = inject(CartService);
  cart = this.cartService.cart; // Solo para mostrar el contador (badge)

  private categoryService = inject(CategoryService);
  categories = signal<Category[]>([]);

  constructor(private authService: AuthService, private router: Router) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit() {
    this.categoryService.getAll().subscribe(data => {
      this.categories.set(data);
    });
  }

  // --- MÉTODOS SIMPLIFICADOS ---

  // Este método ahora solo cambia el estado para que el hijo (CartComponent) sepa qué hacer
  toogleSideMenu() {
    this.hideSideMenu.update(prevState => !prevState);
  }

  onMenuClick() {
    this.toggleSidenav.emit();
  }

  onLoginClick(): void {
    this.router.navigate(['/login']);
  }

  navigateToGestionProductos(): void {
    this.router.navigate(['/ingresa/producto/nuevo']);
    this.showUserMenu.set(false);
  }

  toggleUserMenu(): void {
    this.showUserMenu.update(prevState => !prevState);
  }

  onLogout(): void {
    this.authService.logout();
    this.showUserMenu.set(false);
  }

  toggleMenu() {
    this.showMenu.update(prevState => !prevState);
  }

  navigateToListaProductos() {
    this.router.navigate(['/ingresa/lista-productos']);
    this.showUserMenu.set(false);
  }

  navigateToAnalytics() {
    this.router.navigate(['/ingresa/analitica']);
    this.showUserMenu.set(false);
    this.showMenu.set(false);
  }
}
