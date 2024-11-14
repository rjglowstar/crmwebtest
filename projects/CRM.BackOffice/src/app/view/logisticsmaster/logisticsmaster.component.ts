import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { Address, City, Country, GridDetailConfig, State } from 'shared/businessobjects';
import { AppPreloadService, CommonService, ConfigService, listAddressTypeItems, UtilityService } from 'shared/services';
import { NgxSpinnerService } from 'ngx-spinner';
import { LogisticService } from '../../services/logistic/logistic.service';
import { LogisticResponse, LogisticSearchCriteria } from '../../businessobjects';
import { Logistic, LogisticConfig } from '../../entities';
import { AlertdialogService } from 'shared/views/common/alertdialog/alertdialog.service';
import { fxCredential, GridConfig, GridMasterConfig } from 'shared/enitites';
import { GridPropertiesService } from '../../services';

@Component({
  selector: 'app-logisticsmaster',
  templateUrl: './logisticsmaster.component.html',
  styleUrls: ['./logisticsmaster.component.css']
})
export class LogisticsmasterComponent implements OnInit {

  public isLogisticsMaster: boolean = false;
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
  // CRUD Logistic
  public logisticObj: Logistic = new Logistic();
  public tempLogisticObj!: string;
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
  public insertFlag: boolean = true;
  public openedDelete: boolean = false;
  public mobileMask = '(999) 000-00-00-00';
  public phoneMask = '(9999) 000-00-00';
  public faxMask = '(999) 000-0000';
  public listAddressTypeItems = listAddressTypeItems
  public logisticConfig: LogisticConfig = new LogisticConfig();
  public logisticAddress: Address = new Address();
  public listExcelTypeItems: Array<string> = [
    "GIA",
    "HRD",
    "IGI",
  ];
  public listPrintFormatItems: Array<string> = [
    "Excel",
    "PDF",
  ];
  // Filter Logistic
  public logisticCriteria: LogisticSearchCriteria = new LogisticSearchCriteria();
  // Grid Configuration
  public isGridConfig: boolean = false;
  private fxCredential!: fxCredential;
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;

  public isViewButtons: boolean = false;

  constructor(
    private gridPropertiesService: GridPropertiesService,
    private router: Router,
    private commonService: CommonService,
    public utilityService: UtilityService,
    private logisticService: LogisticService,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private configService: ConfigService,
    private appPreloadService: AppPreloadService
  ) { }

  async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  public async defaultMethodsLoad() {
    this.fxCredential = await this.appPreloadService.fetchFxCredentials();
    if (!this.fxCredential)
      this.router.navigate(["login"]);

    if (this.fxCredential && this.fxCredential.origin && (this.fxCredential.origin.toLowerCase() == 'admin' || this.fxCredential.origin.toLowerCase() == 'accounts'))
      this.isViewButtons = true;

    await this.getGridConfiguration();
    await this.getCountryData();
    await this.loadLogistic();
    this.utilityService.filterToggleSubject.subscribe(flag => {
      this.filterFlag = flag;
    });
  }

  public async getGridConfiguration() {
    try {
      this.gridConfig = await this.configService.getGridConfig(this.fxCredential.id, "Logistic", "LogisticGrid", this.gridPropertiesService.getLogisticMasterGrid());
      if (this.gridConfig && this.gridConfig.id != '') {
        let dbObj: GridDetailConfig[] = this.gridConfig.gridDetail;
        if (dbObj && dbObj.some(c => c.isSelected)) {
          this.fields = dbObj;
          this.fields.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        }
        else
          this.fields.forEach(c => c.isSelected = true);
      }
      else {
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("Logistic", "LogisticGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getLogisticMasterGrid();
      }
    } catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  //#region List Logistic
  public async loadLogistic() {
    try {
      let logistic: LogisticResponse = await this.logisticService.getLogistics(this.logisticCriteria, this.skip, this.pageSize);
      this.gridView = process(logistic.logistics, { group: this.groups });
      this.gridView.total = logistic.totalCount;
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  private async getCountryData() {
    try {
      this.countryItems = await this.commonService.getCountries();
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  public async onCountryChange(e: string) {
    try {
      this.spinnerService.show();
      this.selectedCountry = this.countryItems.find(c => c.name == e);
      if (this.selectedCountry != null)
        await this.getStatesByCountryCode(this.selectedCountry.iso2);

      this.logisticCriteria.state = null as any;
      this.logisticCriteria.city = null as any;
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
        await this.getCityData(this.selectedCountry, this.selectedState.state_Code);

      this.logisticCriteria.city = null as any;
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
      this.alertDialogService.show(error.error)
    }
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.loadLogistic();
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadLogistic();
  }

  public selectedRowChange(e: any) {
    this.insertFlag = false;
    this.logisticObj = new Logistic();
    let value: any = e.selectedRows[0].dataItem
    this.logisticObj = { ...value };
  }

  public resetAddress() {
    this.stateItems = [];
    this.cityItems = [];
  }
  //#endregion List logistic

  //#region Filter section
  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }

  public onFilterSubmit(form: NgForm) {
    this.skip = 0
    this.loadLogistic()
  }

  public clearFilter(form: NgForm) {
    form.reset()
    this.logisticCriteria = new LogisticSearchCriteria()
    this.loadLogistic();
    this.resetAddress();
  }
  //#endregion Filter section

  //#region Logistic Master Modal
  public openLogisticsMasterDialog(): void {
    this.mySelection = [];
    this.logisticObj = new Logistic();
    this.insertFlag = true;
    this.isLogisticsMaster = true;
    this.logisticConfig = new LogisticConfig();
    this.logisticAddress = new Address();
  }

  public async openUpdateLogisticDialog() {
    this.isLogisticsMaster = true;
    let valueCountryExist = this.countryItems.filter((s: any) => {
      return s.name === this.logisticObj.address.country
    })
    if (valueCountryExist !== undefined && valueCountryExist !== null && valueCountryExist.length > 0) {
      this.getStatesByCountryCode(valueCountryExist[0].iso2);
      setTimeout(async () => {
        let valueStateExist = this.stateItems.filter((s: any) => {
          return s.name?.toLowerCase() === this.logisticObj.address.state?.toLowerCase()
        });
        if (valueStateExist !== undefined && valueStateExist !== null && valueStateExist.length > 0) {
          await this.getCityData(valueCountryExist[0], valueStateExist[0].state_Code)
        }
      }, 200);
    }
    this.logisticConfig = { ...this.logisticObj.logisticConfig }
    this.logisticConfig.trackingAPI = this.logisticObj.logisticConfig.trackingAPI;
    this.logisticConfig.excFormat = this.logisticObj.logisticConfig.excFormat;
    this.logisticConfig.printFormat = this.logisticObj.logisticConfig.printFormat;
    this.logisticAddress = { ...this.logisticObj.address };
    this.tempLogisticObj = JSON.stringify(this.logisticObj);
  }

  public closeLogisticsMasterDialog(form: NgForm): void {
    this.isLogisticsMaster = false;
    this.mySelection = [];
    this.resetForm(form);
  }

  public async onLogisticFormSubmit(form: NgForm, action: boolean) {
    try {
      if (form.valid) {
        this.spinnerService.show();
        let messageType: string = "";
        let response: any;
        this.logisticObj.logisticConfig = this.logisticConfig
        this.logisticObj.address = this.logisticAddress;
        if (!this.insertFlag) {
          let fetchLogisticObj = { ...this.logisticObj }
          if (JSON.stringify(fetchLogisticObj) !== this.tempLogisticObj) {
            messageType = "updated";
            response = await this.logisticService.logisticUpdate(this.logisticObj);
          }
          else {
            messageType = "updated";
            this.refreshPage(action, form, messageType);
          }
        }
        else {
          messageType = "registered";
          response = await this.logisticService.logisticRequest(this.logisticObj);
        }

        if (response) {
          this.refreshPage(action, form, messageType);
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
    this.logisticCriteria = new LogisticSearchCriteria()
    this.loadLogistic();
    this.mySelection = [];
    if (action)
      this.isLogisticsMaster = false;
    this.resetForm(form);
    this.logisticObj = new Logistic();
    this.spinnerService.hide();
    this.utilityService.showNotification(`You have been ${messageType} Logistic successfully!`)
  }

  public resetForm(form?: NgForm) {
    this.logisticObj = new Logistic();
    this.insertFlag = true;
    form?.reset();
    this.resetAddress()
  }

  public openDeleteDialog() {
    try {
      this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
        .subscribe(async (res: any) => {
          this.mySelection = [];
          if (res.flag) {
            this.spinnerService.show();
            let responseDelete = await this.logisticService.deleteLogistic(this.logisticObj.id)
            if (responseDelete !== undefined && responseDelete !== null) {
              this.loadLogistic();
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
  //#endregion Logistic Master Modal

  //#region Grid Configuration
  public openGridConfigDialog(): void {
    this.isGridConfig = true;
  }

  public async setNewGridConfig(gridConfig: GridConfig) {
    if (gridConfig) {
      this.fields = gridConfig.gridDetail;
      this.gridConfig = new GridConfig();
      this.gridConfig.id = gridConfig.id
      this.gridConfig.gridDetail = gridConfig.gridDetail;
      this.gridConfig.gridName = gridConfig.gridName;
      this.gridConfig.pageName = gridConfig.pageName;
      this.gridConfig.empID = gridConfig.empID;
    }
  }

  //#endregion Grid Configuration


}
