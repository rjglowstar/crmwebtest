import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ButtonsModule,
        DashboardRoutingModule,
        DialogModule
    ],
    // providers: [BlobUploadsViewStateService, BlobSharedViewStateService, SasGeneratorService, BlobStorageService,
    //     {
    //         provide: BLOB_STORAGE_TOKEN,
    //         useFactory: azureBlobStorageFactory
    //     }],
    declarations: [DashboardComponent]
})
export class DashboardModule { }