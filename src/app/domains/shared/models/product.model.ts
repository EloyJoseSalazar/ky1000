import { Category } from "./category.model";

export interface Product {
    id: number;
    title: string
    sku: string;
    description: string;
    price: number;
     stock: number;
    images: string[];
    creationAt: string;
    category: Category;
    updatedAt: string;
    isactive: boolean;

}
