import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '@shared/services/product.service';
import { Product } from '@shared/models/product.model';
import { GestionImagenesProductoComponent } from '@shared/gestion-imagenes-producto/gestion-imagenes-producto.component';
// Importaciones clave de RxJS
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';

@Component({
  selector: 'app-gestion-productos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GestionImagenesProductoComponent],
  templateUrl: './gestion-productos.component.html',
})
export default class GestionProductosComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private productService = inject(ProductService);

  productForm: FormGroup;
  isEditMode = false;
  currentProductId: number | null = null; // Cambiado a number si tus IDs son numéricos

  product = signal<Product | null>(null);
  mainImage = signal<string>('');
  isSearching = signal(false); // Signal para mostrar un feedback de búsqueda

  // Subject para manejar la desuscripción y evitar fugas de memoria
  private destroy$ = new Subject<void>();

  constructor() {
    this.productForm = this.fb.group({
      // El orden aquí no afecta al HTML
      slug: ['', [Validators.required]],
      title: ['', [Validators.required, Validators.minLength(3)]],
      price: [0, [Validators.required, Validators.min(0)]],
      description: ['', [Validators.required]],
      categoryId: [1, [Validators.required]],
      images: [[] as string[]]
    });
  }

  ngOnInit(): void {
    // --- LÓGICA CENTRAL: Escuchar cambios en el campo SLUG ---
    this.productForm.get('slug')!.valueChanges.pipe(
      debounceTime(500), // Espera 500ms después de la última pulsación
      distinctUntilChanged(), // Solo emite si el valor ha cambiado realmente
      switchMap(slug => {
        if (!slug) {
          // Si el campo está vacío, reseteamos todo al modo 'Crear'
          this.resetToCreateMode();
          return []; // Emite un observable vacío para detener la cadena
        }
        this.isSearching.set(true);
        return this.productService.getBySlug(slug);
      }),
      takeUntil(this.destroy$) // Se desuscribe automáticamente cuando el componente se destruye
    ).subscribe(product => {
      this.isSearching.set(false);
      if (product) {
        // --- PRODUCTO ENCONTRADO ---
        this.setupEditMode(product);
      } else {
        // --- PRODUCTO NO ENCONTRADO ---
        this.resetToCreateMode(this.productForm.get('slug')?.value);
      }
    });
  }

  // Se ejecuta cuando el componente es destruido
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Configura el formulario para el MODO EDICIÓN
  private setupEditMode(product: Product): void {
    this.isEditMode = true;
    this.currentProductId = product.id;
    this.product.set(product);
    this.productForm.patchValue(product);
    if (product.images.length > 0) {
      this.mainImage.set(product.images[0]);
    }
  }

  // Resetea el formulario al MODO CREACIÓN
  private resetToCreateMode(keepSlug: string | null = null): void {
    this.isEditMode = false;
    this.currentProductId = null;
    this.product.set(null);
    this.mainImage.set('');
    // Reseteamos el formulario, pero mantenemos el slug que el usuario escribió
    this.productForm.reset({ slug: keepSlug, price: 0, categoryId: 1, images: [] });
  }

  // La lógica de onSubmit y onDelete se mantiene casi idéntica
  onSubmit(): void {
    // ... (El código de tu onSubmit original es correcto y no necesita cambios)
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }
    const formValue = this.productForm.value;
    if (this.isEditMode && this.currentProductId) {
      this.productService.update(this.currentProductId.toString(), formValue).subscribe({ // Asegúrate de que el ID se pase como string si es necesario
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
          this.router.navigate(['/ingresa']); // O redirigir a donde prefieras
          this.setupEditMode(newProduct); // Cambiamos a modo edición con el nuevo producto
        },
        error: (err) => alert(`Error al crear: ${err.message}`)
      });
    }
  }

  onDelete(): void {
    // ... (Tu código onDelete original es correcto)
  }

  changeMainImage(imageUrl: string): void {
    this.mainImage.set(imageUrl);
  }

  // ... (después de onDelete) ...

  onDeleteImage(imageUrl: string, event: MouseEvent): void {
    // Detenemos la propagación para no activar el changeMainImage
    event.stopPropagation();

    if (!this.currentProductId) return;

    if (confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
      this.productService.deleteImage(this.currentProductId, imageUrl).subscribe({
        next: (updatedProduct) => {
          // --- Feedback Instantáneo ---
          // Actualizamos nuestro signal local con el producto que devuelve la API
          this.product.set(updatedProduct);

          // Si la imagen eliminada era la principal, seleccionamos la primera de la lista
          if (this.mainImage() === imageUrl) {
            this.mainImage.set(updatedProduct.images.length > 0 ? updatedProduct.images[0] : '');
          }
          alert('Imagen eliminada con éxito');
        },
        error: (err) => alert(`Error al eliminar la imagen: ${err.message}`)
      });
    }
  }

}
