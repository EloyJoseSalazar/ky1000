import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { CalculoPrecioPipe } from '@shared/pipes/calculo-precio.pipe'; // Asegúrate que la ruta sea correcta
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environmen';



@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, CalculoPrecioPipe, ReactiveFormsModule],
  // AGREGAMOS EL PIPE A LOS PROVIDERS PARA PODER INYECTARLO
  providers: [CalculoPrecioPipe],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {

  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  private cartService = inject(CartService);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  // INYECTAMOS EL PIPE AQUÍ
  private precioPipe = inject(CalculoPrecioPipe);

  cart = this.cartService.cart;
  total = this.cartService.total;

  showCheckoutForm = signal(false);
  isProcessing = signal(false);

  checkoutForm: FormGroup = this.fb.group({
    clientName: ['', Validators.required],
    clientIdDoc: [''],
    clientPhone: ['', Validators.required],
    clientAddress: [''],
    paymentMethod: ['Pago Móvil', Validators.required]
  });

  paymentMethods = [
    'Pago Móvil',
    'Transferencia Bancaria',
    'Binance',
    'Paypal'
  ];

  closeSidebar() {
    this.close.emit();
  }

  // ... (Tus métodos removeFromCart, increase, decrease siguen igual) ...
  removeFromCart(productId: number) {
    this.cartService.removeFromCart(productId);
  }

  increaseQuantity(productId: number) {
    this.cartService.updateQuantity(productId, 1);
  }

  decreaseQuantity(productId: number) {
    this.cartService.updateQuantity(productId, -1);
  }


  abrirCheckout() {
    this.closeSidebar();
    this.showCheckoutForm.set(true);
  }

  cerrarCheckout() {
    this.showCheckoutForm.set(false);
  }

  // --- FUNCIÓN AUXILIAR PARA LIMPIAR EL PRECIO ---
  // Transforma "US$ 283.04" -> 283.04 (Número)
  private parsePrecio(rawPrice: number): number {
    try {
      // 1. Usamos el pipe para obtener lo que se ve en pantalla (ej: "US$ 283.04")
      const formatted = this.precioPipe.transform(rawPrice);

      // 2. Si el pipe devuelve string, quitamos letras y símbolos, dejamos solo números y punto
      if (typeof formatted === 'string') {
        // Eliminar todo lo que NO sea número o punto (ajusta según tu moneda si usas coma)
        const cleanString = formatted.replace(/[^0-9.]/g, '');
        return parseFloat(cleanString);
      }
      return Number(formatted);
    } catch (e) {
      console.error("Error parseando precio", e);
      return rawPrice; // Fallback
    }
  }

  generarPedido() {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    this.isProcessing.set(true);
    const formValue = this.checkoutForm.value;

    // --- AQUÍ ESTÁ LA MAGIA ---
    // Recalculamos el total visual sumando los precios transformados
    const itemsProcesados = this.cart().map(item => {
      const precioVisual = this.parsePrecio(item.price);
      return {
        sku: item.sku || 'GENERICO',
        title: item.title,
        imageUrl: item.images[0],
        quantity: item.quantity,
        price: precioVisual // <--- Enviamos el precio YA transformado
      };
    });

    // Calcular el total basado en los precios visuales para que coincida exactamente
    // (Aunque el backend lo recalcula, es bueno enviarlo o asegurarnos que coincidan)
    const totalVisual = itemsProcesados.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const orderRequest = {
      clientName: formValue.clientName,
      clientIdDoc: formValue.clientIdDoc,
      clientPhone: formValue.clientPhone,
      clientAddress: formValue.clientAddress,
      paymentMethod: formValue.paymentMethod,
      items: itemsProcesados
    };

   // this.http.post<any>('http://localhost:8080/api/orders/create', orderRequest)
    this.http.post<any>(`${environment.apiUrl}/api/orders/create`, orderRequest)
      .subscribe({
        next: (res) => {
          this.isProcessing.set(false);
          this.cerrarCheckout();
          this.cartService.clearCart();

          const phoneEmpresa = '584249028378';

          // Usamos 'totalVisual' aquí para el mensaje de WhatsApp también
          const mensaje = `Hola TiendaP2P! 👋
He realizado un nuevo pedido.

👤 *Cliente:* ${formValue.clientName}
📄 *N° Recibo:* ${res.receiptNumber}
💰 *Total:* US$ ${res.totalToPay}

🔗 *Ver Recibo PDF:* ${res.pdfUrl}

Quedo atento a su confirmación.`;

          window.open(`https://wa.me/${phoneEmpresa}?text=${encodeURIComponent(mensaje)}`, '_blank');
        },
        error: (err) => {
          console.error('Error al crear pedido', err);
          this.isProcessing.set(false);
          alert('Hubo un error de conexión al crear el pedido.');
        }
      });
  }
}
