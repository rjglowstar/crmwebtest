import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CertifieddiamondsComponent } from './certifieddiamonds.component';
import { CertifieddiamondsRoutingModule } from './certifieddiamonds-routing.module';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [
        CommonModule,
        DialogsModule,
        CertifieddiamondsRoutingModule,
        TranslateModule
    ],
    providers: [],
    declarations: [CertifieddiamondsComponent]
})
export class CertifieddiamondsModule { }