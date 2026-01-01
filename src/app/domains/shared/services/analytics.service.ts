import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environmen';
'../search/search.component';

export interface AnalyticsVisit {
  eventType: 'HOME' | 'PRODUCT';
  productId?: number;
}

export interface ProductStat {
  productId: number;
  sku: string;
  productTitle: string;
  totalViews: number;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private http = inject(HttpClient);


  private apiUrl = `${environment.apiUrl}/api/analytics`;

  trackView(eventType: 'HOME' | 'PRODUCT', productId?: number) {
    // Esto enviará a: .../api/analytics/track
    this.http.post(`${this.apiUrl}/track`, { eventType, productId }).subscribe({
      next: () => console.log('Visita registrada correctamente'),
      error: (err) => console.error('Error registrando visita', err)
    });
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

