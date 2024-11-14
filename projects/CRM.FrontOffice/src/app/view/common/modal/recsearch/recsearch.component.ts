import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { GridConfig, GridMasterConfig, InclusionConfig, MasterConfig, MasterDNorm, MeasurementConfig } from 'shared/enitites';
import { CommonService, ConfigService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { CustLookUp, InventorySearchCriteria, InventorySelectAllItems, InventorySummary, RecommendedData, WeightRange } from '../../../../businessobjects';
import { Customer, fxCredential, InventoryItems } from '../../../../entities';
import { AppPreloadService, CustomerService, GridPropertiesService, InventoryService, MasterConfigService, RecommendedService } from '../../../../services';
import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { PanelBarExpandMode } from '@progress/kendo-angular-layout';
import { NgxSpinnerService } from 'ngx-spinner';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { GridDetailConfig } from 'shared/businessobjects';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import * as moment from 'moment';
import { environment } from 'environments/environment';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-recsearch',
  templateUrl: './recsearch.component.html',
  styleUrls: ['./recsearch.component.css']
})

export class RecsearchComponent implements OnInit {
  @Output() closeDialogPopup: EventEmitter<boolean> = new EventEmitter();

  public expandMode: PanelBarExpandMode = 1;
  private fxCredential!: fxCredential;
  public showFilterPopOver: boolean = false;
  public dateformat = "dd/MM/yyyy";
  public timeformat = "HH:mm";
  public today: Date = new Date();
  public pageSize = 26;
  public skip = 0;
  public gridView?: DataResult;
  public groups: GroupDescriptor[] = [];
  public selectableSettings: SelectableSettings = {
    mode: 'multiple',
  };
  public mySelection: string[] = [];
  public fields!: GridDetailConfig[];
  public isShowCheckBoxAll: boolean = true;
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains',
  };
  public isGridConfig: boolean = false;
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;
  public inventoryItems: InventoryItems[] = [];
  public allInventoryItems: InventorySelectAllItems[] = [];
  public inventoryObj: InventoryItems[] = [];
  public invSummary: InventorySummary = new InventorySummary();
  public stoneId?: "";
  public certificateNo?: "";
  public mediaTitle!: string
  public mediaSrc!: string
  public mediaType!: string
  public firstCaratFrom?: number;
  public firstCaratTo?: number;
  public inventorySearchCriteriaObj: InventorySearchCriteria = new InventorySearchCriteria();
  public listLocation: Array<{ name: string; isChecked: boolean }> = [];
  public allTheShapes?: MasterDNorm[];
  public allColors?: MasterDNorm[];
  public allClarities?: MasterDNorm[];
  public allTheFluorescences?: MasterDNorm[];
  public allTheLab?: MasterDNorm[];
  public allTheCPS?: MasterDNorm[];
  public listKToS: Array<{ name: string; isChecked: boolean }> = [];
  public listCulet: Array<{ name: string; isChecked: boolean }> = [];
  public inclusionConfig: InclusionConfig = new InclusionConfig();
  public inclusionData: MasterDNorm[] = [];
  public masterConfigList!: MasterConfig;
  public selectedCPS?: string;
  public isBGM: boolean = false;
  public measurementData: MasterDNorm[] = [];
  public measurementConfig: MeasurementConfig = new MeasurementConfig();
  public exisingStoneIds: Array<string> = [];
  public errRation: string = "";
  public errTotalDepth: string = "";
  public errTable: string = "";
  public errGirdlePer: string = "";
  public errGirdle: string = "";
  public errPavAngle: string = "";
  public errPavDepth: string = "";
  public errCrnAngle: string = "";
  public errCrnHeight: string = "";
  public errDiaMinimum: string = "";
  public errDiaMaximum: string = "";
  public errArrivalDate: string = "";
  public errLength: string = "";
  public errWidth: string = "";
  public errDepth: string = "";
  public errHeight: string = "";
  public errDollarPerCt: string = "";
  public errNetAmount: string = "";
  public isEditInventory: boolean = false;
  public isSearchFilter: boolean = false;
  public isShowMedia: boolean = false;
  public isFormValid: boolean = false;
  public showExcelOption = false;
  public isSendMail = false;
  public isSendProposal = false;
  public customerItems!: CustLookUp[];
  public recommendedDataObj: RecommendedData = new RecommendedData();
  public selectedStoneIds: Array<string> = [];

  public listCompany: Array<{ name: string; id: string; isChecked: boolean }> = [];
  public filterCompany: string = '';
  public filterCompanyChk: boolean = true;

  constructor(
    private router: Router,
    private appPreloadService: AppPreloadService,
    private commonService: CommonService,
    private alertDialogService: AlertdialogService,
    public utilityService: UtilityService,
    private masterConfigService: MasterConfigService,
    private spinnerService: NgxSpinnerService,
    private changeDetRef: ChangeDetectorRef,
    private gridPropertiesService: GridPropertiesService,
    private configService: ConfigService,
    private inventoryService: InventoryService,
    public datePipe: DatePipe,
    private recommendedService: RecommendedService,
    private customerService: CustomerService,
  ) { }

  public async ngOnInit() {
    this.fxCredential = await this.appPreloadService.fetchFxCredentials();
    if (!this.fxCredential)
      this.router.navigate(["login"]);

    this.gridView = { data: [], total: 0 };
    await this.getGridConfiguration();
    await this.getMasterConfigData();
    await this.getCustomerList();
  }

  public async getGridConfiguration() {
    try {
      this.spinnerService.show();
      this.gridConfig = await this.configService.getGridConfig(this.fxCredential?.id ?? '', "Inventory", "InventoryGrid", this.gridPropertiesService.getInventoryGrid());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("Inventory", "InventoryGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getInventoryGrid();
      }
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  public closeDialog(): void {
    this.closeDialogPopup.emit(true);
  }

  public searchMe(): void {
    this.showFilterPopOver = !this.showFilterPopOver;
  }

  public tagMapper(tags: string[]): void {
    // This function is used for hide selected items in multiselect box
  }

  public async getMasterConfigData() {
    // //Master Config
    this.masterConfigList = await this.masterConfigService.getAllMasterConfig();
    this.allTheShapes = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.shape);
    this.allColors = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.colors);
    this.allClarities = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.clarities);
    this.allTheFluorescences = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.fluorescence);
    this.allTheCPS = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.cps);
    this.allTheLab = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.lab);
    this.inclusionData = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.inclusions);
    this.inclusionConfig = this.masterConfigList.inclusionConfig;
    this.measurementData = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.measurements);
    this.measurementConfig = this.masterConfigList.measurementConfig;

    let allKTOS = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('ktos') !== -1);
    allKTOS.forEach(z => { this.listKToS.push({ name: z.name, isChecked: false }); });

    let allCulet = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('culet') !== -1);
    allCulet.forEach(z => { this.listCulet.push({ name: z.name, isChecked: false }); });

    this.getCountryData();
  }

  public onMultiSelectChange(val: Array<{ name: string; isChecked: boolean }>, selectedData: string[]): void {
    val.forEach(element => {
      element.isChecked = false;
    });

    if (selectedData && selectedData.length > 0) {
      val.forEach(element => {
        selectedData.forEach(item => {
          if (element.name.toLocaleLowerCase() == item.toLocaleLowerCase())
            element.isChecked = true;
        });
      });
    }
  }

  public onMultiSelectChangeDropDown(val: Array<{ name: string; id: string; isChecked: boolean }>, selectedData: string[]): void {
    val.forEach(element => {
      element.isChecked = false;
    });

    if (selectedData && selectedData.length > 0) {
      val.forEach(element => {
        selectedData.forEach(item => {
          if (element.id.toLocaleLowerCase() == item.toLocaleLowerCase())
            element.isChecked = true;
        });
      });
    }
  }

  private async getCustomerList() {
    try {
      this.customerItems = await this.customerService.getAllCustomers();

      this.customerItems.forEach((z) => {
        this.listCompany.push({ name: z.companyName, id: z.id, isChecked: false });
      });

    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  private async getCountryData() {
    try {
      var countryItems = await this.commonService.getCountries();
      if (countryItems)
        countryItems.forEach(z => { this.listLocation.push({ name: z.name, isChecked: false }); });
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  public addRemoveStringInArrayFilter(a: string[], b: string) {
    if (b == 'All') {
      let c = [...a];
      c.forEach(z => { a.splice(0, 1); });
      return;
    }
    if (a.indexOf(b) == -1)
      a.push(b);
    else {
      let index = a.findIndex(x => x == b);
      if (index >= 0)
        a.splice(index, 1)
    }
  }

  public changeCPSData(type: string) {
    this.selectedCPS = type != 'BGM' ? type : this.selectedCPS;
    if (type == '3EX') {
      var ExData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'ex');
      this.inventorySearchCriteriaObj.cut = [];
      this.inventorySearchCriteriaObj.cut.push(ExData?.name ?? 'EX');

      this.inventorySearchCriteriaObj.polish = [];
      this.inventorySearchCriteriaObj.polish.push(ExData?.name ?? 'EX');

      this.inventorySearchCriteriaObj.symm = [];
      this.inventorySearchCriteriaObj.symm.push(ExData?.name ?? 'EX');
    }
    else if (type == '2EX') {
      var ExData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'ex');
      this.inventorySearchCriteriaObj.cut = [];
      this.inventorySearchCriteriaObj.cut.push(ExData?.name ?? 'EX');

      this.inventorySearchCriteriaObj.polish = [];
      this.inventorySearchCriteriaObj.polish.push(ExData?.name ?? 'EX');

      this.inventorySearchCriteriaObj.symm = [];
    }
    else if (type == '3VG') {
      var ExData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'ex');
      var VGData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'vg');

      this.inventorySearchCriteriaObj.cut = [];
      this.inventorySearchCriteriaObj.cut.push(ExData?.name ?? 'EX');
      this.inventorySearchCriteriaObj.cut.push(VGData?.name ?? 'VG');

      this.inventorySearchCriteriaObj.polish = [];
      this.inventorySearchCriteriaObj.polish.push(ExData?.name ?? 'EX');
      this.inventorySearchCriteriaObj.polish.push(VGData?.name ?? 'VG');

      this.inventorySearchCriteriaObj.symm = [];
      this.inventorySearchCriteriaObj.symm.push(ExData?.name ?? 'EX');
      this.inventorySearchCriteriaObj.symm.push(VGData?.name ?? 'VG');
    }
    else if (type == 'Clear') {
      this.inventorySearchCriteriaObj.cut = [];
      this.inventorySearchCriteriaObj.polish = [];
      this.inventorySearchCriteriaObj.symm = [];
    }
    else if (type == 'BGM') {
      if (this.isBGM) {
        this.inventorySearchCriteriaObj.green = [];
        this.inventorySearchCriteriaObj.brown = [];
        this.inventorySearchCriteriaObj.milky = [];
        this.isBGM = false;
      }
      else {
        this.isBGM = true;

        const inclusions = [...this.inclusionData];
        let BrownData = inclusions.filter(item => item.type.toLowerCase().indexOf('brown') !== -1);
        var NoBrownData = BrownData.find(z => z.name.toLowerCase() == 'no');
        this.inventorySearchCriteriaObj.brown = [];
        this.inventorySearchCriteriaObj.brown.push(NoBrownData?.name ?? 'NO');

        var NoGreenData = inclusions.filter(item => item.type.toLowerCase().indexOf('green') !== -1).find(z => z.name.toLowerCase() == 'no');
        this.inventorySearchCriteriaObj.green = [];
        this.inventorySearchCriteriaObj.green.push(NoGreenData?.name ?? 'NO');

        var NoMilkyData = inclusions.filter(item => item.type.toLowerCase().indexOf('milky') !== -1).find(z => z.name.toLowerCase() == 'no');
        this.inventorySearchCriteriaObj.milky = [];
        this.inventorySearchCriteriaObj.milky.push(NoMilkyData?.name ?? 'NO');
      }
    }
  }

  public checkCPS(type?: string) {
    if (type == 'BGM') {
      var NoMilkyData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('milky') !== -1).find(z => z.name.toLowerCase() == 'no');
      var checkMilky = this.inventorySearchCriteriaObj.milky.indexOf(NoMilkyData?.name ?? 'NO');

      var NoGreenData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('green') !== -1).find(z => z.name.toLowerCase() == 'no');
      var checkGreen = this.inventorySearchCriteriaObj.green.indexOf(NoGreenData?.name ?? 'NO');

      let BrownData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('brown') !== -1).find(z => z.name.toLowerCase() == 'no');
      var checkBrown = this.inventorySearchCriteriaObj.brown.indexOf(BrownData?.name ?? 'NO');

      if (checkMilky > -1 && checkGreen > -1 && checkBrown > -1)
        this.isBGM = true;
      else
        this.isBGM = false;
    }
    else {
      var ExData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'ex');
      var VGData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'vg');

      var checkCutEX = this.inventorySearchCriteriaObj.cut.indexOf(ExData?.name ?? 'EX');
      var checkPolishEX = this.inventorySearchCriteriaObj.polish.indexOf(ExData?.name ?? 'EX');
      var checkSymmEX = this.inventorySearchCriteriaObj.symm.indexOf(ExData?.name ?? 'EX');

      var checkCutVG = this.inventorySearchCriteriaObj.cut.indexOf(VGData?.name ?? 'VG');
      var checkPolishVG = this.inventorySearchCriteriaObj.polish.indexOf(VGData?.name ?? 'VG');
      var checkSymmVG = this.inventorySearchCriteriaObj.symm.indexOf(VGData?.name ?? 'VG');

      if (checkCutEX > -1 && checkPolishEX > -1 && checkSymmEX > -1 && checkCutVG > -1 && checkPolishVG > -1 && checkSymmVG > -1)
        this.selectedCPS = '3VG';
      else if (checkCutEX > -1 && checkPolishEX > -1 && checkSymmEX > -1)
        this.selectedCPS = '3EX';
      else if (checkCutEX > -1 && checkPolishEX > -1)
        this.selectedCPS = '2EX';
      else
        this.selectedCPS = 'Clear';
    }
  }

  public checkMinMaxValidation(min: any, max: any): string {
    if (min && max) {
      if (parseFloat(min) > parseFloat(max))
        return "min value must greater than max value!";
    }
    else if (min && !max)
      return "max value required!";
    else if (max && !min)
      return "min value required!";

    return '';
  }

  public async filterBySearch() {
    this.skip = 0;
    this.assignAdditionalData();
    await this.initInventoryData();
    this.showFilterPopOver = false;
  }

  public assignAdditionalData(): void {
    let weightRanges = new Array<WeightRange>();

    if (this.firstCaratFrom && this.firstCaratTo) {
      let weight = new WeightRange();
      weight.minWeight = Number(this.firstCaratFrom);
      weight.maxWeight = Number(this.firstCaratTo);
      weightRanges.push(weight);
    }
    this.inventorySearchCriteriaObj.weightRanges = weightRanges;
    this.inventorySearchCriteriaObj.stoneIds = this.stoneId ? this.utilityService.CheckStoneIds(this.stoneId).map(x => x.toUpperCase()) : [];
    this.inventorySearchCriteriaObj.certificateNos = this.certificateNo ? this.utilityService.checkCertificateIds(this.certificateNo) : [];

    let fData = this.inventorySearchCriteriaObj.fromDate;
    this.inventorySearchCriteriaObj.fromDate = fData ? this.utilityService.setUTCDateFilter(fData) : null;

    let tData = this.inventorySearchCriteriaObj.toDate;
    this.inventorySearchCriteriaObj.toDate = tData ? this.utilityService.setUTCDateFilter(tData) : null;
  }

  public async initInventoryData() {
    try {
      this.spinnerService.show();
      let res = await this.inventoryService.getInventoryItemsBySearch(this.inventorySearchCriteriaObj, this.skip, this.pageSize);
      if (res) {
        this.inventoryItems = res;
        this.invSummary = await this.inventoryService.getInvSummaryBySearch(this.inventorySearchCriteriaObj);
        this.gridView = process(this.inventoryItems, { group: this.groups });
        this.gridView.total = this.invSummary.totalCount;
        this.spinnerService.hide();
      }
      else
        this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }


  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.initInventoryData();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  public selectedRowChange(event: any): void {
    try {
      if (event.selectedRows && event.selectedRows.length > 0) {
        event.selectedRows.forEach((element: any) => {
          let Selectedindex = this.selectedStoneIds.findIndex(x => x == element.dataItem.stoneId);
          if (Selectedindex < 0) {
            this.selectedStoneIds.push(element.dataItem.stoneId)
          }
        });
      }
      else {
        event.deselectedRows.forEach((element: any) => {
          if (!element.dataItem.isDisabled) {
            let index = this.selectedStoneIds.findIndex(x => x == element.dataItem.stoneId);
            if (index >= 0)
              this.selectedStoneIds.splice(index, 1)
          }
        });
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }


  public getValidDate(date: any): Date | null {
    if (date != null) {
      const day = moment(date).date();
      const month = moment(date).month();
      const year = moment(date).year();
      var newDate = new Date(year, month, day);
      return newDate;
    }
    return date;
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.initInventoryData();
  }

  public async selectAllInventories(event: string) {
    this.mySelection = [];
    if (event.toLowerCase() == 'checked') {
      if (this.invSummary.totalCount > this.pageSize)
        await this.loadAllInventories();
      else
        this.mySelection = this.inventoryItems.map(z => z.id);
    }
  }

  public async loadAllInventories() {
    try {
      this.inventorySearchCriteriaObj.supplierIds = [];
      this.allInventoryItems = await this.inventoryService.getInventoryItemsForSelectAll(this.inventorySearchCriteriaObj);
      if (this.allInventoryItems && this.allInventoryItems.length > 0)
        this.mySelection = this.allInventoryItems.map(z => z.id);

      this.changeDetRef.detectChanges();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public calculateDateDiff(date: Date | null): string {
    if (date == null)
      return '0';

    let today = new Date();
    let calDate = new Date(date);

    var diff = Math.abs(today.getTime() - calDate.getTime());
    var diffDays = Math.ceil(diff / (1000 * 3600 * 24));

    if (today.getMonth() == calDate.getMonth() && today.getFullYear() == calDate.getFullYear())
      diffDays = today.getDate() - calDate.getDate();

    return diffDays.toString();
  }

  /* #endregion */
  public openDiamondDetails(stoneId: string) {
    let baseUrl = environment.proposalUrl;
    var url = baseUrl + 'diamond-detail/' + stoneId;
    window.open(url, '_blank');
  }


  public openMediaDialog(title: string, stoneId: string, type: string): void {
    if (stoneId) {
      this.mediaTitle = title;

      if (type == "iframe")
        this.mediaSrc = environment.videoURL.replace('{stoneId}', stoneId.toLowerCase());
      else if (type == "img")
        this.mediaSrc = environment.imageURL.replace('{stoneId}', stoneId.toLowerCase());
      else if (type == "cert")
        this.mediaSrc = environment.certiURL.replace('{certiNo}', stoneId);
      else
        this.mediaSrc = stoneId;

      this.mediaType = type;
      this.isShowMedia = true;
    }
  }

  public closeMediaDialog(e: boolean): void {
    this.isShowMedia = e;
  }

  public onOpenDropdown(
    list: Array<{ name: string; id: string; isChecked: boolean }>,
    e: boolean,
    selectedData: string[]
  ): boolean {
    if (selectedData?.length == list.map((z) => z.name).length) e = true;
    else e = false;
    return e;
  }

  public handleFilter(e: any): string {
    return e;
  }

  public filterDropdownSearch(allData: CustLookUp[], e: any, selectedData: string[])
    : Array<{ name: string; id: string; isChecked: boolean }> {
    let filterData: any[] = [];
    allData.forEach((z) => {
      filterData.push({ name: z.companyName, id: z.id, isChecked: false });
    });
    filterData.forEach((z) => {
      if (selectedData?.includes(z.id)) z.isChecked = true;
    });
    if (e?.length > 0)
      return filterData.filter((z) => z.name?.toLowerCase().includes(e?.toLowerCase())
      );
    else return filterData;
  }

  public checkAllListItems(
    list: Array<{ name: string; id: string; isChecked: boolean }>,
    e: boolean,
    selectedData: string[]
  ): string[] {
    if (e) {
      selectedData = [];
      selectedData = list.map((z) => z.id);
      list.forEach((element) => {
        element.isChecked = true;
      });
    } else {
      selectedData = [];
      list.forEach((element) => {
        element.isChecked = false;
      });
    }
    return selectedData;
  }

  public getCommaSapratedString(vals: any[], list: Array<{ name: string; id: string; isChecked: boolean }>, isAll: boolean = false): string {
    let data = list.filter(z => vals.includes(z.id));
    let name = data.map(z => z.name).join(',');
    if (!isAll)
      if (name.length > 15)
        name = name.substring(0, 15) + '...';

    return name;
  }

  public async save() {
    try {
      if (this.selectedStoneIds.length > 0 && this.recommendedDataObj.customerIds.length > 0) {
        this.spinnerService.show();
        this.recommendedDataObj.stoneIds = this.selectedStoneIds;
        var res = await this.recommendedService.insertRecommended(this.recommendedDataObj);
        if (res) {
          this.spinnerService.hide();
          this.alertDialogService.show(res);
          this.closeDialogPopup.emit(true);
        }
        else {
          this.spinnerService.hide();
          this.alertDialogService.show('Something went wrong, Try again later!');
        }
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

}
