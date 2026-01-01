import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AnalyticsVisit {
  eventType: 'HOME' | 'PRODUCT';
  productId?: number;
}

export interface ProductStat {
  productId: number;
  sku: string;         // Nuevo campo
  productTitle: string; // Nuevo campo
  totalViews: number;
  // Opcional: Podrías cruzar esto con tu lista de productos para obtener el nombre
  productName?: string;



}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private http = inject(HttpClient);
  private apiUrl = 'https://api.tudominio.com/api/analytics';

  // Registrar visita (Usar en ngOnInit de tus componentes)
  trackView(eventType: 'HOME' | 'PRODUCT', productId?: number) {
    this.http.post(`${this.apiUrl}/track`, { eventType, productId }).subscribe();
  }

  // Obtener reporte de visitas generales
  getGeneralStats(start: string, end: string): Observable<{ totalViews: number }> {
    return this.http.get<{ totalViews: number }>(`${this.apiUrl}/stats/general?start=${start}&end=${end}`);
  }

  // Obtener reporte de productos
  getProductStats(start: string, end: string): Observable<ProductStat[]> {
    return this.http.get<ProductStat[]>(`${this.apiUrl}/stats/products?start=${start}&end=${end}`);
  }
}

