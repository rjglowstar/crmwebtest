import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { fromEvent } from 'rxjs';
import { debounceTime, filter, map } from 'rxjs/operators';
import { Address, GirdleDNorm, GradeSearchItems, GridDetailConfig, InclusionPrice, MeasItems, MfgInclusionData, MfgMeasurementData, MfgPricingRequest, RapPriceRequest } from 'shared/businessobjects';
import { fxCredential, GridConfig, GridMasterConfig, MasterConfig, MasterDNorm, MeasurementConfig } from 'shared/enitites';
import { ConfigService, MeasureGradeService, PricingService, StoneStatus, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import * as xlsx from 'xlsx';
import { InventoryExcelItems, InverntoryError, InvUpdateItem, InWardMemoSearchCriteria, LogisticDNorm } from '../../businessobjects';
import { IdentityDNorm, InventoryItemMeasurement, InventoryItems, InWardMemo, LedgerDNorm, MemoInvItem, PriceDNorm, StoneOrgDNorm } from '../../entities';
import { GridPropertiesService, OrderService, LedgerService, InwardMemoService, LogisticService, CommuteService, MasterConfigService, InventoryUploadService, OrganizationService, InventoryService, LabService } from '../../services';

@Component({
  selector: 'app-inwardmemo',
  templateUrl: './inwardmemo.component.html',
  styleUrls: ['./inwardmemo.component.css']
})
export class InwardmemoComponent implements OnInit {
  @ViewChild('BarcodeInput') barcodeInput!: ElementRef;

  //#region Grid Data
  public groups: GroupDescriptor[] = [];
  public selectableSettings: SelectableSettings = { mode: 'single' };
  public selectableSettingsMemo: SelectableSettings = { mode: 'multiple' };
  public mySelection: string[] = [];
  public mySelectionMemo: string[] = [];
  public excelFile: any[] = [];
  public gridView!: DataResult;
  public pageSize = 26;
  public skip = 0
  public fields!: GridDetailConfig[];
  public gridMasterConfigResponse!: GridMasterConfig;
  public gridConfig!: GridConfig;
  //#endregion

  //#region Master Config
  public masterConfigList!: MasterConfig;
  public allTheShapes!: MasterDNorm[];
  public allColors!: MasterDNorm[];
  public allClarities!: MasterDNorm[];
  public allTheFluorescences!: MasterDNorm[];
  public allTheCPS!: MasterDNorm[];
  public measurementData: MasterDNorm[] = [];
  public measurementConfig: MeasurementConfig = new MeasurementConfig();
  //#endregion

  //#region Comman Objects and Arrays
  public fxCredentials!: fxCredential;
  public stoneId: string = "";
  public inWardMemoSearchCriteria: InWardMemoSearchCriteria = new InWardMemoSearchCriteria();
  public selectedInWardItems: InWardMemo[] = [];
  public filterInWardItems: InWardMemo[] = [];
  public inventoryExcelItems: InventoryExcelItems[] = [];
  public organizationAddress: Address = new Address();
  public filterFlag = true;
  //#endregion

  //#region Modal
  public inWardObj: InWardMemo = new InWardMemo();
  public existStoneIds: string[] = [];
  public errorMessagesByStoneId: InverntoryError[] = [];
  public invStatus: string = StoneStatus.Transit.toString();
  public totalUploadCount = 0;
  public totalWeight = 0;
  public isUpload = false;
  public isInwardmemo: boolean = false
  public isEdit = false;
  public isViewButtons: boolean = false;
  public certificateNo!: string;
  //#endregion

  //#region Dropdown Data
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };
  public brokerItems: LedgerDNorm[] = [];
  public partyItems: LedgerDNorm[] = [];
  public logisticItems: LogisticDNorm[] = [];
  public listBrokerItems: Array<{ text: string; value: string }> = [];
  public listPartyItems: Array<{ text: string; value: string }> = [];
  public listLogisticItems: Array<{ text: string; value: string }> = [];

  public selectedBroker = "";
  public selectedParty = "";
  public selectedLogistic = "";
  //#endregion

  constructor(private router: Router,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private utilityService: UtilityService,
    private gridPropertiesService: GridPropertiesService,
    private configService: ConfigService,
    private ledgerService: LedgerService,
    private logisticService: LogisticService,
    private inwardMemoService: InwardMemoService,
    private pricingService: PricingService,
    private commuteService: CommuteService,
    private orderService: OrderService,
    private masterConfigService: MasterConfigService,
    private organizationService: OrganizationService,
    private inventoryService: InventoryService,
    private measureGradeService: MeasureGradeService,
    private labService: LabService,
    private inventoryUploadService: InventoryUploadService) { }

  public async ngOnInit() {
    this.defaultMethodsLoad();
  }

  //#region Default Method
  public async defaultMethodsLoad() {
    try {
      this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
      if (!this.fxCredentials)
        this.router.navigate(["login"]);

      if (this.fxCredentials && this.fxCredentials.origin && (this.fxCredentials.origin.toLowerCase() == 'admin' || this.fxCredentials.origin.toLowerCase() == 'accounts' || this.fxCredentials.origin.toLowerCase() == 'accounts'))
        this.isViewButtons = true;

      this.spinnerService.show();
      await this.getGridConfiguration();
      await this.loadBroker();
      await this.loadParty();
      await this.loadLogistic();
      await this.loadMasterConfig();
      await this.loadOrganizationData();
      await this.initInWardData();

      this.utilityService.filterToggleSubject.subscribe(flag => {
        this.filterFlag = flag;
      });
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Data not load!');
    }
  }
  //#endregion

  //#region Grid Config | On Change
  public async getGridConfiguration() {
    try {
      this.spinnerService.show();
      this.gridConfig = await this.configService.getGridConfig(this.fxCredentials?.id ?? '', "InWard", "InWardGrid", this.gridPropertiesService.getInWardItems());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("InWard", "InWardGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getInWardItems();
      }
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  public onSelect(event: any): void {
    try {
      this.selectedInWardItems.push(event.selectedRows[0].dataItem);
      this.inWardObj = JSON.parse(JSON.stringify(event.selectedRows[0].dataItem));
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.initInWardData();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.initInWardData();
  }

  public calculateDayDiff(expireDate: Date): number {
    let date = new Date(expireDate);
    let currentDate = new Date();

    let days = Math.floor(((date.getTime() - currentDate.getTime()) / 1000 / 60 / 60 / 24));
    return days;
  }
  //#endregion

  //#region Master Config
  public async loadMasterConfig() {
    try {
      this.masterConfigList = await this.masterConfigService.getAllMasterConfig();
      const { shape, colors, clarities, fluorescence, cps, measurements, measurementConfig } = this.masterConfigList;

      this.allTheShapes = shape;
      this.allColors = colors;
      this.allClarities = clarities;
      this.allTheFluorescences = fluorescence;
      this.allTheCPS = cps;

      this.measurementData = measurements;
      this.measurementConfig = measurementConfig;
    } catch (error) {
      console.error(error);
    }
  }
  //#endregion

  //#region comman Init Data
  public async initInWardData() {
    try {
      this.spinnerService.show();
      this.inWardMemoSearchCriteria.stoneIds = this.stoneId ? this.utilityService.CheckStoneIds(this.stoneId).map(x => x.toUpperCase()) : [];
      this.inWardMemoSearchCriteria.certificateNos = this.certificateNo ? this.utilityService.checkCertificateIds(this.certificateNo) : [];

      let res = await this.inwardMemoService.getPaginatedByCriteria(this.inWardMemoSearchCriteria, this.skip, this.pageSize);
      if (res) {
        this.filterInWardItems = res.inWardMemos;
        this.gridView = process(res.inWardMemos, { group: this.groups });
        this.gridView.total = res.totalCount;

        this.selectedInWardItems = [];
        this.mySelection = [];
        this.inWardObj = new InWardMemo();

        this.spinnerService.hide();
      }
      else
        this.spinnerService.hide();
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Data could not be loaded. Please try again later.');
    }
  }

  //#region Load Broker
  public async loadBroker() {
    try {
      const ledgerType: string[] = ['Broker'];
      const brokers = await this.ledgerService.getAllLedgersByType(ledgerType);

      this.brokerItems = brokers.map(element => ({
        id: element.id,
        group: element.group.name,
        name: element.name,
        code: element.code,
        contactPerson: element.contactPerson,
        email: element.email,
        mobileNo: element.mobileNo,
        phoneNo: element.phoneNo,
        faxNo: element.faxNo,
        address: element.address,
        idents: element.idents,
        incomeTaxNo: element.incomeTaxNo,
        taxNo: element.taxNo
      }));

      this.listBrokerItems = this.brokerItems.map(z => ({ text: z.name, value: z.id }));
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Broker not loaded. Please try again later.');
    }
  }
  //#endregion

  //#region Load Party
  public async loadParty() {
    try {
      const ledgerType: string[] = ['Suppliers'];
      const parties = await this.ledgerService.getAllLedgersByType(ledgerType);

      this.partyItems = parties.map(element => ({
        id: element.id,
        group: element.group.name,
        name: element.name,
        code: element.code,
        contactPerson: element.contactPerson,
        email: element.email,
        mobileNo: element.mobileNo,
        phoneNo: element.phoneNo,
        faxNo: element.faxNo,
        address: element.address,
        idents: element.idents,
        incomeTaxNo: element.incomeTaxNo,
        taxNo: element.taxNo
      }));

      this.listPartyItems = this.partyItems.map(z => ({ text: z.name, value: z.id }));
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Party not loaded. Please try again later.');
    }
  }
  //#endregion

  //#region Load Logistic
  public async loadLogistic() {
    try {
      this.spinnerService.show();
      const res = await this.logisticService.getGetLogisticDNormForMemo();
      if (res) {
        this.logisticItems = res;
        this.listLogisticItems = [];
        this.listLogisticItems = this.logisticItems.map(z => ({ text: z.name, value: z.id }));
      } else {
        this.spinnerService.hide();
      }
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Logistic not loaded. Please try again later.');
    }
  }
  //#endregion

  public async loadOrganizationData() {
    try {
      this.organizationAddress = await this.organizationService.getOrganizationAddressByEmployee(this.fxCredentials.id);

      //Add country from organization if not exists in branch address
      if (this.organizationAddress.country == null) {
        let orgAddress = await this.organizationService.getOrganizationDNorm();
        if (orgAddress && orgAddress.length > 0)
          this.organizationAddress.country = orgAddress[0].address.country;
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Failed to load organization, Please try again later!');
    }
  }
  //#endregion

  //#region OnChange Functions
  public getPcsTotal(data: MemoInvItem[], type: string) {
    return data.filter(z => type === 'return' ? z.isReturned : z.isPurchased).length;
  }

  public handlePartyFilter(value: any) {
    this.listPartyItems = [];
    let partyItems = this.partyItems.filter(z => z.name.toLowerCase().includes(value.toLowerCase()));
    this.listPartyItems = partyItems.map(z => ({ text: z.name, value: z.id }));
  }

  public handleBrokerFilter(value: any) {
    this.listBrokerItems = [];
    let brokerItems = this.brokerItems.filter(z => z.name.toLowerCase().includes(value.toLowerCase()));
    this.listBrokerItems = brokerItems.map(z => ({ text: z.name, value: z.id }));
  }

  public handleLogisticFilter(value: any) {
    this.listLogisticItems = [];
    let logisticItems = this.logisticItems.filter(z => z.name.toLowerCase().includes(value.toLowerCase()));
    this.listLogisticItems = logisticItems.map(z => ({ text: z.name, value: z.id }));
  }

  public onBrokerChange(e: any) {
    if (e) {
      let fetchBroker = this.brokerItems.find(x => x.id == e);
      if (fetchBroker) {
        setTimeout(() => {
          this.selectedBroker = fetchBroker?.name ?? '';
        }, 0);
        this.inWardObj.broker = fetchBroker ?? new LedgerDNorm();
      }
    }
    else
      this.inWardObj.broker = new LedgerDNorm();
  }

  public onPartyChange(e: any) {
    if (e) {
      let fetchParty = this.partyItems.find(x => x.id == e);
      if (fetchParty) {
        setTimeout(() => {
          this.selectedParty = fetchParty?.name ?? '';
        }, 0);
        this.inWardObj.party = fetchParty ?? new LedgerDNorm();
      }
    }
    else
      this.inWardObj.party = new LedgerDNorm();
  }

  public onLogisticChange(e: any) {
    if (e) {
      let fetchLogistic = this.logisticItems.find(x => x.id == e);
      if (fetchLogistic) {
        setTimeout(() => {
          this.selectedLogistic = fetchLogistic?.name ?? '';
        }, 0);
        this.inWardObj.courierName = fetchLogistic ?? new LedgerDNorm();
      }
    }
    else
      this.inWardObj.courierName = new LedgerDNorm();
  }
  //#endregion

  //#region Modal Changes
  public async openInwardmemoDialog(isEdit = false) {
    if (isEdit) {

      if (this.mySelection.length != 1) {
        this.alertDialogService.show('Select at least one memo for update stone!');
        return;
      }
      this.inWardObj.expiryDate = this.getValidJoiningDate(this.inWardObj.expiryDate);
      this.inventoryExcelItems = this.mappingInWardMemoInvToExcelInv(this.inWardObj.inventoryItems);

      this.selectedBroker = this.inWardObj.broker?.name ?? '';
      this.selectedParty = this.inWardObj.party?.name ?? '';
      this.selectedLogistic = this.inWardObj.courierName?.name ?? '';
      this.invStatus = this.inWardObj.invStatus;
    }
    else {
      this.selectedBroker = '';
      this.selectedParty = '';
      this.selectedLogistic = '';

      this.invStatus = StoneStatus.Transit.toString();

      this.inventoryExcelItems = [];
      this.inWardObj = new InWardMemo();
    }

    this.isEdit = isEdit;
    this.isInwardmemo = true;
    this.onAddBarcode();
  }

  public closeInwardmemoDialog(): void {
    this.inWardObj = new InWardMemo();
    this.mySelection = [];
    this.isInwardmemo = false;
  }

  private mappingInWardMemoInvToExcelInv(data: MemoInvItem[]): InventoryExcelItems[] {
    let excelItems: InventoryExcelItems[] = [];

    data.forEach(z => {
      let obj: InventoryExcelItems = new InventoryExcelItems();
      obj.srNo = z.srNo;
      obj.stoneId = z.stoneId;
      obj.inWardFlag = z.inWardFlag;
      obj.certificateNo = z.certificateNo;
      obj.certiType = z.certiType;
      obj.kapan = z.kapan;
      obj.shape = z.shape;
      obj.weight = z.weight;
      obj.color = z.color;
      obj.clarity = z.clarity;
      obj.cut = z.cut;
      obj.polish = z.polish;
      obj.symmetry = z.symmetry;
      obj.fluorescence = z.fluorescence;
      obj.rap = z.price.rap ?? 0;
      obj.discount = z.price.discount ?? 0;
      obj.netAmount = z.price.netAmount ?? 0;
      obj.perCarat = z.price.perCarat ?? 0;
      obj.returnDate = z.returnDate;
      obj.purchaseDate = z.purchaseDate;
      excelItems.push(obj);
    });

    return excelItems;
  }

  public getValidJoiningDate(date: any): Date {
    const day = moment(date).date();
    const month = moment(date).month();
    const year = moment(date).year();
    var newDate = new Date(year, month, day);
    return newDate;
  }

  public onAddBarcode() {
    try {
      fromEvent(this.barcodeInput.nativeElement, 'keyup').pipe(
        map((event: any) => {
          return event.target.value;
        })
        , filter(res => res.length > 1)
        , debounceTime(1000)
      ).subscribe(async (barcodeText: string) => {
        let message: string = ''
        let stoneIds = this.utilityService.CheckStoneIds(barcodeText.toLowerCase());

        let searchStones = this.inventoryExcelItems.filter(z => stoneIds.includes(z.stoneId.toLowerCase()));
        if (searchStones && searchStones.length > 0) {
          let notValidStones = searchStones.filter(z => z.isDisabled == true).map(z => z.stoneId);
          let validStones = searchStones.filter(z => z.isDisabled != true).map(z => z.stoneId);

          if (validStones && validStones.length > 0)
            this.mySelectionMemo.push(...validStones);

          let errorMessages = '';
          if (notValidStones && notValidStones.length > 0)
            errorMessages = notValidStones.join(',') + ' stone(s) not valid, please check in detail.!';

          let foundStoneIds = searchStones.map(z => z.stoneId.toLowerCase());
          let notFoundStoneId = stoneIds.filter(z => !foundStoneIds.includes(z));
          if (notFoundStoneId && notFoundStoneId.length > 0) {
            errorMessages.length > 0 ? errorMessages += ` </br></br> ` : '';
            errorMessages += notFoundStoneId.join(',') + ' stone(s) not found.';
          }

          if (errorMessages.length > 0)
            this.alertDialogService.show(errorMessages);
        }
        else
          this.alertDialogService.show('No Stone found!');

        if (message)
          this.alertDialogService.show(message)
      });

    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('stone not search, Try again later!');
    }
  }
  //#endregion

  //#region File Export & Download file
  public async downLoadExcelFile() {
    try {
      this.spinnerService.show();
      let data: InWardMemo[] = [];
      if (this.mySelection.length != 1) {
        this.spinnerService.hide();
        this.alertDialogService.show('Select at least one memo for exporting stones!');
        return;
      }
      data = this.filterInWardItems.filter(z => this.mySelection.includes(z.id));
      if (data.length == 1) {
        this.generateExcelData(data);
        if (this.excelFile.length > 0)
          this.utilityService.exportAsExcelFile(this.excelFile, `Inward_Memo_Excel`);
      }

      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  private async generateExcelData(data: InWardMemo[]) {
    this.excelFile = [];
    data[0].inventoryItems.forEach((z, i) => {
      var excel = {
        'NO': i + 1,
        'MemoStatus': 'MemoStatus',
        'StoneId': z.stoneId,
        'Kapan': z.kapan,
        'Article': '',
        'Shape': z.shape,
        'Weight': z.weight,
        'Color': z.color,
        'Clarity': z.clarity,
        'Cut': z.cut,
        'Polish': z.polish,
        'Symmetry': z.symmetry,
        'Fluorescence': z.fluorescence,
        'Table': z.measurement.table,
        'Length': z.measurement.length,
        'Width': z.measurement.width,
        'Height': z.measurement.height,
        'CrownHeight': z.measurement.crownHeight,
        'CrownAngle': z.measurement.crownAngle,
        'PavilionDepth': z.measurement.pavilionDepth,
        'PavilionAngle': z.measurement.pavilionAngle,
        'Girdleper': z.measurement.girdlePer,
        'MinGirdle': z.measurement.minGirdle,
        'MaxGirdle': z.measurement.maxGirdle,
        'Ratio': z.measurement.ratio,
        'Lab': z.lab,
        'CertificateNo': z.certificateNo,
        'FluorescenceColor': z.fluorescenceColor,
        'KeytoSymbols': z.keytoSymbols,
        'Inscription': z.inscription,
        'BGM Comment': z.bgmComments,
        'Comment': z.comments,
        'RAP': z.price.rap,
        'DISCOUNT': z.price.discount,
        'PER CR $': z.price.perCarat,
        'PRICE $': z.price.netAmount,
        'CertiType': z.certiType
      }
      this.excelFile.push(excel);
    });
  }
  //#endregion

  //#region File Import Code
  public async onSelectExcelFile(event: Event) {
    try {
      let acceptedFiles: string[] = [];
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
        for (let i = 0; i < target.files.length; i++) {
          let file = target.files[i];
          let fileReader = new FileReader();
          this.inventoryExcelItems = [];
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
              // this.inventoryExcelItems = new Array<any>();

              for (let j = 0; j < inventoryFetchExcelItems.length; j++) {
                Object.keys(inventoryFetchExcelItems[j]).map(key => {
                  if (key.toLowerCase().trim() != key) {
                    inventoryFetchExcelItems[j][key.toLowerCase().trim()] = inventoryFetchExcelItems[j][key];
                    delete inventoryFetchExcelItems[j][key];
                  }
                });

                let newItem = await this.mappingExcelDataToInvExcelItems(inventoryFetchExcelItems, j);
                newItem.srNo = (j + 1);
                this.inventoryExcelItems.push(newItem);
              }

              if (this.inventoryExcelItems && this.inventoryExcelItems.length > 0) {
                await this.checkValidationForAll(this.inventoryExcelItems);


                //Get Exist Stone Ids for inwardflag... update inwardflag = F 
                let existsStoneIds = await this.commuteService.getExistsStoneIds(this.inventoryExcelItems.map(z => z.stoneId));
                if (existsStoneIds && existsStoneIds.length > 0)
                  this.inventoryExcelItems.filter(z => existsStoneIds.includes(z.stoneId)).forEach(z => { z.inWardFlag = 'F'; });

                //Get Pricing of P flag Stones
                this.inventoryExcelItems = await this.setBasePricing(this.inventoryExcelItems);

                //check for Price validation
                let notValidRap: string[] = this.inventoryExcelItems.filter(z => z.rap == null || z.rap == 0).map(z => z.stoneId);
                this.validateValues(this.inventoryExcelItems, notValidRap, "Pricing not Exist");

                this.isUpload = true;
                this.totalUploadCount = this.inventoryExcelItems.length;
                this.totalWeight = this.utilityService.ConvertToFloatWithDecimal(this.inventoryExcelItems.map(z => Number(z.weight)).reduce((ty, u) => ty + u, 0));

                this.spinnerService.hide();
              }
              else {
                this.spinnerService.hide();
                this.alertDialogService.show('No data found in excel, Please import valid file!');
              }

            }
          }

          fileReader.readAsArrayBuffer(file);
        }
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

  public async checkValidationForAll(existData: InventoryExcelItems[]) {
    try {
      //#region validation for exist stones
      let fetchExcelIds: string[] = existData.map((x: any) => x.stoneId);

      //Do not check in Sold Stone
      let existStoneIds = await this.inventoryUploadService.getStoneIdsExistOrNotForPurchase(fetchExcelIds)
      if (existStoneIds && existStoneIds.length > 0)
        this.validateValues(existData, existStoneIds, "StoneId is already Exist");
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
      var notValidMinGirdleId: string[] = existData.filter(z => z.minGirdle == null).map(z => z.stoneId);
      this.validateValues(existData, notValidMinGirdleId, "Please add valid Girdle");

      var notValidMaxGirdleId: string[] = existData.filter(z => z.maxGirdle == null).map(z => z.stoneId);
      this.validateValues(existData, notValidMaxGirdleId, "Please add valid Girdle");
      //#endregion
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
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

  private async setBasePricing(data: InventoryExcelItems[]): Promise<InventoryExcelItems[]> {
    try {
      let reqList: MfgPricingRequest[] = [];
      data.forEach(z => {
        if (z.shape && z.inWardFlag == 'P') {
          reqList.push(this.mappingPricingRequestData(z));
        }
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
    }
    catch (error: any) {
      console.error(error);

      newItem.rap = null as any;
      newItem.discount = null as any;
      newItem.netAmount = null as any;
      newItem.perCarat = null as any;
    }
    return newItem;
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
      Lab: (item.lab && item.lab.length > 0) ? item.lab.toUpperCase() : "GIA",
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

  public async mappingExcelDataToInvExcelItems(excelData: any, excelIndex: number): Promise<InventoryExcelItems> {
    let newItem: InventoryExcelItems = new InventoryExcelItems();
    let data = excelData[excelIndex];

    newItem.stoneId = data["StoneId".toLowerCase()]?.toString().trim();
    newItem.kapan = data["Kapan".toLowerCase()]?.toString().trim();
    newItem.article = data["Article".toLowerCase()]?.toString().trim();
    newItem.shape = this.getDisplayNameFromMasterDNorm(data["Shape".toLowerCase()]?.toString().trim(), this.allTheShapes);
    newItem.weight = data["Weight".toLowerCase()]?.toString().trim();

    newItem.color = '';
    if (data["Color".toLowerCase()]?.toString().trim() != '')
      newItem.color = data["Color".toLowerCase()]?.toString().trim();

    //newItem.color = this.getDisplayNameFromMasterDNorm(data["Color".toLowerCase()]?.toString().trim(), this.allColors);
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

    newItem.lab = data["Lab".toLowerCase()]?.toString().trim();
    newItem.certificateNo = data["CertificateNo".toLowerCase()]?.toString().trim();
    newItem.certiType = data["CertiType".toLowerCase()]?.toString().trim();
    newItem.flColor = data["FluorescenceColor".toLowerCase()]?.toString().trim();
    newItem.ktoS = data["KeytoSymbols".toLowerCase()]?.toString().trim();
    newItem.inscription = data["Inscription".toLowerCase()]?.toString().trim();
    newItem.status = StoneStatus.Pricing.toString();

    newItem.orgId = this.fxCredentials.organizationId;
    newItem.orgName = this.fxCredentials.organization;
    newItem.deptId = this.fxCredentials.departmentId;
    newItem.deptName = this.fxCredentials.department;
    newItem.branchName = this.fxCredentials.branch;
    newItem.orgCode = this.fxCredentials.orgCode;

    if (this.organizationAddress) {
      newItem.country = this.organizationAddress.country;
      newItem.city = this.organizationAddress.city;
    }
    else
      newItem.country = 'India';

    newItem.empName = this.fxCredentials.fullName;
    newItem.empId = this.fxCredentials.id;
    newItem.inWardFlag = "P";

    newItem.rap = Number(data["RAP".toLowerCase()]?.toString().trim());
    newItem.discount = Number(data["DISCOUNT".toLowerCase()]?.toString().trim());
    newItem.netAmount = Number(data["PRICE $".toLowerCase()]?.toString().trim());
    newItem.perCarat = Number(data["PAR CR $".toLowerCase()]?.toString().trim());

    this.calculateDept(newItem);
    this.calculateRatio(newItem);

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

  public getDisplayNameFromMasterDNorm(name: string, list: MasterDNorm[]): string {
    if (name && name.length > 0)
      var obj = list.find(c => c.name.toLowerCase() == name.toLowerCase() || c.displayName?.toLowerCase() == name.toLowerCase() || (c.optionalWords && c.optionalWords.length > 0 && c.optionalWords.map(u => u.toLowerCase().trim()).includes(name.toLowerCase())));
    return obj?.name ?? null as any;
  }

  public fetchError(id: string) {
    return this.errorMessagesByStoneId.find(x => x.stoneId == id)
  }
  //#endregion

  //#region Add InWard Memo
  public async addInwardMemoFile(form?: NgForm) {
    if (!form?.valid)
      return;

    if (this.inventoryExcelItems.length == 0) {
      this.alertDialogService.show('Please upload inward memo stone data!');
      return;
    }

    var validData = this.inventoryExcelItems.filter(z => z.isDisabled == true);
    if (validData.length > 0) {
      this.alertDialogService.show('Please upload valid stone(s) data! <br /> Invalid StoneId(s): ' + validData.map(z => z.stoneId).join(","));
      return;
    }

    let isMemoNo = await this.inwardMemoService.validateMemoNoExits(this.inWardObj.memoNo);
    if (isMemoNo) {
      this.alertDialogService.show('Memo no already exists. Please enter correct one.');
      return;
    }

    this.alertDialogService.ConfirmYesNo("Are you sure you want to add inward memo", "Upload Inventory")
      .subscribe(async (res: any) => {
        if (res.flag) {
          this.spinnerService.show();
          try {
            var validData = this.inventoryExcelItems.filter(z => z.isDisabled != true);
            if (validData.length > 0) {
              this.inWardObj.invStatus = this.invStatus;

              let stoneIds = validData.map(z => z.stoneId);
              let req: InvUpdateItem = new InvUpdateItem();
              req.supplierCode = this.fxCredentials.orgCode;
              req.heldBy = this.fxCredentials.id ? this.fxCredentials.fullName : '';
              req.updatedBy = this.fxCredentials.id ? this.fxCredentials.fullName : '';

              const stoneStatus = this.inWardObj.invStatus == StoneStatus.Stock.toString() ? StoneStatus.Stock.toString() : StoneStatus.Transit.toString();
              let orderStoneIds = await this.orderService.getOrderStonesByStoneIds(stoneIds);

              if (orderStoneIds.length > 0 && this.inWardObj.invStatus == StoneStatus.Stock.toString())
                stoneIds = await this.processInventoryUpdate(orderStoneIds, stoneIds, StoneStatus.Order.toString(), req, true);

              if (stoneIds.length > 0) {
                stoneIds = await this.processInventoryUpdate([], stoneIds, stoneStatus, req, false);

                //Insert stone in Backoffice as StoneStatus is 'Pricing' -- New Inwards
                if (stoneIds.length > 0) {

                  //save Not exists diamanto stones to add and apply pricing request
                  const nonExistsData = validData.filter(z => stoneIds.includes(z.stoneId));
                  const excelData = this.inventoryExcelItems.filter(z => nonExistsData.map(z => z.stoneId).includes(z.stoneId) && z.isDisabled != true);
                  await this.updateExcelInvData(excelData);
                }
                else
                  await this.InsertInwardMemo();
              }
              else
                await this.InsertInwardMemo();

              this.spinnerService.hide();
            }
            else
              this.alertDialogService.show('Please upload valid stone data!');

            this.loadParty();
            this.loadBroker();
          }
          catch (error: any) {
            console.error(error);
            this.spinnerService.hide();
            this.alertDialogService.show('Inward memo not add, Please try again later!')
          }
        }
      });
  }

  public async processInventoryUpdate(orderStoneIds: string[], stoneIds: string[], status: string, req: InvUpdateItem, isHold: boolean) {
    req.stoneIds = status == StoneStatus.Order.toString() ? orderStoneIds : stoneIds;
    req.status = status;
    //Update inventory in - FO
    const res = await this.commuteService.updateBulkInventoryItems(req);

    if (res && res.length > 0) {
      res.forEach(z => {
        this.UpdateInvResponse(z, status, isHold);
      });

      //insert stone data exist in backOffice
      const insertedStoneIds = res.map(z => z.stoneId);
      const insertRes = await this.inwardMemoService.insertInwardMemoInventory(res);

      if (insertRes)
        stoneIds = (status == StoneStatus.Order.toString()) ? stoneIds.filter((x: any) => !orderStoneIds.includes(x)) : stoneIds.filter((x: any) => !insertedStoneIds.includes(x));
    }
    return stoneIds;
  }

  public UpdateInvResponse(invItem: InventoryItems, stoneStatus: string, isHold: boolean) {
    invItem.stoneOrg = new StoneOrgDNorm();
    invItem.stoneOrg.orgId = this.fxCredentials.organizationId;
    invItem.stoneOrg.orgName = this.fxCredentials.organization;
    invItem.stoneOrg.deptId = this.fxCredentials.departmentId;
    invItem.stoneOrg.deptName = this.fxCredentials.department;
    invItem.stoneOrg.branchName = this.fxCredentials.branch;
    invItem.stoneOrg.orgCode = this.fxCredentials.orgCode;

    if (this.organizationAddress) {
      invItem.stoneOrg.country = this.organizationAddress.country;
      invItem.stoneOrg.city = this.organizationAddress.city;
    }

    invItem.status = stoneStatus;
    invItem.heldBy = this.fxCredentials.fullName;
    invItem.identity = new IdentityDNorm();
    invItem.identity.id = this.fxCredentials.id;
    invItem.identity.name = this.fxCredentials.fullName;
    invItem.identity.type = this.fxCredentials.origin;
    invItem.inWardFlag = 'F';

    if (isHold) {
      invItem.isHold = true;
      invItem.holdBy = this.fxCredentials.fullName;
    }
    else {
      invItem.isHold = false;
      invItem.holdDate = null;
      invItem.holdBy = null as any;
    }
  }

  private async updateExcelInvData(invs: InventoryExcelItems[]): Promise<string[]> {
    try {
      //Insert inventory in - BO
      var stoneIds = await this.inventoryUploadService.saveInventoryFile(invs, true);
      if (stoneIds && stoneIds.length > 0) {
        this.utilityService.showNotification('New inventory submitted!');
        await this.savePricingRequestDiamanto(invs);
        await this.InsertInwardMemo();
        this.inventoryExcelItems = [];
        return stoneIds;
      }
      return [];
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Inward memo not add, Please try again later!')
      return [];
    }
  }

  //Insert Pricing Request in FO
  public async savePricingRequestDiamanto(invExcelItems: InventoryExcelItems[]) {
    try {

      let invItems: InventoryItems[] = [];
      if (invExcelItems != null && invExcelItems.length > 0) {
        invExcelItems.forEach(z => { invItems.push(this.mappingInvExcelToInvItems(z)) });

        //Update IGrade, MGrade
        await this.UpdateInvGrade(invItems);

        let res = await this.commuteService.insertPricingRequest(invItems, "Inward Memo By " + this.fxCredentials.fullName, "InwardMemo");
        if (res) {
          this.utilityService.showNotification('Pricing request submitted!');
        }
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show('Pricing request not inserted, Please try again later!');
      console.error(error);
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
    item.comments = invExcelItem.comments;
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

    item.lab = invExcelItem.lab;
    item.certificateNo = invExcelItem.certificateNo;

    item.inclusion.flColor = invExcelItem.flColor;
    item.inclusion.ktoS = invExcelItem.ktoS;
    item.inscription = invExcelItem.inscription;
    item.status = StoneStatus.Lab.toString();

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

  //Update MGrade & IGrade in BO
  public async UpdateInvGrade(inv: InventoryItems[]) {
    try {
      let req: GradeSearchItems[] = [];
      inv.forEach(z => {
        let obj: GradeSearchItems = new GradeSearchItems();
        obj.id = z.stoneId;
        obj.lab = "GIA"//z.lab?.toUpperCase();
        obj.shape = z.shape?.toUpperCase();
        obj.size = Number(z.weight);
        obj.color = z.color?.toUpperCase();
        obj.clarity = z.clarity?.toUpperCase();
        obj.cut = z.cut?.toUpperCase();
        obj.polish = z.polish?.toUpperCase();
        obj.sym = z.symmetry?.toUpperCase();
        obj.fluo = z.fluorescence?.toUpperCase();

        let inclusionData: InclusionPrice = new InclusionPrice();
        inclusionData.brown = z.inclusion.brown?.toUpperCase();
        inclusionData.green = z.inclusion.green?.toUpperCase();
        inclusionData.milky = z.inclusion.milky?.toUpperCase();
        inclusionData.shade = z.inclusion.shade?.toUpperCase();
        inclusionData.sideBlack = z.inclusion.sideBlack?.toUpperCase();
        inclusionData.centerBlack = z.inclusion.centerBlack?.toUpperCase();
        inclusionData.sideWhite = z.inclusion.sideWhite?.toUpperCase();
        inclusionData.centerWhite = z.inclusion.centerWhite?.toUpperCase();
        inclusionData.openTable = z.inclusion.openTable?.toUpperCase();
        inclusionData.openCrown = z.inclusion.openCrown?.toUpperCase();
        inclusionData.openPavilion = z.inclusion.openPavilion?.toUpperCase();
        inclusionData.openGirdle = z.inclusion.openGirdle?.toUpperCase();
        if (z.inclusion.girdleCondition && z.inclusion.girdleCondition.length > 0)
          inclusionData.girdleCond.push(z.inclusion.girdleCondition?.toUpperCase());
        inclusionData.eFOC = z.inclusion.efoc?.toUpperCase();
        inclusionData.eFOP = z.inclusion.efop?.toUpperCase();
        inclusionData.culet = z.inclusion.culet?.toUpperCase();
        inclusionData.hNA = z.inclusion.hna?.toUpperCase();
        inclusionData.eyeClean = z.inclusion.eyeClean?.toUpperCase();

        let ktos = z.inclusion.ktoS?.split(',');
        if (ktos && ktos.length > 0) {
          inclusionData.kToS = [];
          for (let index = 0; index < ktos.length; index++) {
            const element = ktos[index];
            inclusionData.kToS.push(element.trim());
            obj.ktoS.push(element.trim());
          }
        }

        inclusionData.naturalOnGirdle = z.inclusion.naturalOnGirdle?.toUpperCase();
        inclusionData.naturalOnCrown = z.inclusion.naturalOnCrown?.toUpperCase();
        inclusionData.naturalOnPavillion = z.inclusion.naturalOnPavillion?.toUpperCase();
        inclusionData.flColor = z.inclusion.flColor?.toUpperCase();
        inclusionData.luster = z.inclusion.luster?.toUpperCase();
        inclusionData.bowTie = z.inclusion.bowtie?.toUpperCase();
        inclusionData.certiComment = z.inclusion.certiComment?.toUpperCase();

        obj.inclusion = inclusionData;
        obj.measurement = this.mappingMeasListForGrading(z.measurement);

        let girdleData: GirdleDNorm = new GirdleDNorm();
        girdleData.min = z.measurement.minGirdle?.toUpperCase();
        girdleData.max = z.measurement.maxGirdle?.toUpperCase();

        obj.girdle = girdleData;
        obj.certComment = [];

        req.push(obj);
      });

      let res = await this.measureGradeService.getPrice(req);
      if (res) {
        let result = await this.labService.updateInventoryGrading(res);
        if (result) {
          //Update in local array for pricing request
          inv.forEach(z => {
            let grading = res.find(a => a.id == z.stoneId);
            if (grading != null) {
              z.measurement.mGrade = grading.mGrade;
              z.inclusion.iGrade = grading.iGrade;
            }
          });

          this.utilityService.showNotification(`${result.length} stone(s) grade updated!`);
        }
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong when get grade.');
    }
  }

  private mappingMeasListForGrading(measurment: InventoryItemMeasurement): MeasItems[] {
    let list: MeasItems[] = [];

    let measurData: MeasItems = new MeasItems();
    if (measurment.depth) {
      measurData.type = 'Depth';
      measurData.value = Number(measurment.depth);
      list.push(measurData);
    }

    if (measurment.table) {
      measurData = new MeasItems();
      measurData.type = 'Table';
      measurData.value = Number(measurment.table);
      list.push(measurData);
    }

    if (measurment.length) {
      measurData = new MeasItems();
      measurData.type = 'Length';
      measurData.value = Number(measurment.length);
      list.push(measurData);
    }

    if (measurment.width) {
      measurData = new MeasItems();
      measurData.type = 'Width';
      measurData.value = Number(measurment.width);
      list.push(measurData);
    }

    if (measurment.height) {
      measurData = new MeasItems();
      measurData.type = 'Height';
      measurData.value = Number(measurment.height);
      list.push(measurData);
    }

    if (measurment.crownHeight) {
      measurData = new MeasItems();
      measurData.type = 'CrHeight';
      measurData.value = Number(measurment.crownHeight);
      list.push(measurData);
    }

    if (measurment.crownAngle) {
      measurData = new MeasItems();
      measurData.type = 'CrAngle';
      measurData.value = Number(measurment.crownAngle);
      list.push(measurData);
    }

    if (measurment.pavilionDepth) {
      measurData = new MeasItems();
      measurData.type = 'PavDepth';
      measurData.value = Number(measurment.pavilionDepth);
      list.push(measurData);
    }

    if (measurment.pavilionAngle) {
      measurData = new MeasItems();
      measurData.type = 'PavAngle';
      measurData.value = Number(measurment.pavilionAngle);
      list.push(measurData);
    }

    if (measurment.ratio) {
      measurData = new MeasItems();
      measurData.type = 'Ratio';
      measurData.value = Number(measurment.ratio);
      list.push(measurData);
    }

    if (measurment.girdlePer) {
      measurData = new MeasItems();
      measurData.type = 'GirdlePer';
      measurData.value = Number(measurment.girdlePer);
      list.push(measurData);
    }

    return list;
  }

  //Insert Inward Memo in BO
  public async InsertInwardMemo() {
    try {
      let employee: IdentityDNorm = new IdentityDNorm();
      employee.name = this.fxCredentials.fullName;
      employee.id = this.fxCredentials.id;
      employee.type = 'Employee';

      this.inWardObj.employee = employee;
      this.inWardObj.inventoryItems = this.mappingInWardInvData();

      this.inWardObj.totalPcs = this.inWardObj.inventoryItems.length;
      this.inWardObj.totalWeight = this.utilityService.ConvertToFloatWithDecimal(this.inWardObj.inventoryItems.map(z => parseFloat(z.weight.toString())).reduce((ty, u) => ty + u, 0));
      this.inWardObj.totalAmount = this.utilityService.ConvertToFloatWithDecimal(this.inWardObj.inventoryItems.map(z => z.price.netAmount ?? 0).reduce((ty, u) => ty + u, 0));

      let res = await this.inwardMemoService.insert(this.inWardObj);
      if (res) {
        this.spinnerService.hide();
        this.utilityService.showNotification('Inward memo request submitted!');
        this.closeInwardmemoDialog();
        this.initInWardData();
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show('Inward memo not inserted, Please try again later!');
      console.error(error);
    }
  }

  public mappingInWardInvData(): MemoInvItem[] {
    let memoIns: MemoInvItem[] = [];

    var validData = this.inventoryExcelItems.filter(z => z.isDisabled != true);
    validData.forEach(z => {
      let obj: MemoInvItem = new MemoInvItem();
      obj.srNo = z.srNo;
      obj.invId = '';
      obj.stoneId = z.stoneId;
      obj.kapan = z.kapan;
      obj.shape = z.shape;
      obj.weight = z.weight;
      obj.color = z.color;
      obj.clarity = z.clarity;
      obj.cut = z.cut;
      obj.polish = z.polish;
      obj.symmetry = z.symmetry;
      obj.fluorescence = z.fluorescence;
      obj.length = z.length ?? null as any;
      obj.width = z.width ?? null as any;
      obj.height = z.height ?? null as any;
      obj.lab = z.lab;
      obj.certificateNo = z.certificateNo;
      obj.certiType = z.certiType;
      obj.bgmComments = z.bgmComments;
      obj.comments = z.comments
      obj.fluorescenceColor = z.flColor
      obj.inscription = z.inscription
      obj.keytoSymbols = z.ktoS

      let price: PriceDNorm = new PriceDNorm();
      price.rap = z.rap ?? null;
      price.discount = z.discount ?? null;
      price.netAmount = z.netAmount ?? null;
      price.perCarat = z.perCarat ?? null;
      obj.price = price;

      let measurement: InventoryItemMeasurement = new InventoryItemMeasurement();
      measurement.depth = z.depth ?? 0;
      measurement.table = z.table ?? 0;
      measurement.length = z.length ?? 0;
      measurement.width = z.width ?? 0;
      measurement.height = z.height ?? 0;
      measurement.crownAngle = z.crownHeight ?? 0;
      measurement.crownHeight = z.crownAngle ?? 0;
      measurement.pavilionAngle = z.pavilionAngle ?? 0;
      measurement.pavilionDepth = z.pavilionDepth ?? 0;
      measurement.girdlePer = z.girdlePer ?? 0;
      measurement.minGirdle = z.minGirdle;
      measurement.maxGirdle = z.maxGirdle;
      measurement.ratio = z.ratio ?? 0;
      obj.measurement = measurement;

      obj.isHeld = false;
      obj.isReturned = false;
      obj.returnDate = null;

      obj.inWardFlag = z.inWardFlag ?? 'P';

      memoIns.push(obj);
    });
    return memoIns;
  }
  //#endregion

  //#region Update InWard Memo
  public async updateInwardMemoFile(form?: NgForm) {
    try {
      if (!form?.valid)
        return;

      if (this.inWardObj.isReturned) {
        this.alertDialogService.show('Cannot update inward memo after return!');
        return;
      }

      this.spinnerService.show();

      if (this.inventoryExcelItems && this.inventoryExcelItems.length > 0 && this.invStatus == StoneStatus.Stock.toString()
        && this.inWardObj.invStatus == StoneStatus.Transit.toString()) {

        this.inWardObj.invStatus = this.invStatus;
        let stoneIds = this.inventoryExcelItems.map(z => z.stoneId);
        let req: InvUpdateItem = new InvUpdateItem();
        req.supplierCode = this.fxCredentials.orgCode;
        req.heldBy = this.fxCredentials.id ? this.fxCredentials.fullName : '';

        let orderStoneIds = await this.orderService.getOrderStonesByStoneIds(stoneIds);
        if (orderStoneIds.length > 0) {

          req.stoneIds = orderStoneIds;
          req.status = StoneStatus.Order.toString();
          let res = await this.commuteService.updateBulkInventoryItems(req);
          if (res && res.length > 0) {
            await this.inventoryService.updateInventoriesToStockStatus(req.stoneIds, req.status);
            stoneIds = stoneIds.filter(x => !orderStoneIds.includes(x));
          }
        }

        if (stoneIds.length > 0) {

          req.stoneIds = stoneIds;
          req.status = StoneStatus.Stock.toString();
          let res = await this.commuteService.updateBulkInventoryItems(req);
          if (res && res.length > 0) {
            let foStockids = res.map(z => z.stoneId);
            await this.inventoryService.updateInventoriesToStockStatus(foStockids, req.status);
          }
        }
      }

      let res = await this.inwardMemoService.update(this.inWardObj);
      if (res) {
        this.spinnerService.hide();
        this.utilityService.showNotification('Inward memo updated!');
        this.closeInwardmemoDialog();
        this.initInWardData();
        this.loadParty();
        this.loadBroker();
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Inward memo not updated. Please try again later!');
    }
  }
  //#endregion

  //#region Clear search filter
  public clearFilter() {
    this.inWardMemoSearchCriteria = new InWardMemoSearchCriteria();
    this.stoneId = "";
    this.certificateNo = "";
    this.inWardMemoSearchCriteria.partyId = null as any;
    this.inWardMemoSearchCriteria.brokerId = null as any;
    this.initInWardData();
  }
  //#endregion

  //#region Toggle search filter
  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }
  //#endregion
}