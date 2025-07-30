import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Product } from '../models/product.model';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private http = inject(HttpClient);
  //private apiUrl = 'https://api.escuelajs.co/api/v1/products';
  // private apiUrl = 'http://localhost:8080/api/products';
  //private apiUrl = 'https://reactive-api-acma.onrender.com/api/products';
  private apiUrl = 'https://ko4wgwo0c8gkkkw888808okk.systemash.com/api/products';

  // 1. Un "Subject" que guardará la lista actual de productos. Es nuestro estado central.
  private products = new BehaviorSubject<Product[]>([]);

  // 2. Un Observable público para que los componentes se suscriban y escuchen los cambios.
  public products$: Observable<Product[]> = this.products.asObservable();

  constructor() { }

  // 3. Método para la carga inicial y el filtro por categoría
  getProducts(category_id?: string) {
    const url = new URL(this.apiUrl);
    if (category_id) {
      url.searchParams.set('categoryId', category_id);
    }
    return this.http.get<Product[]>(url.toString()).pipe(
      // Cuando se obtienen los productos, se actualiza nuestro "Subject"
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
}
