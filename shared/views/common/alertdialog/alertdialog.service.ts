import { Injectable } from '@angular/core';
import { DialogResult, DialogService } from '@progress/kendo-angular-dialog';
import { Observable } from 'rxjs';
import { AlertdialogComponent } from './alertdialog.component';

@Injectable()

export class AlertdialogService {

    constructor(private dialogService: DialogService) { }

    show(instruction: string): void;
    show(instruction: string, header: string): void;
    show(instruction: string, icon: string): void;
    show(instruction: string, header: string, icon: string): void;
    show(instruction?: string, header?: string, icon?: string): void {
        if (!icon)
            icon = "icon-erroricon";
        const dialogRef = this.dialogService.open({
            content: AlertdialogComponent,
            width: 450,
            height: 200
        });

        const alertObj = dialogRef.content.instance;
        alertObj.header = header;
        alertObj.instruction = instruction;
        alertObj.icon = icon;
        alertObj.isConfirmation = false;
    }

    public ConfirmYesNo(instruction: string, header: string, icon?: string): Observable<DialogResult> {
        const dialogRef = this.dialogService.open({
            content: AlertdialogComponent,
            width: 450,
            height: 200
        });

        const alertObj = dialogRef.content.instance;
        alertObj.header = header;
        alertObj.instruction = instruction;
        alertObj.icon = icon ? icon : 'icon-erroricon ';
        alertObj.isConfirmation = true;

        return dialogRef.result;
    }

}