import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactusRoutingModule } from './contactus-routing.module';
import { ContactusComponent } from './contactus.component';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { ButtonModule, ButtonsModule } from '@progress/kendo-angular-buttons';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { FormsModule } from '@angular/forms';
import { SharedDirectiveModule } from 'shared/directives';
@NgModule({
  declarations: [ContactusComponent],
  imports: [
    CommonModule,
    ContactusRoutingModule,
    DropDownsModule,
    ButtonModule,
    ButtonsModule,
    InputsModule,
    FormsModule,
    SharedDirectiveModule
  ]
})
export class ContactusModule { }
