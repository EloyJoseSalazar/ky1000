import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil, take } from 'rxjs';

// Servicios
import { ProductService } from '@shared/services/product.service';
import { CategoryService } from '@shared/services/category.service';
import { AfiliadoService } from '@shared/services/afiliado.service';

// Modelos
import { Product } from '@shared/models/product.model';
import { Category } from '@shared/models/category.model';
import { Afiliado } from '@shared/models/afiliado.model';

// Componentes
import { GestionImagenesProductoComponent } from '@shared/gestion-imagenes-producto/gestion-imagenes-producto.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-gestion-productos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GestionImagenesProductoComponent, DragDropModule],
  templateUrl: './gestion-productos.component.html',
})
export class GestionProductosComponent implements OnInit, OnDestroy {
  // Inyecciones
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private afiliadoService = inject(AfiliadoService);

  // Propiedades
  productForm: FormGroup;
  isEditMode = false;
  currentProductId: number | null = null;
  product = signal<Product | null>(null);
  mainImage = signal<string>('');
  isSearching = signal(false);
  private destroy$ = new Subject<void>();

  // Signals para los selects
  categories = signal<Category[]>([]);
  afiliados = signal<Afiliado[]>([]);

  constructor() {
    this.productForm = this.fb.group({
      sku: ['', [Validators.required]],
      title: ['', [Validators.required, Validators.minLength(3)]],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      description: ['', [Validators.required]],
      // 👇 CAMBIO 1: Valor por defecto "1" para Categoría
      categoryId: [1, [Validators.required]],
      // 👇 CAMBIO 2: Valor por defecto "1" (como string) para Afiliado
      afiliadoCodigo: ['1'],
      images: [[] as string[]]
    });
  }

  ngOnInit(): void {
    // Cargar las listas para los selects
    this.loadCategories();
    this.loadAfiliados();

    // Lógica para escuchar cambios en SKU (sin cambios)
    this.productForm.get('sku')!.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(sku => {
        if (!sku) {
          this.resetToCreateMode();
          return [];
        }
        this.isSearching.set(true);
        return this.productService.getBySku(sku);
      }),
      takeUntil(this.destroy$)
    ).subscribe(product => {
      this.isSearching.set(false);
      if (product) {
        this.setupEditMode(product);
      } else {
        this.resetToCreateMode(this.productForm.get('sku')?.value);
      }
    });

    // Lógica para cargar producto desde la URL (sin cambios)
    this.route.queryParams.pipe(
      take(1)
    ).subscribe(params => {
      const skuFromUrl = params['sku'];
      if (skuFromUrl) {
        this.productForm.get('sku')?.setValue(skuFromUrl);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Métodos para cargar selects (sin cambios)
  loadCategories(): void {
    this.categoryService.getAll().pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.categories.set(data);
    });
  }

  loadAfiliados(): void {
    this.afiliadoService.getAllAfiliados().pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.afiliados.set(data);
    });
  }

  // ---
  // 👇 CAMBIO 3: CORRECCIÓN EN setupEditMode
  // ---
  private setupEditMode(product: Product): void {
    this.isEditMode = true;
    this.currentProductId = product.id;
    this.product.set(product);

    // Mapeamos manualmente el producto al formulario
    // para asegurar que 'categoryId' se extrae de 'product.category.id_cate'
    // Esto corrige el problema que viste al crear un producto.
    const formValues = {
      sku: product.sku,
      title: product.title,
      price: product.price,
      stock: product.stock,
      description: product.description,
      categoryId: product.category.id_cate, // Extraemos el ID del objeto
      afiliadoCodigo: product.afiliadoCodigo || null, // Asignamos el código o null
      images: product.images
    };

    // Usamos 'reset' con el objeto mapeado
    this.productForm.reset(formValues);

    if (product.images.length > 0) {
      this.mainImage.set(product.images[0]);
    }
  }

  private resetToCreateMode(keepsku: string | null = null): void {
    this.isEditMode = false;
    this.currentProductId = null;
    this.product.set(null);
    this.mainImage.set('');

    // 👇 CAMBIO 4: Valores por defecto "1" en el reset
    this.productForm.reset({
      sku: keepsku,
      price: 0,
      stock: 0,
      categoryId: 1, // Valor por defecto
      afiliadoCodigo: '1', // Valor por defecto
      images: []
    });
  }

  // ---
  // onSubmit (SIN CAMBIOS)
  // La lógica aquí ya es correcta. Al crear, llama a setupEditMode,
  // que ahora (con la corrección) poblará la categoría correctamente.
  // ---
  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const formValue = this.productForm.getRawValue();

    if (this.isEditMode && this.currentProductId) {
      this.productService.update(this.currentProductId.toString(), formValue).subscribe({
        next: (updatedProduct) => {
          alert('¡Producto actualizado con éxito!');
          this.product.set(updatedProduct);
        },
        error: (err) => alert(`Error al actualizar: ${err.message}`)
      });
    } else {
      this.productService.create(formValue).subscribe({
        next: (newProduct) => {
          alert('¡Producto creado con éxito!');
          // Llamamos a setupEditMode, que ahora está corregido
          this.setupEditMode(newProduct);
        },
        error: (err) => alert(`Error al crear: ${err.message}`)
      });
    }
  }

  // ... (El resto de tus métodos: onDelete, changeMainImage, onDeleteImage, recargarProducto, onImageDrop)
  // ... (No necesitan cambios)

  // (Asegúrate de que los métodos de abajo estén presentes)

  onDelete(): void {
    if (this.isEditMode && this.currentProductId && confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      const idToDelete = this.currentProductId.toString();
      this.productService.delete(idToDelete).subscribe({
        next: () => {
          alert('Producto eliminado con éxito');
          this.resetToCreateMode();
          this.router.navigate(['/ingresa/lista-productos']);
        },
        error: (err) => {
          console.error('Error en la eliminación:', err);
          alert(`Error al eliminar: ${err.message}`);
        }
      });
    }
  }

  changeMainImage(imageUrl: string): void {
    this.mainImage.set(imageUrl);
  }

  onDeleteImage(imageUrl: string, event: MouseEvent): void {
    event.stopPropagation();
    if (!this.currentProductId) return;
    if (confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
      this.productService.deleteImage(this.currentProductId, imageUrl).subscribe({
        next: (updatedProduct) => {
          this.product.set(updatedProduct);
          if (this.mainImage() === imageUrl) {
            this.mainImage.set(updatedProduct.images.length > 0 ? updatedProduct.images[0] : '');
          }
          alert('Imagen eliminada con éxito');
        },
        error: (err) => alert(`Error al eliminar la imagen: ${err.message}`)
      });
    }
  }

  recargarProducto(): void {
    if (this.currentProductId) {
      this.productService.getOne(this.currentProductId.toString()).subscribe({
        next: product => this.setupEditMode(product)
      });
    }
  }

  onImageDrop(event: CdkDragDrop<string[]>): void {
    const product = this.product();
    if (!product || !this.currentProductId) return;

    const newImagesOrder = [...product.images];
    moveItemInArray(newImagesOrder, event.previousIndex, event.currentIndex);

    this.product.update(currentProduct => ({ ...currentProduct!, images: newImagesOrder }));

    const fullProductToUpdate = { ...this.productForm.getRawValue(), images: newImagesOrder };

    this.productService.update(this.currentProductId.toString(), fullProductToUpdate).subscribe({
      next: (updatedProduct) => {
        this.product.set(updatedProduct);
        if (updatedProduct.images.length > 0) {
          this.mainImage.set(updatedProduct.images[0]);
        }
      },
      error: (err) => {
        this.product.set(product); // Revertir en caso de error
        alert('No se pudo guardar el nuevo orden.');
      }
    });
  }
}
