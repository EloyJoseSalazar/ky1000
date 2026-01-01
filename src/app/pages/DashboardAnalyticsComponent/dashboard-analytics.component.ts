import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
//import { AnalyticsService, ProductStat } from './analytics.service';
import {AnalyticsService, ProductStat} from '@shared/services/analytics.service';

@Component({
  selector: 'app-dashboard-analytics',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard-analytics.component.html'
})
export class DashboardAnalyticsComponent {
  private analyticsService = inject(AnalyticsService);

  // Signals para Angular 19 (Gestión de estado simple)
  totalVisits = signal<number>(0);
  productStats = signal<ProductStat[]>([]);


  // Fechas por defecto: Últimos 7 días
  startControl = new FormControl(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
  endControl = new FormControl(new Date().toISOString().slice(0, 16));

  loadStats() {
    const start = this.startControl.value || '';
    const end = this.endControl.value || '';

    // Cargar total visitas
    this.analyticsService.getGeneralStats(start, end).subscribe(res => {
      this.totalVisits.set(res.totalViews);
    });

    // Cargar productos top
    this.analyticsService.getProductStats(start, end).subscribe(res => {
      this.productStats.set(res);
    });
  }
}
