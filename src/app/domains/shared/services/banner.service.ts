
// src/app/domains/shared/services/banner.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Banner } from '../models/banner.model';
import {environment} from "../../../../environments/environmen";

@Injectable({
  providedIn: 'root'
})
export class BannerService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1/public/banners`; // Ajusta la URL base de tu API

  getActiveBanners(): Observable<Banner[]> {
    return this.http.get<Banner[]>(`${this.apiUrl}/active`);
  }
}
