import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { SelectionRange } from '@progress/kendo-angular-dateinputs';
import { PageChangeEvent, RowClassArgs, SelectableSettings } from '@progress/kendo-angular-grid';
import { Align } from '@progress/kendo-angular-popup';
import { DataResult, GroupDescriptor, orderBy, process, SortDescriptor } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { keys } from 'shared/auth';
import { Address, GridDetailConfig, MfgInclusionData, MfgMeasurementData, MfgPricingRequest, PricingDiscountApiResponse, RapPriceRequest } from 'shared/businessobjects';
import { fxCredential, GridConfig, GridMasterConfig, MasterConfig, MasterDNorm, MeasurementConfig, SystemUserPermission } from 'shared/enitites';
import { ConfigService, PricingService, StoneStatus, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import * as xlsx from 'xlsx';
import { InventoryExcelItems, InventoryFilter, InventoryManualItems, InverntoryError } from '../../businessobjects';
import { InventoryArrival, InventoryItems, Organization } from '../../entities';
import { CommuteService, GridPropertiesService, InventoryUploadService, MasterConfigService, OrganizationService } from '../../services';

@Component({
  selector: 'app-inventoryupload',
  templateUrl: './inventoryupload.component.html',
  styleUrls: ['./inventoryupload.component.css']
})

export class InventoryuploadComponent implements OnInit {
  //#region Grid Init
  public groups: GroupDescriptor[] = [];
  public pageSize = 26;
  public skip = 0;
  public fields!: GridDetailConfig[];
  public isRegEmployee: boolean = false;
  public filterFlag = true;
  public selectableSettings: SelectableSettings = {
    mode: 'multiple',
  };
  public skeletonArray = new Array(18);
  public mySelection: string[] = [];
  public isShowCheckBoxAll: boolean = true;
  public inventoryExcelItems: InventoryExcelItems[] = [];
  public errorMessagesByStoneId: InverntoryError[] = [];
  public selectedInventoryExcelItems: InventoryExcelItems[] = [];
  public gridView!: DataResult;
  public sort!: SortDescriptor[];
  public existStoneIds: string[] = [];
  public masterConfigList!: MasterConfig;
  public allTheShapes!: MasterDNorm[];
  public allColors!: MasterDNorm[];
  public allClarities!: MasterDNorm[];
  public allTheFluorescences!: MasterDNorm[];
  public allTheCPS!: MasterDNorm[];
  public measurementData: MasterDNorm[] = [];
  public measurementConfig: MeasurementConfig = new MeasurementConfig();
  //#endregion

  //#region Grid Config
  public isGridConfig: boolean = false;
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;
  //#endregion

  public range: SelectionRange = { start: new Date, end: new Date };

  //#region Add/Edit Inventory
  public isEditInventory: boolean = false;
  public inventoryUploadObj: InventoryExcelItems = new InventoryExcelItems();
  public insertFlag: boolean = true;
  //#endregion

  //#region Grid Inventory Manually
  public inventoryManualItems = new InventoryManualItems();
  public inventoryManualForm!: NgForm;
  public inventoryItemsData: InventoryExcelItems[] = []

  public allInvArrivalData: InventoryArrival[] = [];
  //#endregion

  public isRateFound: boolean = true;
  public inventoryFilterObj: InventoryFilter = new InventoryFilter();

  public fxCredentials!: fxCredential;
  public organizationAddress: Address = new Address();

  public showPopup: boolean = false;

  public showSavePopup: boolean = false;
  public boxSerialNo!: string;

  public organizationData: Organization = new Organization();
  public isAllSelected: boolean = true;

  //#region Filter List
  public allKapan: string[] = [];
  public listShape: Array<{ name: string; isChecked: boolean }> = [];
  public listKapan: Array<{ name: string; isChecked: boolean }> = [];
  public listColor: Array<{ name: string; isChecked: boolean }> = [];
  public listClarity: Array<{ name: string; isChecked: boolean }> = [];
  public listCut: Array<{ name: string; isChecked: boolean }> = [];
  public listPolish: Array<{ name: string; isChecked: boolean }> = [];
  public listSymm: Array<{ name: string; isChecked: boolean }> = [];
  public listFlour: Array<{ name: string; isChecked: boolean }> = [];

  public totalPcs: number = 0;
  public totalWeight: number = 0;
  public totalAmount: number = 0;
  //#endregion

  @ViewChild("anchor") public anchor!: ElementRef;
  @ViewChild("popup", { read: ElementRef }) public popup!: ElementRef;
  public anchorAlign: Align = { horizontal: "right", vertical: "bottom" };
  public popupAlign: Align = { horizontal: "center", vertical: "top" };

  @ViewChild("anchorSave") public anchorSave!: ElementRef;
  @ViewChild("popupSave", { read: ElementRef }) public popupSave!: ElementRef;

  public filterShape: string = '';
  public filterShapeChk: boolean = true;
  public filterKapan: string = '';
  public filterKapanChk: boolean = true;
  public filterColor: string = '';
  public filterColorChk: boolean = true;
  public filterClarity: string = '';
  public filterClarityChk: boolean = true;
  public filterCut: string = '';
  public filterCutChk: boolean = true;
  public filterPolish: string = '';
  public filterPolishChk: boolean = true;
  public filterSymm: string = '';
  public filterSymmChk: boolean = true;
  public filterFlour: string = '';
  public filterFlourChk: boolean = true;
  public isCanAddInvArrival: boolean = false;
  public isCanDeleteInvArrival: boolean = false;
  public isViewButtons: boolean = false;

  constructor(private inventoryUploadService: InventoryUploadService,
    private organizationService: OrganizationService,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    public utilityService: UtilityService,
    private masterConfigService: MasterConfigService,
    private gridPropertiesService: GridPropertiesService,
    private pricingService: PricingService,
    private commuteService: CommuteService,
    private configService: ConfigService) {
  }

  async ngOnInit() {
    await this.loadDefaultMethod();
  }

  //#region Init Data
  public async loadDefaultMethod() {
    try {
      this.spinnerService.show();
      this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;

      if (this.fxCredentials && this.fxCredentials.origin && (this.fxCredentials.origin.toLowerCase() == 'admin' || this.fxCredentials.origin.toLowerCase() == 'opmanager'))
        this.isViewButtons = true;

      await this.getGridConfiguration();
      await this.loadMasterConfig();
      await this.loadOrganizationAddress();
      await this.loadInventoryArrival();
      await this.setUserRights();

      this.utilityService.filterToggleSubject.subscribe(flag => {
        this.filterFlag = flag;
      });
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

  public async setUserRights() {
    let userPermissions: SystemUserPermission = new SystemUserPermission();
    let sesValue = sessionStorage.getItem("userPermission");
    if (sesValue)
      userPermissions = JSON.parse(sesValue) as SystemUserPermission;
    if (userPermissions.actions.length > 0) {
      let CanAddInvArrival = userPermissions.actions.find(z => z.name == "CanAddInvArrival");
      if (CanAddInvArrival != null)
        this.isCanAddInvArrival = true;
      let CanDeleteInvArrival = userPermissions.actions.find(z => z.name == "CanDeleteInvArrival");
      if (CanDeleteInvArrival != null)
        this.isCanDeleteInvArrival = true;
    }
  }

  public async getGridConfiguration() {
    try {
      this.gridConfig = await this.configService.getGridConfig(this.fxCredentials?.id ?? '', "InventoryUpload", "InventoryUploadGrid", this.gridPropertiesService.getInventoryUploadGrid());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("InventoryUpload", "InventoryUploadGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getInventoryUploadGrid();
      }
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  public async loadOrganizationAddress() {
    this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
    this.organizationAddress = await this.organizationService.getOrganizationAddressByEmployee(this.fxCredentials.id);

    //Add country from organization if not exists in branch address
    if (this.organizationAddress.country == null) {
      let orgAddress = await this.organizationService.getOrganizationDNorm();
      if (orgAddress && orgAddress.length > 0)
        this.organizationAddress.country = orgAddress[0].address.country;
    }
  }

  public async loadMasterConfig() {

    this.masterConfigList = await this.masterConfigService.getAllMasterConfig();
    this.allTheShapes = this.masterConfigList.shape;
    this.allTheShapes.forEach(z => { this.listShape.push({ name: z.name, isChecked: false }); });

    this.allColors = this.masterConfigList.colors;
    this.allColors.forEach(z => { this.listColor.push({ name: z.name, isChecked: false }); });

    this.allClarities = this.masterConfigList.clarities;
    this.allClarities.forEach(z => { this.listClarity.push({ name: z.name, isChecked: false }); });

    this.allTheFluorescences = this.masterConfigList.fluorescence;
    this.allTheFluorescences.forEach(z => { this.listFlour.push({ name: z.name, isChecked: false }); });

    this.allTheCPS = this.masterConfigList.cps;
    this.allTheCPS.forEach(z => { this.listCut.push({ name: z.name, isChecked: false }); });
    this.allTheCPS.forEach(z => { this.listPolish.push({ name: z.name, isChecked: false }); });
    this.allTheCPS.forEach(z => { this.listSymm.push({ name: z.name, isChecked: false }); });

    this.measurementData = this.masterConfigList.measurements;
    this.measurementConfig = this.masterConfigList.measurementConfig;
  }

  public async loadInventoryArrival() {
    try {
      let res = await this.inventoryUploadService.getInventoryArrivalData();
      if (res) {
        this.allInvArrivalData = res;
        this.inventoryExcelItems = this.mappingArrivalToExcelData(res);

        //Validate Data
        await this.checkValidationForAll(this.inventoryExcelItems);

        //Get Pricing
        this.inventoryExcelItems = await this.setBasePricing(this.inventoryExcelItems);

        //check for Price validation
        let notValidRap: string[] = this.inventoryExcelItems.filter(z => z.rap == null || z.rap == 0).map(z => z.stoneId);
        this.validateValues(this.inventoryExcelItems, notValidRap, "Pricing not Exist");

        this.isVisibleCheckAll();
        this.setKapanList();

        this.loadItems(this.inventoryExcelItems);
      }
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Arrival data not load, Try again later!');
      this.spinnerService.hide();
    }
  }

  private mappingArrivalToExcelData(arrivalData: InventoryArrival[]): InventoryExcelItems[] {
    let excelData: InventoryExcelItems[] = [];

    arrivalData.forEach(z => {
      let newItem: InventoryExcelItems = new InventoryExcelItems();
      newItem.stoneId = z.loatNo;
      newItem.kapan = z.loatNo.split('-').length > 1 ? z.loatNo.split('-')[0] : '';
      newItem.shape = this.getDisplayNameFromMasterDNorm(z.shape, this.allTheShapes);;
      newItem.weight = z.weight;
      newItem.color = this.getDisplayNameFromMasterDNorm(z.color, this.allColors);
      newItem.clarity = this.getDisplayNameFromMasterDNorm(z.clarity, this.allClarities);
      newItem.cut = this.getDisplayNameFromMasterDNorm(z.cut, this.allTheCPS);
      newItem.polish = this.getDisplayNameFromMasterDNorm(z.polish, this.allTheCPS);
      newItem.symmetry = this.getDisplayNameFromMasterDNorm(z.symmetry, this.allTheCPS);
      newItem.fluorescence = this.getDisplayNameFromMasterDNorm(z.fluro, this.allTheFluorescences);
      newItem.kapanOrigin = z.origin;
      newItem.shapeRemark = z.remark;

      //Get CPS value
      newItem.cps = this.utilityService.getCPSValue(newItem.shape, newItem.cut, newItem.polish, newItem.symmetry, this.masterConfigList.cutDetails);

      newItem.comments = '';
      newItem.depth = z.tableDepth ?? 0;
      newItem.table = z.tableAngle ?? 0;
      newItem.length = z.length ?? 0;
      newItem.width = z.width ?? 0;
      newItem.height = z.height ?? 0;
      newItem.crownHeight = 0;
      newItem.crownAngle = z.crownAngle ?? 0;
      newItem.pavilionDepth = 0;
      newItem.pavilionAngle = 0;
      newItem.girdlePer = z.girdlePer ?? 0;

      newItem.minGirdle = '';
      newItem.maxGirdle = '';

      newItem.status = StoneStatus.PWaiting.toString();

      newItem.orgId = this.fxCredentials.organizationId;
      newItem.orgName = this.fxCredentials.organization;
      newItem.deptId = this.fxCredentials.departmentId;
      newItem.deptName = this.fxCredentials.department;
      newItem.branchName = this.fxCredentials.branch;
      newItem.country = this.organizationAddress.country;
      newItem.city = this.organizationAddress.city;
      newItem.empName = this.fxCredentials.fullName;
      newItem.empId = this.fxCredentials.id;
      newItem.orgCode = this.fxCredentials.orgCode;

      // this.calculateDept(newItem);
      this.calculateRatio(newItem);

      excelData.push(newItem);
    });

    return excelData;
  }
  //#endregion

  //#region OnChange Functions
  public pageChange(event: PageChangeEvent): void {
    this.spinnerService.show();
    this.skip = event.skip;
    this.loadItems(this.inventoryExcelItems);
  }

  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }

  public onSaveToggle(): void {
    this.showSavePopup = !this.showSavePopup;
  }

  public setKapanList(): void {
    this.listKapan = [];
    this.allKapan = this.inventoryExcelItems.map(z => z.kapan);
    this.allKapan = this.allKapan.filter(this.utilityService.onlyUniqueFromStringArray)
    this.allKapan.forEach(z => { this.listKapan.push({ name: z, isChecked: false }); });
  }

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
        if (acceptedFiles.indexOf(target.files[0].type) == -1) {
          this.alertDialogService.show(`Please select valid file.`);
          return;
        }

        let file = target.files[0];
        let fileReader = new FileReader();
        this.clearGrid();
        this.spinnerService.show();
        fileReader.onload = async (e) => {

          var arrayBuffer: any = fileReader.result;
          let data = new Uint8Array(arrayBuffer);
          let arr = new Array();

          for (let i = 0; i != data.length; ++i)
            arr[i] = String.fromCharCode(data[i]);

          let workbook = xlsx.read(arr.join(""), { type: "binary" });
          var inventoryFetchExcelItems = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]) as any;
          if (inventoryFetchExcelItems && inventoryFetchExcelItems.length > 0) {
            this.inventoryExcelItems = new Array<any>();

            for (let j = 0; j < inventoryFetchExcelItems.length; j++) {
              Object.keys(inventoryFetchExcelItems[j]).map(key => {
                if (key.toLowerCase().trim() != key) {
                  inventoryFetchExcelItems[j][key.toLowerCase().trim()] = inventoryFetchExcelItems[j][key];
                  delete inventoryFetchExcelItems[j][key];
                }
              });

              let newItem = await this.mappingExcelDataToInvExcelItems(inventoryFetchExcelItems, j);
              this.inventoryExcelItems.push(newItem);
            }

            if (this.inventoryExcelItems && this.inventoryExcelItems.length > 0) {
              await this.checkValidationForAll(this.inventoryExcelItems);
              //Get Pricing
              this.inventoryExcelItems = await this.setBasePricing(this.inventoryExcelItems);

              //check for Price validation
              let notValidRap: string[] = this.inventoryExcelItems.filter(z => z.rap == null || z.rap == 0).map(z => z.stoneId);
              this.validateValues(this.inventoryExcelItems, notValidRap, "Pricing not Exist");

              this.isVisibleCheckAll();
            }
            else
              this.alertDialogService.show('No data found in excel, Please import valid file!');

            this.loadItems(this.inventoryExcelItems);
            this.setKapanList();
            this.spinnerService.hide();
          }
        }

        fileReader.readAsArrayBuffer(file);
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('File not upload, Try again later!')
    }
  }

  public async mappingExcelDataToInvExcelItems(excelData: any, excelIndex: number): Promise<InventoryExcelItems> {
    let newItem: InventoryExcelItems = new InventoryExcelItems();
    let data = excelData[excelIndex];

    newItem.stoneId = data["StoneId".toLowerCase()]?.toString().trim();
    newItem.kapan = data["Kapan".toLowerCase()]?.toString().trim();
    newItem.article = data["Article".toLowerCase()]?.toString().trim();
    newItem.shape = this.getDisplayNameFromMasterDNorm(data["Shape".toLowerCase()]?.toString().trim(), this.allTheShapes);
    newItem.weight = data["Weight".toLowerCase()]?.toString().trim();
    newItem.color = this.getDisplayNameFromMasterDNorm(data["Color".toLowerCase()]?.toString().trim(), this.allColors);
    newItem.clarity = this.getDisplayNameFromMasterDNorm(data["Clarity".toLowerCase()]?.toString().trim(), this.allClarities);
    newItem.cut = this.getDisplayNameFromMasterDNorm(data["Cut".toLowerCase()]?.toString().trim(), this.allTheCPS);
    newItem.polish = this.getDisplayNameFromMasterDNorm(data["Polish".toLowerCase()]?.toString().trim(), this.allTheCPS);
    newItem.symmetry = this.getDisplayNameFromMasterDNorm(data["Symmetry".toLowerCase()]?.toString().trim(), this.allTheCPS);
    newItem.fluorescence = this.getDisplayNameFromMasterDNorm(data["Fluorescence".toLowerCase()]?.toString().trim(), this.allTheFluorescences);

    //Get CPS value
    newItem.cps = this.utilityService.getCPSValue(newItem.shape, newItem.cut, newItem.polish, newItem.symmetry, this.masterConfigList.cutDetails);

    newItem.comments = data["Comments".toLowerCase()]?.toString().trim();
    newItem.bgmComments = data["BGMComments".toLowerCase()]?.toString().trim();
    newItem.depth = 0;
    newItem.table = data["Table".toLowerCase()]?.toString().trim();
    newItem.length = data["Length".toLowerCase()]?.toString().trim();
    newItem.width = data["Width".toLowerCase()]?.toString().trim();
    newItem.height = data["Height".toLowerCase()]?.toString().trim();
    newItem.crownHeight = data["CrownHeight".toLowerCase()]?.toString().trim();
    newItem.crownAngle = data["CrownAngle".toLowerCase()]?.toString().trim();
    newItem.pavilionDepth = data["PavilionDepth".toLowerCase()]?.toString().trim();
    newItem.pavilionAngle = data["PavilionAngle".toLowerCase()]?.toString().trim();
    newItem.girdlePer = data["GirdlePer".toLowerCase()]?.toString().trim();
    newItem.ratio = data["Ratio".toLowerCase()]?.toString().trim();

    let girdleAll = this.measurementData.filter(item => item.type.toLowerCase().indexOf('girdle') !== -1);
    newItem.minGirdle = this.getDisplayNameFromMasterDNorm(data["MinGirdle".toLowerCase()]?.toString().trim(), girdleAll);
    newItem.maxGirdle = this.getDisplayNameFromMasterDNorm(data["MaxGirdle".toLowerCase()]?.toString().trim(), girdleAll);

    newItem.status = StoneStatus.PWaiting.toString();

    newItem.orgId = this.fxCredentials.organizationId;
    newItem.orgName = this.fxCredentials.organization;
    newItem.deptId = this.fxCredentials.departmentId;
    newItem.deptName = this.fxCredentials.department;
    newItem.branchName = this.fxCredentials.branch;
    newItem.country = this.organizationAddress.country;
    newItem.city = this.organizationAddress.city;
    newItem.empName = this.fxCredentials.fullName;
    newItem.empId = this.fxCredentials.id;
    newItem.orgCode = this.fxCredentials.orgCode;

    this.calculateDept(newItem);
    this.calculateRatio(newItem);

    return newItem;
  }

  public getDisplayNameFromMasterDNorm(name: string, list: MasterDNorm[]): string {
    if (name && name.length > 0)
      var obj = list.find(c => c.name.toLowerCase() == name.toLowerCase() || c.displayName?.toLowerCase() == name.toLowerCase() || (c.optionalWords && c.optionalWords.length > 0 && c.optionalWords.map(u => u.toLowerCase().trim()).includes(name.toLowerCase())));
    return obj?.name ?? null as any;
  }

  public async getRapPriceData(newItem: InventoryExcelItems): Promise<InventoryExcelItems> {
    try {
      if (newItem.shape != null) {
        let rapPrice: RapPriceRequest = {
          shape: newItem.shape,
          weight: newItem.weight,
          color: newItem.color,
          clarity: newItem.clarity
        }

        let pricing = await this.commuteService.getRapPrice(rapPrice);
        if (pricing)
          newItem.rap = pricing.price;
        else
          newItem.rap = null as any;
      }
      else
        newItem.rap = null as any;

      newItem.discount = null as any;
      newItem.netAmount = null as any;
      newItem.perCarat = null as any;
      newItem.status = StoneStatus.PWaiting.toString();
    }
    catch (error: any) {
      console.error(error);

      newItem.rap = null as any;
      newItem.discount = null as any;
      newItem.netAmount = null as any;
      newItem.perCarat = null as any;
      newItem.status = StoneStatus.PWaiting.toString();
    }
    return newItem;
  }

  public calculateRatio(target: InventoryExcelItems): void {
    if (target) {
      target.length = this.utilityService.ConvertToFloatWithDecimal(parseFloat(target.length?.toString() ?? '0'));
      target.width = this.utilityService.ConvertToFloatWithDecimal(parseFloat(target.width?.toString() ?? '0'));
      target.height = this.utilityService.ConvertToFloatWithDecimal(parseFloat(target.height?.toString() ?? '0'));

      var max = ((target.length ?? 0) > (target.width ?? 0)) ? (target.length ?? 0) : (target.width ?? 0);
      var min = ((target.width ?? 0) > (target.length ?? 0)) ? (target.length ?? 0) : (target.width ?? 0);

      if (target.shape?.toLowerCase() == 'hb')
        target.ratio = min / max;
      else
        target.ratio = max / min;

      target.ratio = this.utilityService.ConvertToFloatWithDecimal(target.ratio ?? 0);
    }
  }

  public calculateDept(target: InventoryExcelItems): void {
    if (target.height && (target.length || target.width)) {
      target.length = this.utilityService.ConvertToFloatWithDecimal(parseFloat(target.length?.toString() ?? '0'));
      target.width = this.utilityService.ConvertToFloatWithDecimal(parseFloat(target.width?.toString() ?? '0'));
      target.height = this.utilityService.ConvertToFloatWithDecimal(parseFloat(target.height?.toString() ?? '0'));
      if (target.shape?.toLowerCase() == 'rbc')
        target.depth = ((target.height ?? 0) / (target.length ?? 0)) * 100;
      else if (target.shape?.toLowerCase() == 'hb') {
        let val = (target.length ?? 0);
        if ((target.length ?? 0) < (target.width ?? 0))
          val = (target.width ?? 0);
        target.depth = ((target.height ?? 0) / val) * 100;
      }
      else {
        let val = (target.length ?? 0);
        if ((target.length ?? 0) > (target.width ?? 0))
          val = (target.width ?? 0);
        target.depth = ((target.height ?? 0) / val) * 100;
      }
      if (target.depth == Infinity || target.depth == 0)
        target.depth = null as any;
      else
        target.depth = this.utilityService.ConvertToFloatWithDecimal(target.depth ?? 0);
    }
    else
      target.depth = null as any;
  }

  public async checkValidationForAll(existData: InventoryExcelItems[]) {
    try {
      //#region validation for exist stones
      let fetchExcelIds: string[] = existData.map((x: any) => x.stoneId);
      let existStoneIds = await this.inventoryUploadService.getStoneIdsExistOrNotAsync(fetchExcelIds)
      if (existStoneIds && existStoneIds.length > 0)
        this.validateValues(existData, existStoneIds, "StoneId is already Exist");
      //#endregion

      //#region  validation for weight
      var notValidWeightId: string[] = existData.filter(z => z.weight == 0).map(z => z.stoneId);
      this.validateValues(existData, notValidWeightId, "Please add valid weight");
      //#endregion

      //#region  validation for shape
      var notValidShapeId: string[] = existData.filter(z => z.shape == null).map(z => z.stoneId);
      this.validateValues(existData, notValidShapeId, "Please add valid shape");
      //#endregion

      //#region  validation for color
      var notValidColorId: string[] = existData.filter(z => z.color == null).map(z => z.stoneId);
      this.validateValues(existData, notValidColorId, "Please add valid color");
      //#endregion

      //#region  validation for clarity
      var notValidClarityId: string[] = existData.filter(z => z.clarity == null).map(z => z.stoneId);
      this.validateValues(existData, notValidClarityId, "Please add valid clarity");
      //#endregion

      //#region  validation for fluorescence
      var notValidFlourId: string[] = existData.filter(z => z.fluorescence == null).map(z => z.stoneId);
      this.validateValues(existData, notValidFlourId, "Please add valid fluorescence");
      //#endregion

      //#region  validation for cut
      var notValidCutId: string[] = existData.filter(z => z.cut == null).map(z => z.stoneId);
      this.validateValues(existData, notValidCutId, "Please add valid cut");
      //#endregion

      //#region  validation for polish
      var notValidPolishId: string[] = existData.filter(z => z.polish == null).map(z => z.stoneId);
      this.validateValues(existData, notValidPolishId, "Please add valid polish");
      //#endregion

      //#region  validation for symmetry
      var notValidSymmId: string[] = existData.filter(z => z.symmetry == null).map(z => z.stoneId);
      this.validateValues(existData, notValidSymmId, "Please add valid symmetry");
      //#endregion

      //#region  validation for Girdle
      // var notValidMinGirdleId: string[] = existData.filter(z => z.minGirdle == null).map(z => z.stoneId);
      // this.validateValues(existData, notValidMinGirdleId, "Please add valid Girdle");

      // var notValidMaxGirdleId: string[] = existData.filter(z => z.maxGirdle == null).map(z => z.stoneId);
      // this.validateValues(existData, notValidMaxGirdleId, "Please add valid Girdle");
      //#endregion
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

  public clearGrid(): void {
    this.isShowCheckBoxAll = true;
    this.inventoryExcelItems = [];
    this.selectedInventoryExcelItems = [];
    this.errorMessagesByStoneId = [];
    this.mySelection = [];
    this.listKapan = [];
    if (this.inventoryManualForm)
      this.inventoryManualForm.reset();
    this.loadItems(this.inventoryExcelItems);
  }

  public clearFilter(form: NgForm) {
    this.spinnerService.show();
    setTimeout(() => {
      form.reset();
      this.inventoryFilterObj = new InventoryFilter();
      this.listShape.forEach(z => { z.isChecked = false });
      this.listKapan.forEach(z => { z.isChecked = false });
      this.listColor.forEach(z => { z.isChecked = false });
      this.listClarity.forEach(z => { z.isChecked = false });
      this.listCut.forEach(z => { z.isChecked = false });
      this.listPolish.forEach(z => { z.isChecked = false });
      this.listSymm.forEach(z => { z.isChecked = false });
      this.listFlour.forEach(z => { z.isChecked = false });
      this.loadItems(this.inventoryExcelItems);
    }, 100);
  }

  public async onFilterSubmit(form: NgForm) {
    this.spinnerService.show();
    await this.loadInventoryArrival();
  }

  public ApplyArrayStringFilter(a: string, z: string[]): boolean {
    let filter = true;
    if ((a == null || a == undefined || a?.length == 0) && (z == null || z == undefined || z?.length == 0))
      filter = true;
    else
      if (a == null || a == undefined || a?.length == 0)
        filter = false;
      else
        if ((a && a.length > 0) && (z && z.length > 0))
          filter = z.map(b => b.toLowerCase()).includes(a.toLowerCase());
    return filter;
  }

  public isVisibleCheckAll() {
    const DisabledCount = this.inventoryExcelItems.filter((obj) => obj.isDisabled === true).length;
    if (DisabledCount == this.inventoryExcelItems.length)
      this.isShowCheckBoxAll = false;
  }

  public onSelect(event: any): void {
    this.selectedInventoryExcelItems = [];
    this.selectedInventoryExcelItems = this.inventoryExcelItems.filter(z => z.isDisabled != true && this.mySelection.includes(z.stoneId));
  }

  public onSelectAll(e: any) {
    this.mySelection = [];
    this.selectedInventoryExcelItems = [];

    if (e.srcElement.checked) {
      this.mySelection = this.inventoryExcelItems.filter(z => z.isDisabled != true).map(z => z.stoneId)
      this.selectedInventoryExcelItems = this.inventoryExcelItems.filter(z => z.isDisabled != true);
    }
  }

  public setSelectableSettings() {
    this.selectableSettings = {
      mode: "multiple",
      checkboxOnly: true
    };
  }

  public loadItems(inventoryExcelItems: InventoryExcelItems[]) {
    let allData = [...inventoryExcelItems];

    let filterData = allData.filter(a => this.utilityService.ApplyStringFilter(a.stoneId, this.inventoryFilterObj.stoneId) &&
      this.utilityService.ApplyCertificateFilter(a.certificateNo, this.inventoryFilterObj.certificateNo) &&
      this.ApplyArrayStringFilter(a.kapan, this.inventoryFilterObj.kapan) &&
      this.ApplyArrayStringFilter(a.shape, this.inventoryFilterObj.shape) &&
      this.ApplyArrayStringFilter(a.color, this.inventoryFilterObj.color) &&
      this.ApplyArrayStringFilter(a.clarity, this.inventoryFilterObj.clarity) &&
      this.ApplyArrayStringFilter(a.cut, this.inventoryFilterObj.cut) &&
      this.ApplyArrayStringFilter(a.polish, this.inventoryFilterObj.polish) &&
      this.ApplyArrayStringFilter(a.symmetry, this.inventoryFilterObj.symmetry) &&
      this.ApplyArrayStringFilter(a.fluorescence, this.inventoryFilterObj.fluorescence) &&
      (this.inventoryFilterObj.minSize != null ? (a.weight >= this.inventoryFilterObj.minSize) : true) &&
      (this.inventoryFilterObj.maxSize != null ? (a.weight <= this.inventoryFilterObj.maxSize) : true));

    this.totalPcs = filterData.length;
    let data = filterData.slice(this.skip, this.skip + this.pageSize);
    this.gridView = process(data, { group: this.groups });
    this.gridView.total = filterData.length;

    this.totalAmount = 0;
    this.totalWeight = 0;

    filterData.forEach(z => {
      this.totalAmount += parseFloat(z.netAmount?.toString() ?? "0");
      this.totalWeight += parseFloat(z.weight.toString());
    });

    this.totalAmount = this.utilityService.ConvertToFloatWithDecimal(this.totalAmount);
    this.totalWeight = this.utilityService.ConvertToFloatWithDecimal(this.totalWeight);

    this.spinnerService.hide();
  }

  public validateValues(data: any, ids: string[], message: string, isPriceAvai: boolean = true) {
    ids.forEach(element => {
      let messageArray = [];
      messageArray.push(message)
      let findErrorIndex = this.errorMessagesByStoneId.findIndex(x => x.stoneId == element);
      if (findErrorIndex >= 0) {
        let messageIndex = this.errorMessagesByStoneId[findErrorIndex].messageList.findIndex(x => x == message);
        if (messageIndex < 0)
          this.errorMessagesByStoneId[findErrorIndex].messageList.push(message)
      }
      else
        this.errorMessagesByStoneId.push({ stoneId: element, messageList: messageArray });
      let index = data.findIndex((x: any) => x.stoneId == element);
      if (index >= 0) {
        data[index].isDisabled = true;
        data[index].isPriceAvailable = isPriceAvai;
      }
    });
  }

  public removeValidateValues(data: any, ids: string[]) {
    ids.forEach(element => {
      let findErrorIndex = this.errorMessagesByStoneId.findIndex(x => x.stoneId == element);
      if (findErrorIndex >= 0)
        this.errorMessagesByStoneId[findErrorIndex].messageList = [];
      let index = data.findIndex((x: any) => x.stoneId == element);
      if (index >= 0) {
        data[index].isDisabled = true;
        data[index].isPriceAvailable = true;
      }
    });
  }

  public isDisabled(args: RowClassArgs) {
    return {
      'k-state-disabled': args.dataItem.isDisabled === true
    };
  }

  public fetchError(id: string) {
    return this.errorMessagesByStoneId.find(x => x.stoneId == id)
  }

  public groupChange(groups: GroupDescriptor[]): void {
    this.groups = groups;
    if (this.inventoryExcelItems && this.inventoryExcelItems.length > 0)
      this.groupInventoryExcel();
  }

  private groupInventoryExcel(): void {
    if (this.groups.length > 0)
      this.gridView = process(this.inventoryExcelItems, { group: this.groups });
    else
      this.loadItems(this.inventoryExcelItems);
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    if (this.inventoryExcelItems && this.inventoryExcelItems.length > 0)
      this.sortInventoryExcel()
  }

  private sortInventoryExcel(): void {
    this.gridView = {
      data: orderBy(this.gridView.data, this.sort),
      total: this.inventoryExcelItems.length
    };
  }

  public openGridConfigDialog(): void {
    this.isGridConfig = true;
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

  public async calculateRate() {
    try {
      this.spinnerService.show();
      let response = await this.getRapPriceServerApiData(this.inventoryUploadObj);
      if (response && response.length > 0) {
        let target = response.find(a => a.id == this.inventoryUploadObj.stoneId);
        if (target && target.error == null) {
          target = this.utilityService.setAmtForPricingDiscountResponse(target, this.inventoryUploadObj.weight);
          this.inventoryUploadObj.rap = target.rapPrice;
          this.inventoryUploadObj.discount = target.discount;
          this.inventoryUploadObj.netAmount = target.amount;
          this.inventoryUploadObj.perCarat = target.dCaret;
          this.inventoryUploadObj.status = StoneStatus.PWaiting.toString();
          this.spinnerService.hide();
          if (target.rapPrice == 0.00)
            this.isRateFound = false;
          else
            this.isRateFound = true;
        }
        else {
          this.spinnerService.hide();
          if (target && target.rapPrice != null && target.rapPrice > 0)
            this.inventoryUploadObj.rap = target.rapPrice;
          else
            this.inventoryUploadObj.rap = null as any;
          this.inventoryUploadObj.rap = null as any;
          this.inventoryUploadObj.discount = null as any;
          this.inventoryUploadObj.netAmount = null as any;
          this.inventoryUploadObj.perCarat = null as any;
          this.inventoryUploadObj.status = StoneStatus.PWaiting.toString();
          this.isRateFound = false;
          this.alertDialogService.show(target?.error)
        }
      }
      else {
        this.spinnerService.hide();
        this.inventoryUploadObj.rap = null as any;
        this.inventoryUploadObj.discount = null as any;
        this.inventoryUploadObj.netAmount = null as any;
        this.inventoryUploadObj.perCarat = null as any;
        this.inventoryUploadObj.status = StoneStatus.PWaiting.toString();
        this.isRateFound = false;
        this.alertDialogService.show('Discount not found!')
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

  public async selectAllInv(event: string) {
    if (event.toLowerCase() == 'checked') {
      this.mySelection = this.inventoryExcelItems.map(z => z.stoneId);
      this.selectedInventoryExcelItems = JSON.parse(JSON.stringify(this.inventoryExcelItems));
      this.isAllSelected = false;
    }
    else {
      this.mySelection = [];
      this.selectedInventoryExcelItems = [];
      this.isAllSelected = true;
    }
  }
  //#endregion

  //#region Add/Edit Inventory
  public handleFilter(e: any): string {
    return e;
  }

  public async uploadInventoryResultFile(form?: NgForm) {
    this.alertDialogService.ConfirmYesNo('Are you sure you want to upload as MFG stones?', "Upload Inventory")
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            let stoneIds = Array<string>();
            this.spinnerService.show();

            if (this.selectedInventoryExcelItems.length > 0) {
              //Apply Box Serial No
              this.selectedInventoryExcelItems.forEach(z => { z.boxSerialNo = this.boxSerialNo; });
              if (this.selectedInventoryExcelItems.length > keys.batchWiseSaveLimit) {
                let batches = Math.ceil(this.selectedInventoryExcelItems.length / keys.batchWiseSaveLimit);

                for (let index = 0; index < batches; index++) {
                  let startIndex = keys.batchWiseSaveLimit * index;
                  let batchInvs = this.selectedInventoryExcelItems.slice(startIndex, startIndex + keys.batchWiseSaveLimit);
                  let res = await this.uploadInventoryResultFileByBatch(batchInvs);
                  stoneIds.push(...res);
                }
              }
              else
                stoneIds = await this.uploadInventoryResultFileByBatch(this.selectedInventoryExcelItems);

              if (stoneIds && stoneIds.length > 0) {
                await this.loadInventoryArrival();
                this.isVisibleCheckAll();
                this.mySelection = [];
                this.selectedInventoryExcelItems = [];

                this.resetForm(form);
                this.utilityService.showNotification(`Inventory have been successfully uploaded!`);
                this.boxSerialNo = '';
                this.showSavePopup = false;

                this.spinnerService.hide();
              }
              else
                this.spinnerService.hide();
            }
            else {
              this.spinnerService.hide();
              this.utilityService.showNotification(`Something went wrong while adding new Inventory`)
            }

          }
          catch (error: any) {
            this.spinnerService.hide();
            this.selectedInventoryExcelItems = [];
            this.alertDialogService.show(error.error)
          }
        }
      });
  }

  public async uploadInventoryResultFileByBatch(invs: InventoryExcelItems[]): Promise<string[]> {
    try {
      let flag = false;
      let stoneIds: string[] = [];
      if (invs && invs.length > 0)
        flag = await this.savePricingRequestDiamanto(invs);

      if (flag)
        stoneIds = await this.inventoryUploadService.saveInventoryFile(invs);
      return stoneIds;
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.selectedInventoryExcelItems = [];
      this.alertDialogService.show(error.error)
      return [];
    }
  }

  public filterDropdownSearch(allData: MasterDNorm[], e: any, selectedData: string[]): Array<{ name: string; isChecked: boolean }> {
    let filterData: any[] = [];
    allData.forEach(z => { filterData.push({ name: z.name, isChecked: false }); });
    filterData.forEach(z => {
      if (selectedData?.includes(z.name))
        z.isChecked = true;
    });
    if (e?.length > 0)
      return filterData.filter(z => z.name?.toLowerCase().includes(e?.toLowerCase()));
    else
      return filterData;
  }

  public filterKapanDropdownSearch(allData: string[], e: any, selectedData: string[]): Array<{ name: string; isChecked: boolean }> {
    let filterData: any[] = [];
    allData.forEach(z => { filterData.push({ name: z, isChecked: false }); });
    filterData.forEach(z => {
      if (selectedData?.includes(z.name))
        z.isChecked = true;
    });
    if (e?.length > 0)
      return filterData.filter(z => z.name?.toLowerCase().includes(e?.toLowerCase()));
    else
      return filterData;
  }

  public onOpenDropdown(list: Array<{ name: string; isChecked: boolean }>, e: boolean, selectedData: string[]): boolean {
    if (selectedData?.length == list.map(z => z.name).length)
      e = true;
    else
      e = false;
    return e;
  }

  public checkAllListItems(list: Array<{ name: string; isChecked: boolean }>, e: boolean, selectedData: string[]): string[] {
    if (e) {
      selectedData = [];
      selectedData = list.map(z => z.name);
      list.forEach(element => {
        element.isChecked = true;
      });
    }
    else {
      selectedData = [];
      list.forEach(element => {
        element.isChecked = false;
      });
    }
    return selectedData;
  }

  public cellClickHandler(e: any) {
    // this.mySelection = [];
    // this.selectedInventoryExcelItems = [];
    // if (!e.dataItem.isDisabled) {
    //   this.mySelection.push(e.dataItem.stoneId);
    //   this.selectedInventoryExcelItems.push(e.dataItem);
    // }
  }

  public openAddInventoryDialog(): void {
    this.inventoryUploadObj = new InventoryExcelItems();
    this.isEditInventory = true;
    this.insertFlag = true;
  }

  public onStoneIdChange(): void {
    let stoneIdArray = this.inventoryUploadObj.stoneId.split("-");
    this.inventoryUploadObj.kapan = stoneIdArray[0];
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

  public getCommaSapratedString(vals: any[], isAll: boolean = false): string {
    let name = vals.join(',')
    if (!isAll)
      if (name.length > 15)
        name = name.substring(0, 15) + '...';

    return name;
  }

  public openEditInventoryDialog(): void {
    this.inventoryUploadObj = { ...this.selectedInventoryExcelItems[0] };
    this.assignDropDownDataForEdit();
    this.isEditInventory = true;
    this.isRateFound = false;
    this.insertFlag = false;
  }

  public closeEditInventoryDialog(): void {
    this.isEditInventory = false;
  }

  public async onUploadInventorySubmit(form: NgForm, flag: boolean) {
    if (form.valid) {
      if (this.insertFlag) {
        this.selectedInventoryExcelItems.push(this.inventoryUploadObj);
        await this.uploadInventoryResultFile(form);
      }
      else {
        let index = this.inventoryExcelItems.findIndex(x => x.stoneId == this.inventoryUploadObj.stoneId);
        if (index >= 0) {
          this.inventoryUploadObj.rap = parseFloat(this.inventoryUploadObj.rap?.toString() ?? '');
          this.inventoryUploadObj.discount = parseFloat(this.inventoryUploadObj.discount?.toString() ?? '');
          this.inventoryUploadObj.netAmount = parseFloat(this.inventoryUploadObj.netAmount?.toString() ?? '');
          this.inventoryUploadObj.perCarat = parseFloat(this.inventoryUploadObj.perCarat?.toString() ?? '');
          this.inventoryUploadObj.isDisabled = false;
          this.inventoryUploadObj.isPriceAvailable = true;

          this.inventoryExcelItems[index] = this.inventoryUploadObj;
          let selectedIndex = this.selectedInventoryExcelItems.findIndex(x => x.stoneId == this.inventoryUploadObj.stoneId);
          if (selectedIndex != -1)
            this.selectedInventoryExcelItems[selectedIndex] = this.inventoryUploadObj;

          this.resetForm(form);

          this.utilityService.showNotification("You have been updated Inventory successfully");
          this.loadItems(this.inventoryExcelItems);
        }
        else
          this.utilityService.showNotification("Something went wrong");
      }
      if (flag)
        this.isEditInventory = false;
      else {
        this.insertFlag = true;
        this.selectedInventoryExcelItems = [];
        this.mySelection = [];
      }
    }
    else
      Object.keys(form.controls).forEach(key => { form.controls[key].markAsTouched(); });
  }

  public resetForm(form?: NgForm) {
    this.inventoryUploadObj = new InventoryExcelItems();
    this.insertFlag = true;
    this.isRateFound = true;
    form?.reset();
  }
  //#endregion

  //#region Delete Inventory
  public openDeleteDialog() {
    try {
      let message: string = "";
      message = this.selectedInventoryExcelItems.length == 1 ? "Stone has been deleted successfully!" : "Stones have been deleted successfully!";
      this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
        .subscribe(async (res: any) => {
          this.mySelection = [];
          if (res.flag) {
            this.spinnerService.show();
            let stoneIds = this.selectedInventoryExcelItems.map(z => z.stoneId);
            let result = await this.inventoryUploadService.removeInventoryArrivalData(stoneIds);
            if (result) {
              this.selectedInventoryExcelItems.forEach(z => {
                let index = this.inventoryExcelItems.findIndex(a => a.stoneId == z.stoneId);
                if (index >= 0)
                  this.inventoryExcelItems.splice(index, 1)
              });
              this.loadItems(this.inventoryExcelItems);
              this.selectedInventoryExcelItems = [];
              this.spinnerService.hide();
              this.utilityService.showNotification(message)
            }
            else {
              this.alertDialogService.show('Stone(s) not remove, Try again later!');
              this.spinnerService.hide();
            }

          }
        })
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }
  //#endregion

  //#region Grid Inventory Manual
  public async fetchInventory(form: NgForm) {
    try {
      this.alertDialogService.show("This feature is not integrated yet!");
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }
  //#endregion

  //#region Pricing Functions
  public async savePricingRequestDiamanto(invExcelItems: InventoryExcelItems[]): Promise<boolean> {
    try {
      var flag: boolean = false;
      let invItems: InventoryItems[] = [];
      // invExcelItems = invExcelItems.filter(z => z.discount == null);
      if (invExcelItems != null && invExcelItems.length > 0) {
        invExcelItems.forEach(z => { invItems.push(this.mappingInvExcelToInvItems(z)) });
        if (invItems.length > 0) {
          flag = await this.commuteService.insertPricingRequest(invItems, "Inv Arrival Apply", this.fxCredentials.fullName);
          this.utilityService.showNotification('Pricing request submitted!');
        }
      }
      return flag;

    } catch (error: any) {
      this.alertDialogService.show('Pricing request not inserted!', 'error');
      console.error(error);
      return false;
    }
  }

  public mappingInvExcelToInvItems(invExcelItem: InventoryExcelItems): InventoryItems {
    let item: InventoryItems = new InventoryItems();
    item.stoneId = invExcelItem.stoneId;
    item.kapan = invExcelItem.kapan;
    item.article = invExcelItem.article;
    item.shape = invExcelItem.shape;
    item.weight = invExcelItem.weight;
    item.color = invExcelItem.color;
    item.clarity = invExcelItem.clarity;
    item.cut = invExcelItem.cut;
    item.polish = invExcelItem.polish;
    item.symmetry = invExcelItem.symmetry;
    item.fluorescence = invExcelItem.fluorescence;
    item.cps = invExcelItem.cps;
    item.shapeRemark = invExcelItem.shapeRemark;

    item.comments = invExcelItem.comments;
    item.bgmComments = invExcelItem.bgmComments;

    item.measurement.depth = invExcelItem.depth ?? 0;
    item.measurement.table = invExcelItem.table ?? 0;
    item.measurement.length = invExcelItem.length ?? 0;
    item.measurement.width = invExcelItem.width ?? 0;
    item.measurement.height = invExcelItem.height ?? 0;
    item.measurement.crownHeight = invExcelItem.crownHeight ?? 0;
    item.measurement.crownAngle = invExcelItem.crownAngle ?? 0;
    item.measurement.pavilionDepth = invExcelItem.pavilionDepth ?? 0;
    item.measurement.pavilionAngle = invExcelItem.pavilionAngle ?? 0;
    item.measurement.girdlePer = invExcelItem.girdlePer ?? 0;
    item.measurement.minGirdle = invExcelItem.minGirdle ?? '';
    item.measurement.maxGirdle = invExcelItem.maxGirdle ?? '';
    item.measurement.ratio = invExcelItem.ratio ?? 0;

    item.basePrice.rap = invExcelItem.rap ?? 0;
    item.basePrice.discount = invExcelItem.discount ?? 0;
    item.basePrice.netAmount = invExcelItem.netAmount ?? 0;
    item.basePrice.perCarat = invExcelItem.perCarat ?? 0;

    item.status = StoneStatus.Arrival.toString();

    item.stoneOrg.orgId = this.fxCredentials.organizationId;
    item.stoneOrg.orgName = this.fxCredentials.organization;
    item.stoneOrg.deptId = this.fxCredentials.departmentId;
    item.stoneOrg.deptName = this.fxCredentials.department;
    item.stoneOrg.branchName = this.fxCredentials.branch;
    item.stoneOrg.country = this.organizationAddress.country;
    item.stoneOrg.city = this.organizationAddress.city;
    item.stoneOrg.orgCode = this.fxCredentials.orgCode;
    item.identity.name = this.fxCredentials.fullName;
    item.identity.id = this.fxCredentials.id;
    item.identity.type = 'Employee';
    return item;
  }

  private async setBasePricing(data: InventoryExcelItems[]): Promise<InventoryExcelItems[]> {
    try {
      let reqList: MfgPricingRequest[] = [];
      data.forEach(z => {
        if (z.isDisabled != true && z.shape)
          reqList.push(this.mappingPricingRequestData(z));
      });

      let response = await this.pricingService.getBasePrice(reqList);
      if (response && response.length > 0) {
        for (let index = 0; index < data.length; index++) {
          let z = data[index];
          let target = response.find(a => a.id == z.stoneId);
          if (target && target.rapPrice != null && target.rapPrice > 0) {
            if (target.error == null) {
              target = this.utilityService.setAmtForPricingDiscountResponse(target, z.weight);
              z.rap = target.rapPrice;
              z.discount = target.discount;
              z.netAmount = target.amount;
              z.perCarat = target.dCaret;
            }
            else {
              z.rap = target.rapPrice;
              z.discount = null as any;
              z.netAmount = null as any;
              z.perCarat = null as any;
              z.status = StoneStatus.PWaiting.toString();
            }
          }
          else
            z = await this.getRapPriceData(z);
        }
      }
      return data;
    }
    catch (error: any) {
      console.error(error);
      this.utilityService.showNotification('Pricing not get, Try again later!', 'Warning');
      return data;
    }
  }

  public mappingPricingRequestData(item: InventoryExcelItems): MfgPricingRequest {
    let mesurement = new MfgMeasurementData();
    mesurement.TblDepth = item.depth ?? 0;
    mesurement.TblAng = item.table ?? 0;
    mesurement.Length = item.length ?? 0;
    mesurement.Width = item.width ?? 0;
    mesurement.Height = item.height ?? 0;
    mesurement.CrHeight = item.crownHeight ?? 0;
    mesurement.CrAngle = item.crownAngle ?? 0;
    mesurement.PvlDepth = item.pavilionDepth ?? 0;
    mesurement.PvlAngle = item.pavilionAngle ?? 0;
    mesurement.StarLength = 0;
    mesurement.LowerHalf = 0;
    mesurement.GirdlePer = item.girdlePer ?? 0;
    mesurement.MinGirdle = item.minGirdle;
    mesurement.MaxGirdle = item.maxGirdle;
    mesurement.Ratio = item.ratio ?? 0;

    let req: MfgPricingRequest = {
      Lab: "GIA",
      Rapver: "NONE",
      Id: item.stoneId,
      Shape: item.shape?.toUpperCase(),
      Weight: item.weight,
      Color: (item.color?.toUpperCase() == "O" || item.color?.toUpperCase() == "P") ? "M" : item.color?.toUpperCase(),
      Clarity: item.clarity?.toUpperCase(),
      Cut: item.cut?.toUpperCase(),
      Polish: item.polish?.toUpperCase(),
      Symmetry: item.symmetry?.toUpperCase(),
      Flour: item.fluorescence?.toUpperCase(),
      InclusionPrice: new MfgInclusionData(),
      MeasurePrice: mesurement,
      IGrade: "",
      MGrade: ""
    };

    return req;
  }

  private async getRapPriceServerApiData(data: InventoryExcelItems): Promise<PricingDiscountApiResponse[]> {
    let response: PricingDiscountApiResponse[] = [];
    try {
      let reqList: MfgPricingRequest[] = [];
      reqList.push(this.mappingPricingRequestData(data));

      response = await this.pricingService.getBasePrice(reqList);

    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong on get pricing, Try again later.');
    }
    return response;
  }

  public updatePricingData(data: InventoryExcelItems) {
    if (!data.isPriceAvailable) {
      this.inventoryUploadObj = { ...data };

      this.assignDropDownDataForEdit();
      this.inventoryUploadObj.rap = undefined;
      this.inventoryUploadObj.discount = undefined;
      this.inventoryUploadObj.netAmount = undefined;
      this.inventoryUploadObj.perCarat = undefined;

      this.isRateFound = false;

      this.isEditInventory = true;
      this.insertFlag = false;
    }
  }

  //Match Name for Dropdown Selection
  public assignDropDownDataForEdit() {
    const shape = this.inventoryUploadObj.shape;
    var obj = this.allTheShapes.find(c => c.name.toLowerCase() == shape.toLowerCase() || c.displayName.toLowerCase() == shape.toLowerCase() || c.optionalWords && c.optionalWords.map(u => u.toLowerCase().trim()).includes(shape.toLowerCase()));
    if (obj)
      this.inventoryUploadObj.shape = obj.name;

    const color = this.inventoryUploadObj.color;
    var obj = this.allColors.find(c => c.name.toLowerCase() == color.toLowerCase() || c.displayName.toLowerCase() == color.toLowerCase() || c.optionalWords && c.optionalWords.map(u => u.toLowerCase().trim()).includes(color.toLowerCase()));
    if (obj)
      this.inventoryUploadObj.color = obj.name;

    const clarity = this.inventoryUploadObj.clarity;
    var obj = this.allClarities.find(c => c.name.toLowerCase() == clarity.toLowerCase() || c.displayName.toLowerCase() == clarity.toLowerCase() || c.optionalWords && c.optionalWords.map(u => u.toLowerCase().trim()).includes(clarity.toLowerCase()));
    if (obj)
      this.inventoryUploadObj.clarity = obj.name;

    const fluorescence = this.inventoryUploadObj.fluorescence;
    var obj = this.allTheFluorescences.find(c => c.name.toLowerCase() == fluorescence.toLowerCase() || c.displayName.toLowerCase() == fluorescence.toLowerCase() || c.optionalWords && c.optionalWords.map(u => u.toLowerCase().trim()).includes(fluorescence.toLowerCase()));
    if (obj)
      this.inventoryUploadObj.fluorescence = obj.name;

    const cut = this.inventoryUploadObj.cut;
    var obj = this.allTheCPS.find(c => c.name.toLowerCase() == cut.toLowerCase() || c.displayName.toLowerCase() == cut.toLowerCase() || c.optionalWords && c.optionalWords.map(u => u.toLowerCase().trim()).includes(cut.toLowerCase()));
    if (obj)
      this.inventoryUploadObj.cut = obj.name;

    const polish = this.inventoryUploadObj.polish;
    var obj = this.allTheCPS.find(c => c.name.toLowerCase() == polish.toLowerCase() || c.displayName.toLowerCase() == polish.toLowerCase() || c.optionalWords && c.optionalWords.map(u => u.toLowerCase().trim()).includes(polish.toLowerCase()));
    if (obj)
      this.inventoryUploadObj.polish = obj.name;

    const symmetry = this.inventoryUploadObj.symmetry;
    var obj = this.allTheCPS.find(c => c.name.toLowerCase() == symmetry.toLowerCase() || c.displayName.toLowerCase() == symmetry.toLowerCase() || c.optionalWords && c.optionalWords.map(u => u.toLowerCase().trim()).includes(symmetry.toLowerCase()));
    if (obj)
      this.inventoryUploadObj.symmetry = obj.name;
  }

  public calculateRapPricing() {
    if (!this.isRateFound)
      this.setRapPricing(this.inventoryUploadObj);
  }

  public setRapPricing(target: InventoryExcelItems) {
    let rap = target.rap?.toString();
    let disc = target.discount?.toString();
    if (rap && disc && rap.length > 0 && disc.length > 0) {
      if (disc.toString() != '-') {

        let rapNumber = parseFloat(rap);
        let discNumber = parseFloat(disc);
        let weight = target.weight;
        let stoneRap = weight * rapNumber;
        let calDiscount = 100 + discNumber;
        let netAmount = (calDiscount * stoneRap) / 100;

        target.netAmount = this.utilityService.ConvertToFloatWithDecimal(netAmount);
        let perCarat = netAmount / weight;
        target.perCarat = this.utilityService.ConvertToFloatWithDecimal(perCarat);
      }
    }
  }
  //#endregion

}