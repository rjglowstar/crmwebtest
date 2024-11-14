import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { SharedDirectiveModule } from 'shared/directives';
import { UtilityService } from 'shared/services';
import { NavigationService, PermissionService } from '../../../../services';
import { UserpermissionComponent } from './userpermission.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        InputsModule,
        LayoutModule,
        DialogModule,
        SharedDirectiveModule,
    ],
    providers: [NavigationService,
        PermissionService,
        UtilityService],
    declarations: [UserpermissionComponent],
    exports: [UserpermissionComponent],
})
export class UserpermissionModule { }