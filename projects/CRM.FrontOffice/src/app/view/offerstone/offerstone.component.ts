import { Component, OnInit } from '@angular/core';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, SelectAllCheckboxState, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, SortDescriptor, process } from '@progress/kendo-data-query';
import { GridDetailConfig } from 'shared/businessobjects';
import { GridConfig, GridMasterConfig, InclusionConfig, MasterConfig, MasterDNorm, MeasurementConfig, fxCredential } from 'shared/enitites';
import { CustomerDNorm, SystemUser, SystemUserDNorm } from '../../entities';
import { OfferStoneItem } from '../../businessobjects/business/offerstoneitem';
import { OfferStoneSearchCriteria } from '../../businessobjects/analysis/offerstonesearchcriteria';
import { Align } from '@progress/kendo-angular-popup';
import { OfferstoneService } from '../../services/analysis/offerstone.service';
import { AlertdialogService } from 'shared/views';
import { AppPreloadService, ConfigService, OriginValue, UtilityService } from 'shared/services';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgForm } from '@angular/forms';
import { CustomerService, GridPropertiesService, MasterConfigService, SystemUserService } from '../../services';
import { SortFieldDescriptor } from 'projects/CRM.BackOffice/src/app/businessobjects';
import { Router } from '@angular/router';

@Component({
  selector: 'app-offerstone',
  templateUrl: './offerstone.component.html',
  styleUrls: ['./offerstone.component.css']
})
export class OfferstoneComponent implements OnInit {

  //#region Grid Init
  public offerstoneobj: OfferStoneItem = new OfferStoneItem();
  public sort: SortDescriptor[] = [];
  public groups: GroupDescriptor[] = [];
  public pageSize = 26;
  public skip = 0;
  public fields!: GridDetailConfig[];
  public gridView?: DataResult;
  public isRegSystemUser: boolean = false;
  public filterFlag = true;
  public selectableSettings: SelectableSettings = {
    mode: 'multiple',
  };
  public skeletonArray = new Array(18);
  public mySelection: string[] = [];
  public isShowCheckBoxAll: boolean = true;
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains',
  };
  //#endregion

  //#region Grid Config
  public isGridConfig: boolean = false;
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;
  //#endregion
  private fxCredential!: fxCredential;
  public selectedEmpItems?: { text: string, value: string };
  public selectedCustomer?: { text: string, value: string };
  public selectedCPS?: string;
  public isBGM: boolean = false;
  public listSupplierDNormItems: Array<{ name: string; value: string; isChecked: boolean }> = [];
  public listBranchDNormItems: Array<{ text: string; value: string }> = [];
  public listDepartmentItems: Array<{ text: string; value: string }> = [];
  public listEmpItems: Array<{ text: string; value: string }> = [];

  public masterConfigList!: MasterConfig;
  public sortFieldDescriptors!: SortFieldDescriptor[];
  public sellerItems: SystemUser[] = [];
  public customerItems: CustomerDNorm[] = [];
  public allTheLab?: MasterDNorm[];
  public allTheShapes?: MasterDNorm[];
  public allColors?: MasterDNorm[];
  public allClarities?: MasterDNorm[];
  public allTheFluorescences?: MasterDNorm[];
  public allTheCPS?: MasterDNorm[];
  public inclusionData: MasterDNorm[] = [];
  public inclusionFlag: boolean = false;
  public inclusionConfig: InclusionConfig = new InclusionConfig();
  public measurementData: MasterDNorm[] = [];
  public measurementConfig: MeasurementConfig = new MeasurementConfig();
  public listKToS: Array<{ name: string; isChecked: boolean }> = [];
  public listStatus: Array<{ name: string; isChecked: boolean }> = [];
  public listSeller: Array<{ name: string; isChecked: boolean }> = [];
  public listCustomer: Array<{ name: string; isChecked: boolean }> = [];
  public listCulet: Array<{ name: string; isChecked: boolean }> = [];
  public listLocation: Array<{ name: string; isChecked: boolean }> = [];
  public listTypeA: Array<{ name: string; isChecked: boolean }> = [];
  public listKapanItems: Array<{ name: string; isChecked: boolean }> = [];
  public listIGradeItems: Array<{ name: string; isChecked: boolean }> = [];
  public listMGradeItems: Array<{ name: string; isChecked: boolean }> = [];
  public offerStoneItem: OfferStoneItem[] = [];
  public offerStoneSearchCriteria: OfferStoneSearchCriteria = new OfferStoneSearchCriteria();

  //#endregion


  //#region Model Flag
  public isSearchFilter: boolean = false;
  public isFormValid: boolean = false;


  //#region Custom Models
  public stoneId?: "";
  public certificateNo?: "";
  public ToWeight?: number;
  public FromWeight?: number;
  public anchorAlign: Align = { horizontal: "right", vertical: "bottom" };
  public popupAlign: Align = { horizontal: "center", vertical: "top" };
  public isLeadModal: boolean = false;
  public sellerObj = new SystemUserDNorm();
  public basesixtyfour: any;
  public isCanHoldInventory: boolean = false;
  public isCanReleaseHoldInventory: boolean = false;
  public isCanRapnetHoldInventory: boolean = false;
  public isCanRapnetReleaseHoldInventory: boolean = false;
  public isCanDeleteInventory: boolean = false;

  public selectAllState: SelectAllCheckboxState = 'unchecked';
  public fxCredentials!: fxCredential;
  public isFirstTimeLoad = true;

  public aDiscount!: number;
  public selectedBGM?: string;
  public selectedIsold?: string;
  public searchMailTo: Array<string> = [];
  public mailTo: string[] = [];
  public searchCCMail: Array<string> = [];
  public ccEmail: string[] = [];
  public searchBCCMail: Array<string> = [];
  public bccEmail: string[] = [];
  //#endregion

  constructor(private offerstonService: OfferstoneService,
    private alertDialogService: AlertdialogService,
    public utilityService: UtilityService,
    private spinnerService: NgxSpinnerService,
    private systemUserService: SystemUserService,
    public appPreloadService: AppPreloadService,
    private customerService: CustomerService,
    private gridPropertiesService: GridPropertiesService,
    private masterConfigService: MasterConfigService,
    private configService: ConfigService,
  ) { }

  async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  //#region DefaultMethod
  async defaultMethodsLoad() {
    try {
      this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
      this.getGridConfiguration();
      await this.offerStoneData();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async openSearchDialog() {
    try {
      this.isSearchFilter = true;
      if (this.isFirstTimeLoad) {
        this.spinnerService.show();
        await this.loadSellers();
        await this.loadCustomers();

        await this.getMasterConfigData();
        this.isFirstTimeLoad = false;
      }
      this.spinnerService.hide();

      //show checked location if change from summary filter
      // this.utilityService.onMultiSelectChange(this.listLocation, this.offerStoneSearchCriteria.location);
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public closeSearchDialog(): void {
    this.isSearchFilter = false;
  }

  public openGridConfigDialog(): void {
    this.isGridConfig = !this.isGridConfig;
  }

  public setNewGridConfig(gridConfig: GridConfig) {
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

  public async offerStoneData() {
    try {
      this.spinnerService.show();
      let res = await this.offerstonService.getOfferstoneBySearch(this.offerStoneSearchCriteria, this.skip, this.pageSize);
      this.offerStoneItem = res.offerStones;
      if (res) {
        const mappedOfferDetails = this.offerStoneItem.map(element => {
          let netAmount = null;
          let offerPerCarat = null;

          if (element?.offer) {
            var offerDisc = parseFloat(element?.offer?.toString() || "0");
            let weight = element?.weight;
            let stoneRap = weight * (element.price?.rap ?? 0);
            let calDiscount = 100 + offerDisc;
            netAmount = (calDiscount * stoneRap) / 100;
            offerPerCarat = netAmount / weight;
          }

          return {
            ...element,
            offerNetAmount: netAmount,
            offerPerCT: offerPerCarat
          };
        });

        this.gridView = process(mappedOfferDetails, { group: this.groups, sort: this.sort });
        this.gridView.total = res.counts;
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

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.offerStoneData();
  }

  //#region Grid Config
  public async getGridConfiguration() {
    try {
      this.gridConfig = await this.configService.getGridConfig(this.fxCredentials?.id ?? '', "OfferStone", "OfferStoneGrid", this.gridPropertiesService.getOfferStoneItems());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("OfferStone", "OfferStoneGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getOfferStoneItems();
      }
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  public async loadSellers() {
    try {
      let res = await this.systemUserService.getSystemUserByOrigin(OriginValue.Seller.toString());
      if (res)
        this.sellerItems = res;
      else
        this.alertDialogService.show('Seller not load, Try again later!');
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Seller not load, Try again later!');
    }
  }

  private async loadCustomers() {
    try {
      let res = await this.customerService.getAllCustomerDNormsByName('');
      if (res)
        this.customerItems = res;
      else
        this.alertDialogService.show('Customer not load, Try again later!');
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Customer not load, Try again later!');
    }
  }

  //#region Master Config Data
  public async getMasterConfigData() {
    //Master Config
    this.sellerItems.forEach(z => { this.listSeller.push({ name: z.fullName.toString(), isChecked: false }); });
    this.customerItems.forEach(z => { this.listCustomer.push({ name: z.name, isChecked: false }); });
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
  }

  public async filterBySearch() {
    this.assignAdditionalData();
    await this.offerStoneData();
    this.isSearchFilter = false;

  }

  public assignAdditionalData() {
    this.offerStoneSearchCriteria.FromWeight = this.FromWeight ?? null as any;
    this.offerStoneSearchCriteria.ToWeight = this.ToWeight ?? null as any;
    this.offerStoneSearchCriteria.stoneIds = this.stoneId ? this.utilityService.CheckStoneIds(this.stoneId).map(x => x.toUpperCase()) : [];
    this.offerStoneSearchCriteria.certificateNos = this.certificateNo ? this.utilityService.checkCertificateIds(this.certificateNo) : [];
    let fOfferDate = this.offerStoneSearchCriteria.fromOfferDate;
    this.offerStoneSearchCriteria.fromOfferDate = fOfferDate ? this.utilityService.setUTCDateFilter(fOfferDate) : null;

    let tOfferDate = this.offerStoneSearchCriteria.toOfferDate;
    this.offerStoneSearchCriteria.toOfferDate = tOfferDate ? this.utilityService.setUTCDateFilter(tOfferDate) : null;
  }

  public checkCPS(type?: string) {
    if (type == 'BGM') {
      var NoMilkyData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('milky') !== -1).find(z => z.name.toLowerCase() == 'no');
      var checkMilky = this.offerStoneSearchCriteria.milkies.indexOf(NoMilkyData?.name ?? 'NO');

      var NoGreenData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('green') !== -1).find(z => z.name.toLowerCase() == 'no');
      var checkGreen = this.offerStoneSearchCriteria.greens.indexOf(NoGreenData?.name ?? 'NO');

      let BrownData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('brown') !== -1).find(z => z.name.toLowerCase() == 'no');
      var checkBrown = this.offerStoneSearchCriteria.browns.indexOf(BrownData?.name ?? 'NO');

      if (checkMilky > -1 && checkGreen > -1 && checkBrown > -1)
        this.isBGM = true;
      else
        this.isBGM = false;
    }
    else {
      var ExData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'ex');
      var VGData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'vg');

      var checkCutEX = this.offerStoneSearchCriteria.cuts.indexOf(ExData?.name ?? 'EX');
      var checkPolishEX = this.offerStoneSearchCriteria.polishes.indexOf(ExData?.name ?? 'EX');
      var checkSymmEX = this.offerStoneSearchCriteria.symmentries.indexOf(ExData?.name ?? 'EX');

      var checkCutVG = this.offerStoneSearchCriteria.cuts.indexOf(VGData?.name ?? 'VG');
      var checkPolishVG = this.offerStoneSearchCriteria.polishes.indexOf(VGData?.name ?? 'VG');
      var checkSymmVG = this.offerStoneSearchCriteria.symmentries.indexOf(VGData?.name ?? 'VG');

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

  public changeCPSData(type: string) {
    this.selectedCPS = type != 'BGM' ? type : this.selectedCPS;
    if (type == '3EX') {
      var ExData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'ex');
      this.offerStoneSearchCriteria.cuts = [];
      this.offerStoneSearchCriteria.cuts.push(ExData?.name ?? 'EX');

      this.offerStoneSearchCriteria.polishes = [];
      this.offerStoneSearchCriteria.polishes.push(ExData?.name ?? 'EX');

      this.offerStoneSearchCriteria.symmentries = [];
      this.offerStoneSearchCriteria.symmentries.push(ExData?.name ?? 'EX');
    }
    else if (type == '2EX') {
      var ExData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'ex');
      this.offerStoneSearchCriteria.cuts = [];
      this.offerStoneSearchCriteria.cuts.push(ExData?.name ?? 'EX');

      this.offerStoneSearchCriteria.polishes = [];
      this.offerStoneSearchCriteria.polishes.push(ExData?.name ?? 'EX');

      this.offerStoneSearchCriteria.symmentries = [];
    }
    else if (type == '3VG') {
      var ExData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'ex');
      var VGData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'vg');

      this.offerStoneSearchCriteria.cuts = [];
      this.offerStoneSearchCriteria.cuts.push(ExData?.name ?? 'EX');
      this.offerStoneSearchCriteria.cuts.push(VGData?.name ?? 'VG');

      this.offerStoneSearchCriteria.polishes = [];
      this.offerStoneSearchCriteria.polishes.push(ExData?.name ?? 'EX');
      this.offerStoneSearchCriteria.polishes.push(VGData?.name ?? 'VG');

      this.offerStoneSearchCriteria.symmentries = [];
      this.offerStoneSearchCriteria.symmentries.push(ExData?.name ?? 'EX');
      this.offerStoneSearchCriteria.symmentries.push(VGData?.name ?? 'VG');
    }
    else if (type == 'Clear') {
      this.offerStoneSearchCriteria.cuts = [];
      this.offerStoneSearchCriteria.polishes = [];
      this.offerStoneSearchCriteria.symmentries = [];
    }
    else if (type == 'BGM') {
      if (this.isBGM) {
        this.offerStoneSearchCriteria.greens = [];
        this.offerStoneSearchCriteria.browns = [];
        this.offerStoneSearchCriteria.milkies = [];
        this.isBGM = false;
      }
      else {
        this.isBGM = true;

        const inclusions = [...this.inclusionData];
        let BrownData = inclusions.filter(item => item.type.toLowerCase().indexOf('brown') !== -1);
        var NoBrownData = BrownData.find(z => z.name.toLowerCase() == 'no');
        this.offerStoneSearchCriteria.browns = [];
        this.offerStoneSearchCriteria.browns.push(NoBrownData?.name ?? 'NO');

        var NoGreenData = inclusions.filter(item => item.type.toLowerCase().indexOf('green') !== -1).find(z => z.name.toLowerCase() == 'no');
        this.offerStoneSearchCriteria.greens = [];
        this.offerStoneSearchCriteria.greens.push(NoGreenData?.name ?? 'NO');

        var NoMilkyData = inclusions.filter(item => item.type.toLowerCase().indexOf('milky') !== -1).find(z => z.name.toLowerCase() == 'no');
        this.offerStoneSearchCriteria.milkies = [];
        this.offerStoneSearchCriteria.milkies.push(NoMilkyData?.name ?? 'NO');
      }
    }
  }

  public changeIsSoldData(type?: string) {
    if (this.selectedIsold == type) {
      this.selectedIsold = '';
      return;
    }
    this.selectedIsold = type;
    type == "sold" ? this.offerStoneSearchCriteria.isSold = true : this.offerStoneSearchCriteria.isSold = false;
  }

  public changeBGMData(type?: string) {
    this.offerStoneSearchCriteria.browns = [];
    this.offerStoneSearchCriteria.milkies = [];
    this.offerStoneSearchCriteria.greens = [];

    if (this.selectedBGM == type) {
      this.selectedBGM = '';
      return;
    }
    this.selectedBGM = type;

    if (type == "BM") {
      let brownData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('brown') !== -1).filter(z => z.name.toLowerCase() != 'no').map(z => z.name);
      this.offerStoneSearchCriteria.browns.push(...brownData);
      let milkyData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('milky') !== -1).filter(z => z.name.toLowerCase() != 'no').map(z => z.name);
      this.offerStoneSearchCriteria.milkies.push(...milkyData);

    } else if (type == "LBNM") {
      let brownData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('brown') !== -1).filter(z => z.name.toLowerCase() == 'lbr').map(z => z.name);
      this.offerStoneSearchCriteria.browns.push(...brownData);
      let milkyData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('milky') !== -1).filter(z => z.name.toLowerCase() == 'no').map(z => z.name);
      this.offerStoneSearchCriteria.milkies.push(...milkyData);

    } else if (type == "BNM") {
      let brownData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('brown') !== -1).filter(z => z.name.toLowerCase() != 'no').map(z => z.name);
      this.offerStoneSearchCriteria.browns.push(...brownData);
      let milkyData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('milky') !== -1).filter(z => z.name.toLowerCase() == 'no').map(z => z.name);
      this.offerStoneSearchCriteria.milkies.push(...milkyData);

    } else if (type == "NBLM") {
      let brownData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('brown') !== -1).filter(z => z.name.toLowerCase() == 'no').map(z => z.name);
      this.offerStoneSearchCriteria.browns.push(...brownData);
      let milkyData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('milky') !== -1).filter(z => z.name.toLowerCase() == 'lml').map(z => z.name);
      this.offerStoneSearchCriteria.milkies.push(...milkyData);
    }
    else if (type == "NBM") {
      let brownData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('brown') !== -1).filter(z => z.name.toLowerCase() == 'no').map(z => z.name);
      this.offerStoneSearchCriteria.browns.push(...brownData);
      let milkyData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('milky') !== -1).filter(z => z.name.toLowerCase() != 'no').map(z => z.name);
      this.offerStoneSearchCriteria.milkies.push(...milkyData);
    }
    else if (type == "NBNM") {
      let brownData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('brown') !== -1).filter(z => z.name.toLowerCase() == 'no').map(z => z.name);
      this.offerStoneSearchCriteria.browns.push(...brownData);
      let milkyData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('milky') !== -1).filter(z => z.name.toLowerCase() == 'no').map(z => z.name);
      this.offerStoneSearchCriteria.milkies.push(...milkyData);

    } else if (type == "NBGM") {
      let brownData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('brown') !== -1).filter(z => z.name.toLowerCase() == 'no').map(z => z.name);
      this.offerStoneSearchCriteria.browns.push(...brownData);
      let milkyData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('milky') !== -1).filter(z => z.name.toLowerCase() == 'no').map(z => z.name);
      this.offerStoneSearchCriteria.milkies.push(...milkyData);
      let greenData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('green') !== -1).filter(z => z.name.toLowerCase() == 'no').map(z => z.name);
      this.offerStoneSearchCriteria.greens.push(...greenData);
    }
  }

  public clearSearchCriteria(form: NgForm): void {
    form?.reset();
    this.offerStoneSearchCriteria = new OfferStoneSearchCriteria();
    this.sort = new Array<SortDescriptor>();
    this.listStatus.forEach(z => { z.isChecked = false });
    this.listLocation.forEach(z => { z.isChecked = false });
    this.listKToS.forEach(z => { z.isChecked = false });
    this.listCulet.forEach(z => { z.isChecked = false });
    this.FromWeight = undefined;
    this.ToWeight = undefined;
    this.stoneId = '';
    this.certificateNo = '';
  }

  public async copyToClipboard() {
    // try {
    //   this.spinnerService.show();
    //   let res = await this.offerstonService.copyToClipboardStoneId(this.offerStoneSearchCriteria);
    //   if (res) {
    //     navigator.clipboard.writeText(res);
    //     this.utilityService.showNotification(`Copy to clipboard successfully!`);
    //     this.spinnerService.hide();
    //   }
    //   else
    //     this.spinnerService.hide();
    // }
    // catch (error: any) {
    //   this.spinnerService.hide();
    //   this.alertDialogService.show(error.error);
    // }
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    this.sortFieldDescriptors = new Array<SortFieldDescriptor>();
    this.offerStoneData();
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.offerStoneData();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }
}
