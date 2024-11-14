import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TermsRoutingModule } from './terms-routing.module';
import { TermsComponent } from './terms.component';
import { SharedDirectiveModule } from 'shared/directives';
@NgModule({
  declarations: [TermsComponent],
  imports: [
    CommonModule,
    TermsRoutingModule,
    SharedDirectiveModule
  ]
})
export class TermsModule { }
