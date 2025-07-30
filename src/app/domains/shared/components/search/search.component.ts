import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
// --- CORRECCIÓN DE RUTA AQUÍ ---
// Subimos tres niveles (../../../) para llegar a 'src/app' y luego bajamos.
import { ProductService } from '@shared/services/product.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search.component.html',
})
export class SearchComponent {
  searchControl = new FormControl('');
  // Ahora TypeScript sabe que 'productService' es de tipo ProductService
  private productService = inject(ProductService);

  triggerSearch() {
    const searchTerm = this.searchControl.value || '';
    if (searchTerm) {
      // Los errores de 'unknown' desaparecen porque el servicio ya es conocido
      this.productService.searchByTitle(searchTerm).subscribe();
    } else {
      this.productService.getProducts().subscribe();
    }
  }
}

