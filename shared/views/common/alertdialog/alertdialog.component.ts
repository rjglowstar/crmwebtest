import { Component, Input } from '@angular/core';
import { DialogContentBase, DialogRef } from '@progress/kendo-angular-dialog';

@Component({
  template: `
  <ng-container>
  <div class="example-wrapper alertdialog-sm">
  <div class="gridcontainer">
  <div class="alertheader">CRM</div>
  <div class="alertbody">
    <div class="alertbody-icon">
      <i [ngClass]="icon"> </i>
    </div>
    <div class="alertbody-area">
      <div class="area-heading" *ngIf="header"> {{header}} </div>
      <div class="area-desc" [innerHTML]="instruction"></div>
      <div class="area-footer">
      <div class="float-end">
      <button *ngIf="isConfirmation" class="btn btn-primary" (click)="onYesAction()"><i class="icon-check"></i>Yes</button>
      <button *ngIf="isConfirmation" class="btn btn-primary" (click)="onCancelAction()"><i class="icon-delete"></i>No</button>
      <button *ngIf="!isConfirmation" class="btn btn-primary" (click)="onCancelAction()">Continue Working<i class="icon-rightarrow"></i></button>
      </div>
      </div>
    </div>
  </div>
</div>
</div>
</ng-container>
  `
})

export class AlertdialogComponent extends DialogContentBase {
  @Input() public header!: string;
  @Input() public instruction!: string;
  @Input() public icon!: string;
  @Input() public isConfirmation!: boolean;

  constructor(dialog: DialogRef) {
    super(dialog);
  }

  public onCancelAction(): void {
    this.dialog.close({ flag: false });
  }

  public onYesAction(): void {
    this.dialog.close({ flag: true });
  }
}