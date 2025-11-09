
//src/app/components/product-filters/product-filters.component.ts
import {Component, EventEmitter, inject, OnInit, Output} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";
import {Category} from "@shared/models/category.model";
import {debounceTime} from "rxjs";
import {CategoryService} from "@shared/services/category.service";


@Component({
  selector: 'app-product-filters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-filters.component.html',
  styleUrls: ['./product-filters.component.css']
})
export class ProductFiltersComponent implements OnInit {
  @Output() filtersApplied = new EventEmitter<any>();

  private fb = inject(FormBuilder);
// Asumo que tienes un servicio para obtener todas las categorías
  private categoryService = inject(CategoryService);

  categories: Category[] = [];

  filterForm = this.fb.group({
    title: [''],
    sku: [''],
   // categoryId: [''],
    categoryId: [null as number | null],
    creationDate: ['']
  });

  ngOnInit() {
// Cargar categorías para el dropdown
    this.categoryService.getAll().subscribe(cate => {
      // 👇 ¡NUEVA DEPURACIÓN CRÍTICA AQUÍ! 👇
      console.log('DATOS CRUDOS DEL CATEGORY SERVICE:', cate);
      if (cate && cate.length > 0) {
        console.log('ID DE LA PRIMERA CATEGORÍA:', cate[0].id_cate);
        console.log('TIPO DE ID (debe ser "number"):', typeof cate[0].id_cate);
      }
      // 👆 FIN DE DEPURACIÓN 👆

      this.categories = cate;
    });

// Emitir cambios automáticamente mientras el usuario escribe (opcional, pero mejora la UX)
    this.filterForm.valueChanges.pipe(
      debounceTime(500) // Espera 500ms después de la última pulsación de tecla
    ).subscribe(value => {
      this.applyFilters();
    });

  }

  applyFilters() {
    // 1. Obtenemos todos los valores del formulario
    const formValue = this.filterForm.getRawValue();

    const activeFilters: any = {};

    // Función auxiliar para verificar si un valor es 'útil'
    const isUseful = (value: any) =>
      value !== null &&
      value !== undefined &&
      value !== '' &&
      value !== 'undefined'; // <-- CLAVE: Excluir la cadena "undefined"

    // 2. Revisamos cada campo
    if (isUseful(formValue.title)) {
      activeFilters.title = formValue.title;
    }

    if (isUseful(formValue.sku)) {
      activeFilters.sku = formValue.sku;
    }

    if (isUseful(formValue.categoryId)) {
      // 3. Convertimos a string antes de emitir, para estandarizar
      activeFilters.categoryId = String(formValue.categoryId);
    }

    if (isUseful(formValue.creationDate)) {
      activeFilters.creationDate = formValue.creationDate;
    }


    console.log('Valor RAW de categoryId en el form:', formValue.categoryId);
    console.log('Filtros FINALES a emitir:', activeFilters);

    this.filtersApplied.emit(activeFilters);
  }

  resetFilters() {
    this.filterForm.reset();
    this.applyFilters(); // Emitirá un objeto vacío, mostrando todos los productos
  }
}
