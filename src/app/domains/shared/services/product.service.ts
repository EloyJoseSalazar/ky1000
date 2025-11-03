import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Product } from '../models/product.model';
import {BehaviorSubject, catchError, Observable, of, tap} from 'rxjs';
import {environment} from "../../../../environments/environmen";
import {PagedResponse} from "@shared/models/paged-response.model";



@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/products`;


  private products = new BehaviorSubject<Product[]>([]);
   public products$: Observable<Product[]> = this.products.asObservable();

  constructor() { }


  // filtro de busqueda  de la pagina listado de producto - product-table

  getProductsPaged(filters: any, page: number, size: number): Observable<PagedResponse<Product>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    // Añadir filtros si existen
    if (filters.sku) {
      params = params.append('sku', filters.sku);
    }


    // Añadir el filtro de título si existe
    if (filters.title) {
      params = params.append('title', filters.title);
    }


    if (filters.categoryId) {
      params = params.append('categoryId', filters.categoryId);
    }
    if (filters.startDate) {
      params = params.append('startDate', new Date(filters.startDate).toISOString());
    }
    // ... otros filtros

    return this.http.get<PagedResponse<Product>>(`${this.apiUrl}/paged`, { params });
  }

  getProducts(categoryId?: string, query?: string): Observable<Product[]> {
    let params = new HttpParams();
    if (categoryId) {
      params = params.set('categoryId', categoryId);
    }
    if (query) {
      params = params.set('title', query);
    }
    return this.http.get<Product[]>(this.apiUrl, { params }).pipe(
      tap(products => this.products.next(products))
    );
  }


  // 4. NUEVO MÉTODO: Para buscar por título
  searchByTitle(term: string) {
    const params = new HttpParams().set('title', term);
    return this.http.get<Product[]>(this.apiUrl, { params }).pipe(
      // Actualiza nuestro "Subject" con los resultados de la búsqueda
      tap(products => this.products.next(products))
    );
  }

  getOne(id: string) {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  subirImagenes(productoId: number | string, formData: FormData): Observable<any> {
    // La URL será algo como: /api/productos/123/imagenes
    return this.http.post(`${this.apiUrl}/${productoId}/imagenes`, formData);
  }
// -----------------> 25 08 2025
  // ... tus otros métodos como getOne(), etc. ...

  // CREAR un nuevo producto
  create(productData: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, productData);
  }

  // ACTUALIZAR un producto existente
  update(id: string, productData: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, productData);
  }

  // ELIMINAR un producto
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }


  getBySku(sku: string): Observable<Product | null> {
    return this.http.get<Product>(`${this.apiUrl}/sku/${sku}`).pipe(
      catchError(error => {
        // Si el error es un 404 (Not Found), devolvemos un 'null' observable
        // para que el componente sepa que el producto no existe.
        if (error.status === 404) {
          return of(null);
        }
        // Para otros errores, los relanzamos.
        throw error;
      })
    );
  }

  deleteImage(productId: number | string, imageUrl: string): Observable<Product> {
    // El endpoint espera un cuerpo con la URL de la imagen
    const body = { imageUrl: imageUrl };
    return this.http.delete<Product>(`${this.apiUrl}/${productId}/imagenes`, { body: body });
  }

}
