// en tu-modulo.module.ts
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import {NgModule} from "@angular/core";
import { ProductListRoutingModule } from './pages/product-list/product-list-routing.module';

@NgModule({
  imports: [
    // ... otros módulos
    HttpClientModule,
    ReactiveFormsModule,
    ProductListRoutingModule
  ],
  // ...
})
export class TuModuloModule { }
