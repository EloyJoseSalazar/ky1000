// src/app/domains/shared/services/moneda.service.ts

import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Moneda } from '../models/moneda.model';
import { tap } from 'rxjs';
import { environment } from '../../../../environments/environmen';

@Injectable({
  providedIn: 'root'
})
export class MonedaService {
  private http = inject(HttpClient);
  //private apiUrl = 'http://localhost:8080/api/monedas';
  private apiUrl = `${environment.apiUrl}/api/monedas`;

  // SIGNAL: Aquí guardaremos las monedas para usarlas en toda la app
  monedas = signal<Moneda[]>([]);

  // Cargar monedas y actualizar la señal
  loadRates() {
    this.http.get<Moneda[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.monedas.set(data);
        console.log('Tasas cargadas:', data);
      },
      error: (err) => console.error('Error cargando tasas', err)
    });
  }

  // (Tus métodos anteriores getMonedas y updateMoneda pueden seguir igual o usar loadRates)
  getMonedas() {
    return this.http.get<Moneda[]>(this.apiUrl).pipe(
      tap(data => this.monedas.set(data)) // Actualiza la señal al obtener datos
    );
  }

  updateMoneda(id: number, moneda: Moneda) {
    return this.http.put<Moneda>(`${this.apiUrl}/${id}`, moneda);
  }
}
