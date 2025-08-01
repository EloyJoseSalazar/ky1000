import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { RouterLinkWithHref, RouterLinkActive } from '@angular/router';
import { SearchComponent } from '../search/search.component';

@Component({
  selector: 'app-header',
  standalone: true, // Esto ya lo tenías implícito, pero es bueno ser explícito
  imports: [CommonModule, RouterLinkWithHref, RouterLinkActive, SearchComponent],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  hideSideMenu = signal(true);
  showMenu = signal(false);
  private cartService = inject(CartService);
  cart = this.cartService.cart;
  total = this.cartService.total;

  toogleSideMenu() {
    this.hideSideMenu.update(prevState => !prevState);
  }

  toggleMenu() {
    this.showMenu.update(prevState => !prevState);
  }

  // --- MÉTODOS AÑADIDOS PARA CONECTAR AL SERVICIO ---

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
