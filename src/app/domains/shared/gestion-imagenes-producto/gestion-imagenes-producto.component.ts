import { CommonModule } from '@angular/common'; // Para *ngIf, *ngFor, etc.

import { ProductService } from '@shared/services/product.service';
import {Component, Input, OnInit} from "@angular/core";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";

@Component({
  selector: 'app-gestion-imagenes-producto',
  templateUrl: './gestion-imagenes-producto.component.html',

  // --- INICIO DE LOS CAMBIOS ---
  standalone: true, // 1. Declara el componente como independiente
  imports: [
    ReactiveFormsModule, // 2. Importa los módulos que usa la plantilla HTML
    CommonModule
  ]
})

export class GestionImagenesProductoComponent implements OnInit {

  // El ID del producto al que pertenecen las imágenes.
  // Podrías recibirlo de la ruta o de un componente padre.

  //@Input() productoId!: number;
  @Input() productoId!: number | string;  //Acepta int y string

  imagenesForm: FormGroup;
  archivosSeleccionados: File[] = [];
  previews: string[] = [];

  constructor(
    private fb: FormBuilder,
    private productoService: ProductService // Servicio para hablar con la API
  ) {
    this.imagenesForm = this.fb.group({
      // Este control es solo para la validación del input
      imagenesInput: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    if (!this.productoId) {
      console.error("Error: El ID del producto es necesario.");
    }
  }

  onFileSelected(event: any): void {
    const files = event.target.files;

    if (files.length > 3) {
      alert("¡Solo puedes seleccionar un máximo de 3 imágenes!");
      this.imagenesForm.get('imagenesInput')?.reset(); // Limpia el input
      return;
    }

    this.archivosSeleccionados = Array.from(files);
    this.previews = []; // Limpiamos las vistas previas anteriores

    // Generamos las vistas previas
    for (const file of this.archivosSeleccionados) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previews.push(e.target.result);
      };
      reader.readAsDataURL(file);
    }

    if (this.archivosSeleccionados.length > 0) {
      this.imagenesForm.get('imagenesInput')?.setValue(this.archivosSeleccionados);
    } else {
      this.imagenesForm.get('imagenesInput')?.setValue(null);
    }
  }

  onSubmit(): void {
    if (this.archivosSeleccionados.length === 0) {
      alert("Por favor, selecciona al menos una imagen.");
      return;
    }

    // Usamos FormData para enviar archivos
    const formData = new FormData();
    for (const file of this.archivosSeleccionados) {
      // La clave 'files' debe coincidir con la que espera el backend
      formData.append('files', file, file.name);
    }

    console.log(`Enviando ${this.archivosSeleccionados.length} imágenes para el producto ID: ${this.productoId}`);

    // Llamamos al servicio para subir las imágenes
    this.productoService.subirImagenes(this.productoId, formData).subscribe({
      next: (response) => {
        console.log('¡Imágenes subidas con éxito!', response);
        alert('¡Las imágenes se guardaron correctamente!');
        // Aquí podrías redirigir al usuario o limpiar el formulario
        this.imagenesForm.reset();
        this.previews = [];
        this.archivosSeleccionados = [];
      },
      error: (err) => {
        console.error('Error al subir las imágenes', err);
        alert('Ocurrió un error al guardar las imágenes.');
      }
    });
  }
}
