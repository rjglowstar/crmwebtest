import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor } from '@progress/kendo-data-query';
import { Address, City, Country, GridDetailConfig, State } from 'shared/businessobjects';
import { AppPreloadService, CommonService, listAddressTypeItems, UtilityService } from 'shared/services';
import { NgxSpinnerService } from 'ngx-spinner';
import { AlertdialogService } from 'shared/views/common/alertdialog/alertdialog.service';
import { fxCredential } from 'shared/enitites';
import { CompanyService } from 'projects/CRM.BackOffice/src/app/services/company/company.service';
import { Company } from 'projects/CRM.BackOffice/src/app/entities';

@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.css']
})
export class CompanyComponent implements OnInit {
  @Input() companyObj: Company = new Company();
  @Output() toggle: EventEmitter<boolean> = new EventEmitter();
  @Output() toggleClose: EventEmitter<boolean> = new EventEmitter();

  public groups: GroupDescriptor[] = [];
  public pageSize = 26;
  public skip = 0
  public gridView!: DataResult;
  public filterFlag = true;
  public selectableSettings: SelectableSettings = {
    mode: 'single',
  };
  public mySelection: string[] = [];
  public fields!: GridDetailConfig[];
  public skeletonArray = new Array(18);
  public tempCompanyObj!: string;
  public websitePattern = "(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?"
  public countryItems!: Country[];
  public selectedCountry: any;
  public stateItems!: State[];
  public selectedState: any;
  public cityItems!: City[];
  public selectedCity: any;
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };
  public openedDelete: boolean = false;
  public listAddressTypeItems = listAddressTypeItems
  public companyAddress: Address = new Address();
  public isGridConfig: boolean = false;
  private fxCredential!: fxCredential;

  constructor(
    private router: Router,
    private commonService: CommonService,
    public utilityService: UtilityService,
    private companyService: CompanyService,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private appPreloadService: AppPreloadService
  ) { }

  async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  public async defaultMethodsLoad() {
    this.fxCredential = await this.appPreloadService.fetchFxCredentials();
    if (!this.fxCredential)
      this.router.navigate(["login"]);
    await this.getCountryData();
    this.utilityService.filterToggleSubject.subscribe(flag => {
      this.filterFlag = flag;
    });

    if (this.companyObj) {
      this.companyAddress = { ...this.companyObj.address };
      this.tempCompanyObj = JSON.stringify(this.companyObj);
      this.openUpdateDialog();
    }
  }

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

      this.companyAddress.state = null as any;
      this.companyAddress.city = null as any;
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show('Something went wrong, Try again later!')
    }
  }

  private async getStatesByCountryCode(country_code: string) {
    try {
      this.stateItems = await this.commonService.getStatesByCountryCode(country_code)
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show('Something went wrong, Try again later!')
    }
  }

  public async onStateChange(e: string) {
    try {
      this.spinnerService.show();
      this.selectedState = this.stateItems.find((c: State) => c.name == e);
      if (this.selectedState != null)
        await this.getCityData(this.selectedCountry, this.selectedState.state_Code)

      this.companyAddress.city = null as any;
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show('Something went wrong, Try again later!')
    }
  }

  public async getCityData(selectedCountry: Country, state_code: string) {
    try {
      this.cityItems = await this.commonService.getCitiesByCountryCodeandStateCode(selectedCountry.iso2, state_code)
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show('Something went wrong, Try again later!')
    }
  }

  public onCityChange(e: string): void {
    try {
      this.selectedCity = this.cityItems.find((c: City) => c.name == e);
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show('Something went wrong, Try again later!')
    }
  }

  public resetAddress() {
    this.stateItems = [];
    this.cityItems = [];
  }

  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }

  public async openUpdateDialog() {
    let valueCountryExist = this.countryItems.filter((s: any) => {
      return s.name === this.companyObj.address.country
    })

    if (valueCountryExist !== undefined && valueCountryExist !== null && valueCountryExist.length > 0) {
      await this.getStatesByCountryCode(valueCountryExist[0].iso2);
      setTimeout(async () => {
        let valueStateExist = this.stateItems.filter((s: any) => {
          return s.name?.toLowerCase() === this.companyObj.address.state?.toLowerCase();
        });
        if (valueStateExist !== undefined && valueStateExist !== null && valueStateExist.length > 0)
          await this.getCityData(valueCountryExist[0], valueStateExist[0].state_Code);
      }, 200);
    }

    this.companyAddress = { ...this.companyObj.address };
    this.tempCompanyObj = JSON.stringify(this.companyObj);
  }

  public closeMasterDialog(): void {
    this.toggleClose.emit(false);
  }

  public async onFormSubmit(form: NgForm, action: boolean) {
    try {
      if (form.valid) {
        this.spinnerService.show();
        let messageType: string = "";
        let response: any;
        this.companyObj.address = this.companyAddress;
        if (this.companyObj.id) {
          let Obj = { ...this.companyObj }
          if (JSON.stringify(Obj) !== this.tempCompanyObj) {
            messageType = "updated";
            response = await this.companyService.companyUpdate(this.companyObj);
          }
          else {
            messageType = "updated";
            this.refreshPage(action, form, messageType);
          }
        }
        else {
          messageType = "registered";
          response = await this.companyService.companyRequest(this.companyObj);
          this.companyObj = new Company();
        }
        if (response) {
          this.refreshPage(action, form, messageType);
          this.toggle.emit(false);
          this.companyObj = new Company();
        }
      }
      else {
        Object.keys(form.controls).forEach(key => {
          form.controls[key].markAsTouched();
        });
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

  public refreshPage(action: boolean, form: NgForm, messageType: string) {
    this.mySelection = [];
    this.resetForm(form);
    this.companyObj = new Company();
    this.spinnerService.hide();
    this.utilityService.showNotification(`You have been ${messageType} company successfully!`)
  }

  public resetForm(form?: NgForm) {
    this.companyObj = new Company();
    form?.reset();
    this.resetAddress()
  }
}