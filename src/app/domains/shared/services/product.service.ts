import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, PLATFORM_ID, Inject } from '@angular/core';
import { Product } from '../models/product.model';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environmen';
import { PagedResponse } from "@shared/models/paged-response.model";
import { isPlatformServer } from '@angular/common';

export interface UpdateStatusRequest {
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private http: HttpClient;

  // 1. Definimos la variable, pero su valor final se decide en el constructor
  private apiUrl: string;

  private products = new BehaviorSubject<Product[]>([]);
  public products$: Observable<Product[]> = this.products.asObservable();

  constructor(
    http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.http = http;

    // 2. LÓGICA MAESTRA: Decidimos la URL al iniciar el servicio
    if (isPlatformServer(this.platformId)) {
      // 🏢 Servidor (Docker): Usamos la red interna CONFIRMADA
      console.log('[ProductService] Modo SSR: Usando backend-api interna');
      this.apiUrl = 'http://backend-api:8080/api/products';
    } else {
      // 🏠 Cliente (Navegador): Usamos la URL pública del environment
      this.apiUrl = `${environment.apiUrl}/api/products`;
    }
  }

  // --- MÉTODOS (Ya no necesitan lógica especial, usan this.apiUrl) ---

  getOne(id: string) {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
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

  // ... Copia el resto de tus métodos igual que siempre ...

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
