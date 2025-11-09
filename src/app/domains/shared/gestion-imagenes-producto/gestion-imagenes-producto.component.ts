import { Component, Input, OnInit, signal, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '@shared/services/product.service';

/*
 * NOTA DE GEMINI:
 * Este archivo estaba 100% correcto.
 * El método onSubmit() ya usa la clave 'files' (plural) que el backend espera.
 * No se requieren cambios aquí.
*/

@Component({
  selector: 'app-gestion-imagenes-producto',
  templateUrl: './gestion-imagenes-producto.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class GestionImagenesProductoComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  @Input() productoId!: number | string;
  @Output() imagenesSubidas = new EventEmitter<void>();

  imagenesForm: FormGroup;
  archivosSeleccionados: File[] = [];
  previews: string[] = [];

  isDragging = signal(false);
  private maxFiles = 5;

  constructor(private fb: FormBuilder, private productoService: ProductService) {
    this.imagenesForm = this.fb.group({
      imagenesInput: [null]
    });
  }

  ngOnInit(): void {
    if (!this.productoId) {
      console.error("Error: El ID del producto es necesario.");
    }
  }

  // --- LÓGICA DE EVENTOS ---

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

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

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        this.addImageFile(files[i]);
      }
    }
  }

  // --- LÓGICA DE MANEJO DE ARCHIVOS ---

  private addImageFile(file: File): void {
    if (this.archivosSeleccionados.length >= this.maxFiles) {
      // (No usar alert() en producción real, es solo para el ejemplo)
      alert(`¡Solo puedes seleccionar un máximo de ${this.maxFiles} imágenes!`);
      return;
    }
    this.archivosSeleccionados.push(file);
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previews.push(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  clearSelection(): void {
    this.archivosSeleccionados = [];
    this.previews = [];
    this.imagenesForm.reset();
  }

  onSubmit(): void {
    if (this.archivosSeleccionados.length === 0) {
      alert("Por favor, selecciona o pega al menos una imagen.");
      return;
    }
    const formData = new FormData();
    // Esta clave 'files' (plural) es la correcta para tu backend
    for (const file of this.archivosSeleccionados) {
      formData.append('files', file, file.name || `pasted-image-${Date.now()}.png`);
    }

    this.productoService.subirImagenes(this.productoId, formData).subscribe({
      next: (response) => {
        alert('¡Las imágenes se guardaron correctamente!');
        this.clearSelection();
        this.imagenesSubidas.emit();
      },
      error: (err) => {
        console.error('Error al subir las imágenes', err);
        // El error 400 que recibes aquí es por el backend, no por este código.
        alert('Ocurrió un error al guardar las imágenes.');
      }
    });
  }
}
