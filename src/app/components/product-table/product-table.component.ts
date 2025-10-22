// E:\WebStorm\KY1001\src\app\components\product-table\product-table.component.ts
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '@shared/models/product.model';
import { Router } from "@angular/router";

@Component({
  selector: 'app-product-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-table.component.html',
  styleUrls: ['./product-table.component.css']
})
export class ProductTableComponent {
  @Input({ required: true }) products: Product[] = [];

  @Output() edit = new EventEmitter<string>();
  @Output() remove = new EventEmitter<number>();
  @Output() statusChange = new EventEmitter<{ id: number; isActive: boolean }>();

  defaultImage = '/assets/images.png';
  public router = inject(Router);


  onEdit(productSku: string) {
    this.edit.emit(productSku);
  }

  onDelete(productId: number) {
    this.remove.emit(productId);
  }

  onStatusChange(event: Event, productId: number) {
    const checkbox = event.target as HTMLInputElement;
    this.statusChange.emit({ id: productId, isActive: checkbox.checked });
  }

  handleImageError(event: Event) {
    const element = event.target as HTMLImageElement;
    element.src = this.defaultImage;
  }
}
