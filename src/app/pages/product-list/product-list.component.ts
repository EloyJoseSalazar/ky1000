import { Component, inject, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { Observable, startWith, Subject, switchMap } from "rxjs";

// (otros imports sin cambios)
import { PagedResponse } from '@shared/models/paged-response.model';
import { ProductService } from '@shared/services/product.service';
import { ProductFiltersComponent } from '../../components/product-filters/product-filters.component';
import { ProductTableComponent } from '../../components/product-table/product-table.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';


@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    ProductFiltersComponent,
    ProductTableComponent,
    PaginationComponent
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  public router = inject(Router);

  public pagedResponse$!: Observable<PagedResponse<any>>;
  private refreshProducts$ = new Subject<void>();

  private currentPage = 0;
  private pageSize = 10;
  private currentFilters: any = {};

  ngOnInit() {
    this.pagedResponse$ = this.refreshProducts$.pipe(
      startWith(null),
      switchMap(() =>
        this.productService.getProductsPaged(this.currentFilters, this.currentPage, this.pageSize)
      )
    );
  }

  handleFilters(filters: any) {

    console.log('Filtros recibidos del componente hijo:', filters);

    const apiFilters: { [key: string]: any } = {};

    for (const key in filters) {
      const value = filters[key];

      // 🟢 CORRECCIÓN CLAVE: Excluir la cadena 'undefined'
      if (value !== null && value !== undefined && value !== '' && String(value).toLowerCase() !== 'undefined') {
        apiFilters[key] = value;
      }
    }

    // 👇 PASO DE DEPURACIÓN: Muestra los filtros que se enviarán a la API 👇
    console.log('Filtros que se usarán para la API:', apiFilters);

    this.currentFilters = apiFilters;
    this.currentPage = 0;
    this.refreshProducts$.next();
  }

  handlePageChange(page: number) {
    this.currentPage = page;
    this.refreshProducts$.next();
  }


  handleEdit(sku: string) {
    this.router.navigate(['/ingresa/producto/nuevo'], { queryParams: { sku: sku } });
  }

  handleDelete(productId: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      this.productService.delete(productId.toString()).subscribe({
        next: () => {
          alert('Producto eliminado con éxito');
          this.refreshProducts$.next();
        },
        error: (err) => alert('Error al eliminar el producto: ' + err.message)
      });
    }
  }

  handleStatusChange(event: { id: number; isActive: boolean }) {
    this.productService.update(event.id.toString(), { isactive: event.isActive }).subscribe({});
  }

}

