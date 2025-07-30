import { Product } from './product.model';

// Esta interfaz hereda todas las propiedades de Product y añade 'quantity'
export interface CartItem extends Product {
  quantity: number;
}
