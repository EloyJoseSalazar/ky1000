import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Category } from '@shared/models/category.model';
import {environment} from "../../../../environments/environmen";

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl  // Usa la variable


  constructor() { }

  getAll() {
   // return this.http.get<Category[]>(`https://api.escuelajs.co/api/v1/categories`);
  //  return this.http.get<Category[]>(`http://localhost:8080/api/categories`);
  //  return this.http.get<Category[]>(`https://reactive-api-acma.onrender.com/api/categories`);
    //return this.http.get<Category[]>(`https://ko4wgwo0c8gkkkw888808okk.systemash.com/api/categories`);
    return this.http.get<Category[]>(`${this.apiUrl}/api/categories`);
  }
}
