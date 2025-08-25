// en tu-modulo.module.ts
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import {NgModule} from "@angular/core";

@NgModule({
  imports: [
    // ... otros módulos
    HttpClientModule,
    ReactiveFormsModule
  ],
  // ...
})
export class TuModuloModule { }
