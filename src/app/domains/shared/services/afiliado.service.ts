import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Afiliado } from '@shared/models/afiliado.model';
import {environment} from "../../../../environments/environmen";

// URL de tu API (ajusta si es necesario, ej. si usas 'proxy.conf.json')
//const API_URL = '${environment.apiUrl}api/afiliados';

@Injectable({
  providedIn: 'root'
})
export class AfiliadoService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl  // Usa la variable

  /**
   * Obtiene la lista completa de afiliados para el combobox
   */
  getAllAfiliados(): Observable<Afiliado[]> {
    return this.http.get<Afiliado[]>(`${this.apiUrl}/api/afiliados`);
  }
}
