// src/app/domains/shared/services/product.service.ts
import {
  HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Product } from '../models/product.model';
import {BehaviorSubject, catchError, Observable, of, tap} from 'rxjs';
import {environment} from "../../../../environments/environmen";
import {PagedResponse} from "@shared/models/paged-response.model";


export interface UpdateStatusRequest {
  isActive: boolean;
}


@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/products`;

  private products = new BehaviorSubject<Product[]>([]);
  public products$: Observable<Product[]> = this.products.asObservable();

  constructor() { }

  // filtro de busqueda de la pagina listado de producto - product-table
  getProductsPaged(
    filters: any,
    page: number,
    size: number,
    includeInactive: boolean = false // <-- 1. AÑADIR 'includeInactive'
  ): Observable<PagedResponse<Product>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      // --- 2. AÑADIR el flag a los parámetros ---
      .set('includeInactive', includeInactive.toString());

    // Añadir filtros si existen
    if (filters.sku) {
      params = params.append('sku', filters.sku);
    }
    if (filters.title) {
      params = params.append('title', filters.title);
    }
    if (filters.categoryId) {
      params = params.append('categoryId', filters.categoryId);
    }


    if (filters.afiliadoCodigo) {
      params = params.append('afiliadoCodigo', filters.afiliadoCodigo);
    }


    if (filters.startDate) {
      params = params.append('startDate', new Date(filters.startDate).toISOString());
    }


    console.log('Filtros ENVIADOS a la API:', params.toString()); // <-- Buen log para depurar
    return this.http.get<PagedResponse<Product>>(`${this.apiUrl}/paged`, { params });
  }

  // --- *** 4. ¡¡NUEVO MÉTODO AÑADIDO!! *** ---
  // Este método llama al endpoint PATCH que creamos en el backend
  updateStatus(id: string, isActive: boolean): Observable<Product> {
    const url = `${this.apiUrl}/${id}/status`;
    // El body debe coincidir con el DTO 'UpdateStatusRequest.kt' ( { "isActive": true } )
    const body: UpdateStatusRequest = { isActive: isActive };

    // Usamos PATCH
    return this.http.patch<Product>(url, body);
  }
  // --- *** FIN DEL NUEVO MÉTODO *** ---



  // 4. NUEVO MÉTODO: Para buscar por título
  searchByTitle(term: string) {
    const params = new HttpParams().set('title', term);
    return this.http.get<Product[]>(this.apiUrl, { params }).pipe(
      tap(products => this.products.next(products))
    );
  }

  getOne(id: string) {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  subirImagenes(productoId: number | string, formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/${productoId}/imagenes`, formData);
  }

  create(productData: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, productData);
  }

  update(id: string, productData: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, productData);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getBySku(sku: string): Observable<Product | null> {
    return this.http.get<Product>(`${this.apiUrl}/sku/${sku}`).pipe(
      catchError(error => {
        if (error.status === 404) {
          return of(null);
        }
        throw error;
      })
    );
  }

  deleteImage(productId: number | string, imageUrl: string): Observable<Product> {
    const url = `${this.apiUrl}/${productId}/imagenes`;

    // 1. Creamos el objeto 'body' que el backend espera
    const body = { imageUrl: imageUrl };

    // 2. Usamos la opción 'body' en lugar de 'params'
    // OJO: La sintaxis para enviar un body en un DELETE es { body: ... }
    return this.http.delete<Product>(url, { body: body }); // <-- ¡SOLUCIONADO!
  }

}
