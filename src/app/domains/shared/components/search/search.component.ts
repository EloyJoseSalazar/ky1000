import { Component, inject } from '@angular/core';
import { Router } from '@angular/router'; // <-- Importar Router

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [],
  template: `
    <form (submit)="onSearch($event)" class="relative">
      <input
        #searchInput
        type="search"
        placeholder="Buscar productos..."
        class="w-full md:w-64 p-2 pl-4 pr-10 border rounded-full focus:outline-none focus:ring-2 focus:ring-red-300"
      >
      <button type="submit" class="absolute right-3 top-1/2 -translate-y-1/2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-gray-500"><path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
      </button>
    </form>
  `
})
export class SearchComponent {
  private router = inject(Router);

  onSearch(event: Event) {
    event.preventDefault(); // Evita que la página se recargue
    const inputElement = (event.target as HTMLFormElement).querySelector('input');
    const searchTerm = inputElement?.value || '';

    // --- LA LÓGICA CLAVE ---
    // Navegamos a la página principal, pasando el término de búsqueda como query param
    this.router.navigate(['/'], {
      queryParams: { q: searchTerm }
    });
  }
}
