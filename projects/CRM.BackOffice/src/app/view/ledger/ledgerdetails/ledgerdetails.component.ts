import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService, listAddressTypeItems, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { NgxSpinnerService } from 'ngx-spinner';
import { LedgerService } from '../../../services';
import { Ledger } from '../../../entities';
import { Address, City, Country, State } from 'shared/businessobjects';
import { NgForm } from '@angular/forms';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { LedgerSummaryAnalysis } from '../../../businessobjects';
import { LedgerSummaryCriteria } from '../../../businessobjects/accounting/ledgersummarycriteria';

@Component({
  selector: 'app-ledgerdetails',
  templateUrl: './ledgerdetails.component.html',
  styleUrls: ['./ledgerdetails.component.css']
})
export class LedgerdetailsComponent implements OnInit {
  
  public ledgerId!: string;
  public ledgerData: Ledger = new Ledger();
  public ledgerSummaryData: LedgerSummaryAnalysis = new LedgerSummaryAnalysis();
  public isBrokerDtl: boolean = false;

  public listAddressTypeItems = listAddressTypeItems
  public isAddress: boolean = false;
  public lastDivNumber = [3, 7, 11, 15, 19];
  public insertFlag: boolean = true;
  public editIndex: null | number = null;

  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };

  public addressObj: Address = new Address();

  public countryItems!: Country[];
  public selectedCountry: any;
  public stateItems!: State[];
  public selectedState: any;
  public cityItems!: City[];
  public selectedCity: any;

  //#region Custome Pagination Variables
  public pageSize = 7;

  public skip = 0;
  public take = this.pageSize;

  public activePage = 1;
  public pageCount: number[] = [];
  public pageCountString = '0 - 0 of 0';
  //#endregion

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    private ledgerService: LedgerService,
    public utilityService: UtilityService,
    private alertDialogService: AlertdialogService,
    private commonService: CommonService,
    private spinnerService: NgxSpinnerService
  ) { }

  async ngOnInit() {
    await this.defaultMethods()
  }

  public async defaultMethods() {
    this.spinnerService.show();
    await this.loadLedgerSummary();
    await this.getCountryData();
    await this.loadLedgerDetail();
  }

  public async loadLedgerDetail() {
    try {
      this.ledgerId = this.route.snapshot.params.id
      this.ledgerData = await this.ledgerService.getLedgerById(this.ledgerId);
      this.spinnerService.hide();
      if (this.ledgerData.broker.brokrage != null && this.ledgerData.broker.brokrage != undefined && this.ledgerData.broker.brokrage != 0)
        this.isBrokerDtl = true;
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async loadLedgerSummary() {
    try {
      this.ledgerId = this.route.snapshot.params.id
      let ledgerSummaryCriteria = new LedgerSummaryCriteria();
      ledgerSummaryCriteria.ledgerId = this.ledgerId;
      let data = await this.ledgerService.getLedgerSummaryAnalysis(ledgerSummaryCriteria, this.skip, this.take);
      if (data) {
        this.ledgerSummaryData = data;
        this.setPageCount(data.totalRecords);
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  //#region On Change Functions
  private async getCountryData() {
    try {
      this.countryItems = await this.commonService.getCountries();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  public async onCountryChange(e: string) {
    try {
      this.spinnerService.show();
      this.selectedCountry = this.countryItems.find(c => c.name == e);
      if (this.selectedCountry != null)
        await this.getStatesByCountryCode(this.selectedCountry.iso2)

      this.addressObj.state = null as any;
      this.addressObj.city = null as any;
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  private async getStatesByCountryCode(country_code: string) {
    try {
      this.stateItems = await this.commonService.getStatesByCountryCode(country_code)
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  public async onStateChange(e: string) {
    try {
      this.spinnerService.show();
      this.selectedState = this.stateItems.find((c: State) => c.name == e);
      if (this.selectedState != null)
        await this.getCityData(this.selectedCountry, this.selectedState.state_Code)

      this.addressObj.city = null as any;
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  public async getCityData(selectedCountry: Country, state_code: string) {
    try {
      this.cityItems = await this.commonService.getCitiesByCountryCodeandStateCode(selectedCountry.iso2, state_code)
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  public onCityChange(e: string): void {
    try {
      this.selectedCity = this.cityItems.find((c: City) => c.name == e);
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  public openAddressModal() {
    this.isAddress = true;
    this.resetForm();
  }

  public closeAddressModal() {
    this.isAddress = false;
  }
  //#endregion

  //#region Add | Update Address
  public async editAddress(data: Address, index: number, isCopy = false) {
    this.addressObj = new Address();
    this.addressObj = { ...data };
    await this.onCountryChange(this.addressObj.country);
    await this.onStateChange(this.addressObj.state);
    this.insertFlag = isCopy;
    this.editIndex = index;
    this.isAddress = true;
  }

  public async deleteAddress(addressId: string, index: number) {
    this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            this.ledgerData.otherAddress.splice(index, 1);
            this.spinnerService.show();
            let res = await this.updateLedger();
            if (res) {
              this.spinnerService.hide();
              this.utilityService.showNotification('Address remove successfully..!!!');
              this.loadLedgerDetail();
            } else {
              this.spinnerService.hide();
              this.alertDialogService.show('Address not remove, Try again later!');
            }
          } catch (error: any) {
            console.error(error);
            this.spinnerService.show();
            this.alertDialogService.show('Address not remove, Try again later!');
          }
        }
      });
  }

  public async onAddressSubmit(form: NgForm, saveClose = true) {
    try {
      if (form.valid) {
        let message = 'inserted';
        if (this.insertFlag)
          this.ledgerData.otherAddress.push(this.addressObj);
        else {
          this.ledgerData.otherAddress[(this.editIndex ?? 0)] = this.addressObj;
          message = 'updated';
        }

        let res = await this.updateLedger();
        if (res) {
          this.spinnerService.hide();
          this.utilityService.showNotification('Address ' + message + ' successfully..!');
          if (saveClose)
            this.isAddress = false;
          else
            this.resetForm(form);
          this.loadLedgerDetail();
        } else {
          this.spinnerService.hide();
          this.alertDialogService.show('Address not remove, Try again later!');
        }
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.show();
      this.alertDialogService.show('Ledger Address not save, Try again later!');
    }

  }

  public resetForm(form?: NgForm) {
    this.addressObj = new Address();
    this.insertFlag = true;
    form?.reset();
  }

  public async updateLedger(): Promise<boolean> {
    try {
      this.ledgerData.updatedAt = new Date();
      var response = await this.ledgerService.ledgerUpdate(this.ledgerData);
      return response;

    } catch (error: any) {
      console.error(error);
      this.spinnerService.show();
      this.alertDialogService.show('Ledger Address not save, Try again later!');
      return false;
    }
  }
  //#endregion

  //#region Custom Pagination
  private setPageCount(totalRecords: number) {
    const pageCount = this.getPageCount(totalRecords);
    this.pageCount = this.getArrayOfPage(pageCount);

    let take = this.take > totalRecords ? totalRecords : this.take;
    this.pageCountString = (this.skip + 1).toString() + ' - ' + take + ' of ' + totalRecords;
  }

  private getPageCount(totalRecords: number): number {
    let totalPage = 0;

    if (totalRecords > 0 && this.pageSize > 0) {
      const pageCount = totalRecords / this.pageSize;
      const roundedPageCount = Math.floor(pageCount);

      totalPage = roundedPageCount < pageCount ? roundedPageCount + 1 : roundedPageCount;
    }

    return totalPage;
  }

  private getArrayOfPage(pageCount: number): number[] {
    const pageArray = [];

    if (pageCount > 0) {
      for (let i = 1; i <= pageCount; i++) {
        pageArray.push(i);
      }
    }

    return pageArray;
  }

  public async onClickPage(pageNumber: number) {
    if (pageNumber >= 1 && pageNumber <= this.pageCount.length) {
      this.spinnerService.show();

      this.activePage = pageNumber;
      this.skip = (pageNumber - 1) * this.pageSize;
      this.take = pageNumber * this.pageSize;
      await this.loadLedgerSummary();

      this.spinnerService.hide();
    }
  }
  //#endregion
}