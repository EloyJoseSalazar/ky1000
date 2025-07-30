import { Component, Input, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLinkWithHref } from '@angular/router';
import { ProductComponent } from '@products/components/product/product.component';
import { Product } from '@shared/models/product.model';
import { CartService } from '@shared/services/cart.service';
import { ProductService } from '@shared/services/product.service';
import { CategoryService } from '@shared/services/category.service';
import { Category } from '@shared/models/category.model';
import { Observable } from 'rxjs';
// --- CORRECCIÓN DE RUTA Y NOMBRE DE ARCHIVO AQUÍ ---
// Subimos 3 niveles (../../../) para llegar a 'domains' y luego bajamos a la carpeta correcta
import { SearchComponent } from '../../../shared/components/search/search.component';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonModule,
    ProductComponent,
    RouterLinkWithHref,
    SearchComponent // <-- Ahora Angular lo encontrará y el error NG1010 desaparecerá
  ],
  templateUrl: './list.component.html'
})
export default class ListComponent {

  products$: Observable<Product[]>;
  categories = signal<Category[]>([]);
  private cartService = inject(CartService);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  @Input() category_id?: string;

  constructor() {
    this.products$ = this.productService.products$;
  }

  ngOnInit() {
    this.productService.getProducts().subscribe();
    this.getCategories();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['category_id']) {
      this.productService.getProducts(this.category_id).subscribe();
    }
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product)
  }

  private getCategories() {
    this.categoryService.getAll()
      .subscribe({
        next: (data) => this.categories.set(data),
        error: () => {}
      })
  }
}
