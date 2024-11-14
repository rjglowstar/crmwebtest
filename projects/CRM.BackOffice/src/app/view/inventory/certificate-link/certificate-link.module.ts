import { NgModule } from '@angular/core';
import { InventoryService } from '../../../services';
import { CommonService } from 'shared/services';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { CertificateLinkComponent } from './certificate-link.component';

@NgModule({
  declarations: [CertificateLinkComponent],
  imports: [CommonModule],
  providers: [
    InventoryService,
    CommonService,
    LayoutModule,
  ]

})
export class CertificateLinkModule { }
