import { Injectable, computed, signal } from '@angular/core';
import { Product } from '../models/product.model';
import { CartItem } from '../models/cart-item.model'; // <-- IMPORTANTE: Importa la nueva interfaz

@Injectable({
  providedIn: 'root'
})
export class CartService {

  // 1. El estado del carrito ahora guarda un array de CartItem
  cart = signal<CartItem[]>([]);

  // 2. El 'total' ahora multiplica el precio por la cantidad de cada ítem
  total = computed(() => {
    const cartItems = this.cart();
    return cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  });

  constructor() { }

  // 3. 'addToCart' ahora es más inteligente: o añade un nuevo ítem o incrementa la cantidad
  addToCart(product: Product) {
    this.cart.update(state => {
      const existingItem = state.find(item => item.id === product.id);
      if (existingItem) {
        // Si el producto ya existe, lo buscamos y le sumamos 1 a su cantidad
        return state.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Si es un producto nuevo, lo añadimos al array con cantidad 1
        return [...state, { ...product, quantity: 1 }];
      }
    });
  }

  // 4. NUEVO MÉTODO: Para eliminar un ítem completamente del carrito
  removeFromCart(productId: number) {
    this.cart.update(state => state.filter(item => item.id !== productId));
  }

  // 5. NUEVO MÉTODO: Para aumentar o disminuir la cantidad de un ítem
  updateQuantity(productId: number, change: -1 | 1) {
    this.cart.update(state =>
      state.map(item => {
        if (item.id === productId) {
          const newQuantity = item.quantity + change;
          // Si la nueva cantidad es mayor que 0, actualizamos el ítem
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
        }
        return item;
      })
        // Después del map, filtramos cualquier 'null' que haya quedado (esto elimina ítems con cantidad 0)
        .filter((item): item is CartItem => item !== null)
    );
  }
}
