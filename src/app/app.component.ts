import {Component, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MonedaService } from './domains/shared/services/moneda.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`
})
export class AppComponent implements OnInit {
  private monedaService = inject(MonedaService);

  ngOnInit() {
    // ¡Aquí pedimos las tasas al backend al iniciar!
    this.monedaService.loadRates();
  }
}


