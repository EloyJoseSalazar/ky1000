// src/app/domains/shared/models/product.model.ts
import { Category } from "./category.model";

// Nueva interfaz para los items de interés
export interface InterestItem {
  imageUrl: string;
  searchKeyword: string;
}

export interface Product {
  id: number;
  title: string;
  sku: string;
  description: string;
  precioCosto: number;      // Mapea a precio_costo de la BD
  porcentajeUtilidad: number; // Mapea a porc_precio de la BD
  price: number;
  stock: number;
  images: string[];
  creationAt: string;
  category: Category;

  // Campos opcionales existentes
  afiliadoCodigo?: string;
  nombreAfiliado?: string;

  // NUEVO CAMPO: Lista de items de interés (Cross-selling)
  interestedItems?: InterestItem[];

  updatedAt: string;
  isactive: boolean;
  isOffer: boolean;
}
