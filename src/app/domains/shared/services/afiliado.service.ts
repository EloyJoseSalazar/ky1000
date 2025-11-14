import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Afiliado } from '@shared/models/afiliado.model';

// URL de tu API (ajusta si es necesario, ej. si usas 'proxy.conf.json')
const API_URL = 'http://localhost:8080/api/afiliados';

@Injectable({
  providedIn: 'root'
})
export class AfiliadoService {
  private http = inject(HttpClient);

  /**
   * Obtiene la lista completa de afiliados para el combobox
   */
  getAllAfiliados(): Observable<Afiliado[]> {
    return this.http.get<Afiliado[]>(API_URL);
  }
}
