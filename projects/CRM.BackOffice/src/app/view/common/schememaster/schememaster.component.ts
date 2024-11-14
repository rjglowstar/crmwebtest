import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { SelectableSettings } from '@progress/kendo-angular-grid';
import { NgxSpinnerService } from 'ngx-spinner';
import { fxCredential } from 'shared/enitites';
import { AppPreloadService, listOriginItems, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { SchemeDetails } from '../../../businessobjects';
import { Scheme } from '../../../entities';
import { SchemeService } from '../../../services';

@Component({
  selector: 'app-schememaster',
  templateUrl: './schememaster.component.html',
  styleUrls: ['./schememaster.component.css']
})
export class SchememasterComponent implements OnInit {

  public fxCredential?: fxCredential;
  public isSchemeDialog: boolean = false;
  public listSchemes: Scheme[] = new Array<Scheme>();
  public schemeObj: Scheme = new Scheme();
  public schemeDatesFlag: boolean = false;
  public schemeDetailObj: SchemeDetails = new SchemeDetails();
  public listOriginItems = listOriginItems;
  public listOrigins: Array<{ name: string; isChecked: boolean }> = [];
  public filterOrigin: string = '';
  public filterOriginChk: boolean = true;
  public selectableSettings: SelectableSettings = { mode: 'single' };
  public mySelection: string[] = [];
  public selectedDetailCallback = (args: any) => args.index;
  public myDetailSelection: number[] = [];

  public isViewButtons: boolean = false;

  constructor(
    private router: Router,
    private schemeService: SchemeService,
    private alertDialogService: AlertdialogService,
    public utilityService: UtilityService,
    private spinnerService: NgxSpinnerService,
    private appPreloadService: AppPreloadService) {

  }

  async ngOnInit() {
    this.fxCredential = await this.appPreloadService.fetchFxCredentials();
    if (!this.fxCredential)
      this.router.navigate(["login"]);

    if (this.fxCredential && this.fxCredential.origin && (this.fxCredential.origin.toLowerCase() == 'admin'))
      this.isViewButtons = true;

    await this.defaultMethodLoad();
  }

  public async defaultMethodLoad() {
    this.spinnerService.show();
    this.listOriginItems.forEach(element => {
      if (element)
        this.listOrigins.push({ name: element, isChecked: false });
    });
    this.loadSchemes();

  }

  public async loadSchemes() {
    try {

      this.listSchemes = await this.schemeService.getAllSchemes() ?? new Array<Scheme>();
      this.spinnerService.hide();
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  /* #region  SchemeDialog Code */
  public openSchemeDialog(isNew: boolean): void {
    if (isNew) {
      this.schemeObj = new Scheme();
      this.schemeDetailObj = new SchemeDetails();
      this.myDetailSelection = [];
      this.mySelection = [];
    }
    else
      this.compareTwoDates();
    this.utilityService.onMultiSelectChange(this.listOrigins, this.schemeObj.origin);

    this.isSchemeDialog = true;
  }

  /* #region  Scheme Section */
  public closeSchemeDialog(): void {
    this.isSchemeDialog = false;
    this.schemeObj = new Scheme();
    this.mySelection = [];
  }

  public compareTwoDates() {
    if (this.schemeObj.startDate && this.schemeObj.endDate) {
      if (new Date(this.schemeObj.endDate) <= new Date(this.schemeObj.startDate)) {
        this.alertDialogService.show(`End Date should be greater than Start Date`);
        this.schemeDatesFlag = false;
      }
      else
        this.schemeDatesFlag = true;
    }
  }

  public selectedRowChange(e: any) {
    this.schemeObj = new Scheme();
    if (e.selectedRows != null && e.selectedRows.length > 0) {
      let value: Scheme = e.selectedRows[0].dataItem;
      this.schemeObj = JSON.parse(JSON.stringify(value));
      this.schemeObj.startDate = this.utilityService.getValidDate(this.schemeObj.startDate);
      this.schemeObj.endDate = this.utilityService.getValidDate(this.schemeObj.endDate);
    }
  }

  public async sumbitScheme(form: NgForm, isClose: boolean) {
    try {
      if (form.valid) {
        this.spinnerService.show();
        let response: any;
        if (!isClose)
          this.schemeObj.id = ""

        if (this.schemeObj.id) {
          response = await this.schemeService.schemeUpdate(this.schemeObj);
          this.spinnerService.hide();
          if (response)
            this.utilityService.showNotification(`Scheme has been updated successfully!`)
        }
        else {
          response = await this.schemeService.schemeInsert(this.schemeObj);
          this.spinnerService.hide();
          if (response)
            this.utilityService.showNotification(`Scheme has been added successfully!`)
        }

        if (isClose)
          this.closeSchemeDialog();

        this.clearForm(form);
        this.schemeObj = new Scheme();
        this.utilityService.onMultiSelectChange(this.listOrigins, this.schemeObj.origin);
        this.mySelection = [];
        this.loadSchemes();
      }
      else {
        Object.keys(form.controls).forEach(key => {
          form.controls[key].markAsTouched();
        });
      }
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public openDeleteDialog() {
    try {
      this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
        .subscribe(async (res: any) => {
          if (res.flag) {
            this.spinnerService.show();
            let responseDelete = await this.schemeService.deleteScheme(this.schemeObj.id)
            if (responseDelete !== undefined && responseDelete !== null) {
              this.spinnerService.hide();
              this.loadSchemes();
              this.mySelection = [];
              this.schemeObj = new Scheme();
              this.utilityService.showNotification(`Scheme has been deleted successfully!`)
            }
          }
        });
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }
  /* #endregion */

  /* #region  Scheme-Detail Section */
  public selectedDetailRowChange(e: any) {
    this.schemeDetailObj = new SchemeDetails();
    if (e.selectedRows != null && e.selectedRows.length > 0) {
      let value: SchemeDetails = e.selectedRows[0].dataItem;
      this.schemeDetailObj = JSON.parse(JSON.stringify(value));
    }
  }

  public validateSizes() {
    if (Number(this.schemeDetailObj.from) && Number(this.schemeDetailObj.to)) {
      if (Number(this.schemeDetailObj.from) > Number(this.schemeDetailObj.to)) {
        this.alertDialogService.show(`From Amt should be less than To Amt`);
        return false;
      }
    }
    return true;
  }

  public validateDiscountAmt(gridDataSend: SchemeDetails[]) {
    let validation: boolean = false;

    if (gridDataSend.length > 0) {
      for (let index = 0; index < gridDataSend.length; index++) {
        const element = gridDataSend[index];
        if ((Number(this.schemeDetailObj.from) >= Number(element.from) && Number(this.schemeDetailObj.from) <= Number(element.to)) ||
          (Number(this.schemeDetailObj.to) >= Number(element.from) && Number(this.schemeDetailObj.to) <= Number(element.to)) || (Number(element.to) >= Number(this.schemeDetailObj.from) && Number(element.from) <= Number(this.schemeDetailObj.to))) {
          validation = false;
          this.alertDialogService.show("Volume Criteria already exists or not valid, Please enter valid criteria");
          break;
        }
        else
          validation = true;
      }
    }
    else
      validation = true;

    return validation;
  }

  public async sumbitDiscountCriteria(form: NgForm) {
    if (form.valid) {
      let validationSubmit: boolean = false;
      validationSubmit = await this.validateDiscountAmt(this.schemeObj.details);
      this.schemeDetailObj.from = Number(this.schemeDetailObj.from);
      this.schemeDetailObj.to = Number(this.schemeDetailObj.to);
      this.schemeDetailObj.discount = Number(this.schemeDetailObj.discount);
      if (validationSubmit) {
        if (this.myDetailSelection[0] >= 0)
          this.schemeObj.details[this.myDetailSelection[0]] = this.schemeDetailObj;
        else
          this.schemeObj.details.push(this.schemeDetailObj);
        this.myDetailSelection = [];
        this.schemeDetailObj = new SchemeDetails();
        this.clearForm(form);
      }
    }
    else {
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsTouched();
      });
    }
  }

  public clearDetailForm(form: NgForm) {
    this.myDetailSelection = [];
    this.schemeDetailObj = new SchemeDetails();
    this.clearForm(form);
  }

  public openDetailDeleteDialog() {
    try {
      this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
        .subscribe(async (res: any) => {
          if (res.flag) {
            if (this.myDetailSelection[0] >= 0) {
              this.schemeObj.details.splice(this.myDetailSelection[0], 1);
              this.myDetailSelection = [];
              this.schemeDetailObj = new SchemeDetails();
            }
          }
        });
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  /* #endregion */
  public clearForm(form: NgForm) {
    form?.reset();
  }

  /* #endregion */
}
