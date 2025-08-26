import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '@shared/services/product.service'; // Tu servicio de productos
import { Product } from '@shared/models/product.model';
import { GestionImagenesProductoComponent } from '@shared/gestion-imagenes-producto/gestion-imagenes-producto.component'; // Nuestro componente de ayer

@Component({
  selector: 'app-gestion-productos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GestionImagenesProductoComponent],
  templateUrl: './gestion-productos.component.html',
})
export default class GestionProductosComponent implements OnInit {
  // Inyección de dependencias moderna
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);

  productForm: FormGroup;
  isEditMode = false;
  currentProductId: string | null = null;

  // Signals para manejar el estado del producto y las imágenes
  product = signal<Product | null>(null);
  mainImage = signal<string>('');

  constructor() {
    // Definimos la estructura y validaciones del formulario
    this.productForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      price: [0, [Validators.required, Validators.min(0)]],
      description: ['', [Validators.required]],
      categoryId: [1, [Validators.required]], // Por defecto categoría 1, puedes cambiarlo
      slug: ['', [Validators.required]], // Esto funciona como tu SKU
      images: [[] as string[]] // No se edita directamente aquí, pero es parte del modelo
    });
  }

  ngOnInit(): void {
    // Leemos el parámetro 'id' de la URL para saber si estamos creando o editando
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id && id !== 'nuevo') {
        this.isEditMode = true;
        this.currentProductId = id;
        this.loadProduct(id);
      } else {
        this.isEditMode = false;
        this.currentProductId = null;
      }
    });
  }

  loadProduct(id: string): void {
    this.productService.getOne(id).subscribe({
      next: (product) => {
        this.product.set(product);
        this.productForm.patchValue(product); // Llena el formulario con los datos del producto
        if (product.images.length > 0) {
          this.mainImage.set(product.images[0]); // Pone la primera imagen como principal
        }
      },
      error: () => this.router.navigate(['/ingresa/producto/nuevo']) // Si no lo encuentra, redirige a 'crear'
    });
  }

  // Cambia la imagen principal al hacer clic en una miniatura
  changeMainImage(imageUrl: string): void {
    this.mainImage.set(imageUrl);
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched(); // Muestra errores si el formulario es inválido
      return;
    }

    const formValue = this.productForm.value;

    if (this.isEditMode && this.currentProductId) {
      // MODO EDICIÓN
      this.productService.update(this.currentProductId, formValue).subscribe({
        next: (updatedProduct) => {
          alert('¡Producto actualizado con éxito!');
          this.product.set(updatedProduct); // Actualiza el signal para refrescar la vista
        },
        error: (err) => alert(`Error al actualizar: ${err.message}`)
      });
    } else {
      // MODO CREACIÓN
      this.productService.create(formValue).subscribe({
        next: (newProduct) => {
          alert('¡Producto creado con éxito!');
          // Redirige a la página de edición del nuevo producto creado
          this.router.navigate(['/ingresa/producto', newProduct.id]);
        },
        error: (err) => alert(`Error al crear: ${err.message}`)
      });
    }
  }

  onDelete(): void {
    if (this.isEditMode && this.currentProductId && confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      this.productService.delete(this.currentProductId).subscribe({
        next: () => {
          alert('Producto eliminado con éxito');
          this.router.navigate(['/ingresa']);
        },
        error: (err) => alert(`Error al eliminar: ${err.message}`)
      });
    }
  }
}
