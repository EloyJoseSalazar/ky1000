import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, PLATFORM_ID, Inject } from '@angular/core';
import { Product } from '../models/product.model';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environmen';
import { PagedResponse } from "@shared/models/paged-response.model";
import { isPlatformServer } from '@angular/common'; // <--- IMPORTANTE

export interface UpdateStatusRequest {
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private http: HttpClient;
  // Esta variable tiene la URL pública (https://...)
  private apiUrl = `${environment.apiUrl}/api/products`;

  private products = new BehaviorSubject<Product[]>([]);
  public products$: Observable<Product[]> = this.products.asObservable();

  constructor(
    http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.http = http;
  }

  // --- CONFIGURACIÓN MAESTRA ---
  getOne(id: string) {
    let url = `${this.apiUrl}/${id}`;

    // Si estamos en el SERVIDOR (SSR), usamos la ruta que confirmaste con CURL.
    if (isPlatformServer(this.platformId)) {

      // Nombre interno confirmado por ti:
      const internalUrl = 'http://backend-api:8080';

      // Cambiamos la URL pública por la interna
      // Angular llamará a: http://backend-api:8080/api/products/246
      url = url.replace(environment.apiUrl, internalUrl);

      console.log(`[SSR] Usando red interna confirmada: ${url}`);
    }

    return this.http.get<Product>(url);
  }


  getProductsPaged(filters: any, page: number, size: number, includeInactive: boolean = false): Observable<PagedResponse<Product>> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString()).set('includeInactive', includeInactive.toString());
    if (filters.sku) params = params.append('sku', filters.sku);
    if (filters.title) params = params.append('title', filters.title);
    if (filters.categoryId) params = params.append('categoryId', filters.categoryId);
    if (filters.afiliadoCodigo) params = params.append('afiliadoCodigo', filters.afiliadoCodigo);
    if (filters.startDate) params = params.append('startDate', new Date(filters.startDate).toISOString());
    return this.http.get<PagedResponse<Product>>(`${this.apiUrl}/paged`, { params });
  }

  updateStatus(id: string, isActive: boolean): Observable<Product> {
    const url = `${this.apiUrl}/${id}/status`;
    const body: UpdateStatusRequest = { isActive: isActive };
    return this.http.patch<Product>(url, body);
  }

  searchByTitle(term: string) {
    const params = new HttpParams().set('title', term);
    return this.http.get<Product[]>(this.apiUrl, { params }).pipe(tap(products => this.products.next(products)));
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
    return this.http.get<Product>(`${this.apiUrl}/sku/${sku}`).pipe(catchError(error => { if (error.status === 404) return of(null); throw error; }));
  }

  deleteImage(productId: number | string, imageUrl: string): Observable<Product> {
    const url = `${this.apiUrl}/${productId}/imagenes`;
    const body = { imageUrl: imageUrl };
    return this.http.delete<Product>(url, { body: body });
  }


}
