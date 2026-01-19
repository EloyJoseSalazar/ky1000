import { Component, inject, signal, OnInit, Output, EventEmitter } from '@angular/core'; // <--- AGREGADO Output, EventEmitter
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { RouterLinkWithHref, RouterLinkActive, RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SearchComponent } from '../search/search.component';
import { CategoryService } from '@shared/services/category.service';
import { Category } from '@shared/models/category.model';
import { Observable } from 'rxjs';
import { CalculoPrecioPipe } from '@shared/pipes/calculo-precio.pipe';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLinkWithHref, RouterLinkActive, RouterLink, SearchComponent, CalculoPrecioPipe],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  // --- NUEVO: Evento para avisar al App Component que abra el Sidenav ---
  @Output() toggleSidenav = new EventEmitter<void>();

  hideSideMenu = signal(true);
  showMenu = signal(false);
  showCategoriesDropdown = signal(false);

  // --- Propiedades para el Auth ---
  isAuthenticated$: Observable<boolean>;
  currentUser$: Observable<string | null>;
  showUserMenu = signal(false);

  private cartService = inject(CartService);
  cart = this.cartService.cart;
  total = this.cartService.total;

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

  // --- NUEVO MÉTODO: Emite el evento al hacer clic en el botón de hamburguesa ---
  onMenuClick() {
    this.toggleSidenav.emit();
  }

  // --- Métodos de Auth ---
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
    this.showUserMenu.set(false);
  }

  navigateToAnalytics() {
    this.router.navigate(['/ingresa/analitica']);
    this.showUserMenu.set(false);
    this.showMenu.set(false);
  }

  navigateToCategory(categoryId: number) {
    this.router.navigate(
      ['/'],
      {
        queryParams: { categoryId: categoryId },
        queryParamsHandling: 'merge'
      }
    );
    this.toggleCategoriesDropdown();
  }
}
