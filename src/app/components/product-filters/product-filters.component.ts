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
    categoryId: [''],
    creationDate: ['']
  });

  ngOnInit() {
// Cargar categorías para el dropdown
    this.categoryService.getAll().subscribe(cats => {
      this.categories = cats;
    });

// Emitir cambios automáticamente mientras el usuario escribe (opcional, pero mejora la UX)
    this.filterForm.valueChanges.pipe(
      debounceTime(500) // Espera 500ms después de la última pulsación de tecla
    ).subscribe(value => {
      this.applyFilters();
    });
  }

  applyFilters() {
// Filtramos los valores que no son nulos o vacíos
    const activeFilters: any = {};
    const formValue = this.filterForm.getRawValue();

    if (formValue.title) activeFilters.title = formValue.title;
    if (formValue.sku) activeFilters.sku = formValue.sku;
    if (formValue.categoryId) activeFilters.categoryId = formValue.categoryId;
    if (formValue.creationDate) activeFilters.creationDate = formValue.creationDate;

    this.filtersApplied.emit(activeFilters);
  }

  resetFilters() {
    this.filterForm.reset();
    this.applyFilters(); // Emitirá un objeto vacío, mostrando todos los productos
  }
}
