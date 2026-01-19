import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  // Este evento "avisa" afuera que se hizo clic en el botón
  @Output() toggleCategories = new EventEmitter<void>();

  onCategoriesClick() {
    this.toggleCategories.emit();
  }
}
