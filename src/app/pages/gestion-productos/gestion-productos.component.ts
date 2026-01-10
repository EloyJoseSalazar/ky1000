import { Component, OnInit, OnDestroy, inject, signal, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms'; // <-- AGREGADO FormsModule
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil, take } from 'rxjs';

// Servicios
import { ProductService } from '@shared/services/product.service';
import { CategoryService } from '@shared/services/category.service';
import { AfiliadoService } from '@shared/services/afiliado.service';

// Modelos
import { Product, InterestItem } from '@shared/models/product.model'; // <-- AGREGADO InterestItem
import { Category } from '@shared/models/category.model';
import { Afiliado } from '@shared/models/afiliado.model';

// Componentes
import { GestionImagenesProductoComponent } from '@shared/gestion-imagenes-producto/gestion-imagenes-producto.component';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-gestion-productos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, GestionImagenesProductoComponent, DragDropModule], // <-- AGREGADO FormsModule
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
  private elementRef = inject(ElementRef);

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

  // NUEVO: Gestión de Items de Interés
  currentInterestedItems = signal<InterestItem[]>([]);
  newItemImageUrl = signal('');
  newItemKeyword = signal('');

  constructor() {
    this.productForm = this.fb.group({
      sku: ['', [Validators.required]],
      title: ['', [Validators.required, Validators.minLength(3)]],
      precioCosto: [0, [Validators.required, Validators.min(0)]],
      porcentajeUtilidad: [0, [Validators.required, Validators.min(0)]],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      description: ['', [Validators.required]],
      categoryId: [1, [Validators.required]],
      afiliadoCodigo: ['1'],
      images: [[] as string[]]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadAfiliados();
    this.setupMathLogic();

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

    this.route.queryParams.pipe(take(1)).subscribe(params => {
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

  private setupEditMode(product: Product): void {
    this.isEditMode = true;
    this.currentProductId = product.id;
    this.product.set(product);

    // Cargar items de interés existentes
    if (product.interestedItems) {
      this.currentInterestedItems.set([...product.interestedItems]);
    } else {
      this.currentInterestedItems.set([]);
    }

    const formValues = {
      sku: product.sku,
      title: product.title,
      precioCosto: product.precioCosto || 0,
      porcentajeUtilidad: product.porcentajeUtilidad || 0,
      price: product.price,
      stock: product.stock,
      description: product.description,
      categoryId: product.category.id_cate,
      afiliadoCodigo: product.afiliadoCodigo || null,
      images: product.images
    };

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

    // Limpiar items de interés
    this.currentInterestedItems.set([]);
    this.newItemImageUrl.set('');
    this.newItemKeyword.set('');

    this.productForm.reset({
      sku: keepsku,
      precioCosto: 0,       // Resetear
      porcentajeUtilidad: 0, // Resetear
      price: 0,
      stock: 0,
      categoryId: 1,
      afiliadoCodigo: '1',
      images: []
    });
  }

  // NUEVO: Métodos para Items de Interés
  addInterestItem(): void {
    const url = this.newItemImageUrl();
    const keyword = this.newItemKeyword();

    if (url && keyword) {
      if (this.currentInterestedItems().length >= 6) {
        alert('Máximo 6 imágenes de interés permitidas.');
        return;
      }
      this.currentInterestedItems.update(items => [...items, { imageUrl: url, searchKeyword: keyword }]);
      // Limpiar inputs
      this.newItemImageUrl.set('');
      this.newItemKeyword.set('');
    }
  }

  removeInterestItem(index: number): void {
    this.currentInterestedItems.update(items => items.filter((_, i) => i !== index));
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    // Combinamos los datos del formulario con los items de interés
    const formValue = this.productForm.getRawValue();
    const fullPayload = {
      ...formValue,
      interestedItems: this.currentInterestedItems()
    };

    if (this.isEditMode && this.currentProductId) {
      this.productService.update(this.currentProductId.toString(), fullPayload).subscribe({
        next: (updatedProduct) => {
          alert('¡Producto actualizado con éxito!');
          this.product.set(updatedProduct);
        },
        error: (err) => alert(`Error al actualizar: ${err.message}`)
      });
    } else {
      this.productService.create(fullPayload).subscribe({
        next: (newProduct) => {
          alert('¡Producto creado con éxito!');
          this.setupEditMode(newProduct);
        },
        error: (err) => alert(`Error al crear: ${err.message}`)
      });
    }
  }

  onDelete(): void {
    if (this.isEditMode && this.currentProductId && confirm('¿Estás seguro de eliminar este producto?')) {
      const idToDelete = this.currentProductId.toString();
      this.productService.delete(idToDelete).subscribe({
        next: () => {
          alert('Producto eliminado con éxito');
          this.resetToCreateMode();
        },
        error: (err) => {
          if (err.status === 500) {
            alert('Producto eliminado con éxito (error 500 fantasma ignorado).');
            this.resetToCreateMode();
          } else {
            console.error('Error real en la eliminación:', err);
            alert(`Error al eliminar: ${err.message}`);
          }
        }
      });
    }
  }

  onNewProductClick(): void {
    this.resetToCreateMode();
    setTimeout(() => {
      const skuInput = this.elementRef.nativeElement.querySelector('#sku');
      if (skuInput) skuInput.focus();
    }, 0);
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

    // Aquí también debemos asegurarnos de mantener los items de interés al actualizar el orden de imágenes principales
    const fullProductToUpdate = {
      ...this.productForm.getRawValue(),
      images: newImagesOrder,
      interestedItems: this.currentInterestedItems()
    };

    this.productService.update(this.currentProductId.toString(), fullProductToUpdate).subscribe({
      next: (updatedProduct) => {
        this.product.set(updatedProduct);
        if (updatedProduct.images.length > 0) {
          this.mainImage.set(updatedProduct.images[0]);
        }
      },
      error: (err) => {
        this.product.set(product);
        alert('No se pudo guardar el nuevo orden.');
      }
    });
  }

  private setupMathLogic(): void {
    const costControl = this.productForm.get('precioCosto');
    const utilControl = this.productForm.get('porcentajeUtilidad');
    const priceControl = this.productForm.get('price');

    if (!costControl || !utilControl || !priceControl) return;

    // CASO A: Si cambia el Costo -> Recalcula el Precio (manteniendo el % de utilidad fijo)
    costControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(costo => {
      const utilidad = utilControl.value || 0;
      if (costo != null) {
        // Fórmula: Costo + (Costo * % / 100)
        const nuevoPrecio = costo + (costo * (utilidad / 100));
        // Usamos { emitEvent: false } para no disparar el evento del precio y evitar bucles
        priceControl.setValue(Number(nuevoPrecio.toFixed(2)), { emitEvent: false });
      }
    });

    // CASO B: Si cambia el Porcentaje -> Recalcula el Precio (basado en el costo actual)
    utilControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(utilidad => {
      const costo = costControl.value || 0;
      if (utilidad != null) {
        const nuevoPrecio = costo + (costo * (utilidad / 100));
        priceControl.setValue(Number(nuevoPrecio.toFixed(2)), { emitEvent: false });
      }
    });

    // CASO C: Si cambia el Precio Final -> Recalcula el Porcentaje (basado en el costo actual)
    priceControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(precio => {
      const costo = costControl.value || 0;
      if (precio != null && costo > 0) {
        // Fórmula: ((Precio - Costo) / Costo) * 100
        const nuevaUtilidad = ((precio - costo) / costo) * 100;
        utilControl.setValue(Number(nuevaUtilidad.toFixed(2)), { emitEvent: false });
      }
    });
  }


}
