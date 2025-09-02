import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '@shared/services/product.service';

@Component({
  selector: 'app-gestion-imagenes-producto',
  templateUrl: './gestion-imagenes-producto.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class GestionImagenesProductoComponent implements OnInit {
  @Input() productoId!: number | string;

  imagenesForm: FormGroup;
  archivosSeleccionados: File[] = [];
  previews: string[] = [];

  // Signal para el feedback visual de arrastrar y soltar
  isDragging = signal(false);
  private maxFiles = 5;

  constructor(private fb: FormBuilder, private productoService: ProductService) {
    this.imagenesForm = this.fb.group({
      // El input ya no necesita ser 'required', validaremos por el tamaño del array
      imagenesInput: [null]
    });
  }

  ngOnInit(): void {
    if (!this.productoId) {
      console.error("Error: El ID del producto es necesario.");
    }
  }

  // --- NUEVO: Lógica de Pegado desde el Portapapeles ---
  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          this.addImageFile(file);
        }
      }
    }
  }

  // --- NUEVO: Lógica de Arrastrar y Soltar (Drag and Drop) ---
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        this.addImageFile(files[i]);
      }
    }
  }

  // --- MODIFICADO: Ahora solo llama a la función helper ---
  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        this.addImageFile(files[i]);
      }
    }
  }

  // --- NUEVO: Función Helper Centralizada para añadir imágenes ---
  private addImageFile(file: File): void {
    if (this.archivosSeleccionados.length >= this.maxFiles) {
      alert(`¡Solo puedes seleccionar un máximo de ${this.maxFiles} imágenes!`);
      return;
    }

    // Añadimos el nuevo archivo a nuestras listas
    this.archivosSeleccionados.push(file);

    // Generamos la vista previa para el nuevo archivo
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previews.push(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  // --- NUEVO: Función para limpiar la selección ---
  clearSelection(): void {
    this.archivosSeleccionados = [];
    this.previews = [];
    this.imagenesForm.reset();
  }

  // --- MODIFICADO: La lógica de envío se mantiene, pero más limpia ---
  onSubmit(): void {
    if (this.archivosSeleccionados.length === 0) {
      alert("Por favor, selecciona o pega al menos una imagen.");
      return;
    }

    const formData = new FormData();
    for (const file of this.archivosSeleccionados) {
      formData.append('files', file, file.name || `pasted-image-${Date.now()}.png`);
    }

    this.productoService.subirImagenes(this.productoId, formData).subscribe({
      next: (response) => {
        alert('¡Las imágenes se guardaron correctamente!');
        this.clearSelection();
        // OPCIONAL: Emitir un evento para que el componente padre refresque la lista de imágenes
      },
      error: (err) => {
        console.error('Error al subir las imágenes', err);
        alert('Ocurrió un error al guardar las imágenes.');
      }
    });
  }
}
