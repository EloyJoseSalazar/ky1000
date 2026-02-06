import { Pipe, PipeTransform, inject } from '@angular/core';
import { MonedaService } from '../services/moneda.service';

@Pipe({
  name: 'calculoPrecio',
  standalone: true,
  pure: false
})
export class CalculoPrecioPipe implements PipeTransform {
  private monedaService = inject(MonedaService);

  transform(precioBase: number): string {
    const monedas = this.monedaService.monedas();

    // --- ESPÍA (DEBUG) ---
    // Esto imprimirá en la consola qué datos tiene el pipe en ese momento
    if (monedas.length === 0) {
      console.warn('⚠️ Pipe: Aún no hay monedas cargadas.');
    } else {
      // console.log('✅ Pipe: Monedas encontradas:', monedas);
      // (Comenté la línea de arriba para no llenar tu consola, descoméntala si quieres ver los datos)
    }
    // ---------------------

    // Buscamos las tasas (Asegurándonos que coincidan con tu DB)
    // En tu DB, el nombre es 'usdt' y 'bcv'. Probemos buscar por 'nombre' también si 'simbolo' falla.
    const usdtObj = monedas.find(m =>
      m.simbolo.toLowerCase().includes('usdt') || m.nombre.toLowerCase().includes('usdt')
    );
    const bcvObj = monedas.find(m =>
      m.simbolo.toLowerCase().includes('bcv') || m.nombre.toLowerCase().includes('bcv')
    );

    const usdt = usdtObj?.factorCambio || 0;
    const bcv = bcvObj?.factorCambio || 0;

    // Si faltan datos, mostramos el precio base
    if (!usdt || !bcv || !precioBase) {
      // Aquí es donde está cayendo tu código ahora
      return 'US$ ' + (precioBase || 0).toFixed(2);
    }

    // FÓRMULA
    const precioPublico = (precioBase * usdt) / bcv;

    return `US$ ${precioPublico.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}
