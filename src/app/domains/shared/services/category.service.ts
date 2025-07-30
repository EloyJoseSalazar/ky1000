import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Category } from '@shared/models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);

  constructor() { }

  getAll() {
   // return this.http.get<Category[]>(`https://api.escuelajs.co/api/v1/categories`);
  //  return this.http.get<Category[]>(`http://localhost:8080/api/categories`);
  //  return this.http.get<Category[]>(`https://reactive-api-acma.onrender.com/api/categories`);
    return this.http.get<Category[]>(`https://ko4wgwo0c8gkkkw888808okk.systemash.com/api/categories`);
  }
}
