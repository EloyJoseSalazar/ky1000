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

    return this.http.get<Category[]>(`${this.apiUrl}/api/categories`);
  }
}
