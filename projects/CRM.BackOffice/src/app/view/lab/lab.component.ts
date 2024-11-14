import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs';
import { GridPropertiesService, LabService } from '../../services';
import * as xlsx from 'xlsx';
import { Lab, LabSearchCriteria, LabServiceType, LabLabour, LabConfig } from '../../businessobjects';
import { Address, City, Country, GridDetailConfig, State } from 'shared/businessobjects';
import { AppPreloadService, CommonService, ConfigService, FileStoreService, listAddressTypeItems, listCurrencyType, listExcelTypeItems, UtilityService } from 'shared/services';
import { AzureFileStore, FileStore, fxCredential, GridConfig, GridMasterConfig } from 'shared/enitites';
import { AlertdialogService } from 'shared/views';

@Component({
  selector: 'app-lab',
  templateUrl: './lab.component.html',
  styleUrls: ['./lab.component.css']
})

export class LabComponent implements OnInit {

  public groups: GroupDescriptor[] = [];
  public pageSize = 26;
  public skip = 0
  public gridView!: DataResult;
  public filterFlag = true;
  public selectableSettings: SelectableSettings = {
    mode: 'single',
  };
  // public openedConfirmationLabDetails = false;
  public mySelection: string[] = [];
  public fields!: GridDetailConfig[];
  public isLabMaster: boolean = false;
  public skeletonArray = new Array(18);

  // CRUD Lab
  public labObj: Lab = new Lab();
  public tempLabObj!: string;
  public labLabourObj: LabLabour = new LabLabour();
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
  public labLabours: LabLabour[] = [];
  public labConfig: LabConfig = new LabConfig();
  public labAddress: Address = new Address();

  public listExcelTypeItems = listExcelTypeItems
  public currentFormat!: File;
  public currentCsvFormat!: File;
  public fileStoreUpload$!: Observable<any>
  // Filter Lab
  public labCriteria: LabSearchCriteria = new LabSearchCriteria();
  // Grid Configuration
  public isGridConfig: boolean = false;
  private fxCredential!: fxCredential;
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;
  public labFileStore!: AzureFileStore[]
  public listCurrencyType: Array<{ text: string; value: string }> = [];

  public listLabServices: Array<{ name: string; value: string }> = [];
  public LabServiceTypes: LabServiceType[] = [];

  public isViewButtons: boolean = false;

  constructor(private gridPropertiesService: GridPropertiesService,
    private router: Router,
    private commonService: CommonService,
    public utilityService: UtilityService,
    private labService: LabService,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private configService: ConfigService,
    private appPreloadService: AppPreloadService,
    private fileStoreService: FileStoreService
  ) { }

  async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  public async defaultMethodsLoad() {
    this.fxCredential = await this.appPreloadService.fetchFxCredentials();
    if (!this.fxCredential)
      this.router.navigate(["login"]);

    if (this.fxCredential && this.fxCredential.origin && (this.fxCredential.origin.toLowerCase() == 'admin' || this.fxCredential.origin.toLowerCase() == 'opmanager'))
      this.isViewButtons = true;

    await this.getGridConfiguration();
    await this.getCountryData();
    await this.loadLab();
    Object.values(listCurrencyType).forEach(z => { this.listCurrencyType.push({ text: z.toString(), value: z.toString() }); });

    this.LabServiceTypes = await this.labService.getAlllabService();
    this.LabServiceTypes.forEach(z => { this.listLabServices.push({ name: z.service.toString(), value: z.toString() }); });

    this.utilityService.filterToggleSubject.subscribe(flag => {
      this.filterFlag = flag;
    });
  }

  public async getGridConfiguration() {
    try {
      this.gridConfig = await this.configService.getGridConfig(this.fxCredential.id, "Lab", "LabGrid", this.gridPropertiesService.getLabMasterGrid());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("Lab", "LabGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getLabMasterGrid();
      }
    } catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  //#region List Lab
  public async loadLab() {
    try {
      let lab: any = await this.labService.getLabs(this.labCriteria, this.skip, this.pageSize);
      this.gridView = process(lab.labs, { group: this.groups });
      this.gridView.total = lab.totalCount;
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Something went wrong, Try again later!');
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
        await this.getStatesByCountryCode(this.selectedCountry.iso2)

      this.labAddress.state = null as any;
      this.labAddress.city = null as any;
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

      this.labAddress.city = null as any;
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

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.loadLab();
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadLab();
  }

  public selectedRowChange(e: any) {
    this.insertFlag = false;
    this.labObj = new Lab();
    let value: any = e.selectedRows[0].dataItem
    this.labObj = { ...value };
  }
  //#endregion List Lab

  //#region Filter section
  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }

  public onFilterSubmit(form: NgForm) {
    this.skip = 0
    this.loadLab()
  }

  public clearFilter(form: NgForm) {
    form.reset()
    this.labCriteria = new LabSearchCriteria()
    this.loadLab()
  }
  //#endregion Filter section

  //#region Lab Master Modal
  public openAddLabDialog(): void {
    this.clearFile()
    this.labFileStore = [];
    this.mySelection = [];
    this.labObj = new Lab();
    this.insertFlag = true;
    this.isLabMaster = true;
    this.labLabourObj = new LabLabour();
    this.labLabours = [];
    this.labConfig = new LabConfig();
    this.labAddress = new Address();
  }

  public async openUpdateLabDialog() {
    this.isLabMaster = true;
    this.labFileStore = await this.fileStoreService.getAzureFileByIdent(this.labObj.id);
    let valueCountryExist = this.countryItems.filter((s: any) => {
      return s.name === this.labObj.address.country
    })
    if (valueCountryExist !== undefined && valueCountryExist !== null && valueCountryExist.length > 0) {
      this.getStatesByCountryCode(valueCountryExist[0].iso2);
      setTimeout(async () => {
        let valueStateExist = this.stateItems.filter((s: any) => {
          return s.name?.toLowerCase() === this.labObj.address.state?.toLowerCase()
        });
        if (valueStateExist !== undefined && valueStateExist !== null && valueStateExist.length > 0) {
          await this.getCityData(valueCountryExist[0], valueStateExist[0].state_Code)
        }
      }, 200);
    }
    this.labLabours = [];
    this.labConfig = { ...this.labObj.labConfig }
    this.labLabours = [...this.labObj.labConfig.labLabours]
    this.labConfig.labAPI = this.labObj.labConfig.labAPI;
    this.labAddress = { ...this.labObj.address };
    this.tempLabObj = JSON.stringify(this.labObj);
  }

  public closeAddLabDialog(form: NgForm): void {
    this.isLabMaster = false;
    this.mySelection = [];
    this.resetForm(form);
  }

  public async onLabSubmit(form: NgForm, action: boolean) {
    try {
      if (form.valid) {
        this.spinnerService.show();
        let messageType: string = "";
        let response: any;
        this.labObj.labConfig.labAPI = this.labConfig.labAPI;
        this.labObj.labConfig.labLabours = this.labLabours;
        this.labObj.address = this.labAddress;
        if (!this.insertFlag) {
          let fetchLabObj = { ...this.labObj };
          if (this.currentFormat)
            this.uploadFilesOnServer(this.currentFormat, fetchLabObj.excFormat, fetchLabObj.id);

          if (this.currentCsvFormat)
            this.uploadFilesOnServer(this.currentCsvFormat, fetchLabObj.excFormat + "-Csv", fetchLabObj.id, true);

          if (JSON.stringify(fetchLabObj) !== this.tempLabObj) {
            messageType = "updated";
            response = await this.labService.labUpdate(this.labObj);
          }
          else {
            messageType = "updated";
            this.refreshPage(action, form, messageType);
          }
        }
        else {
          messageType = "registered";
          response = await this.labService.labRequest(this.labObj);
          this.uploadFilesOnServer(this.currentFormat, this.labObj.excFormat, response);
          this.uploadFilesOnServer(this.currentCsvFormat, this.labObj.excFormat + "-Csv", response, true);
        }
        if (response)
          this.refreshPage(action, form, messageType);

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

  public onLabLabourSubmit(form: NgForm) {
    if (form.valid) {
      this.spinnerService.show();
      Number(this.labLabourObj.minSize)
      Number(this.labLabourObj.maxSize)
      let lbObj = { ...this.labLabourObj }
      this.labLabours.push(lbObj);
      form?.reset();
      setTimeout(() => {
        this.labLabourObj = new LabLabour();
      }, 0);
      this.spinnerService.hide();
    }
    else {
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsTouched();
      });
    }
  }

  public validateSizes() {
    if (Number(this.labLabourObj.minSize) && Number(this.labLabourObj.maxSize)) {
      if (Number(this.labLabourObj.minSize) > Number(this.labLabourObj.maxSize)) {
        this.alertDialogService.show(`Min Size should be less than Max Size`);
        return false;
      }
    }
    return true;
  }

  public deleteLabLabour(labLabour: LabLabour, index: number) {
    this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
      .subscribe(async (res: any) => {
        if (res.flag)
          this.labLabours.splice(this.labObj.labConfig.labLabours.indexOf(labLabour), 1);
      });
  }

  public refreshPage(action: boolean, form: NgForm, messageType: string) {
    this.loadLab();
    this.mySelection = [];
    if (action)
      this.isLabMaster = false;
    this.resetForm(form);
    this.labObj = new Lab();
    this.spinnerService.hide();
    this.utilityService.showNotification(`You have been ${messageType} Lab successfully!`)
  }

  public resetForm(form?: NgForm) {
    this.labObj = new Lab();
    this.insertFlag = true;
    form?.reset();
  }

  public openDeleteDialog() {
    try {
      this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
        .subscribe(async (res: any) => {
          this.mySelection = [];
          if (res.flag) {
            this.spinnerService.show();
            let responseDelete = await this.labService.deleteLab(this.labObj.id)
            if (responseDelete !== undefined && responseDelete !== null) {
              this.loadLab();
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
  //#endregion Lab Master Modal

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

  //#region Lab format upload
  public uploadFiles(event: Event): void {
    let acceptedFiles: string[] = []
    const target = event.target as HTMLInputElement;
    if (target.accept) {
      acceptedFiles = target.accept.split(',').map(function (item) {
        return item.trim();
      });
    }


    if (target.files && target.files.length) {
      if (acceptedFiles.indexOf(target.files[0].type) > -1)
        this.currentFormat = target.files[0];
      else
        this.alertDialogService.show(`Please select only .xlsx or .xls file.`);
    }
  }

  public uploadCsvFiles(event: Event): void {
    let acceptedFiles: string[] = []
    const target = event.target as HTMLInputElement;
    if (target.accept) {
      acceptedFiles = target.accept.split(',').map(function (item) {
        return item.trim();
      });
    }


    if (target.files && target.files.length) {
      if (target.files[0].name.includes(".csv"))
        this.currentCsvFormat = target.files[0];
      else
        this.alertDialogService.show(`Please select only .csv file.`);
    }
  }

  public uploadFilesOnServer(file: File, type: string, ident: string, isCsv: boolean = false) {

    this.fileStoreService.postUploadFileDocument(file, type, ident, this.labObj?.email).subscribe(
      (res: any) => {
        if (isCsv)
          this.clearCsvFile();
        else
          this.clearFile();
      },
      (err: any) => {
        if (isCsv)
          this.clearCsvFile();
        else
          this.clearFile();
        this.alertDialogService.show(`Something went wrong while uploading a file!`, "error")
      }
    );
  }

  public clearFile() {
    this.currentFormat = null as any;
  }

  public clearCsvFile() {
    this.currentCsvFormat = null as any;
  }

  public async openDocumentDialog(labObj: Lab) {
    if (this.labFileStore) {
      if (labObj.excFormat == 'GIA-India') {
        let id = this.labFileStore.find(z => z.identType == 'GIA-India')?.id;
        await this.fileStoreService.downloadFile(id ?? '');
      }
      else if (labObj.excFormat == 'GIA-Surat') {
        let id = this.labFileStore.find(z => z.identType == 'GIA-Surat')?.id;
        await this.fileStoreService.downloadFile(id ?? '');
      }
      else
        await this.fileStoreService.downloadFile(this.labFileStore[0].id);
    }
  }

  public async openDocumentCSVDialog(labObj: Lab) {
    if (this.labFileStore) {
      if (labObj.excFormat == 'GIA-India') {
        let id = this.labFileStore.find(z => z.identType == 'GIA-India-Csv')?.id;
        await this.fileStoreService.downloadFile(id ?? '');
      }
      else if (labObj.excFormat == 'GIA-Surat') {
        let id = this.labFileStore.find(z => z.identType == 'GIA-Surat-Csv')?.id;
        await this.fileStoreService.downloadFile(id ?? '');
      }
    }
  }
  //#endregion Lab format upload

  //#region Excel Upload
  public async onSelectExcelFile(event: Event) {
    try {

      let acceptedFiles: string[] = []
      const target = event.target as HTMLInputElement;
      if (target.accept) {
        acceptedFiles = target.accept.split(',').map(function (item) {
          return item.trim();
        });
      }

      if (target.files && target.files.length) {
        if (acceptedFiles.indexOf(target.files[0].type) > -1) {

          let file = target.files[0];
          let fileReader = new FileReader();
          this.labLabours = [];
          this.spinnerService.show();
          fileReader.onload = async (e) => {

            var arrayBuffer: any = fileReader.result;
            let data = new Uint8Array(arrayBuffer);
            let arr = new Array();

            for (let i = 0; i != data.length; ++i)
              arr[i] = String.fromCharCode(data[i]);

            let workbook = xlsx.read(arr.join(""), { type: "binary" });
            var fetchExcelItems = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]) as any;

            if (fetchExcelItems && fetchExcelItems.length > 0) {

              for (let j = 0; j < fetchExcelItems.length; j++) {
                Object.keys(fetchExcelItems[j]).map(key => {
                  if (key.toLowerCase().trim() != key) {
                    fetchExcelItems[j][key.toLowerCase().trim()] = fetchExcelItems[j][key];
                    delete fetchExcelItems[j][key];
                  }
                });

                let newLabExpense: LabLabour = new LabLabour();
                newLabExpense.labService = fetchExcelItems[j]["service"]?.toString().trim();
                newLabExpense.minSize = fetchExcelItems[j]["from"]?.toString().trim();
                newLabExpense.maxSize = fetchExcelItems[j]["to"]?.toString().trim();
                newLabExpense.amount = fetchExcelItems[j]["charge"]?.toString().trim();

                this.labLabours.push(newLabExpense);
                this.spinnerService.hide();
              }
            }
          }
          fileReader.readAsArrayBuffer(file);
        }
        else
          this.alertDialogService.show(`Please select only CSV XLSX XLS file.`);
      }
    }
    catch (error: any) {

      this.alertDialogService.show(error.error)
    }
  }
  //#endregion

}
