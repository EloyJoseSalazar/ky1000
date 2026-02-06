
//src/app/components/product-filters/product-filters.component.ts
import {Component, EventEmitter, inject, OnInit, Output} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";
import {Category} from "@shared/models/category.model";
import {debounceTime} from "rxjs";
import {CategoryService} from "@shared/services/category.service";
import { Afiliado } from '@shared/models/afiliado.model'; // <-- 1. IMPORTAR MODELO
import { AfiliadoService } from '@shared/services/afiliado.service'; // <-- 2. IMPORTAR SERVICIO

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
  private categoryService = inject(CategoryService);
  private afiliadoService = inject(AfiliadoService); // <-- 3. INYECTAR SERVICIO

  categories: Category[] = [];
  afiliados: Afiliado[] = []; // <-- 4. AÑADIR ARRAY PARA AFILIADOS

  filterForm = this.fb.group({
    title: [''],
    sku: [''],
    categoryId: [null as number | null],
    afiliadoCodigo: [null as string | null], // <-- 5. AÑADIR AL FORMULARIO
    creationDate: [''] // Este campo no parece estar en tu API, pero lo dejamos
  });

  ngOnInit() {
    // Cargar categorías
    this.categoryService.getAll().subscribe(cate => {
      this.categories = cate;
    });

    // --- 6. CARGAR AFILIADOS ---
    this.afiliadoService.getAllAfiliados().subscribe(data => {
      this.afiliados = data;
    });
    // ----------------------------

    // Emitir cambios automáticamente
    this.filterForm.valueChanges.pipe(
      debounceTime(500)
    ).subscribe(() => {
      this.applyFilters();
    });
  }

  applyFilters() {
    const formValue = this.filterForm.getRawValue();
    const activeFilters: any = {};

    const isUseful = (value: any) =>
      value !== null &&
      value !== undefined &&
      value !== ''; // Un valor 0 o false es útil, pero aquí no aplica

    if (isUseful(formValue.title)) {
      activeFilters.title = formValue.title;
    }
    if (isUseful(formValue.sku)) {
      activeFilters.sku = formValue.sku;
    }
    if (isUseful(formValue.categoryId)) {
      activeFilters.categoryId = String(formValue.categoryId);
    }

    // --- 7. AÑADIR LÓGICA DE FILTRO DE AFILIADO ---
    if (isUseful(formValue.afiliadoCodigo)) {
      activeFilters.afiliadoCodigo = formValue.afiliadoCodigo; // Ya es string
    }
    // ---------------------------------------------

    if (isUseful(formValue.creationDate)) {
      // Tu API actual no parece filtrar por fecha, pero si lo hiciera:
      // activeFilters.startDate = formValue.creationDate;
      // Por ahora lo ignoramos para que no dé error
    }

    console.log('Filtros FINALES a emitir:', activeFilters);
    this.filtersApplied.emit(activeFilters);
  }

  resetFilters() {
    // Reseteamos el formulario a sus valores iniciales nulos/vacíos
    this.filterForm.reset({
      title: '',
      sku: '',
      categoryId: null,
      afiliadoCodigo: null, // <-- 8. RESETEAR NUEVO CAMPO
      creationDate: ''
    });
    // applyFilters() se llamará automáticamente por el valueChanges
  }
}

