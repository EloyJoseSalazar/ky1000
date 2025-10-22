import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CounterComponent } from '@shared/components/counter/counter.component';
import { HighlightDirective } from '@shared/directives/highlight.directive';
import { HeaderComponent } from '@shared/components/header/header.component';
import { WaveAudioComponent } from '@info/components/wave-audio/wave-audio.component';

@Component({
  selector: 'app-Contacto',
  standalone: true, // Se recomienda usar standalone para componentes modernos
  imports: [
    CommonModule
  ],
  templateUrl: './contacto.component.html'
})
export class ContactoComponent {
  duration = signal(1000);
  message = signal('Hola');

  // Aquí puedes agregar la lógica para manejar el formulario en el futuro,
  // por ejemplo, usando ReactiveFormsModule.
}
