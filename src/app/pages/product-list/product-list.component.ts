import { Component, inject, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { Observable, startWith, Subject, switchMap } from "rxjs";

// (otros imports sin cambios)
import { PagedResponse } from '@shared/models/paged-response.model';
import { ProductService } from '@shared/services/product.service'; // Asegúrate que la ruta sea correcta
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
        // --- *** 1. ¡¡CAMBIO IMPORTANTE!! *** ---
        // Pasamos 'true' para decirle al servicio
        // que esta es la lista de admin y queremos verlos TODOS.
        this.productService.getProductsPaged(
          this.currentFilters,
          this.currentPage,
          this.pageSize,
          true // <-- ¡AQUÍ!
        )
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
    // Usamos 'confirm' por ahora
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      this.productService.delete(productId.toString()).subscribe({
        next: () => {
          // 'alert' tampoco es ideal, pero por ahora...
          alert('Producto eliminado con éxito');
          this.refreshProducts$.next();
        },
        error: (err) => alert('Error al eliminar el producto: ' + err.message)
      });
    }
  }

  // --- *** 2. ¡¡MÉTODO TOTALMENTE CORREGIDO!! *** ---
  handleStatusChange(event: { id: number; isActive: boolean }) {
    console.log(`Cambiando estado de ID ${event.id} a ${event.isActive}`);

    // 1. Llamamos al NUEVO servicio 'updateStatus' (PATCH)
    this.productService.updateStatus(event.id.toString(), event.isActive).subscribe({
      next: (updatedProduct) => {
        console.log('Producto actualizado:', updatedProduct.title, 'Nuevo estado:', updatedProduct.isactive);

        // 2. ¡Importante! Le decimos al 'Subject' que recargue los datos
        //    para que la tabla muestre el estado actualizado.
        this.refreshProducts$.next();
      },
      error: (err) => {
        console.error('Error al actualizar estado:', err);
        alert('Error al cambiar el estado: ' + err.message);
        // Si falla, forzar una recarga para revertir el toggle visualmente
        this.refreshProducts$.next();
      }
    });
  }
  // --- *** FIN DE LA CORRECCIÓN *** ---
}
