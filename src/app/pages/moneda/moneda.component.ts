import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Moneda } from '@shared/models/moneda.model';
import { MonedaService } from '@shared/services/moneda.service';

@Component({
  selector: 'app-moneda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './moneda.component.html',
  styleUrls: ['./moneda.component.css']
})
export class MonedaComponent implements OnInit {
  monedaService = inject(MonedaService);
  monedas: Moneda[] = [];
  mensaje: string = '';

  ngOnInit() {
    this.cargarMonedas();
  }

  cargarMonedas() {
    this.monedaService.getMonedas().subscribe({
      next: (data) => {
        // Ordenamos para asegurar que salgan en orden (ej. primero USDT o BCV)
        this.monedas = data.sort((a, b) => (a.id || 0) - (b.id || 0));
      },
      error: (err) => console.error('Error cargando monedas', err)
    });
  }

  guardarCambios() {
    // Recorremos las monedas y las actualizamos una por una
    this.monedas.forEach(moneda => {
      if (moneda.id) {
        this.monedaService.updateMoneda(moneda.id, moneda).subscribe({
          next: () => this.mensaje = 'Tasas actualizadas correctamente',
          error: () => this.mensaje = 'Error al actualizar'
        });
      }
    });

    // Ocultar mensaje después de 3 segundos
    setTimeout(() => this.mensaje = '', 3000);
  }
}
