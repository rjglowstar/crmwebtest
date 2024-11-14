import { Component, OnInit } from '@angular/core';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { City, Country, GridDetailConfig, State } from 'shared/businessobjects';
import { GridConfig, GridMasterConfig, fxCredential } from 'shared/enitites';
import { AppPreloadService, CommonService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Expomaster } from '../../entities/organization/expomaster';
import { ExpoMasterSearchCriteria } from '../../businessobjects/organizations/expomastersearchcriteria ';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { ExpomasterService } from '../../services/expomaster/expomaster.service';

@Component({
  selector: 'app-expomaster',
  templateUrl: './expomaster.component.html'
})
export class ExpomasterComponent implements OnInit {
  public groups: GroupDescriptor[] = [];
  public pageSize = 26;
  public skip = 0
  public fields!: GridDetailConfig[];
  public gridView!: DataResult;
  public isRegOrganization: boolean = false;
  public filterFlag = true;
  public selectableSettings: SelectableSettings = {
    mode: 'single',
  };

  public openedConfirmationOrganizationDetails = false;
  public skeletonArray = new Array(18);
  public mySelection: string[] = [];
  public expomasterObj: Expomaster = new Expomaster();
  public expomasterdate: Expomaster[] = [];
  public expomastersearchcriteria: ExpoMasterSearchCriteria = new ExpoMasterSearchCriteria();
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };

  public insertFlag: boolean = true;
  public countryItems!: Country[];
  public selectedCountry: any;
  public stateItems!: State[];
  public selectedState: any;
  public cityItems!: City[];
  public selectedCity: any;

  // Grid Configuration
  public isGridConfig: boolean = false;
  private fxCredential!: fxCredential;
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;

  constructor(private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private utilityService: UtilityService,
    private commonService: CommonService,
    private appPreloadService: AppPreloadService,
    private expoMasterService: ExpomasterService,
    private router: Router
  ) { }

  async ngOnInit(): Promise<void> {
    await this.defaultMethodsLoad();
  }


  public async defaultMethodsLoad() {
    this.fxCredential = await this.appPreloadService.fetchFxCredentials();
    if (!this.fxCredential)
      this.router.navigate(["login"]);
    await this.getCountryData();
    await this.loadExpoMaster();
    this.utilityService.filterToggleSubject.subscribe(flag => {
      this.filterFlag = flag;
    });
  }

  public async loadExpoMaster() {
    try {
      this.spinnerService.show();
      this.expomastersearchcriteria.isActive = true;
      let expoMasterRes: Expomaster = await this.expoMasterService.getExpoMaster(this.expomastersearchcriteria);
      var expoMasterData = JSON.parse(JSON.stringify(expoMasterRes))
      this.gridView = process(expoMasterData, { group: this.groups });
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
      this.spinnerService.hide();
    }
  }
  public openAddExpoMasterDialog() {
    this.expomasterObj =new Expomaster();
    this.insertFlag = true;
    this.isRegOrganization = true;
  }


  public async openUpdateExpoMasterDialog() {
    this.isRegOrganization = true;
    await this.onCountryChange(this.expomasterObj.address.country);
    await this.onStateChange(this.expomasterObj.address.state);
  }

  public async selectedRowChange(e: any) {
    this.insertFlag = false;
    this.expomasterObj = new Expomaster();
    if (e.selectedRows != null && e.selectedRows.length > 0) {
      let value: Expomaster = e.selectedRows[0].dataItem;
      this.expomasterObj = JSON.parse(JSON.stringify(value));
      var startDate = this.expomasterObj.fromDate;
      var endDate = this.expomasterObj.toDate;
      this.expomasterObj.fromDate = new Date(startDate ?? '')
      this.expomasterObj.toDate = new Date(endDate ?? '')
    }
  }

  // delete
  public openDeleteDialog() {
    try {
      this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
      .subscribe(async (res: any) => {
        this.mySelection = [];
        if (res.flag) {
            this.spinnerService.show();
            this.expomasterObj.isActive=false;
            let responseDelete = await this.expoMasterService.deleteExpoMaster(this.expomasterObj.id)
            if (responseDelete !== undefined && responseDelete !== null) {
              this.loadExpoMaster();
              this.spinnerService.hide();
              this.insertFlag = true;
              this.utilityService.showNotification(`You have been deleted successfully!`)
            }
          }
        })
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }



  public resetForm(form?: NgForm) {
    this.expomasterObj = new Expomaster();
    this.insertFlag = true;
    form?.reset();
  }

  public closeExpoOrganDialog(form: NgForm): void {
    this.isRegOrganization = false;
    this.mySelection = [];
    this.resetForm(form);
  }


  //#region Filter Section
  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }

  public clearFilter(form: NgForm) {
    form.reset()
    this.expomastersearchcriteria = new ExpoMasterSearchCriteria()
    this.loadExpoMaster()
  }


  public onFilterSubmit(form: NgForm) {
    this.skip = 0
    this.loadExpoMaster()
  }

  private async getCountryData() {
    try {
      this.countryItems = await this.commonService.getCountries();
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Something went wrong , Try again later!');
    }
  }

  public async onCountryChange(e: string) {
    try {
      this.spinnerService.show();
      this.selectedCountry = this.countryItems.find(c => c.name == e);
      if (this.selectedCountry != null)
        await this.getStatesByCountryCode(this.selectedCountry.iso2)


      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show('Something went wrong , Try again later!');
    }
  }
  private async getStatesByCountryCode(country_code: string) {
    try {
      this.stateItems = await this.commonService.getStatesByCountryCode(country_code)
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show('Something went wrong , Try again later!');
    }
  }

  public async onStateChange(e: string) {
    try {
      this.spinnerService.show();
      this.selectedState = this.stateItems.find((c: State) => c.name == e);
      if (this.selectedState != null)
        await this.getCityData(this.selectedCountry, this.selectedState.state_Code)
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show('Something went wrong , Try again later!');
    }
  }


  public async getCityData(selectedCountry: Country, state_code: string) {
    try {
      this.cityItems = await this.commonService.getCitiesByCountryCodeandStateCode(selectedCountry.iso2, state_code);
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show('Something went wrong , Try again later!');
    }
  }

  public onCityChange(e: string): void {
    try {
      this.selectedCity = this.cityItems.find((c: City) => c.name == e);
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show('Something went wrong , Try again later!');
    }
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }
  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
  }

  //submit form
  public async onExpoSubmit(form: NgForm, action: boolean) {
    try {
      if (form.valid) {
        this.spinnerService.show();
        let messageType: string = "";
        let response: any;
        this.expomasterObj.isActive = true;

        if (!this.insertFlag) {
          messageType = "updated";
          response = await this.expoMasterService.expoMasterUpdate(this.expomasterObj);
        }
        else {
          messageType = "registered";
          response = await this.expoMasterService.expoMasterRequest(this.expomasterObj);
        }

        if (response) {
          this.loadExpoMaster();
          this.mySelection = [];
          this.spinnerService.hide();
          if (action)
            this.isRegOrganization = false;
          this.resetForm(form);
          this.utilityService.showNotification(`You have been ${messageType} successfully!`)
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

}

