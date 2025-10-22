// E:\WebStorm\KY1001\src\app\pages\gestion-productos\gestion-productos.component.ts
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// 👇 CAMBIO 1: Importamos 'ActivatedRoute' para leer la URL 👇
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '@shared/services/product.service';
import { Product } from '@shared/models/product.model';
import { GestionImagenesProductoComponent } from '@shared/gestion-imagenes-producto/gestion-imagenes-producto.component';
// 👇 CAMBIO 2: Importamos 'take' para que la suscripción a la URL sea única 👇
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil, take } from 'rxjs';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-gestion-productos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GestionImagenesProductoComponent, DragDropModule],
  templateUrl: './gestion-productos.component.html',
})
export class GestionProductosComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private productService = inject(ProductService);
  // 👇 CAMBIO 3: Inyectamos 'ActivatedRoute' 👇
  private route = inject(ActivatedRoute);

  productForm: FormGroup;
  isEditMode = false;
  currentProductId: number | null = null;
  product = signal<Product | null>(null);
  mainImage = signal<string>('');
  isSearching = signal(false);
  private destroy$ = new Subject<void>();

  constructor() {
    this.productForm = this.fb.group({
      sku: ['', [Validators.required]],
      title: ['', [Validators.required, Validators.minLength(3)]],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      description: ['', [Validators.required]],
      categoryId: [1, [Validators.required]],
      images: [[] as string[]]
    });
  }

  ngOnInit(): void {
    // --- LÓGICA CENTRAL: Escuchar cambios en el campo sku ---
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

    this.route.queryParams.pipe(
      take(1) // Solo nos interesa el valor una vez, al cargar
    ).subscribe(params => {
      const skuFromUrl = params['sku'];
      if (skuFromUrl) {
        // Si hay un SKU en la URL, lo ponemos en el formulario.
        // Esto disparará automáticamente el 'valueChanges' de arriba.
        this.productForm.get('sku')?.setValue(skuFromUrl);
      }
    });
  }



  // --- NUEVO MÉTODO CENTRALIZADO PARA CARGAR PRODUCTOS ---
  loadProductBySku(sku: string): void {
    this.isSearching.set(true);
    this.productService.getBySku(sku).subscribe(product => {
      this.isSearching.set(false);
      if (product) {
        this.setupEditMode(product);
      } else {
        // Mantenemos el SKU que el usuario buscó en el campo
        this.resetToCreateMode(this.productForm.get('sku')?.value);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupEditMode(product: Product): void {
    this.isEditMode = true;
    this.currentProductId = product.id;
    this.product.set(product);
    // Usamos 'reset' en lugar de 'patchValue' para limpiar validadores antiguos
    this.productForm.reset(product);
    if (product.images.length > 0) {
      this.mainImage.set(product.images[0]);
    }
  }

  private resetToCreateMode(keepsku: string | null = null): void {
    this.isEditMode = false;
    this.currentProductId = null;
    this.product.set(null);
    this.mainImage.set('');
    this.productForm.reset({ sku: keepsku, price: 0, categoryId: 1, images: [] });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }
    // Usamos getRawValue() por si algún campo como SKU está deshabilitado
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
          // Navegamos a la ruta de edición del nuevo producto
          this.router.navigate(['/ingresa/producto', newProduct.sku]);
        },
        error: (err) => alert(`Error al crear: ${err.message}`)
      });
    }
  }

  // ... (El resto de tus métodos como onDelete, onImageDrop, etc. no necesitan cambios)
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
